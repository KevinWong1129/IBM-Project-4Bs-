---
name: ibm-pptx
description: >-
  Use when the user wants to generate, create, or build an IBM-branded
  PowerPoint presentation (.pptx) for any IBM product, service, or topic —
  applies IBM brand guidelines (IBM Plex Sans, #1261FD blue, white/gray/blue
  slide themes, footer bar, confidentiality line) and sources content from
  OpenRAG before generating with pptxgenjs. Triggers on phrases like "IBM
  pitch deck", "IBM presentation", "IBM pptx", "IBM slides", or any request
  for an IBM-branded deck.
version: 1.0.0
metadata:
  disable-model-invocation: false
---

# IBM-Branded PPTX Generator

This skill produces a professional IBM-branded `.pptx` for **any IBM product or topic**.
It reads the IBM brand guidelines bundled in this skill directory, queries OpenRAG for
topic-specific content, then generates the file with `pptxgenjs`.

Supporting reference file (in this skill's directory):
- **`ibm-brand-guidelines.md`** — canonical IBM brand rules. Load with `read_file` before
  writing any slide code.

---

## Step 0 — Confirm prerequisites

1. Check `pptxgenjs` is available:
   ```bash
   node -e "require('pptxgenjs')" && echo ok
   ```
   If it fails: `npm install pptxgenjs`

2. Confirm the `mcp__openrag__openrag_search` MCP tool is reachable (skip OpenRAG steps if not).

3. **Read the brand guidelines now** — load
   `<skill-dir>/ibm-brand-guidelines.md` with `read_file` before writing any code.
   Every rule in that file overrides generic defaults for the entire task.

---

## Step 1 — Clarify the brief (ask once if not already clear)

Gather:
- **Topic / IBM product** — e.g. "IBM Concert", "IBM watsonx", "IBM Cloud Pak for Security"
- **Audience / client name** — affects cover and closing lines (e.g. "HKBEA", "Generic")
- **Slide count** — default: 8 slides
- **Output path** — default: `outputs/<topic-slug>.pptx`
- **Any specific sections to emphasise**

---

## Step 2 — Source content from OpenRAG

Run up to four searches in parallel, tailored to the topic:

```
mcp__openrag__openrag_search: "<topic> features capabilities value proposition"         limit=12
mcp__openrag__openrag_search: "<topic> customer pain points challenges use cases"        limit=8
mcp__openrag__openrag_search: "<topic> ROI business outcomes metrics statistics results" limit=8
mcp__openrag__openrag_search: "<topic> competitive differentiation why IBM"              limit=6
```

Organise findings into:
- **Product one-liner** — what the product does
- **Key capabilities** (3–6 bullets per capability module)
- **KPI statistics** — exact numbers with source labels if available
- **Customer pain points** — 5–8 items, first-person phrasing ("Too many alerts…")
- **Why IBM / differentiators** — 3–4 items vs competitors
- **Next steps** — trial URL, demo request, contact info (from docs if available)

If OpenRAG returns no results for a query, fall back to your training knowledge for that section
and note it in the final report.

---

## Step 3 — Plan the slide structure

Use this default 8-slide skeleton and adapt it to the topic:

| # | Role         | Background       | Layout pattern                        |
|---|--------------|------------------|---------------------------------------|
| 1 | Cover        | IBM Blue `1261FD`| Headline 44pt bold + tagline + confidentiality line |
| 2 | Agenda       | White `FFFFFF`   | Numbered card grid (2×3 or 2×2)      |
| 3 | The Challenge| White            | Stat callouts (left) + pain points (right) |
| 4 | Product intro| IBM Blue         | Understand / Decide / Act or equivalent 3-pillar layout |
| 5 | Capabilities | White            | 3+2 or 2+2 card grid with KPIs       |
| 6 | Outcomes/ROI | Cool Gray `F1F4F7`| Large stat callouts + 3 outcome columns |
| 7 | Why IBM?     | White            | Differentiators (left) + comparison table (right) |
| 8 | Next Steps   | IBM Blue         | 3-step numbered cards + closing line  |

Adjust slide count and titles to fit the topic — do not force a structure that doesn't fit.

---

## Step 4 — Write the pptxgenjs script

Write the generator script to `<output-path-stem>.js`.

### Mandatory IBM brand constants (memorise these)

```js
const IBM_BLUE   = '1261FD';   // cover, divider, accent
const IBM_WHITE  = 'FFFFFF';   // default content bg
const IBM_GRAY10 = 'F1F4F7';   // light variant bg
const IBM_BORDER = 'C1C7CD';   // borders, footer rule
const IBM_BLACK  = '000000';   // body text on white/gray
const IBM_MUTED  = '565656';   // captions, footer text, secondary
const IBM_LIGHT  = 'D0E4FF';   // text on blue backgrounds
const FONT       = 'IBM Plex Sans';
```

### Mandatory layout rules

- `pres.layout = 'LAYOUT_16x9'` — canvas is **10" × 5.625"**
- Set `fontFace: FONT` on **every** `addText` call
- Hex colors: **never** prefix `#`, **never** 8 digits — both silently corrupt the file
- **No gradient fills** — IBM uses flat solid fills only
- **No text drop-shadows**
- `transparency: 0–100` on fills; `opacity: 0.0–1.0` on shadows (mixing them is silently ignored)
- **Never share** an options object between two `add*` calls — pptxgenjs mutates in place
- One `new pptxgen()` per output file

### Footer bar — required on every content slide (slides 2–7)

```js
function addFooter(slide, pageNum, onBlue) {
  const textColor = onBlue ? 'D0E4FF' : '565656';
  const bgColor   = onBlue ? '1261FD' : 'FFFFFF';
  // Border line
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.325, w: 10, h: 0.001,
    fill: { color: 'C1C7CD' }, line: { color: 'C1C7CD' }
  });
  // Footer bg
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.326, w: 10, h: 0.299,
    fill: { color: bgColor }, line: { color: bgColor }
  });
  // Left: deck title
  slide.addText('IBM <Product> Platform', {  // replace with actual title
    x: 0.38, y: 5.33, w: 7, h: 0.28,
    fontFace: 'IBM Plex Sans', fontSize: 9, color: textColor,
    valign: 'middle', align: 'left', margin: 0
  });
  // Right: zero-padded page number
  slide.addText(String(pageNum).padStart(2, '0'), {
    x: 9.2, y: 5.33, w: 0.42, h: 0.28,
    fontFace: 'IBM Plex Sans', fontSize: 9, color: textColor,
    valign: 'middle', align: 'right', margin: 0
  });
}
```

### Cover slide rules

```
Bottom-left confidentiality line:  "Confidential  |  IBM Hong Kong  |  2026"
Font: IBM Plex Sans 10pt, color D0E4FF (light blue on blue bg)
```

### Closing slide rules

```
Bottom line:  "ibm.com/<product>  |  IBM Hong Kong  |  © 2026 IBM Corporation"
```

### Capability card grid alignment

When using a 3-card row (Row 1) + 2-card row (Row 2):
- Both rows share `x: 0.38` left margin and the same right edge
- Row 2 gap = `(row1_right_edge - 0.38 - 2 * card_width) / 1`
- Row 1 card width default: `2.85"`, gap: `0.23"`

---

## Step 5 — Generate the deck

```bash
node <script-path>
```

Confirm `✅ <output>.pptx written` in stdout.

---

## Step 6 — QA loop (run until all three pass)

Fix in the script, regenerate, restart from 6a after any failure.

### 6a — Structural validation
```bash
python3 ppt-master/skills/ppt-master/scripts/pptx_opc_validation.py <output.pptx>
python3 ppt-master/skills/ppt-master/scripts/pptx_delivery_check.py <output.pptx>
```
- Exit 0 required from OPC validation
- `"errors": []` required from delivery check
- Advisory `font_portability` for IBM Plex Sans is expected — not a failure

### 6b — Content QA
```bash
markitdown <output.pptx>
markitdown <output.pptx> | grep -iE "\bx{3,}\b|lorem|ipsum|\bTODO|\[insert"
```
- Grep must return empty (no placeholder text)
- All slide headlines and key stats must appear

### 6c — Visual QA
```bash
python3 ppt-master/skills/ppt-master/scripts/pptx_to_svg.py <output.pptx> -o outputs/preview_svgs
cat outputs/preview_svgs/conversion-report.json
```
- `"warnings": 0` required
- Inspect each slide SVG for: no overflow, no overlap, footer on all content slides,
  IBM Blue on cover + closing only, no accent stripes or title underlines

**Stop only when**: zero errors · zero placeholder text · zero visual blockers · all slides present.

---

## Step 7 — Report

State:
- Output file path
- Slide count
- Content sources used (OpenRAG queries that returned results vs training knowledge)
- Any QA advisory notes (font portability is normal)
