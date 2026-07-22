"""
ingest.py — Document Ingestion Pipeline
=========================================
Downloads documents from Box or Seismic and pushes them into the
OpenRAG knowledge base via the OpenRAG REST API.

Usage
-----
  # ingest all files in the configured Box folder
  python ingest.py --source box

  # ingest from Seismic
  python ingest.py --source seismic

  # ingest a single local file (for quick testing)
  python ingest.py --source local --file path/to/document.pdf
"""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

# ── Configuration ────────────────────────────────────────────────────────────
OPENRAG_BASE_URL  = os.getenv("OPENRAG_BASE_URL", "http://localhost:3005")
OPENRAG_API_KEY   = os.getenv("OPENRAG_API_KEY", "")
OPENRAG_USERNAME  = os.getenv("OPENRAG_USERNAME", "")

BOX_CLIENT_ID     = os.getenv("BOX_CLIENT_ID", "")
BOX_CLIENT_SECRET = os.getenv("BOX_CLIENT_SECRET", "")
BOX_ENTERPRISE_ID = os.getenv("BOX_ENTERPRISE_ID", "")
BOX_FOLDER_ID     = os.getenv("BOX_FOLDER_ID", "0")  # root = "0"

SEISMIC_BASE_URL   = os.getenv("SEISMIC_BASE_URL", "https://api.seismic.com/integration/v2")
SEISMIC_TOKEN      = os.getenv("SEISMIC_TOKEN", "")
SEISMIC_TENANT     = os.getenv("SEISMIC_TENANTALIAS", "")

SUPPORTED_TYPES = {".pdf", ".docx", ".pptx", ".txt", ".md", ".html"}

# ── OpenRAG helpers ──────────────────────────────────────────────────────────

def _openrag_headers() -> dict:
    return {
        "X-API-Key": OPENRAG_API_KEY,
        "X-USERNAME": OPENRAG_USERNAME,
    }


def ingest_file_to_openrag(file_path: Path) -> dict:
    """
    POST a single file to OpenRAG /ingest endpoint and return the task info.
    OpenRAG handles all chunking, embedding, and indexing internally.
    """
    url = f"{OPENRAG_BASE_URL}/ingest"
    with open(file_path, "rb") as fh:
        mime = _guess_mime(file_path.suffix)
        resp = requests.post(
            url,
            headers=_openrag_headers(),
            files={"file": (file_path.name, fh, mime)},
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def wait_for_task(task_id: str, poll_seconds: int = 3, max_wait: int = 300) -> str:
    """Poll OpenRAG until a task finishes and return its final status."""
    url = f"{OPENRAG_BASE_URL}/tasks/{task_id}"
    elapsed = 0
    while elapsed < max_wait:
        resp = requests.get(url, headers=_openrag_headers(), timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            status = data.get("status", "unknown")
            if status in ("completed", "failed", "error"):
                return status
        time.sleep(poll_seconds)
        elapsed += poll_seconds
    return "timeout"


def _guess_mime(suffix: str) -> str:
    mapping = {
        ".pdf":  "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".txt":  "text/plain",
        ".md":   "text/markdown",
        ".html": "text/html",
    }
    return mapping.get(suffix.lower(), "application/octet-stream")


# ── Box source ───────────────────────────────────────────────────────────────

def _box_auth_token() -> str:
    """Obtain a Box CCG (Client Credentials Grant) access token."""
    resp = requests.post(
        "https://api.box.com/oauth2/token",
        data={
            "grant_type":    "client_credentials",
            "client_id":     BOX_CLIENT_ID,
            "client_secret": BOX_CLIENT_SECRET,
            "box_subject_type": "enterprise",
            "box_subject_id":   BOX_ENTERPRISE_ID,
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def list_box_files(folder_id: str, token: str) -> list[dict]:
    """Return a flat list of file items in a Box folder."""
    url = f"https://api.box.com/2.0/folders/{folder_id}/items"
    headers = {"Authorization": f"Bearer {token}"}
    params  = {"fields": "id,name,type,size", "limit": 200}
    resp = requests.get(url, headers=headers, params=params, timeout=15)
    resp.raise_for_status()
    return [i for i in resp.json().get("entries", []) if i["type"] == "file"]


def download_box_file(file_id: str, dest: Path, token: str) -> None:
    url = f"https://api.box.com/2.0/files/{file_id}/content"
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"},
                        stream=True, timeout=60)
    resp.raise_for_status()
    with open(dest, "wb") as fh:
        for chunk in resp.iter_content(8192):
            fh.write(chunk)


def ingest_from_box() -> None:
    print("[Box] Authenticating …")
    token = _box_auth_token()
    files = list_box_files(BOX_FOLDER_ID, token)
    print(f"[Box] Found {len(files)} file(s) in folder {BOX_FOLDER_ID}")

    with tempfile.TemporaryDirectory() as tmp:
        for item in files:
            name = item["name"]
            if Path(name).suffix.lower() not in SUPPORTED_TYPES:
                print(f"  [skip] {name} (unsupported type)")
                continue
            dest = Path(tmp) / name
            print(f"  [download] {name} …", end=" ", flush=True)
            download_box_file(item["id"], dest, token)
            print("ok  →  ingesting …", end=" ", flush=True)
            result = ingest_file_to_openrag(dest)
            task_id = result.get("task_id") or result.get("id")
            status = wait_for_task(task_id) if task_id else "no-task-id"
            print(f"{status}")


# ── Seismic source ───────────────────────────────────────────────────────────

def list_seismic_documents(query: str = "IBM Concert") -> list[dict]:
    url = f"{SEISMIC_BASE_URL}/contentsearch"
    headers = {
        "Authorization": f"Bearer {SEISMIC_TOKEN}",
        "TenantAlias":   SEISMIC_TENANT,
    }
    params = {"query": query, "contentTypes": "document", "pageSize": 50}
    resp = requests.get(url, headers=headers, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json().get("items", [])


def download_seismic_file(content_id: str, dest: Path) -> None:
    url = f"{SEISMIC_BASE_URL}/library/content/{content_id}/download"
    headers = {
        "Authorization": f"Bearer {SEISMIC_TOKEN}",
        "TenantAlias":   SEISMIC_TENANT,
    }
    resp = requests.get(url, headers=headers, stream=True, timeout=60)
    resp.raise_for_status()
    with open(dest, "wb") as fh:
        for chunk in resp.iter_content(8192):
            fh.write(chunk)


def ingest_from_seismic(search_query: str = "IBM Concert") -> None:
    print(f"[Seismic] Searching for: {search_query!r} …")
    docs = list_seismic_documents(search_query)
    print(f"[Seismic] Found {len(docs)} document(s)")

    with tempfile.TemporaryDirectory() as tmp:
        for doc in docs:
            name = doc.get("name", doc["id"]) + ".pdf"
            dest = Path(tmp) / name
            print(f"  [download] {name} …", end=" ", flush=True)
            try:
                download_seismic_file(doc["id"], dest)
            except Exception as exc:
                print(f"FAILED ({exc})")
                continue
            print("ok  →  ingesting …", end=" ", flush=True)
            result = ingest_file_to_openrag(dest)
            task_id = result.get("task_id") or result.get("id")
            status = wait_for_task(task_id) if task_id else "no-task-id"
            print(f"{status}")


# ── Local file source (quick testing) ────────────────────────────────────────

def ingest_local_file(file_path: str) -> None:
    path = Path(file_path)
    if not path.exists():
        print(f"[local] File not found: {file_path}")
        sys.exit(1)
    print(f"[local] Ingesting {path.name} …", end=" ", flush=True)
    result = ingest_file_to_openrag(path)
    task_id = result.get("task_id") or result.get("id")
    status = wait_for_task(task_id) if task_id else str(result)
    print(f"{status}")


# ── CLI entry-point ──────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest documents into OpenRAG")
    parser.add_argument("--source", choices=["box", "seismic", "local"],
                        default="local", help="Document source")
    parser.add_argument("--file",  type=str, default=None,
                        help="Path to local file (required when --source=local)")
    parser.add_argument("--query", type=str, default="IBM Concert",
                        help="Search query for Seismic (default: 'IBM Concert')")
    args = parser.parse_args()

    if args.source == "box":
        ingest_from_box()
    elif args.source == "seismic":
        ingest_from_seismic(args.query)
    elif args.source == "local":
        if not args.file:
            parser.error("--file is required when --source=local")
        ingest_local_file(args.file)


if __name__ == "__main__":
    main()
