# IBM Project 4Bs — OpenRAG Knowledge Base Ingestion Tool

Automatically converts and ingests documents from a local `Knowledge base/` folder into an [OpenRAG](https://github.com/IBM/openrag) instance.

---

## Quick Start (one command)

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/KevinWong1129/IBM-Project-4Bs-/main/setup.sh | bash
```

Or clone and run the setup script manually:

```bash
git clone https://github.com/KevinWong1129/IBM-Project-4Bs-.git
cd IBM-Project-4Bs-
bash setup.sh
```

---

## What the setup script does

1. Checks that Python 3.8+ is installed
2. Creates a virtual environment (`.venv/`)
3. Installs all dependencies from `requirements.txt` (`docling`, `requests`)
4. Creates an empty `Knowledge base/` folder if it doesn't exist
5. Prints usage instructions

---

## Manual install

```bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt
```

---

## Usage

### Dry run (no credentials needed — previews what would be uploaded)

```bash
source .venv/bin/activate
python ingest_knowledge_base.py --dry-run
```

### Real run

```bash
python ingest_knowledge_base.py \
  --base-url http://<your-openrag-host>:3005 \
  --api-key <your-api-key> \
  --username <your-username>
```

### Using environment variables instead of flags

```bash
export OPENRAG_API_KEY=your_key
export OPENRAG_USERNAME=your_username
python ingest_knowledge_base.py --base-url http://localhost:3005
```

---

## How it works

1. Drop files (PDF, PPTX, DOCX, etc.) into the `Knowledge base/` folder
2. Run the script — it converts each file to Markdown via [Docling](https://github.com/DS4SD/docling), then uploads to OpenRAG
3. A local manifest (`.ingest_manifest.json`) tracks what has been ingested — unchanged files are skipped on subsequent runs
4. If a file is deleted locally, the script removes it from OpenRAG too

---

## Requirements

- Python 3.8 or later
- A running OpenRAG instance
- OpenRAG API key and username

---

## What NOT to share

When sharing this tool, only send:
- `ingest_knowledge_base.py`
- `requirements.txt`
- `setup.sh`

**Do NOT share** `Knowledge base/`, `.ingest_manifest.json`, or `converted_markdown/` — these contain your source documents and their converted text.
