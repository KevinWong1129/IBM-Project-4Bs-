# Product Requirement Document (PRD): OpenRAG Knowledge Base for Automated Client Content Generation

**Author:** IBM Intern (Mentored by Tech Sales Team)  
**Date:** July 22, 2026  
**Track:** Sales Enablement / Productivity  
**Core Technologies:** IBM Bob, OpenRAG, IBM watsonx.ai, Box API, Seismic API  

---

## 1. Executive Summary

IBM client-facing tech sales teams spend a significant portion of their preparation time—often 2 to 4 hours per engagement—manually searching for, verifying, and assembling product content across disparate repositories like Box and Seismic. This manual process is not only inefficient but also prone to errors, such as utilizing outdated or unapproved materials. 

This project proposes the development of an intelligent, automated Retrieval-Augmented Generation (RAG) knowledge base. By integrating **OpenRAG** for robust document ingestion and semantic retrieval, and **IBM Bob** (powered by **watsonx.ai**) for query rewriting and content generation, this system will automatically ingest product content from Box and Seismic. It will enable tech sales professionals to generate polished, source-grounded client assets—such as one-pagers, presentation outlines, and product summaries—on demand, significantly reducing preparation time and ensuring content accuracy.

## 2. Problem Statement

The current workflow for preparing client-facing materials is highly fragmented and manual. The core pain points include:

*   **Fragmented Repositories:** Content is scattered across Box folders, Seismic channels, and email threads, making it difficult to locate the single source of truth.
*   **Time Inefficiency:** Assembling a cohesive one-pager or presentation deck requires hours of manual searching, reading, and formatting.
*   **Version Control Issues:** Without a centralized, searchable index, sales teams risk sharing stale or incorrect versions of documents with clients.
*   **Knowledge Silos:** Institutional knowledge regarding which documents are most effective for specific client scenarios is often locked within individual team members.

## 3. Proposed Solution & Architecture

The proposed solution is a RAG-powered knowledge base that automates the ingestion, indexing, and generation of sales materials. 

### 3.1. High-Level Architecture

The system architecture is divided into two primary pipelines: the Ingestion Pipeline and the Generation Pipeline.

1.  **Ingestion Pipeline (Background Process):**
    *   **Sources:** Box and Seismic APIs.
    *   **Processing:** A Python-based pipeline fetches documents (PDFs, PPTX, DOCX, HTML) on a scheduled basis.
    *   **OpenRAG Integration:** The fetched documents are passed to OpenRAG. OpenRAG utilizes **Docling** to parse and chunk the documents, and **OpenSearch** to embed and store the vectors, creating a semantically searchable index.

2.  **Generation Pipeline (User-Facing Process):**
    *   **User Interface:** A lightweight query interface (OpenRAG UI or a custom Flask app) where team members input natural language prompts.
    *   **Query Rewriting:** **IBM Bob** intercepts the user's query and refines it to ensure optimal retrieval from the vector database.
    *   **Semantic Retrieval:** OpenRAG queries the OpenSearch database to retrieve the most relevant document chunks based on the refined query.
    *   **Asset Generation:** The retrieved context, along with the original prompt, is sent to **IBM Bob** (utilizing IBM Granite models via watsonx.ai). Bob generates the requested asset (e.g., a PPTX outline or a Markdown one-pager), ensuring all claims are grounded in the retrieved sources.

### 3.2. Key Features

*   **Automatic Ingestion:** Scheduled synchronization with Box and Seismic ensures the knowledge base is always up-to-date without manual intervention.
*   **Semantic Search:** Users can find relevant content using natural language, bypassing the need for exact keyword matches or knowing document locations.
*   **On-Demand Asset Generation:** The system generates structured outputs (one-pagers, deck outlines) grounded entirely in approved IBM content.
*   **Source Citations:** Every generated asset includes citations linking back to the exact source document in Box or Seismic, ensuring traceability and trust.
*   **IBM-Native Security:** The solution is built entirely on IBM infrastructure (IBM Bob, OpenRAG, watsonx.ai) with credentials securely managed via IBM Key Protect.

## 4. Detailed Step-by-Step Workflow

This section breaks down the workflow of the automation system, explaining how data moves from the source repositories to the final generated asset.

### Step 1: Automated Content Ingestion (The Foundation)

The process begins with gathering the raw materials. The system uses a Python script, orchestrated by LangChain or a simple cron job, to connect to the Box and Seismic APIs. 

*   **Action:** The script authenticates using OAuth credentials securely stored in IBM Key Protect. It then queries specific, pre-approved folders in Box and channels in Seismic for new or updated product documents.
*   **Result:** A raw collection of files (PDFs, PPTX, DOCX) is temporarily downloaded to the processing environment.

### Step 2: Parsing and Chunking with OpenRAG and Docling

Raw documents cannot be directly understood by an AI model; they must be processed into smaller, meaningful pieces.

*   **Action:** The downloaded files are fed into the **OpenRAG** framework. OpenRAG utilizes a component called **Docling**, an open-source tool developed by IBM specifically for document parsing. Docling reads the complex layouts of PDFs and presentations, extracting text, tables, and metadata.
*   **Action:** Docling then "chunks" the text. This means it splits the large documents into smaller paragraphs or sections (e.g., 500-word blocks) while preserving the context and metadata (like the document title and source URL).
*   **Result:** The raw documents are transformed into thousands of structured text chunks.

### Step 3: Embedding and Indexing in OpenSearch

To enable semantic search (searching by meaning rather than exact keywords), the text chunks must be converted into numbers.

*   **Action:** OpenRAG takes each text chunk and passes it through an embedding model (hosted on watsonx.ai). This model converts the text into a high-dimensional vector (a long list of numbers that represents the semantic meaning of the text).
*   **Action:** These vectors, along with the original text and metadata, are stored in **OpenSearch**, the vector database component of OpenRAG.
*   **Result:** A fully searchable, semantic index of all IBM product content is established.

### Step 4: User Query and IBM Bob Query Rewriting

Now the system is ready for a user. A tech sales team member needs a document.

*   **Action:** The user opens the interface and types a prompt, for example: *"Generate a 5-slide PPT outline for the new watsonx.data features tailored for a retail client."*
*   **Action:** Before searching the database, the prompt is sent to **IBM Bob**. Bob acts as an intelligent intermediary. It analyzes the prompt and rewrites it to be more effective for a database search. It might expand "retail" to include related terms or clarify "watsonx.data features."
*   **Result:** An optimized search query is generated.

### Step 5: Semantic Retrieval via OpenRAG

The system must now find the facts to answer the user's prompt.

*   **Action:** The optimized query is converted into a vector and compared against the vectors stored in OpenSearch. OpenSearch retrieves the top *N* (e.g., top 5) most relevant text chunks that match the meaning of the query.
*   **Result:** The system now holds the specific paragraphs from approved IBM documents that discuss watsonx.data features relevant to retail.

### Step 6: Asset Generation with IBM Bob and watsonx.ai

The final step is to synthesize the retrieved facts into the requested format.

*   **Action:** The original user prompt and the retrieved text chunks are combined into a single, comprehensive prompt. This is sent to **IBM Bob**, which utilizes a powerful generative model like IBM Granite via watsonx.ai.
*   **Action:** Bob is instructed to act as a tech sales assistant. It reads the retrieved chunks and generates the requested asset (in this case, a 5-slide PPT outline). Crucially, Bob is constrained to *only* use the information provided in the chunks, preventing hallucinations.
*   **Action:** Bob appends citations to the generated text, linking back to the metadata of the retrieved chunks.
*   **Result:** A complete, accurate, and cited document or presentation outline is generated and presented to the user.

## 5. Success Metrics

To evaluate the effectiveness of this automation system, the following metrics will be tracked:

| Metric | Target |
| :--- | :--- |
| **Time Savings** | ≥ 80% reduction in time required to produce a first-draft client asset compared to the manual process. |
| **Retrieval Accuracy** | ≥ 90% relevance score, meaning the top 5 retrieved chunks contain the necessary information for benchmark queries. |
| **Factual Grounding** | 100% of generated claims must be traceable to a cited source document from Box or Seismic. |
| **User Adoption** | 10+ active users from the tech sales team within 4 weeks of the initial launch. |
| **Security Compliance** | Zero hardcoded credentials; all data access is strictly controlled and audited. |

## 6. Anticipated Challenges & Mitigation

*   **API Access Delays:** Securing enterprise admin approval for Box and Seismic APIs can be time-consuming. *Mitigation: Submit access requests immediately upon project kickoff.*
*   **Complex Document Formats:** Parsing tables and embedded images in PDFs and PPTXs is notoriously difficult. *Mitigation: Leverage IBM Docling's advanced parsing capabilities within OpenRAG and allocate time for format-specific tuning.*
*   **Hallucinations:** The LLM might generate plausible but incorrect information if retrieval fails. *Mitigation: Implement strict prompting constraints within IBM Bob and build an evaluation harness to systematically test retrieval quality.*

---
*This document outlines the foundational requirements and workflow for the OpenRAG Knowledge Base project. It serves as the blueprint for the 10-week internship development cycle.*
