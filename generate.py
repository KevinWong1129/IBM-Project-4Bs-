"""
generate.py — RAG Generation Pipeline
========================================
Accepts a natural-language prompt, retrieves relevant chunks from the
OpenRAG knowledge base, then calls IBM watsonx.ai to produce a grounded
response.  Results can be returned as plain text or exported to a file.

Usage
-----
  # interactive single query
  python generate.py --prompt "Summarise IBM Concert's key differentiators"

  # export to PDF
  python generate.py --prompt "..." --format pdf --output out/brief.pdf

  # export to DOCX
  python generate.py --prompt "..." --format docx --output out/brief.docx

  # export to PPTX outline
  python generate.py --prompt "..." --format pptx --output out/deck.pptx
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

# ── Configuration ────────────────────────────────────────────────────────────
OPENRAG_BASE_URL  = os.getenv("OPENRAG_BASE_URL", "http://localhost:3005")
OPENRAG_API_KEY   = os.getenv("OPENRAG_API_KEY", "")
OPENRAG_USERNAME  = os.getenv("OPENRAG_USERNAME", "")

WATSONX_URL       = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
WATSONX_API_KEY   = os.getenv("WATSONX_API_KEY", "")
WATSONX_PROJECT   = os.getenv("WATSONX_PROJECT_ID", "")
WATSONX_MODEL     = os.getenv("WATSONX_MODEL_ID", "ibm/granite-13b-chat-v2")

TOP_K_CHUNKS = 5  # number of context chunks to retrieve

# ── OpenRAG search ────────────────────────────────────────────────────────────

def _openrag_headers() -> dict:
    return {
        "X-API-Key": OPENRAG_API_KEY,
        "X-USERNAME": OPENRAG_USERNAME,
        "Content-Type": "application/json",
    }


def search_knowledge_base(query: str, top_k: int = TOP_K_CHUNKS) -> list[dict]:
    """
    Call OpenRAG semantic search and return the top-k relevant chunks.
    Each chunk dict contains at least: 'text', 'filename', 'score'.
    """
    url = f"{OPENRAG_BASE_URL}/search"
    payload = {"query": query, "limit": top_k, "score_threshold": 0.0}
    resp = requests.post(url, headers=_openrag_headers(), json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # OpenRAG returns {"results": [...]} or a list directly
    if isinstance(data, list):
        return data
    return data.get("results", [])


def openrag_chat(message: str, chat_id: str | None = None) -> tuple[str, str]:
    """
    Use OpenRAG's built-in RAG chat endpoint (retrieval + generation in one call).
    Returns (answer_text, chat_id).
    """
    url = f"{OPENRAG_BASE_URL}/chat"
    payload: dict = {"message": message, "limit": TOP_K_CHUNKS, "stream": False}
    if chat_id:
        payload["chat_id"] = chat_id
    resp = requests.post(url, headers=_openrag_headers(), json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    answer  = data.get("response") or data.get("answer") or str(data)
    new_id  = data.get("chat_id") or chat_id or ""
    return answer, new_id


# ── watsonx.ai generation ────────────────────────────────────────────────────

def _watsonx_iam_token() -> str:
    """Exchange an IBM Cloud API key for a short-lived IAM bearer token."""
    resp = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": WATSONX_API_KEY,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


SYSTEM_PROMPT = """\
You are an IBM Tech Sales Assistant. Your job is to help IBM sales professionals
create accurate, professional client-facing materials.

Rules:
1. ONLY use information explicitly stated in the provided Context sections.
2. Do NOT add facts, statistics, or product details not found in the context.
3. Cite every claim with [Source: <filename>] inline.
4. Be concise, professional, and structured.
5. If the context does not contain enough information, say so clearly.
"""


def build_augmented_prompt(user_prompt: str, chunks: list[dict]) -> str:
    """Combine retrieved chunks with the user prompt into a single LLM prompt."""
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        source   = chunk.get("filename", "unknown")
        text     = chunk.get("text", "")
        score    = chunk.get("score", 0)
        context_parts.append(
            f"--- Context [{i}] | Source: {source} | Relevance: {score:.2f} ---\n{text}"
        )
    context_block = "\n\n".join(context_parts)

    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"=== RETRIEVED CONTEXT ===\n{context_block}\n\n"
        f"=== USER REQUEST ===\n{user_prompt}\n\n"
        f"=== YOUR RESPONSE ===\n"
    )


def generate_with_watsonx(prompt: str) -> str:
    """Call the watsonx.ai text generation REST endpoint."""
    token = _watsonx_iam_token()
    url   = f"{WATSONX_URL}/ml/v1/text/generation?version=2024-05-31"
    payload = {
        "model_id": WATSONX_MODEL,
        "project_id": WATSONX_PROJECT,
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 1500,
            "repetition_penalty": 1.1,
        },
    }
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    resp.raise_for_status()
    results = resp.json().get("results", [{}])
    return results[0].get("generated_text", "").strip()


# ── Sources helper ────────────────────────────────────────────────────────────

def format_citations(chunks: list[dict]) -> str:
    seen = {}
    for chunk in chunks:
        fname = chunk.get("filename", "unknown")
        score = chunk.get("score", 0)
        if fname not in seen or score > seen[fname]:
            seen[fname] = score
    lines = [f"  [{i+1}] {fname}  (relevance: {seen[fname]:.2f})"
             for i, fname in enumerate(seen)]
    return "\n".join(lines)


# ── Main RAG pipeline ─────────────────────────────────────────────────────────

def run_rag(prompt: str, use_openrag_chat: bool = False) -> dict:
    """
    Full pipeline:
      1. Retrieve relevant chunks via OpenRAG semantic search.
      2. Build an augmented prompt.
      3. Generate an answer with watsonx.ai (or OpenRAG built-in chat).
      4. Return a result dict with keys: answer, chunks, citations.
    """
    print(f"\n[RAG] Query: {prompt!r}")

    if use_openrag_chat:
        # Shortcut: OpenRAG's own RAG-chat endpoint (uses its configured LLM)
        print("[RAG] Using OpenRAG built-in chat …")
        answer, _ = openrag_chat(prompt)
        return {"answer": answer, "chunks": [], "citations": ""}

    # Step 1 — Semantic retrieval
    print(f"[RAG] Retrieving top-{TOP_K_CHUNKS} chunks …")
    chunks = search_knowledge_base(prompt, TOP_K_CHUNKS)
    print(f"[RAG] Retrieved {len(chunks)} chunk(s)")

    if not chunks:
        return {
            "answer": "No relevant documents found in the knowledge base for that query.",
            "chunks": [],
            "citations": "",
        }

    # Step 2 — Augmented prompt
    augmented = build_augmented_prompt(prompt, chunks)

    # Step 3 — watsonx.ai generation
    print("[RAG] Generating with watsonx.ai …")
    answer = generate_with_watsonx(augmented)

    # Step 4 — citations
    citations = format_citations(chunks)

    return {"answer": answer, "chunks": chunks, "citations": citations}


# ── CLI entry-point ──────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="IBM Concert RAG generator")
    parser.add_argument("--prompt", type=str, required=True,
                        help="Natural-language prompt / request")
    parser.add_argument("--format", choices=["text", "pdf", "docx", "pptx"],
                        default="text", help="Output format (default: text)")
    parser.add_argument("--output", type=str, default=None,
                        help="Output file path (auto-generated if omitted)")
    parser.add_argument("--openrag-chat", action="store_true",
                        help="Use OpenRAG built-in chat instead of watsonx.ai")
    args = parser.parse_args()

    result = run_rag(args.prompt, use_openrag_chat=args.openrag_chat)
    answer     = result["answer"]
    citations  = result["citations"]

    if args.format == "text":
        print("\n" + "="*60)
        print(answer)
        if citations:
            print("\n--- Sources ---")
            print(citations)
    else:
        # Delegate to the exporters module
        from exporters import export
        out_path = args.output or f"output.{args.format}"
        export(answer, citations, args.prompt, out_path, args.format)
        print(f"\n[RAG] Saved to: {out_path}")


if __name__ == "__main__":
    main()
