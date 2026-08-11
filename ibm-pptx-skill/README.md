# ibm-pptx — IBM-Branded PPTX Skill for Bob

A [Bob](https://www.ibm.com/bob) skill that generates professional IBM-branded PowerPoint presentations (`.pptx`) for **any IBM product or topic** — using OpenRAG for content and IBM brand guidelines for design.

## What it does

When activated, the skill:
1. Reads the bundled IBM brand guidelines (IBM Plex Sans, `#1261FD` blue, correct footer bar)
2. Queries your OpenRAG knowledge base for product-specific content
3. Writes a `pptxgenjs` generator script and runs it to produce a `.pptx`
4. Runs a full QA loop (structural validation → content check → visual SVG check)

Works for any IBM product: Concert, watsonx, Cloud Pak, Z Systems, etc.

## Install — one command

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/KevinWong1129/IBM-Project-4Bs-/main/ibm-pptx-skill/install.sh)
```

This installs the skill globally to `~/.bob/skills/ibm-pptx/` so it's available in every workspace.

## Usage

Start a **new** Bob conversation after installing, then say:

```
Generate an IBM pitch deck for watsonx
```

or use the slash command:

```
/ibm-pptx
```

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill instructions — the step-by-step workflow Bob follows |
| `ibm-brand-guidelines.md` | IBM brand rules bundled as a reference (IBM Plex Sans, colors, footer spec) |
| `install.sh` | One-command installer |

## Requirements

- [Bob](https://www.ibm.com/bob) AI assistant
- `node` + `pptxgenjs` (`npm install pptxgenjs`)
- OpenRAG MCP tool (optional — falls back to training knowledge if unavailable)
- `markitdown`, `python3` for QA steps
