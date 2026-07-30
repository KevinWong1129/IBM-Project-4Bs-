# IBM Developer Presentation Brand Guidelines

Extracted from `IBM_Developer_Master_Presentation_2021_R01_Plex.potx`.  
**These rules override all generic style-preset defaults whenever generating an IBM-branded presentation.**

---

## When These Guidelines Apply

Apply this design system when:
- The user asks for an **IBM** presentation, deck, or slide
- The user references **IBM Developer**, **IBM Cloud**, **IBM Watson**, or any IBM product/brand
- The source file being converted is an IBM-branded `.pptx` / `.potx`
- The user explicitly says "follow IBM brand guidelines"

---

## 1. Slide Dimensions

| Property | Value |
|----------|-------|
| Canvas | **1920 × 1080 px** (16:9) |
| Source dimensions | 10" × 5.625" (960 × 540 pt at 96 dpi) |

---

## 2. Typography

### Font Family

IBM Plex is the **only** permitted typeface family for IBM-branded presentations.  
IBM Plex is available free on Google Fonts.

| Role | Font | Weight | Google Fonts import |
|------|------|--------|---------------------|
| Headings / Display | **IBM Plex Sans** | Bold (700) | `IBM+Plex+Sans:wght@700` |
| Body / Subheadings | **IBM Plex Sans** | Regular (400) or Light (300) | `IBM+Plex+Sans:wght@300;400` |
| Code / Monospace | **IBM Plex Mono** | Light (300) or Regular (400) | `IBM+Plex+Mono:wght@300;400` |

**Never use**: Arial, Inter, Roboto, system fonts, or any non-IBM Plex family.  
*Exception*: When sharing externally on Apple devices, IBM Plex may be substituted with Arial per IBM's own guidance.

### Type Scale (at 1920 × 1080 stage)

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Cover / Hero title | 80–96 px | Bold 700 | IBM Plex Sans |
| Section divider title | 64–72 px | Bold 700 | IBM Plex Sans |
| Slide title | 40–48 px | Bold 700 | IBM Plex Sans |
| Lead / feature stat | 96–128 px | Bold 700 | IBM Plex Sans |
| Body text (primary) | 24–28 px | Regular 400 | IBM Plex Sans |
| Body text (secondary / captions) | 18–22 px | Light 300 | IBM Plex Sans |
| Footer / legal | 12–14 px | Light 300 | IBM Plex Sans |
| Slide number | 12 px | Light 300 | IBM Plex Sans |
| Code samples | 22–24 px | Light 300 | IBM Plex Mono |

### Line Spacing

- Headings: `line-height: 1.1`
- Body text: `line-height: 1.5`
- Captions / footer: `line-height: 1.4`

---

## 3. Color Palette

### Three Theme Variants

IBM Developer 2021 has three theme variants. The **White** theme is the default.

| Theme | Background | Text | Accent | Use case |
|-------|-----------|------|--------|----------|
| **White** (default) | `#FFFFFF` | `#000000` | `#1261FD` | Standard content slides |
| **Cool Gray 10** | `#F1F4F7` | `#000000` | `#1261FD` | Light variant, supporting slides |
| **Blue** | `#1261FD` | `#FFFFFF` | `#FFFFFF` | Cover slides, dividers, emphasis |

### Full Palette

```css
:root {
    /* ── IBM Brand Colors ── */
    --ibm-blue:        #1261FD;   /* accent1 — IBM Blue (primary brand accent) */
    --ibm-pink:        #FF7EB5;   /* accent2 — IBM Pink */
    --ibm-teal:        #3BDAD8;   /* accent3 — IBM Teal */
    --ibm-cool-gray:   #F1F4F7;   /* accent4 — Cool Gray 10 (light bg variant) */
    --ibm-purple:      #BE94FE;   /* accent5 — IBM Purple */
    --ibm-sky-blue:    #81CEFE;   /* accent6 — IBM Sky Blue */

    /* ── Extended IBM Palette (from slides) ── */
    --ibm-light-blue:  #82CFFF;   /* IBM Light Blue 30 */
    --ibm-light-purple:#BB8EFF;   /* IBM Purple 30 */

    /* ── Neutrals ── */
    --ibm-black:       #000000;
    --ibm-dark-gray:   #565656;   /* dk2 */
    --ibm-mid-gray:    #C1C7CD;   /* lt2 — IBM Cool Gray 30 */
    --ibm-white:       #FFFFFF;

    /* ── Semantic (White theme) ── */
    --slide-bg:        #FFFFFF;
    --slide-text:      #000000;
    --slide-text-muted:#565656;
    --slide-accent:    #1261FD;
    --slide-divider:   #C1C7CD;
}
```

### Color Usage Rules

- **Backgrounds**: White `#FFFFFF` (default), Cool Gray `#F1F4F7` (alt), IBM Blue `#1261FD` (cover/divider)
- **Primary text**: `#000000` on white/gray bg; `#FFFFFF` on blue bg
- **Accent / links**: `#1261FD` (IBM Blue) on white backgrounds
- **Borders / rules**: `#C1C7CD` (light) or `#565656` (dark)
- **Highlight boxes / badges**: use IBM Pink `#FF7EB5`, Teal `#3BDAD8`, Purple `#BE94FE`, or Sky Blue `#81CEFE`
- Do **not** use gradients as primary backgrounds — IBM uses **flat solid fills**
- Do **not** use drop shadows on text

---

## 4. Layout Grid & Spacing

### Grid
- Content area starts at **x=44px** from left (scaled from 10" slide = ~44px at 1920px canvas)
- Top margin: **~42px**
- Right margin mirrors left: keep ~44px clearance from right edge
- Bottom footer zone: **bottom 54px** reserved for footer bar

### Slide Zones (at 1920 × 1080)
```
┌─────────────────────────────────────────────────────────────┐
│  44px margin                                     44px margin │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TITLE ZONE  (top ~42–220px)                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  CONTENT ZONE  (220–960px)                          │   │
│  │    Left column  (44–912px)                          │   │
│  │    Right column (1006–1872px)                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  FOOTER BAR  (bottom 54px)   6pt / 12px             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Column Layouts
| Layout | Left col | Right col |
|--------|----------|-----------|
| Two equal columns | x=44, w=868 | x=1006, w=866 |
| Title left / content right | x=44, w=870 | x=1006, w=866 |
| Cover (title left half) | x=44, w=870 | — |

### Key Spacing Values
| Property | Value |
|----------|-------|
| Slide padding (sides) | 44px |
| Slide padding (top) | 42px |
| Footer bar height | 54px |
| Column gap | ~92px (1006 - 44 - 870 = 92) |
| Section rule line height | 2px |

---

## 5. Slide Layout Catalogue

The IBM template defines the following canonical layout types — use these when generating IBM slides:

| Category | Layout | Use |
|----------|--------|-----|
| **Cover** | `cover` | Title slide — title + subtitle, no images on cover |
| **Cover variants** | `1_cover` – `5_cover` | Cover with different color banding |
| **Divider** | `divider` | Section break — full-width title |
| **Divider (contents)** | `divider (with page contents)` | Section break with agenda list |
| **Fact / Stat** | `fact, number` | Large stat/number + supporting text |
| **Fact + Image** | `fact, number, half-image (bleeds)` | Stat left, photo right (bleed) |
| **Big Text** | `big text` | Full-slide oversized statement |
| **Quote** | `quote` | Pull quote centered |
| **Title + Text** | `title, text` | Standard two-column content slide |
| **Title + Two columns** | `title, text (two columns)` | Title + two equal text columns |
| **Title + Four columns** | `title, text (four columns)` | Title + four narrow columns |
| **Title + Image** | `title, image` | Title left, image right |
| **Insight + Boxes** | `insight, text, boxes` | Key insight + supporting box cards |
| **Boxes (grid)** | `boxes (3 med, 2 small)` etc. | Card grid layouts |
| **Case Study** | `case study 1`, `case study 2` | Case study narrative slides |
| **Table** | `table` | Data table slide |
| **Thank You** | `thank you` | Closing slide |
| **IBM Sign-off** | `ibm sign-off` | Legal/brand close |

---

## 6. Footer Bar

Every content slide (not blank slides) must include a footer bar at the bottom:

```html
<div class="ibm-footer">
    <span class="footer-group">Group Name / DOC ID / Month YYYY / © YYYY IBM Corporation</span>
    <span class="footer-page">01</span>
</div>
```

```css
.ibm-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 44px;
    border-top: 1px solid #C1C7CD;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 12px;
    font-weight: 300;
    color: #565656;
}
```

---

## 7. IBM Logo Usage

- The IBM 8-bar logo should appear on **cover slides** and **closing slides** only
- Logo is white on blue backgrounds, black on white/gray backgrounds  
- **Do not** place logos on every content slide
- Position: lower-right or lower-left corner of the cover title zone

---

## 8. Imagery Rules (from IBM template notes)

- **No photos or images on cover pages** (stated explicitly in template guidance)
- Photos/images only appear on content slides in designated image zones
- Use images only in half-image layouts or full-bleed background layouts
- IBM photography style: authentic, unscripted, editorial — avoid stock-photo clichés

---

## 9. Animation Style

IBM presentations prioritize **professionalism and clarity** over decorative animation:

- **Simple, fast transitions**: slide-in from right (next) or left (previous) at 300–400ms
- **Content reveals**: fade-up at 200ms delay, 300ms duration — stagger children by 80ms
- **No bouncing, spinning, or playful easing** — use `ease-out` or `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- **No particle effects, no gradient animations, no glows**
- Always include `prefers-reduced-motion` support

---

## 10. CSS Variables Reference

Use these exact variable names in IBM-themed HTML output:

```css
:root {
    /* Typography */
    --font-display: 'IBM Plex Sans', sans-serif;
    --font-body:    'IBM Plex Sans', sans-serif;
    --font-mono:    'IBM Plex Mono', monospace;

    /* Font Weights */
    --weight-bold:    700;
    --weight-regular: 400;
    --weight-light:   300;

    /* Type Scale (1920×1080 stage) */
    --size-hero:      96px;
    --size-title:     48px;
    --size-divider:   72px;
    --size-lead:      28px;
    --size-body:      24px;
    --size-caption:   18px;
    --size-footer:    12px;

    /* IBM Colors */
    --ibm-blue:       #1261FD;
    --ibm-pink:       #FF7EB5;
    --ibm-teal:       #3BDAD8;
    --ibm-cool-gray:  #F1F4F7;
    --ibm-purple:     #BE94FE;
    --ibm-sky-blue:   #81CEFE;
    --ibm-dark-gray:  #565656;
    --ibm-mid-gray:   #C1C7CD;
    --ibm-black:      #000000;
    --ibm-white:      #FFFFFF;

    /* Active Theme (White = default) */
    --slide-bg:       #FFFFFF;
    --slide-text:     #000000;
    --slide-muted:    #565656;
    --slide-accent:   #1261FD;
    --slide-border:   #C1C7CD;
    --stage-bg:       #FFFFFF;

    /* Spacing */
    --slide-pad-x:    44px;
    --slide-pad-top:  42px;
    --slide-footer-h: 54px;
    --col-gap:        92px;

    /* Animation */
    --ease-ibm:       cubic-bezier(0.4, 0, 0.2, 1);
    --dur-fast:       0.2s;
    --dur-normal:     0.3s;
}

/* Blue theme override (for cover/divider slides) */
.slide.theme-blue {
    --slide-bg:     #1261FD;
    --slide-text:   #FFFFFF;
    --slide-muted:  rgba(255,255,255,0.7);
    --slide-accent: #FFFFFF;
    --slide-border: rgba(255,255,255,0.3);
    background: #1261FD;
    color: #FFFFFF;
}

/* Cool Gray theme override */
.slide.theme-gray {
    --slide-bg:    #F1F4F7;
    --slide-text:  #000000;
    background: #F1F4F7;
}
```

---

## 11. Google Fonts Import

Always use this `<link>` in the `<head>` for IBM Plex fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400&family=IBM+Plex+Sans:wght@300;400;700&display=swap" rel="stylesheet">
```
