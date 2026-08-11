# IBM Developer Presentation Brand Guidelines

> Extracted from `IBM_Developer_Master_Presentation_2021_R01_Plex.potx`.
> **These rules override all generic style-preset defaults whenever generating an IBM-branded presentation.**

---

## When These Guidelines Apply

Apply this design system when:

- The user asks for an **IBM** presentation, deck, or slide
- The user references **IBM Developer**, **IBM Cloud**, **IBM Watson**, or any IBM product/brand
- The source file being converted is an IBM-branded `.pptx` / `.potx`
- The user explicitly says "follow IBM brand guidelines"

---

## 1. Slide Dimensions

| Property          | Value                                  |
| ----------------- | -------------------------------------- |
| Canvas            | **1920 × 1080 px** (16:9)              |
| Source dimensions | 10" × 5.625" (960 × 540 pt at 96 dpi)  |

---

## 2. Typography

Use **IBM Plex Sans** for all text.

### Line Spacing

| Element          | Line Height |
| ---------------- | ----------- |
| Headings         | `1.1`       |
| Body text        | `1.5`       |
| Captions/footer  | `1.4`       |

---

## 3. Color Palette

### Three Theme Variants

IBM Developer 2021 has three theme variants. The **White** theme is the default.

| Theme               | Background | Text      | Accent    | Use case                         |
| ------------------- | ---------- | --------- | --------- | -------------------------------- |
| **White** (default) | `#FFFFFF`  | `#000000` | `#1261FD` | Standard content slides          |
| **Cool Gray 10**    | `#F1F4F7`  | `#000000` | `#1261FD` | Light variant, supporting slides |
| **Blue**            | `#1261FD`  | `#FFFFFF` | `#FFFFFF` | Cover slides, dividers, emphasis |

---

## 4. Color Usage Rules

- **Backgrounds**: White `#FFFFFF` (default), Cool Gray `#F1F4F7` (alt), IBM Blue `#1261FD` (cover/divider)
- **Primary text**: `#000000` on white/gray bg; `#FFFFFF` on blue bg
- **Accent / links**: `#1261FD` (IBM Blue) on white backgrounds
- **Borders / rules**: `#C1C7CD` (light) or `#565656` (dark)
- Do **not** use gradients as primary backgrounds — IBM uses **flat solid fills**
- Do **not** use drop shadows on text

---

## 5. Footer Bar

Every content slide (not cover or blank slides) must include a footer bar at the bottom.

> **Title rule:** Use the same title as the cover page (e.g. `IBM Corporate Overview`).

> **Clearance rule:** The last content element above the footer must have at least `0.15"` of breathing room before the footer border line. Never let body text sit flush against the footer.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Cover Page Title]                          [Page No.]  │
└─────────────────────────────────────────────────────────┘
```

### Specification

| Property      | Value                            |
| ------------- | -------------------------------- |
| Height        | `54px` (≈ 0.3" at 96 dpi)        |
| Position      | Bottom of slide, full width      |
| Border        | `1px solid #C1C7CD` (top edge)   |
| Font          | IBM Plex Sans, 12px, weight 300  |
| Text color    | `#565656`                        |
| Left content  | Cover page title                 |
| Right content | Zero-padded page number (`01`)   |
| Padding       | `0 44px` (left and right)        |

### Reference HTML/CSS

```html
<div class="ibm-footer">
  <span class="footer-group">Cover Page Title</span>
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

## 6. Deck Metadata Defaults

When generating a deck for IBM Hong Kong clients:

| Field            | Value                                  |
| ---------------- | -------------------------------------- |
| Organisation     | **IBM Hong Kong** (not "IBM Greater China") |
| Year             | **2026**                               |
| Cover line       | `Confidential  \|  IBM Hong Kong  \|  2026` |
| Closing line     | `ibm.com/[product]  \|  IBM Hong Kong  \|  © 2026 IBM Corporation` |

### Capability Card Grid (two-row layouts)

- Row 1 cards and Row 2 cards must share the **same left and right edges**.
- If Row 1 has 3 equal-width cards and Row 2 has 2, compute Row 2 card width so that `left_edge + 2*(cardWidth + gap) = right_edge_of_row1`.
- Use the same `x:0.38` left margin for both rows.

---

