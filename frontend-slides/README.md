# IBM-Branded Frontend Slides Plugin

A portable Bob plugin that generates **IBM Developer brand-compliant HTML presentations** from any project folder. Drop it in, point Bob at it, and every deck you generate will automatically follow IBM's official 2021 presentation guidelines — correct fonts, exact colors, grid spacing, footer bars, and slide layout catalogue.

---

## What's inside

```
plugins/frontend-slides/
├── .claude-plugin/
│   └── plugin.json                  ← Plugin registration metadata
└── skills/
    └── frontend-slides/
        ├── SKILL.md                 ← Master instructions for Bob (IBM Brand Mode lives here)
        ├── IBM_BRAND_GUIDELINES.md  ← Full IBM brand spec extracted from .potx template
        ├── STYLE_PRESETS.md         ← 12 style presets + IBM Developer preset
        ├── viewport-base.css        ← Mandatory 1920×1080 fixed-stage CSS
        ├── html-template.md         ← HTML architecture reference
        ├── animation-patterns.md    ← Animation reference
        ├── bold-template-pack/      ← 35 creative templates (non-IBM decks)
        └── scripts/
            ├── extract-pptx.py      ← Convert .pptx → content
            ├── deploy.sh            ← Deploy to Vercel
            └── export-pdf.sh        ← Export to PDF
```

---

## How to use in any project

### Step 1 — Copy the plugin folder

Copy the entire `plugins/frontend-slides/` folder into your target project:

```
your-project/
└── plugins/
    └── frontend-slides/   ← paste here
```

That's the only file you need to copy. The `.potx` source file stays in the original repo — all brand specs are already extracted into `IBM_BRAND_GUIDELINES.md`.

### Step 2 — Open the project in Bob

Open `your-project/` as your workspace in Bob (Claude Desktop or Claude Code).

### Step 3 — Just ask

Bob reads the plugin automatically. No setup, no install commands. Simply ask:

```
Create an IBM presentation on [your topic]
```

IBM Brand Mode triggers automatically on any IBM keyword. Bob will:
1. Read `IBM_BRAND_GUIDELINES.md` for the full design spec
2. Generate a complete `.html` file in your project folder
3. Open it in your browser

---

## IBM Brand — what's enforced automatically

Every generated deck will have:

| Rule | Value |
|------|-------|
| **Fonts** | IBM Plex Sans Bold (headings) · IBM Plex Sans Regular/Light (body) · IBM Plex Mono (code) |
| **Default background** | `#FFFFFF` white |
| **Cover / divider slides** | `#1261FD` IBM Blue background, white text |
| **Primary accent** | `#1261FD` IBM Blue |
| **Supporting palette** | Pink `#FF7EB5` · Teal `#3BDAD8` · Purple `#BE94FE` · Sky Blue `#81CEFE` · Cool Gray `#F1F4F7` |
| **Slide canvas** | 1920 × 1080 px, scales to any screen |
| **Side padding** | 44 px |
| **Footer bar** | Every content slide: `Group Name / DOC ID / Month YYYY / © YYYY IBM Corporation` |
| **No images on covers** | IBM guideline: cover slides are text-only |
| **No gradients** | IBM uses flat solid fills only |
| **Animations** | Fade-up only, 300ms ease-out — no particles, no glows |

---

## IBM Brand trigger keywords

The IBM Brand Mode fires automatically when your request contains any of:

- `IBM`, `IBM Developer`, `IBM Cloud`, `IBM Watson`
- Any IBM product name (Concert, instana, Turbonomic, watsonx, etc.)
- `"follow IBM brand guidelines"` or `"IBM format"`
- A file named with `IBM` in the path being converted

---

## Non-IBM presentations

The plugin also generates non-IBM decks with a full style-discovery flow (3 visual preview options, 35 bold templates). Just ask without any IBM keywords:

```
Create a presentation about [topic]
```

Bob will ask 4 quick questions (purpose / length / content / density) then show 3 style previews to pick from.

---

## Output

All generated files land in your **project root** as a single self-contained `.html` file:

```
your-project/
├── plugins/
├── your-topic.html    ← generated deck, open directly in browser
└── ...
```

**Navigation:** `←` `→` arrow keys · Space · scroll wheel · touch swipe  
**Inline editing:** Press `E` or hover top-left corner → click any text to edit in place  
**Export to PDF:** Ask Bob: *"Export this to PDF"*  
**Deploy to URL:** Ask Bob: *"Deploy this to a live URL"*

---

## Brand spec source

All IBM colors, fonts, type scale, grid measurements, and layout names were extracted directly from:

> `IBM_Developer_Master_Presentation_2021_R01_Plex.potx`

The full extracted specification lives in [`skills/frontend-slides/IBM_BRAND_GUIDELINES.md`](skills/frontend-slides/IBM_BRAND_GUIDELINES.md). Edit that file if IBM updates its brand guidelines.
