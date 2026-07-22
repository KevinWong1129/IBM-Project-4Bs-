"""
app.py — Flask Web Interface
==============================
Lightweight web UI for the IBM Concert RAG system.
Exposes three endpoints:
  GET  /              — main query page
  POST /query         — run RAG and return JSON
  POST /export        — run RAG and download a file (pdf / docx / pptx)

Start:
  python app.py
Then open http://localhost:5001
"""

from __future__ import annotations

import os
import tempfile
import uuid
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_file
from dotenv import load_dotenv

load_dotenv()

from generate import run_rag
from exporters import export as export_file

app = Flask(__name__)
app.secret_key = os.urandom(24)

EXPORT_DIR = Path(tempfile.gettempdir()) / "concert_rag_exports"
EXPORT_DIR.mkdir(exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/query", methods=["POST"])
def query():
    data   = request.get_json(force=True)
    prompt = data.get("prompt", "").strip()
    use_openrag_chat = data.get("openrag_chat", False)
    if not prompt:
        return jsonify({"error": "prompt is required"}), 400
    try:
        result = run_rag(prompt, use_openrag_chat=use_openrag_chat)
        return jsonify({
            "answer":    result["answer"],
            "citations": result["citations"],
            "chunks":    [
                {"filename": c.get("filename", ""), "score": c.get("score", 0)}
                for c in result["chunks"]
            ],
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/export", methods=["POST"])
def export_endpoint():
    fmt    = request.form.get("format", "pdf").lower()
    prompt = request.form.get("prompt", "").strip()
    if not prompt:
        return jsonify({"error": "prompt is required"}), 400
    if fmt not in ("pdf", "docx", "pptx"):
        return jsonify({"error": f"Unsupported format: {fmt}"}), 400

    try:
        result   = run_rag(prompt)
        filename = f"concert_brief_{uuid.uuid4().hex[:8]}.{fmt}"
        out_path = str(EXPORT_DIR / filename)
        export_file(result["answer"], result["citations"], prompt, out_path, fmt)
        return send_file(out_path, as_attachment=True, download_name=filename)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"  IBM Concert RAG — running at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
