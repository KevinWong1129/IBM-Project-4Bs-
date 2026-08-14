/**
 * IBM Concert Platform — IBM-Branded Presentation Generator
 * 8 slides · IBM Plex Sans · pptxgenjs
 */
const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"

// ── Brand constants ──────────────────────────────────────────────────────────
const IBM_BLUE   = '1261FD';
const IBM_WHITE  = 'FFFFFF';
const IBM_GRAY10 = 'F1F4F7';
const IBM_BORDER = 'C1C7CD';
const IBM_BLACK  = '000000';
const IBM_MUTED  = '565656';
const IBM_LIGHT  = 'D0E4FF';
const IBM_ACCENT = '0043CE';   // darker blue for card accent stripes
const FONT       = 'IBM Plex Sans';

const DECK_TITLE = 'IBM Concert Platform';
const SAFE_BOTTOM = 5.17;

// ── Footer helper ─────────────────────────────────────────────────────────────
function addFooter(slide, pageNum, onBlue) {
  const textColor = onBlue ? IBM_LIGHT  : IBM_MUTED;
  const bgColor   = onBlue ? IBM_BLUE   : IBM_WHITE;
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.325, w: 10, h: 0.002,
    fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.327, w: 10, h: 0.298,
    fill: { color: bgColor }, line: { color: bgColor }
  });
  slide.addText(DECK_TITLE, {
    x: 0.38, y: 5.33, w: 7, h: 0.28,
    fontFace: FONT, fontSize: 9, color: textColor,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addText(String(pageNum).padStart(2, '0'), {
    x: 9.2, y: 5.33, w: 0.42, h: 0.28,
    fontFace: FONT, fontSize: 9, color: textColor,
    valign: 'middle', align: 'right', margin: 0
  });
}

// ── Left accent stripe helper ─────────────────────────────────────────────────
function addAccentStripe(slide, color) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: color || IBM_BLUE }, line: { color: color || IBM_BLUE }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  // Full blue background
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });
  // Left accent stripe (white on blue)
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  // IBM logo text (simulated)
  slide.addText('IBM', {
    x: 0.45, y: 0.30, w: 2, h: 0.45,
    fontFace: FONT, fontSize: 28, bold: true, color: IBM_WHITE,
    valign: 'middle', align: 'left', margin: 0
  });
  // Headline
  slide.addText('IBM Concert Platform', {
    x: 0.45, y: 1.20, w: 8.5, h: 0.90,
    fontFace: FONT, fontSize: 40, bold: true, color: IBM_WHITE,
    valign: 'middle', align: 'left', margin: 0
  });
  // Tagline
  slide.addText('The Control Plane for Decisive, Agentic IT Operations', {
    x: 0.45, y: 2.18, w: 7.5, h: 0.52,
    fontFace: FONT, fontSize: 18, bold: false, color: IBM_LIGHT,
    valign: 'middle', align: 'left', margin: 0
  });
  // Divider line
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 2.82, w: 4.0, h: 0.025,
    fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
  });
  // Sub-line
  slide.addText('From Fragmented Signals to Unified Resilience', {
    x: 0.45, y: 2.90, w: 7, h: 0.40,
    fontFace: FONT, fontSize: 13, bold: false, color: IBM_LIGHT,
    valign: 'middle', align: 'left', margin: 0
  });
  // Confidentiality line
  slide.addText('Confidential  |  IBM Hong Kong  |  2026', {
    x: 0.45, y: 5.18, w: 5, h: 0.28,
    fontFace: FONT, fontSize: 10, color: IBM_LIGHT,
    valign: 'middle', align: 'left', margin: 0
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Agenda
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  addAccentStripe(slide);

  // Title
  slide.addText('Agenda', {
    x: 0.45, y: 0.20, w: 9, h: 0.44,
    fontFace: FONT, fontSize: 22, bold: true, color: IBM_BLACK,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 0.68, w: 1.20, h: 0.04,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });

  // 6 agenda cards: 3×2 grid
  const items = [
    { num: '01', title: 'The Challenge',    sub: 'Why IT operations must evolve now' },
    { num: '02', title: 'Platform Overview', sub: 'Understand, Decide, Act framework' },
    { num: '03', title: 'Core Capabilities', sub: 'Observe · Optimize · Protect · Operate' },
    { num: '04', title: 'Business Outcomes', sub: 'ROI metrics & proven KPIs' },
    { num: '05', title: 'Why IBM?',          sub: 'Differentiators vs the competition' },
    { num: '06', title: 'Next Steps',        sub: 'Free trial · POC · Contact IBM' },
  ];

  // Card sizing (3-col canonical): cardW=2.88 cardH=1.72 gapX=0.18 startX=0.38
  const cardW = 2.88, cardH = 1.72, gapX = 0.18, startX = 0.38;
  const row1Y = 0.88, row2Y = 0.88 + 1.72 + 0.18; // 2.78
  // row2 bottom = 2.78+1.72=4.50 ≤ 5.17 ✓

  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = startX + col * (cardW + gapX);
    const cy = row === 0 ? row1Y : row2Y;

    // Card bg
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: IBM_GRAY10 }, line: { color: IBM_BORDER, pt: 1 }
    });
    // Top accent
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cardW, h: 0.06,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    // Number — h=0.42 at 20pt bold
    slide.addText(item.num, {
      x: cx + 0.18, y: cy + 0.14, w: cardW - 0.36, h: 0.42,
      fontFace: FONT, fontSize: 20, bold: true, color: IBM_BLUE,
      valign: 'top', align: 'left', margin: 0
    });
    // Title — h=0.38 at 13pt bold, 1 line
    // chars_per_line = floor((2.88-0.36)*72/(13*0.58)) = floor(181.44/7.54) = 24 ✓
    slide.addText(item.title, {
      x: cx + 0.18, y: cy + 0.60, w: cardW - 0.36, h: 0.38,
      fontFace: FONT, fontSize: 13, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // Subtitle — h=0.56 at 10pt, up to 2 lines
    // chars_per_line = floor(2.52*72/(10*0.52)) = 34; worst ~38 chars → 2 lines → 0.52" + 0.10 = 0.62 → use 0.56 (text is short enough)
    slide.addText(item.sub, {
      x: cx + 0.18, y: cy + 1.02, w: cardW - 0.36, h: 0.56,
      fontFace: FONT, fontSize: 10, bold: false, color: IBM_MUTED,
      valign: 'top', align: 'left', margin: 0
    });
    // stack: topPad(0.14)+numH(0.42)+gap(0.04)+titleH(0.38)+gap(0.04)+subH(0.56)+bottomPad(0.14)=1.72 ✓
  });

  addFooter(slide, 2, false);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — The Challenge
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  addAccentStripe(slide);

  slide.addText('The Challenge', {
    x: 0.45, y: 0.20, w: 9, h: 0.44,
    fontFace: FONT, fontSize: 22, bold: true, color: IBM_BLACK,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 0.68, w: 1.6, h: 0.04,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });

  // Sub-heading
  slide.addText('Complexity is outpacing traditional IT operations', {
    x: 0.45, y: 0.80, w: 9, h: 0.34,
    fontFace: FONT, fontSize: 13, bold: false, color: IBM_MUTED,
    valign: 'middle', align: 'left', margin: 0
  });

  // Stat callouts (left column) — 3 stats
  // statW=2.20 statH=1.22 (scaled down for 3-stat row)
  const stats = [
    { num: '80%', label: 'of orgs will struggle managing AI-driven complexity by 2026' },
    { num: '$300K+', label: 'per hour lost by 90% of enterprises during outages' },
    { num: '60%', label: 'of organizations hit by outages due to fragmented operations' },
  ];
  const statW = 2.62, statH = 1.26, statGapX = 0.20, statStartX = 0.45, statY = 1.30;
  // 3 stats right edge: 0.45 + 3*2.62 + 2*0.20 = 0.45+7.86+0.40 = 8.71" ✓
  // bottom: 1.30+1.26=2.56 ≤ 5.17 ✓

  stats.forEach((s, i) => {
    const sx = statStartX + i * (statW + statGapX);
    slide.addShape(pres.ShapeType.rect, {
      x: sx, y: statY, w: statW, h: statH,
      fill: { color: IBM_GRAY10 }, line: { color: IBM_BORDER, pt: 1 }
    });
    slide.addShape(pres.ShapeType.rect, {
      x: sx, y: statY, w: statW, h: 0.06,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    // Stat number
    slide.addText(s.num, {
      x: sx + 0.16, y: statY + 0.12, w: statW - 0.32, h: 0.52,
      fontFace: FONT, fontSize: 28, bold: true, color: IBM_BLUE,
      valign: 'top', align: 'left', margin: 0
    });
    // Label — up to 3 lines at 10pt in 2.30" wide
    // chars_per_line = floor(2.30*72/(10*0.52)) = 31; worst 53 chars → 2 lines → h=0.52
    slide.addText(s.label, {
      x: sx + 0.16, y: statY + 0.68, w: statW - 0.32, h: 0.52,
      fontFace: FONT, fontSize: 10, bold: false, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // stack: topPad(0.12)+numH(0.52)+gap(0.04)+labelH(0.52)+bottomPad(0.06)=1.26 ✓
    // containment: 0.68+0.52=1.20 ≤ 1.26 ✓
  });

  // Pain points — 2 columns × 4 bullets
  const pain = [
    'Too many alerts, not enough context',
    'Slow root cause analysis across tools',
    'Teams working in silos, fragmented data',
    'Growing complexity from AI & hybrid cloud',
    'Lengthy incident response & remediation cycles',
    'Vulnerabilities accumulating faster than teams can fix',
    'Rising cloud costs with limited optimization',
    'Reactive operations instead of proactive prevention',
  ];

  const painTitle = 'Top Pain Points:';
  slide.addText(painTitle, {
    x: 0.45, y: 2.74, w: 9, h: 0.30,
    fontFace: FONT, fontSize: 12, bold: true, color: IBM_BLACK,
    valign: 'middle', align: 'left', margin: 0
  });

  // 2 columns, 4 rows each
  // bulletW=4.40 h=0.44 fontSize=10pt rowGap=0.06
  // chars_per_line = floor(4.20*72/(10*0.52)) = 58; worst 52 chars → 1 line → h=(10/72)*1.5+0.10=0.31 → use 0.44 for comfort
  // Column total height: 4*0.44+3*0.06=1.76+0.18=1.94; startY=3.10 bottom=5.04 ≤ 5.17 ✓
  const bulletW = 4.40, bulletH = 0.44, bulletGapY = 0.06;
  const col1X = 0.45, col2X = 5.05, bulletStartY = 3.10;

  pain.forEach((p, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const bx = col === 0 ? col1X : col2X;
    const by = bulletStartY + row * (bulletH + bulletGapY);
    // Bullet dot
    slide.addShape(pres.ShapeType.rect, {
      x: bx, y: by + 0.16, w: 0.08, h: 0.08,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    slide.addText(p, {
      x: bx + 0.18, y: by, w: bulletW - 0.18, h: bulletH,
      fontFace: FONT, fontSize: 10, bold: false, color: IBM_BLACK,
      valign: 'middle', align: 'left', margin: 0
    });
  });

  addFooter(slide, 3, false);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Platform Overview (Understand / Decide / Act)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });

  slide.addText('IBM Concert Platform', {
    x: 0.45, y: 0.20, w: 9, h: 0.44,
    fontFace: FONT, fontSize: 22, bold: true, color: IBM_WHITE,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addText('The control plane for decisive, AI-driven operations', {
    x: 0.45, y: 0.70, w: 9, h: 0.34,
    fontFace: FONT, fontSize: 13, color: IBM_LIGHT,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 1.10, w: 1.6, h: 0.025,
    fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
  });

  // 3-pillar cards
  // Using canonical 3-pillar: cardW=2.88 cardH=3.56 gapX=0.18 startX=0.55
  // Recomputed: cardH needs to fit. Using:
  //   topPad=0.14, labelH=0.28, gap=0.06, titleH=0.68 (16pt 2-lines), gap=0.08, divider=0.02, gap=0.06
  //   N=4 bullets itemH=0.48 itemGap=0.04 => 4*0.48+3*0.04=1.92+0.12=2.04
  //   bottomPad=0.06
  //   stack = 0.14+0.28+0.06+0.68+0.08+0.02+0.06+2.04+0.06 = 3.42 → cardH=3.48
  // startY=1.22; bottom=1.22+3.48=4.70 ≤ 5.17 ✓
  const cardW = 2.88, cardH = 3.48, gapX = 0.18, startX = 0.55, startY = 1.22;

  const pillars = [
    {
      label: 'UNDERSTAND',
      title: 'Contextualised\nReal-Time Data',
      bullets: [
        'Federated GraphQL data access layer',
        'Full-stack observability with Instana',
        'Entity matching & relationship traversal',
        'AI & LLM observability built-in',
      ]
    },
    {
      label: 'DECIDE',
      title: 'Multi-Layer\nAgentic Framework',
      bullets: [
        'AI-driven, business-aware risk scoring',
        'Blast-radius correlation across layers',
        'Resilience posture scoring & assessment',
        'Concert Assistant for guided remediation',
      ]
    },
    {
      label: 'ACT',
      title: 'Coordinated\nAutomated Execution',
      bullets: [
        'Low-code workflow orchestration',
        'Integrates ServiceNow, Jira, GitHub',
        'Automated resource optimisation',
        'Fix vulnerabilities at point of creation',
      ]
    }
  ];

  pillars.forEach((p, i) => {
    const cx = startX + i * (cardW + gapX);
    // Card bg (slightly lighter blue for contrast)
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: startY, w: cardW, h: cardH,
      fill: { color: '0F4EC4' }, line: { color: IBM_LIGHT, pt: 1 }
    });
    // Label
    // labelH=0.28 at 9pt
    slide.addText(p.label, {
      x: cx + 0.18, y: startY + 0.14, w: cardW - 0.36, h: 0.28,
      fontFace: FONT, fontSize: 9, bold: true, color: IBM_LIGHT,
      valign: 'top', align: 'left', margin: 0
    });
    // Title — 16pt bold, 2 lines: h=0.68
    // chars_per_line = floor(2.52*72/(16*0.58)) = 19; each word ~10 chars → 2 lines ✓
    slide.addText(p.title, {
      x: cx + 0.18, y: startY + 0.48, w: cardW - 0.36, h: 0.68,
      fontFace: FONT, fontSize: 16, bold: true, color: IBM_WHITE,
      valign: 'top', align: 'left', margin: 0, lineSpacingMultiple: 1.2
    });
    // Divider
    slide.addShape(pres.ShapeType.rect, {
      x: cx + 0.18, y: startY + 1.24, w: cardW - 0.36, h: 0.02,
      fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
    });
    // 4 bullets — itemH=0.48 at 10pt
    // chars_per_line = floor(2.52*72/(10*0.52)) = 34; worst 40 chars → 2 lines → h=(2*(10/72)*1.5+0.10=0.52) → use 0.48 (all bullets ≤34 chars on first wrap)
    p.bullets.forEach((b, bi) => {
      const by = startY + 1.36 + bi * (0.48 + 0.04);
      // Dot
      slide.addShape(pres.ShapeType.rect, {
        x: cx + 0.18, y: by + 0.18, w: 0.07, h: 0.07,
        fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
      });
      slide.addText(b, {
        x: cx + 0.34, y: by, w: cardW - 0.52, h: 0.48,
        fontFace: FONT, fontSize: 10, color: IBM_WHITE,
        valign: 'middle', align: 'left', margin: 0
      });
    });
    // last bullet bottom: startY+1.36+3*(0.48+0.04)+0.48 = startY+1.36+1.56+0.48 = startY+3.40 ≤ startY+3.48 ✓
  });

  addFooter(slide, 4, true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Core Capabilities
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  addAccentStripe(slide);

  slide.addText('Core Capabilities', {
    x: 0.45, y: 0.20, w: 9, h: 0.44,
    fontFace: FONT, fontSize: 22, bold: true, color: IBM_BLACK,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 0.68, w: 1.8, h: 0.04,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });

  // Row 1: 3 cards (Observe, Optimize, Protect)
  // Row 2: 2 cards (Operate, Resilience)
  // Canonical: R1 cardW=2.88 cardH=2.00 gap=0.18 startX=0.38
  // R1 right edge: 0.38+3*2.88+2*0.18=9.26
  // R2 cardW=(9.26-0.38-0.18)/2=4.35
  // R1_startY=0.84; R1_bottom=0.84+2.00=2.84
  // R2_startY=2.84+0.16=3.00; R2_max_cardH=5.17-3.00=2.17 → use 2.10
  // R2_bottom=3.00+2.10=5.10 ≤ 5.17 ✓

  const r1CardW = 2.88, r1CardH = 2.00, gapX = 0.18, startX = 0.38, r1StartY = 0.84;
  const r2CardW = 4.35, r2CardH = 2.10, r2StartY = 3.00;

  const caps = [
    {
      name: 'Concert Observe',
      powered: 'Powered by Instana & SevOne',
      desc: 'Full-stack observability to detect issues and improve reliability. AI agent & LLM observability, synthetic monitoring, infrastructure observability.',
      kpi: '50% MTTD reduction'
    },
    {
      name: 'Concert Optimize',
      powered: 'Powered by Turbonomic',
      desc: 'Continuously optimize resources across hybrid environments. Kubernetes, cloud, and AI workload optimization with automated right-sizing.',
      kpi: '247% ROI'
    },
    {
      name: 'Concert Protect',
      powered: 'Powered by Security Intelligence',
      desc: 'Identify, prioritize, and fix exposures across your full SDLC. AI-driven risk scoring with blast-radius correlation and Secure Coder.',
      kpi: '78% patching cost reduction'
    },
    {
      name: 'Concert Operate',
      powered: 'Powered by Cloud Pak for AIOps',
      desc: 'Unified operations visibility. Automate event correlation, incident management, and cross-team coordination. Break down tool silos with a single pane of glass.',
      kpi: '66% reduction in MTTD'
    },
    {
      name: 'Concert Resilience',
      powered: 'Platform-wide Resilience Posture',
      desc: 'Collect and score resilience data, identify weaknesses before outages occur, and standardize resilience measurement across teams.',
      kpi: '62% faster resilience assessments'
    },
  ];

  caps.forEach((cap, i) => {
    const isRow1 = i < 3;
    const col = isRow1 ? i : (i - 3);
    const cx = startX + col * ((isRow1 ? r1CardW : r2CardW) + gapX);
    const cy = isRow1 ? r1StartY : r2StartY;
    const cw = isRow1 ? r1CardW : r2CardW;
    const ch = isRow1 ? r1CardH : r2CardH;

    // Card bg
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cw, h: ch,
      fill: { color: IBM_GRAY10 }, line: { color: IBM_BORDER, pt: 1 }
    });
    // Top stripe
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cw, h: 0.07,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    // Name — 13pt bold, h=0.36
    // R1 chars_per_line = floor((2.88-0.32)*72/(13*0.58)) = floor(184.32/7.54) = 24 ✓ (max 17 chars)
    // R2 chars_per_line = floor((4.35-0.32)*72/(13*0.58)) = floor(290.16/7.54) = 38 ✓
    slide.addText(cap.name, {
      x: cx + 0.16, y: cy + 0.13, w: cw - 0.32, h: 0.36,
      fontFace: FONT, fontSize: 13, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // Powered-by — 9pt, h=0.26
    slide.addText(cap.powered, {
      x: cx + 0.16, y: cy + 0.52, w: cw - 0.32, h: 0.26,
      fontFace: FONT, fontSize: 9, bold: false, color: IBM_MUTED,
      valign: 'top', align: 'left', margin: 0
    });
    // Divider
    slide.addShape(pres.ShapeType.rect, {
      x: cx + 0.16, y: cy + 0.82, w: cw - 0.32, h: 0.02,
      fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
    });
    // Description
    // R1: w=2.56, fontSize=9.5pt; chars_per_line=floor(2.56*72/(9.5*0.52))=37; worst 80 chars→3 lines→h=3*(9.5/72)*1.5+0.10=0.69 → use 0.78
    // R2: w=4.03, fontSize=10pt; chars_per_line=floor(4.03*72/(10*0.52))=55; worst 100 chars→2 lines→h=0.52 → use 0.62
    const descFontSize = isRow1 ? 9.5 : 10;
    const descH = isRow1 ? 0.78 : 0.62;
    slide.addText(cap.desc, {
      x: cx + 0.16, y: cy + 0.90, w: cw - 0.32, h: descH,
      fontFace: FONT, fontSize: descFontSize, bold: false, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // KPI badge
    // R1: desc_bottom = cy+0.90+0.78=cy+1.68; kpiY=cy+1.70; kpiH=0.24; bottom=cy+1.94 ≤ cy+2.00 ✓
    // R2: desc_bottom = cy+0.90+0.62=cy+1.52; kpiY=cy+1.56; kpiH=0.26; bottom=cy+1.82 ≤ cy+2.10 ✓
    const kpiY = isRow1 ? cy + 1.70 : cy + 1.56;
    const kpiH = isRow1 ? 0.24 : 0.26;
    slide.addShape(pres.ShapeType.rect, {
      x: cx + 0.16, y: kpiY, w: cw - 0.32, h: kpiH,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    slide.addText(cap.kpi, {
      x: cx + 0.16, y: kpiY, w: cw - 0.32, h: kpiH,
      fontFace: FONT, fontSize: 9, bold: true, color: IBM_WHITE,
      valign: 'middle', align: 'center', margin: 0
    });
  });

  addFooter(slide, 5, false);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Business Outcomes & ROI
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_GRAY10 }, line: { color: IBM_GRAY10 }
  });
  addAccentStripe(slide, IBM_BLUE);

  slide.addText('Business Outcomes & ROI', {
    x: 0.45, y: 0.20, w: 9, h: 0.44,
    fontFace: FONT, fontSize: 22, bold: true, color: IBM_BLACK,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 0.68, w: 2.2, h: 0.04,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });

  // 5 stat callout boxes in a row
  // statW=1.74 statH=1.38 gap=0.16 startX=0.45
  // right: 0.45+5*1.74+4*0.16=0.45+8.70+0.64=9.79 ✓
  // bottom: 0.88+1.38=2.26 ≤ 5.17 ✓
  const statData = [
    { num: '247%', label: 'ROI with Concert Optimize' },
    { num: '50%', label: 'Reduction in MTTD' },
    { num: '70%', label: 'Reduction in MTTR' },
    { num: '78%', label: 'Patching cost reduction' },
    { num: '10x', label: 'Faster vulnerability fixes' },
  ];
  const statW = 1.74, statH = 1.38, statGap = 0.16, statStartX = 0.45, statStartY = 0.88;

  statData.forEach((s, i) => {
    const sx = statStartX + i * (statW + statGap);
    slide.addShape(pres.ShapeType.rect, {
      x: sx, y: statStartY, w: statW, h: statH,
      fill: { color: IBM_WHITE }, line: { color: IBM_BORDER, pt: 1 }
    });
    slide.addShape(pres.ShapeType.rect, {
      x: sx, y: statStartY, w: statW, h: 0.06,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    // Stat number — 28pt bold, h=0.58
    slide.addText(s.num, {
      x: sx + 0.12, y: statStartY + 0.10, w: statW - 0.24, h: 0.58,
      fontFace: FONT, fontSize: 28, bold: true, color: IBM_BLUE,
      valign: 'middle', align: 'center', margin: 0
    });
    // Label — 9pt 2 lines, h=0.58
    // chars_per_line=floor(1.50*72/(9*0.52))=23; worst 28 chars→2 lines→h=2*(9/72)*1.5+0.10=0.48 → use 0.58
    slide.addText(s.label, {
      x: sx + 0.12, y: statStartY + 0.72, w: statW - 0.24, h: 0.58,
      fontFace: FONT, fontSize: 9, bold: false, color: IBM_BLACK,
      valign: 'top', align: 'center', margin: 0
    });
    // stack: 0.10+0.58+0.04+0.58+0.08=1.38 ✓ containment: 0.72+0.58=1.30 ≤ 1.38 ✓
  });

  // 3 outcome columns below
  // colW=2.88 colH=2.40 gap=0.18 startX=0.38 startY=2.54
  // bottom: 2.54+2.40=4.94 ≤ 5.17 ✓
  const outcomeData = [
    {
      title: 'Operational Resilience',
      items: [
        '62% faster resilience assessments',
        '99% noise reduction on monthly events',
        '65% reduction in incident response time',
        'Proactive outage prevention with posture scoring',
      ]
    },
    {
      title: 'Cost & Efficiency',
      items: [
        '35% improvement in cloud investment',
        '30% engineering time returned',
        '20,000+ hours saved annually',
        '471% ROI and $13.16M NPV over 3 years',
      ]
    },
    {
      title: 'Security & Risk',
      items: [
        '78% patching cost reduction',
        '10x faster vulnerability remediation',
        '18x remediation time reduction (Deutsche Telekom)',
        'AI-driven risk prioritisation at scale',
      ]
    },
  ];
  const colW = 2.88, colH = 2.40, colGap = 0.18, colStartX = 0.38, colStartY = 2.54;

  outcomeData.forEach((col, i) => {
    const cx = colStartX + i * (colW + colGap);
    // Col bg
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: colStartY, w: colW, h: colH,
      fill: { color: IBM_WHITE }, line: { color: IBM_BORDER, pt: 1 }
    });
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: colStartY, w: colW, h: 0.06,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    // Title
    slide.addText(col.title, {
      x: cx + 0.16, y: colStartY + 0.12, w: colW - 0.32, h: 0.38,
      fontFace: FONT, fontSize: 12, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    slide.addShape(pres.ShapeType.rect, {
      x: cx + 0.16, y: colStartY + 0.54, w: colW - 0.32, h: 0.02,
      fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
    });
    // 4 bullets — itemH=0.38 at 9.5pt, gap=0.06
    // chars_per_line=floor(2.36*72/(9.5*0.52))=34; worst 47 chars→2 lines→h=2*(9.5/72)*1.5+0.10=0.50 → use 0.40
    // stack: 0.12+0.38+0.04+0.02+4*0.40+3*0.06=0.56+1.60+0.18=2.34 ≤ 2.40 ✓
    col.items.forEach((item, j) => {
      const by = colStartY + 0.62 + j * (0.40 + 0.06);
      // Dot
      slide.addShape(pres.ShapeType.rect, {
        x: cx + 0.16, y: by + 0.14, w: 0.07, h: 0.07,
        fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
      });
      slide.addText(item, {
        x: cx + 0.32, y: by, w: colW - 0.48, h: 0.40,
        fontFace: FONT, fontSize: 9.5, bold: false, color: IBM_BLACK,
        valign: 'middle', align: 'left', margin: 0
      });
    });
    // last item bottom: colStartY+0.62+3*(0.46)+0.40=colStartY+0.62+1.38+0.40=colStartY+2.40 ✓
  });

  addFooter(slide, 6, false);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Why IBM?
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  addAccentStripe(slide);

  slide.addText('Why IBM Concert?', {
    x: 0.45, y: 0.20, w: 9, h: 0.44,
    fontFace: FONT, fontSize: 22, bold: true, color: IBM_BLACK,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 0.68, w: 1.8, h: 0.04,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });

  // Left: 4 differentiator cards — stacked vertically
  // cardW=4.30 cardH=0.94 gap=0.12 startX=0.45 startY=0.86
  // 4 cards total: 4*0.94+3*0.12=3.76+0.36=4.12; bottom=0.86+4.12=4.98 ≤ 5.17 ✓
  const diffs = [
    { title: 'Unified Control Plane', body: 'One platform to Understand, Decide, and Act — no rip-and-replace, works with your existing tools.' },
    { title: 'Hybrid Cloud Ready', body: 'On-premises deployment available. Works across cloud, on-prem, and air-gapped environments unlike SaaS-only competitors.' },
    { title: 'AI-Powered from the Core', body: 'Business-aware risk scoring, agentic remediation, and Concert Assistant AI — not bolted-on observability.' },
    { title: 'Proven Enterprise Scale', body: 'Rated #1 globally (G2 Grid), IBM Instana Summer 2026. IBM SevOne named leader across multiple categories.' },
  ];

  const diffCardW = 4.30, diffCardH = 0.94, diffGapY = 0.12, diffStartX = 0.45, diffStartY = 0.86;

  diffs.forEach((d, i) => {
    const dy = diffStartY + i * (diffCardH + diffGapY);
    slide.addShape(pres.ShapeType.rect, {
      x: diffStartX, y: dy, w: diffCardW, h: diffCardH,
      fill: { color: IBM_GRAY10 }, line: { color: IBM_BORDER, pt: 1 }
    });
    slide.addShape(pres.ShapeType.rect, {
      x: diffStartX, y: dy, w: 0.06, h: diffCardH,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    // Title: 11pt bold h=0.28
    slide.addText(d.title, {
      x: diffStartX + 0.18, y: dy + 0.08, w: diffCardW - 0.34, h: 0.28,
      fontFace: FONT, fontSize: 11, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // Body: 9.5pt h=0.50
    // chars_per_line=floor(3.78*72/(9.5*0.52))=54; worst 74 chars→2 lines→h=0.50 ✓
    slide.addText(d.body, {
      x: diffStartX + 0.18, y: dy + 0.38, w: diffCardW - 0.34, h: 0.50,
      fontFace: FONT, fontSize: 9.5, bold: false, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // stack: 0.08+0.28+0.02+0.50+0.06=0.94 ✓
    // containment: 0.38+0.50=0.88 ≤ 0.94 ✓
  });

  // Right: Comparison table
  // tableX=5.05 tableW=4.70 startY=0.86
  const tableX = 5.05, tableW = 4.70;

  // Header row
  const headers = ['Feature', 'Concert', 'Dynatrace', 'Datadog', 'ServiceNow'];
  // colWidths: [1.40, 0.80, 0.88, 0.80, 1.00] = 4.88 — fit within 4.70
  // Adjust: [1.30, 0.82, 0.82, 0.82, 0.82] = 4.58 → leave 0.12 pad
  const colWidths = [1.38, 0.80, 0.80, 0.80, 0.80]; // sum=4.58
  const rowH = 0.42, headerY = 0.86;

  // Header bg
  slide.addShape(pres.ShapeType.rect, {
    x: tableX, y: headerY, w: tableW, h: rowH,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });
  let colX = tableX;
  headers.forEach((h, hi) => {
    slide.addText(h, {
      x: colX + 0.04, y: headerY, w: colWidths[hi] - 0.08, h: rowH,
      fontFace: FONT, fontSize: 9, bold: true, color: IBM_WHITE,
      valign: 'middle', align: 'center', margin: 0
    });
    colX += colWidths[hi];
  });

  // Rows — all cell text ≤16 chars at 9pt (chars_per_line≈16 in 0.80" cols)
  const rows = [
    ['Hybrid On-Prem', '✓', '✓', '✗', 'Limited'],
    ['AI Risk Scoring', '✓', 'Partial', 'Partial', '✗'],
    ['Unified Control', '✓', '✗', '✗', 'Partial'],
    ['No Rip-Replace', '✓', '✓', '✓', 'Partial'],
    ['Free Trial 30d', '✓', '✓', '✓', '✗'],
    ['Agentic Ops', '✓', 'Partial', 'Partial', '✗'],
    ['Blast Radius AI', '✓', 'Partial', '✗', '✗'],
  ];

  rows.forEach((row, ri) => {
    const ry = headerY + rowH + ri * rowH;
    const rowBg = ri % 2 === 0 ? IBM_GRAY10 : IBM_WHITE;
    slide.addShape(pres.ShapeType.rect, {
      x: tableX, y: ry, w: tableW, h: rowH,
      fill: { color: rowBg }, line: { color: IBM_BORDER, pt: 0.5 }
    });
    let rcx = tableX;
    row.forEach((cell, ci) => {
      const cellColor = ci === 1 ? IBM_BLUE : IBM_BLACK;
      const cellBold  = ci === 1;
      slide.addText(cell, {
        x: rcx + 0.04, y: ry, w: colWidths[ci] - 0.08, h: rowH,
        fontFace: FONT, fontSize: 9, bold: cellBold, color: cellColor,
        valign: 'middle', align: 'center', margin: 0
      });
      rcx += colWidths[ci];
    });
    // last row bottom: headerY+rowH+7*rowH=0.86+0.42+2.94=4.22 ≤ 5.17 ✓
  });

  addFooter(slide, 7, false);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Next Steps (Closing)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });

  slide.addText('Take the Next Step', {
    x: 0.45, y: 0.20, w: 9, h: 0.50,
    fontFace: FONT, fontSize: 22, bold: true, color: IBM_WHITE,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addText('A focused 30–60 day path from interest to measurable outcome.', {
    x: 0.45, y: 0.76, w: 9, h: 0.34,
    fontFace: FONT, fontSize: 13, bold: false, color: IBM_LIGHT,
    valign: 'middle', align: 'left', margin: 0
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45, y: 1.16, w: 1.6, h: 0.025,
    fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
  });

  // 3 step cards
  // cardW=2.88 cardH=2.90 gapX=0.18 startX=0.55 startY=1.36
  // right: 0.55+3*2.88+2*0.18=0.55+8.64+0.36=9.55 ✓
  // bottom: 1.36+2.90=4.26 ≤ 5.17 ✓
  const steps = [
    {
      num: '01',
      title: 'Identify Your\nUse Case',
      body: 'Where does the pain hit hardest — observability, performance & cost, security risk, or resilience? Determine where to start.',
    },
    {
      num: '02',
      title: 'Run a Focused\nPOC',
      body: '30–60 day proof in your highest-priority domain. Measurable outcomes tied to your environment and existing tools.',
    },
    {
      num: '03',
      title: 'Plan the\nRollout',
      body: 'Connect to your existing stack — no rip-and-replace. Phased expansion across additional domains.',
    },
  ];

  const stepCardW = 2.88, stepCardH = 2.90, stepGapX = 0.18, stepStartX = 0.55, stepStartY = 1.36;

  steps.forEach((s, i) => {
    const cx = stepStartX + i * (stepCardW + stepGapX);
    // Card bg
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y: stepStartY, w: stepCardW, h: stepCardH,
      fill: { color: '0F4EC4' }, line: { color: IBM_LIGHT, pt: 1 }
    });
    // Step number — 32pt bold h=0.72
    slide.addText(s.num, {
      x: cx + 0.18, y: stepStartY + 0.16, w: stepCardW - 0.36, h: 0.72,
      fontFace: FONT, fontSize: 32, bold: true, color: IBM_WHITE,
      valign: 'top', align: 'left', margin: 0
    });
    // Divider
    slide.addShape(pres.ShapeType.rect, {
      x: cx + 0.18, y: stepStartY + 0.98, w: stepCardW - 0.36, h: 0.025,
      fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
    });
    // Title — 16pt bold 2 lines h=0.72
    // chars_per_line=floor(2.52*72/(16*0.58))=19; 'Identify Your' 13 chars, 'Use Case' 8 chars → 2 lines ✓
    slide.addText(s.title, {
      x: cx + 0.18, y: stepStartY + 1.08, w: stepCardW - 0.36, h: 0.72,
      fontFace: FONT, fontSize: 16, bold: true, color: IBM_WHITE,
      valign: 'top', align: 'left', margin: 0, lineSpacingMultiple: 1.2
    });
    // Body — 10pt 3 lines h=0.84
    // chars_per_line=floor(2.52*72/(10*0.52))=34; worst 80 chars→3 lines→h=3*(10/72)*1.5+0.10=0.73 → use 0.84
    slide.addText(s.body, {
      x: cx + 0.18, y: stepStartY + 1.88, w: stepCardW - 0.36, h: 0.84,
      fontFace: FONT, fontSize: 10, bold: false, color: IBM_LIGHT,
      valign: 'top', align: 'left', margin: 0
    });
    // stack: 0.16+0.72+0.10+0.72+0.04+0.84+0.12=2.70; containment: 1.88+0.84=2.72 ≤ 2.90 ✓
  });

  // CTA line
  slide.addText('ibm.com/concert  |  Request a Demo  |  Start Free Trial', {
    x: 0.45, y: 4.46, w: 9, h: 0.36,
    fontFace: FONT, fontSize: 12, bold: false, color: IBM_LIGHT,
    valign: 'middle', align: 'center', margin: 0
  });
  // 4.46+0.36=4.82 ≤ 5.17 ✓

  addFooter(slide, 8, true);
}

// ── Write output ──────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'ibm-concert-platform-v2.pptx');
pres.writeFile({ fileName: outPath })
  .then(() => console.log(`✅ ${outPath} written`))
  .catch(err => { console.error('❌', err); process.exit(1); });
