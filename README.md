# IBM Project 4Bs — OpenRAG Knowledge Base for Automated Client Content Generation

> A retrieval-augmented generation workflow that turns approved IBM sales and product content into grounded, client-ready assets faster.

## 1. Executive Summary

This project addresses a common sales enablement problem: valuable product collateral already exists, but it is scattered across repositories, difficult to search quickly, and slow to turn into usable client-facing material.

Our solution combines:

- **OpenRAG** as the retrieval and knowledge base layer
- **Docling** for high-fidelity document-to-Markdown conversion
- **IBM Bob** as the generation and workflow assistant
- **A lightweight ingestion pipeline** to keep the knowledge base aligned with approved source documents
- **Automated OpenRAG deployment** for rapid environment setup on a VM

The result is a workflow where a team member can ingest approved documents, query the knowledge base, and generate outputs such as:

- presentation decks
- one-pagers
- product summaries
- client-ready talking points

This README is written to make the project easy to evaluate across **problem clarity, IBM/Bob usage, technical implementation, completeness, and practical business value**.

---

## 2. Problem Statement

### The business problem

Sales and client-facing teams often need to produce tailored collateral quickly, but the source material is fragmented across multiple systems and file formats.

Typical pain points include:

- approved content is spread across **Box, Seismic, PDFs, PPTX, DOCX, and internal repositories**
- consultants spend time **searching, validating versions, and manually stitching content together**
- knowledge is trapped in individuals instead of being operationalised in a reusable system
- outdated or inconsistent messaging can reach clients
- creating a first draft of a one-pager or deck can take **hours instead of seconds**

### Why this matters

In a sales cycle, speed and consistency matter. If teams cannot retrieve trusted content quickly, they lose time, reduce responsiveness, and risk using stale material.

This project focuses on converting existing approved content into a **searchable, grounded, reusable knowledge base** that supports faster asset generation.

---

## 3. Proposed Solution

We built an **OpenRAG-powered knowledge base workflow** for automated client content generation.

At a high level:

1. Approved source documents are collected in a local **Knowledge base/** folder.
2. Each file is converted to **Markdown** using **Docling**.
3. The converted Markdown is uploaded into **OpenRAG** through its ingestion API.
4. OpenRAG performs chunking, embedding, and indexing.
5. A user queries the knowledge base through a lightweight interface / workflow.
6. **IBM Bob** helps drive prompt engineering, query refinement, and generation of client-ready outputs grounded in retrieved content.

### Core value proposition

- **Faster retrieval** of approved content
- **Grounded generation** instead of free-form hallucinated output
- **Repeatable ingestion** with manifest-based tracking
- **Operational simplicity** through deployment automation
- **Practical outputs** for sales enablement use cases

---

## 4. Target Users and Use Cases

### Primary users

- Sales consultants
- Sales engineers
- Client partners
- Solution architects
- Internal enablement teams

### Example use cases

- Generate a one-pager for a client interested in IBM Concert capabilities
- Build a deck outline from approved product collateral
- Summarise technical documentation into an executive brief
- Retrieve grounded answers to product positioning questions
- Reuse approved internal content without manually searching multiple files

---

## 5. How IBM Bob Is Used

IBM Bob is a meaningful part of the workflow, not just a peripheral tool.

### Bob contributions in this project

- **README and project articulation**: structuring the solution clearly for evaluation and handoff
- **Prompt engineering support**: helping shape grounded generation workflows
- **Query refinement**: improving how user requests can be translated into retrieval-friendly prompts
- **Code assistance**: accelerating scripting, debugging, and workflow design
- **Documentation quality**: improving clarity, completeness, and evaluator readability
- **Asset generation support**: enabling downstream creation of summaries, decks, and one-pagers from retrieved knowledge

### Why this matters for evaluation

This project does not treat Bob as a checkbox. Bob is used as an **agentic development and generation assistant** across:

- implementation support
- workflow design
- documentation improvement
- output generation strategy

That directly supports the **Bob** scoring dimension.

---

## 6. System Workflow

The workflow below is based on the project design captured in `openrag_workflow.html`.

### End-to-end flow

#### Deployment phase
- Provision a VM
- Deploy OpenRAG automatically
- Expose the OpenRAG API and web interface

#### Ingestion phase
- Collect source files from repositories such as Box and Seismic
- Extract product content from files such as PDF, PPTX, and DOCX
- Convert documents to Markdown using Docling
- Upload converted Markdown to OpenRAG
- Track ingestion state in a local manifest

#### Knowledge base phase
- OpenRAG stores indexed content for retrieval

#### Query and generation phase
- A team member submits a query
- The system retrieves relevant knowledge from OpenRAG
- IBM Bob supports generation of grounded outputs

#### Output phase
- Decks
- One-pagers
- Product summaries

### Workflow summary

`Sources -> Conversion -> OpenRAG ingestion -> Indexed knowledge base -> Query -> Bob-assisted generation -> Client asset`

---

## 7. Repository Structure

```text
.
├── README.md
├── ingest_knowledge_base.py
├── deploy_openrag_automated.sh
├── openrag_workflow.html
├── Project Proposal — OpenRAG Knowledge Base.pdf
├── Knowledge base/
├── converted_markdown/
├── Demo-html/
├── frontend-slides/
├── ibm-pptx-skill/
└── outputs/
```

### Important folders

- **Knowledge base/**  
  Source documents to be ingested into OpenRAG

- **converted_markdown/**  
  Cached Markdown generated from source files before upload

- **outputs/**  
  Generated presentation artefacts and related output files

- **Demo-html/**  
  Demo HTML assets for showcasing generated content

- **frontend-slides/** and **ibm-pptx-skill/**  
  Supporting presentation-generation assets and skills

---

## 8. Key Technical Components

## 8.1 `ingest_knowledge_base.py`

This is the core ingestion script.

### What it does

- scans the `Knowledge base/` directory recursively
- detects whether files are supported by **Docling**
- converts supported files to Markdown
- caches converted Markdown in `converted_markdown/`
- uploads Markdown to OpenRAG via `/api/v1/documents/ingest`
- polls ingestion tasks until completion
- stores ingestion metadata in `.ingest_manifest.json`
- skips unchanged files on later runs
- removes documents from OpenRAG if the local source file was deleted
- checks whether a supposedly ingested file still exists remotely
- handles migration from older upload naming behaviour

### Technical strengths

- **incremental ingestion**
- **two-way reconciliation**
- **manifest-based state tracking**
- **duplicate filename collision detection**
- **dry-run support**
- **clear operational behaviour for repeated runs**

These are strong technical signals for the **Technical** and **Completeness** scoring dimensions.

---

## 8.2 `deploy_openrag_automated.sh`

This script automates deployment of OpenRAG onto a fresh VM.

### What it does

- validates SSH connectivity and VM prerequisites
- checks user namespace configuration
- installs Podman, Podman Compose, and Python tooling
- initialises OpenRAG
- generates environment configuration
- creates or uploads a working `docker-compose.yml`
- pulls required container images
- starts OpenRAG services
- optionally sets up:
  - Ollama
  - Docling Serve
  - Cloudflare tunnels
- saves deployment metadata locally

### Why it matters

This script shows the project is not only a concept or notebook demo. It includes **deployment automation**, which improves reproducibility and operational readiness.

---

## 9. Architecture and Design Decisions

### Why convert to Markdown before upload?

Instead of uploading raw PDFs or PPTX files directly, this project converts documents locally using **Docling** first.

Benefits:

- better visibility into what is being ingested
- easier debugging and inspection
- more consistent text extraction
- improved control over the ingestion pipeline

### Why use a manifest?

The manifest enables:

- incremental updates
- skip logic for unchanged files
- deletion reconciliation
- traceability of ingestion history

### Why use OpenRAG?

OpenRAG provides the retrieval backbone:

- ingestion API
- chunking and indexing
- semantic retrieval
- integration potential for downstream generation workflows

### Why this architecture is practical

The architecture is intentionally modular:

- deployment is separated from ingestion
- ingestion is separated from generation
- converted content is inspectable
- outputs can be extended into multiple asset types

This makes the project easier to maintain, demo, and evolve.

---

## 10. Setup Instructions

> Note: the repository currently contains `deploy_openrag_automated.sh` and `ingest_knowledge_base.py`. The earlier README referenced `setup.sh` and `requirements.txt`, but those files are **not present in the current repository snapshot**. The instructions below therefore reflect the files that actually exist.

### Prerequisites

- Python 3
- An accessible OpenRAG instance
- OpenRAG credentials:
  - API key
  - username
- Source documents placed in `Knowledge base/`

### Python dependencies

The ingestion script imports:

- `requests`
- `docling`

Install them in your environment before running the script:

```bash
pip install requests docling
```

### Optional: create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install requests docling
```

---

## 11. Usage

## 11.1 Dry run

Use dry run to preview what would be converted and uploaded without making HTTP calls.

```bash
python ingest_knowledge_base.py --dry-run
```

## 11.2 Real ingestion run

```bash
python ingest_knowledge_base.py \
  --base-url http://<your-openrag-host>:3005 \
  --api-key <your-api-key> \
  --username <your-username>
```

## 11.3 Using environment variables

```bash
export OPENRAG_API_KEY=your_key
export OPENRAG_USERNAME=your_username

python ingest_knowledge_base.py --base-url http://localhost:3005
```

## 11.4 Credential fallback via MCP config

The script can also read credentials from:

```text
.bob/mcp.json
```

This supports workflows where Bob/OpenRAG MCP configuration already exists.

---

## 12. Automated Deployment Usage

To deploy OpenRAG to a VM:

```bash
bash deploy_openrag_automated.sh \
  --vm-host <host> \
  --vm-port <port> \
  --vm-user <user> \
  --ssh-key <path-to-private-key>
```

### Deployment outputs

The script provisions and reports access details for services such as:

- OpenRAG frontend
- Langflow
- OpenSearch
- Ollama
- optional public tunnel endpoints

---

## 13. Example Demo Narrative

A simple demo flow for evaluators:

1. Show the source files inside `Knowledge base/`
2. Run `python ingest_knowledge_base.py --dry-run`
3. Explain how files are converted into `converted_markdown/`
4. Show the workflow diagram in `openrag_workflow.html`
5. Explain how OpenRAG indexes the content
6. Demonstrate how a user query can produce:
   - a one-pager
   - a deck outline
   - a product summary
7. Show generated artefacts in `outputs/` and `Demo-html/`

This makes the project easier to understand from both a technical and business perspective.

---

## 14. Business Impact

### Expected impact

- reduce time to first draft from **hours to seconds/minutes**
- improve consistency of client-facing messaging
- reduce duplicated manual effort
- make approved internal knowledge reusable at scale
- support faster response in sales and solutioning workflows

### Why this is valuable

The project turns static collateral into an operational knowledge system. Instead of repeatedly searching for documents, teams can retrieve and repurpose trusted content quickly.

---

## 15. Evaluation Alignment

This section is included deliberately to align the project with AI-based judging criteria.

### IBM / IBM relevance
- Uses **IBM Bob** in a meaningful workflow role
- Targets an IBM sales enablement scenario
- References IBM product collateral and IBM-oriented use cases

### Problem definition
- Clear business pain: fragmented knowledge and slow asset creation
- Clear users: sales consultants, engineers, client partners
- Clear measurable value: faster turnaround and grounded outputs

### Bob usage
- Bob supports implementation, prompt design, workflow refinement, and documentation quality
- Bob is positioned as part of the agentic workflow, not just a coding assistant

### MCP / integration readiness
- The ingestion script supports `.bob/mcp.json` credential loading
- The project is structured to work with Bob/OpenRAG workflows

### Technical implementation
- Automated deployment script
- Incremental ingestion pipeline
- Markdown conversion and caching
- Manifest tracking
- Remote reconciliation
- Duplicate detection
- Dry-run mode

### Completeness
- Problem statement
- architecture
- workflow
- deployment
- ingestion
- outputs
- demo assets
- proposal document

---

## 16. Limitations and Next Steps

### Current limitations

- the current repository snapshot does not include a pinned `requirements.txt`
- the README describes the workflow and scripts, but a full end-user UI implementation is lightweight / external to this repo
- duplicate uploaded filenames can still collide if source stems are not unique

### Recommended next steps

- add a `requirements.txt` for reproducible Python setup
- add screenshots of OpenRAG ingestion and retrieval
- add sample prompts and generated outputs in the README
- add evaluation metrics from live testing
- add a thin query UI that directly demonstrates Bob-assisted generation

---

## 17. Security and Data Handling

This project is designed for approved internal content workflows, so data handling matters.

### Good practices already reflected

- credentials are not hardcoded in the ingestion script
- environment variables are supported
- MCP config loading is supported
- source content and converted Markdown are kept local
- manifest-based tracking avoids unnecessary re-uploading

### Recommended practice

Do **not** publicly share confidential source documents, converted Markdown, or internal-only collateral unless they are explicitly sanitised for demo use.

---

## 18. What to Show in a Submission or Demo

If this project is being judged, the strongest story is:

1. **Problem**: sales teams waste hours rebuilding assets from scattered approved content
2. **Solution**: OpenRAG + Docling + Bob create a grounded knowledge workflow
3. **Technical proof**: automated deployment + ingestion + manifest reconciliation
4. **Business value**: faster, more consistent, client-ready outputs
5. **IBM relevance**: Bob is used meaningfully in the workflow and development process

---

## 19. Conclusion

IBM Project 4Bs demonstrates a practical, technically credible approach to **automated client content generation** using a retrieval-backed knowledge base.

It is not just a document uploader. It is a workflow that connects:

- approved enterprise content
- structured ingestion
- retrieval infrastructure
- Bob-assisted generation
- reusable client-facing outputs

That combination makes it relevant for sales enablement, technically demonstrable, and well-positioned for stronger evaluation performance.

---

## 20. Reference Files in This Repository

- `README.md` — project overview and evaluator-facing documentation
- `ingest_knowledge_base.py` — ingestion pipeline
- `deploy_openrag_automated.sh` — VM deployment automation for OpenRAG
- `openrag_workflow.html` — workflow visualisation
- `Project Proposal — OpenRAG Knowledge Base.pdf` — original proposal
- `outputs/` — generated presentation artefacts
- `Demo-html/` — demo HTML outputs