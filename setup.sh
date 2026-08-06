#!/usr/bin/env bash
# setup.sh — One-command installer for IBM Project 4Bs ingestion tool
# Usage: bash setup.sh

set -e

echo ""
echo "=== IBM Project 4Bs — Setup ==="
echo ""

# ── 1. Check Python 3.8+ ──────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 is not installed. Please install Python 3.8 or later."
  echo "  macOS:  brew install python"
  echo "  Ubuntu: sudo apt install python3 python3-venv"
  exit 1
fi

PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$(python3 -c "import sys; print(sys.version_info.major)")
PY_MINOR=$(python3 -c "import sys; print(sys.version_info.minor)")

if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 8 ]; }; then
  echo "ERROR: Python 3.8+ is required. Found Python $PY_VERSION."
  exit 1
fi

echo "✓ Python $PY_VERSION found"

# ── 2. Create virtual environment ─────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d ".venv" ]; then
  echo "→ Creating virtual environment (.venv/)..."
  python3 -m venv .venv
else
  echo "✓ Virtual environment already exists (.venv/)"
fi

# ── 3. Install dependencies ───────────────────────────────────────────────────
echo "→ Installing dependencies (this may take a minute for docling)..."
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install -r requirements.txt
echo "✓ Dependencies installed"

# ── 4. Create Knowledge base folder if missing ───────────────────────────────
if [ ! -d "Knowledge base" ]; then
  mkdir -p "Knowledge base"
  echo "✓ Created 'Knowledge base/' folder — drop your files in here"
else
  echo "✓ 'Knowledge base/' folder exists"
fi

# ── 5. Done ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo ""
echo "  1. Drop PDF/PPTX/DOCX files into:  Knowledge base/"
echo ""
echo "  2. Preview what would be uploaded (no credentials needed):"
echo "       .venv/bin/python ingest_knowledge_base.py --dry-run"
echo ""
echo "  3. Run for real:"
echo "       .venv/bin/python ingest_knowledge_base.py \\"
echo "         --base-url http://<your-openrag-host>:3005 \\"
echo "         --api-key <your-api-key> \\"
echo "         --username <your-username>"
echo ""
echo "  Or set credentials as environment variables:"
echo "       export OPENRAG_API_KEY=your_key"
echo "       export OPENRAG_USERNAME=your_username"
echo "       .venv/bin/python ingest_knowledge_base.py --base-url http://localhost:3005"
echo ""
