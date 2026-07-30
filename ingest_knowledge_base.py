#!/usr/bin/env python3
"""
ingest_knowledge_base.py

On-demand ingestion of files dropped into the "Knowledge base" folder into
OpenRAG. Every file is first converted to Markdown locally via Docling (the
same parsing library OpenRAG itself uses, just invoked directly for better
fidelity than OpenRAG's own PDF/PPTX chunking produced), then the resulting
.md file is uploaded through OpenRAG's native /v1/documents/ingest API,
which still does all chunking, embedding, and indexing itself.

Every input format Docling supports (docling.datamodel.base_models.
FormatToExtensions) is eligible for conversion, not just PDF/PPTX -- the
allow-list is read directly from Docling's own mapping rather than
hardcoded, so it stays correct as Docling adds formats.

Converted Markdown is cached under --converted-dir (default:
"converted_markdown/", mirroring the Knowledge base's subfolder structure)
so you can inspect exactly what gets sent to OpenRAG. Conversion is skipped
if the cached .md is already newer than its source file.

Bootstrap note: the manifest starts empty, so the first run will re-upload
any file already ingested manually in the past. That's harmless -- the
ingest endpoint defaults to replace_duplicates=true, so the server just
replaces the existing document -- and the manifest correctly tracks the
file from then on.

Migration note: earlier versions of this script uploaded the original file
(PDF/PPTX/etc.) directly, with no local conversion step. Any manifest entry
from that era is recognized by its missing/mismatched "uploaded_filename"
field; on the first run under this version, the stale document is deleted
from OpenRAG under its old (original-extension) filename, and re-uploaded
fresh under its new "<stem>.md" filename.

Two-way reconciliation with OpenRAG (not just the local manifest):
  - If a file tracked in the manifest no longer exists locally, its document
    is deleted from OpenRAG too (via DELETE /v1/documents), and the manifest
    entry is dropped.
  - Before skipping a file as "already ingested", its presence in OpenRAG is
    re-confirmed via POST /v1/search (exact filename filter, no embedding
    needed). If it's gone server-side (e.g. deleted directly in the OpenRAG
    UI) it is re-ingested instead of silently skipped. This check is skipped
    in --dry-run mode, which makes no HTTP calls at all (local conversion
    still runs in --dry-run, so you can preview the Markdown output).

Requirements: `pip install -r requirements.txt` (docling, requests).

Credentials: an OpenRAG API key + username are required for real runs
(--dry-run needs none). Provide them via, in priority order:
  1. --api-key / --username flags
  2. OPENRAG_API_KEY / OPENRAG_USERNAME environment variables
  3. a .bob/mcp.json file (IBM Bob's MCP config), for people who have it
Anyone testing against their own OpenRAG instance should use 1 or 2 --
no IBM-internal tooling required.

Sharing this script: only this file + requirements.txt need to be sent to
someone else. Do NOT share the "Knowledge base/" folder, ".ingest_manifest
.json", or "converted_markdown/" alongside it -- those hold your actual
(often confidential) source documents and their converted text.

Usage:
    python ingest_knowledge_base.py --dry-run
    python ingest_knowledge_base.py --base-url http://<their-openrag-host>:3005 \\
        --api-key <key> --username <user>
"""

import argparse
import hashlib
import json
import os
import pathlib
import sys
import time
from datetime import datetime, timezone

import requests
from docling.datamodel.base_models import FormatToExtensions
from docling.document_converter import DocumentConverter

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
DEFAULT_KB_DIR = SCRIPT_DIR / "Knowledge base"
DEFAULT_MANIFEST = SCRIPT_DIR / ".ingest_manifest.json"
DEFAULT_MCP_CONFIG = SCRIPT_DIR / ".bob" / "mcp.json"
DEFAULT_CONVERTED_DIR = SCRIPT_DIR / "converted_markdown"
DEFAULT_BASE_URL = "http://localhost:3005"
DEFAULT_MAX_SIZE_MB = 200
DEFAULT_POLL_TIMEOUT = 120
DEFAULT_POLL_INTERVAL = 5

SKIP_NAMES = frozenset({".DS_Store"})
SKIP_PREFIXES = ("~$",)

# Read straight from Docling's own format registry so every extension it
# supports is accepted here too, without us hardcoding a list.
DOCLING_EXTENSIONS = frozenset(
    ext.lower() for exts in FormatToExtensions.values() for ext in exts
)

TERMINAL_SUCCESS = frozenset({"completed"})
TERMINAL_FAILURE = frozenset({"failed", "skipped"})
MTIME_TOLERANCE_SECONDS = 1.0

_docling_converter = None


def get_docling_converter() -> DocumentConverter:
    """Lazy singleton -- Docling's model loading is expensive, so build it
    once per run and only if a file actually needs (re)conversion."""
    global _docling_converter
    if _docling_converter is None:
        _docling_converter = DocumentConverter()
    return _docling_converter


def docling_supported(path: pathlib.Path) -> bool:
    ext = path.suffix.lower().lstrip(".")
    return ext in DOCLING_EXTENSIONS


def uploaded_filename_for(path: pathlib.Path) -> str:
    """The filename actually sent to OpenRAG: every source format is
    converted to Markdown locally before upload, so this is always the
    source's stem with a .md extension."""
    return f"{path.stem}.md"


def convert_to_markdown(path: pathlib.Path, converted_dir: pathlib.Path, kb_dir: pathlib.Path) -> pathlib.Path:
    """Convert `path` to Markdown via Docling, caching the result under
    `converted_dir` (mirroring `path`'s position relative to `kb_dir`).
    Skips reconversion if the cached .md is already newer than the source.
    """
    rel = path.relative_to(kb_dir)
    out_path = converted_dir / rel.with_suffix(".md")

    if out_path.exists() and out_path.stat().st_mtime >= path.stat().st_mtime:
        return out_path

    out_path.parent.mkdir(parents=True, exist_ok=True)
    result = get_docling_converter().convert(path)
    out_path.write_text(result.document.export_to_markdown(), encoding="utf-8")
    return out_path


def load_credentials(mcp_path: pathlib.Path, cli_api_key: str = None, cli_username: str = None) -> dict:
    """Resolve OpenRAG API credentials, checked in this priority order:
      1. --api-key / --username command-line flags
      2. OPENRAG_API_KEY / OPENRAG_USERNAME environment variables
      3. .bob/mcp.json (IBM Bob's MCP config for OpenRAG), if present

    Only source 3 requires IBM Bob specifically -- anyone running their own
    OpenRAG instance (e.g. to test this script) can use 1 or 2 instead, no
    IBM-internal tooling required.
    """
    api_key = cli_api_key or os.environ.get("OPENRAG_API_KEY")
    username = cli_username or os.environ.get("OPENRAG_USERNAME")

    if (not api_key or not username) and mcp_path.exists():
        data = json.loads(mcp_path.read_text())
        try:
            headers = data["mcpServers"]["openrag"]["headers"]
            api_key = api_key or headers["X-API-Key"]
            username = username or headers["X-USERNAME"]
        except KeyError as e:
            raise SystemExit(
                f"ERROR: missing {e} at mcpServers.openrag.headers in {mcp_path}"
            )

    if not api_key or not username:
        raise SystemExit(
            "ERROR: no OpenRAG credentials found. Provide them via one of:\n"
            "  --api-key/--username command-line flags\n"
            "  OPENRAG_API_KEY / OPENRAG_USERNAME environment variables\n"
            f"  a .bob/mcp.json file at {mcp_path} (mcpServers.openrag.headers)"
        )
    return {"X-API-Key": api_key, "X-USERNAME": username}


def load_manifest(manifest_path: pathlib.Path) -> dict:
    if not manifest_path.exists():
        return {"version": 2, "files": {}}
    try:
        return json.loads(manifest_path.read_text())
    except json.JSONDecodeError:
        print(f"WARNING: could not parse {manifest_path}, starting fresh", file=sys.stderr)
        return {"version": 2, "files": {}}


def save_manifest(manifest_path: pathlib.Path, manifest: dict) -> None:
    manifest_path.write_text(json.dumps(manifest, indent=2))


def sha256_of(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def should_skip(path: pathlib.Path, size: int, max_size_bytes: int, manifest_path: pathlib.Path):
    """Return (skip: bool, reason: str, silent: bool)."""
    if path.resolve() == manifest_path.resolve():
        return True, "manifest file itself", True
    if path.name in SKIP_NAMES:
        return True, "junk file", True
    if path.name.startswith(SKIP_PREFIXES):
        return True, "office lock file", True
    if not docling_supported(path):
        return True, f"unsupported by Docling ({path.suffix or 'no extension'})", False
    if size > max_size_bytes:
        return (
            True,
            f"{size / (1024 * 1024):.1f} MB exceeds {max_size_bytes / (1024 * 1024):.0f} MB limit",
            False,
        )
    return False, "", False


def find_duplicate_uploaded_names(kb_dir: pathlib.Path, max_size_bytes: int, manifest_path: pathlib.Path) -> dict:
    """OpenRAG identifies documents by filename alone, not full path, and
    every source here is uploaded under "<stem>.md" -- so two files that
    differ only in extension (e.g. "Report.pdf" and "Report.docx") now
    collide too, on top of same-name files in different subfolders. Returns
    {uploaded_filename: [paths]} for every name that would collide, among
    files that aren't already excluded by should_skip.
    """
    seen = {}
    for path in kb_dir.rglob("*"):
        if path.is_dir():
            continue
        skip, _, _ = should_skip(path, path.stat().st_size, max_size_bytes, manifest_path)
        if skip:
            continue
        seen.setdefault(uploaded_filename_for(path), []).append(path)
    return {name: paths for name, paths in seen.items() if len(paths) > 1}


def is_unchanged(entry: dict, size: int, mtime: float, expected_uploaded_filename: str) -> bool:
    if not entry or entry.get("status") != "success":
        return False
    if entry.get("uploaded_filename") != expected_uploaded_filename:
        return False
    return entry.get("size") == size and abs(entry.get("mtime", 0) - mtime) < MTIME_TOLERANCE_SECONDS


def poll_task(session: requests.Session, base_url: str, task_id: str, timeout: int, interval: int):
    deadline = time.monotonic() + timeout
    while True:
        resp = session.get(f"{base_url}/api/v1/tasks/{task_id}", timeout=10)
        resp.raise_for_status()
        data = resp.json()
        status = (data.get("status") or "").lower()

        if status in TERMINAL_SUCCESS:
            return True, data
        if status in TERMINAL_FAILURE:
            return False, data

        if time.monotonic() >= deadline:
            return False, {"status": "timeout", "task_id": task_id}

        remaining = int(deadline - time.monotonic())
        print(f"    status={status or 'unknown'} -- polling again in {interval}s ({remaining}s remaining)...")
        time.sleep(interval)


def upload_file(session: requests.Session, base_url: str, upload_path: pathlib.Path, upload_filename: str, poll_timeout: int, poll_interval: int):
    with upload_path.open("rb") as fh:
        resp = session.post(
            f"{base_url}/api/v1/documents/ingest",
            files={"file": (upload_filename, fh, "text/markdown")},
            data={"replace_duplicates": "true", "delete_after_ingest": "true"},
            timeout=60,
        )

    if not resp.ok:
        print(f"    upload failed: HTTP {resp.status_code} -- {resp.text[:500]}", file=sys.stderr)
        return False, None

    body = resp.json()
    task_id = body.get("task_id")
    if not task_id:
        print(f"    upload accepted but no task_id in response: {body}", file=sys.stderr)
        return False, None

    print(f"    task_id: {task_id}")
    ok, result = poll_task(session, base_url, task_id, poll_timeout, poll_interval)
    if ok:
        print(f"    status=completed")
        return True, task_id
    else:
        print(f"    status={result.get('status')} -- {json.dumps(result)[:500]}", file=sys.stderr)
        return False, task_id


def check_remote_exists(session: requests.Session, base_url: str, filename: str) -> bool:
    """True if OpenRAG still has a document with this exact filename indexed.

    Uses OpenRAG's own search endpoint with an exact filename filter and a
    wildcard query, which skips embedding entirely and just runs the filter.
    On a request error, assumes the file is still present (trusts the local
    manifest) rather than triggering a spurious re-upload.
    """
    try:
        resp = session.post(
            f"{base_url}/api/v1/search",
            json={"query": "*", "filters": {"data_sources": [filename]}, "limit": 1},
            timeout=15,
        )
        resp.raise_for_status()
        return len(resp.json().get("results", [])) > 0
    except requests.RequestException as e:
        print(
            f"    WARNING: could not verify remote state for {filename} ({e}); assuming still present",
            file=sys.stderr,
        )
        return True


def delete_remote(session: requests.Session, base_url: str, filename: str) -> bool:
    """Delete a document from OpenRAG by filename. Returns True on success or
    if it was already gone server-side (HTTP 404)."""
    resp = session.delete(
        f"{base_url}/api/v1/documents",
        json={"filename": filename},
        timeout=30,
    )
    if resp.status_code == 404 or resp.ok:
        return True
    print(f"    remote delete failed: HTTP {resp.status_code} -- {resp.text[:300]}", file=sys.stderr)
    return False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--knowledge-base", type=pathlib.Path, default=DEFAULT_KB_DIR)
    parser.add_argument("--manifest", type=pathlib.Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--mcp-config", type=pathlib.Path, default=DEFAULT_MCP_CONFIG)
    parser.add_argument("--api-key", default=None, help="OpenRAG API key (or set OPENRAG_API_KEY)")
    parser.add_argument("--username", default=None, help="OpenRAG username (or set OPENRAG_USERNAME)")
    parser.add_argument("--converted-dir", type=pathlib.Path, default=DEFAULT_CONVERTED_DIR)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="OpenRAG base URL, e.g. http://localhost:3005")
    parser.add_argument("--max-size-mb", type=int, default=DEFAULT_MAX_SIZE_MB)
    parser.add_argument("--poll-timeout", type=int, default=DEFAULT_POLL_TIMEOUT)
    parser.add_argument("--poll-interval", type=int, default=DEFAULT_POLL_INTERVAL)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    kb_dir = args.knowledge_base.resolve()
    if not kb_dir.is_dir():
        raise SystemExit(f"ERROR: Knowledge base folder not found at {kb_dir}")

    converted_dir = args.converted_dir.resolve()
    converted_dir.mkdir(parents=True, exist_ok=True)

    manifest = load_manifest(args.manifest)
    files_manifest = manifest.setdefault("files", {})
    max_size_bytes = args.max_size_mb * 1024 * 1024

    dupes = find_duplicate_uploaded_names(kb_dir, max_size_bytes, args.manifest)
    if dupes:
        print(
            "WARNING: OpenRAG identifies documents by filename only (not folder path), "
            "and every file here is uploaded as \"<stem>.md\". The following would "
            "collide in OpenRAG -- uploading or deleting one affects all of them. "
            "Rename these to be unique:",
            file=sys.stderr,
        )
        for name, paths in sorted(dupes.items()):
            print(f"  {name}:", file=sys.stderr)
            for p in paths:
                print(f"    - {p}", file=sys.stderr)
        print("", file=sys.stderr)

    session = None
    if not args.dry_run:
        creds = load_credentials(args.mcp_config, args.api_key, args.username)
        session = requests.Session()
        session.headers.update(creds)

    ingested = failed = skipped = removed = 0

    # Reconciliation pass: a manifest entry whose local file is gone means the
    # file was deleted from the Knowledge base folder -- mirror that deletion
    # into OpenRAG and drop the manifest entry.
    for key in sorted(files_manifest.keys()):
        entry = files_manifest[key]
        if pathlib.Path(key).exists():
            continue
        filename = entry.get("uploaded_filename") or entry.get("filename") or pathlib.Path(key).name
        if args.dry_run:
            print(f"DRY-RUN  would remove from OpenRAG (local file deleted): {filename}")
            continue
        print(f"REMOVE  {filename} -- local file deleted, removing from OpenRAG")
        if delete_remote(session, args.base_url, filename):
            del files_manifest[key]
            removed += 1
        else:
            failed += 1

    for path in sorted(kb_dir.rglob("*")):
        if path.is_dir():
            continue

        stat = path.stat()
        size, mtime = stat.st_size, stat.st_mtime
        key = str(path.resolve())

        skip, reason, silent = should_skip(path, size, max_size_bytes, args.manifest)
        if skip:
            skipped += 1
            if not silent:
                print(f"SKIP  {path.name} -- {reason}", file=sys.stderr)
            continue

        expected_uploaded_filename = uploaded_filename_for(path)
        entry = files_manifest.get(key)

        # Migration: this entry was uploaded under a different filename than
        # the current run would use (e.g. it predates the local-Docling-
        # conversion step, so it's still sitting in OpenRAG under its raw
        # original filename). Clean up the stale document before re-ingesting
        # fresh under the new name.
        old_uploaded_filename = entry.get("uploaded_filename") or entry.get("filename") if entry else None
        if entry and old_uploaded_filename and old_uploaded_filename != expected_uploaded_filename:
            if args.dry_run:
                print(f"DRY-RUN  would migrate {path.name}: remove OpenRAG doc '{old_uploaded_filename}', re-ingest as '{expected_uploaded_filename}'")
            else:
                print(f"MIGRATE  {path.name} -- was uploaded as '{old_uploaded_filename}', switching to '{expected_uploaded_filename}'")
                delete_remote(session, args.base_url, old_uploaded_filename)
            entry = None

        if is_unchanged(entry, size, mtime, expected_uploaded_filename):
            if args.dry_run:
                print(f"SKIP  {path.name} -- already ingested (unchanged; remote state not checked in dry-run)")
                skipped += 1
                continue
            if check_remote_exists(session, args.base_url, expected_uploaded_filename):
                print(f"SKIP  {path.name} -- already ingested (confirmed present in OpenRAG)")
                skipped += 1
                continue
            print(f"RE-UPLOAD  {path.name} -- local record says ingested, but missing from OpenRAG")

        size_mb = size / (1024 * 1024)

        try:
            md_path = convert_to_markdown(path, converted_dir, kb_dir)
        except Exception as e:
            print(f"    conversion to Markdown failed: {e}", file=sys.stderr)
            failed += 1
            continue

        if args.dry_run:
            print(f"DRY-RUN  would upload: {path.name} ({size_mb:.1f} MB source) -> {expected_uploaded_filename} (see {md_path})")
            continue

        print(f"UPLOAD  {path.name} ({size_mb:.1f} MB source) -> {expected_uploaded_filename}")
        ok, task_id = upload_file(session, args.base_url, md_path, expected_uploaded_filename, args.poll_timeout, args.poll_interval)
        if ok:
            files_manifest[key] = {
                "path": key,
                "source_filename": path.name,
                "uploaded_filename": expected_uploaded_filename,
                "size": size,
                "mtime": mtime,
                "sha256": sha256_of(path),
                "task_id": task_id,
                "ingested_at": datetime.now(timezone.utc).isoformat(),
                "status": "success",
            }
            ingested += 1
        else:
            failed += 1

    if not args.dry_run:
        save_manifest(args.manifest, manifest)

    print(f"\n{'DRY-RUN summary' if args.dry_run else 'Manifest saved'}: "
          f"{ingested} ingested, {removed} removed, {failed} failed, {skipped} skipped.")

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
