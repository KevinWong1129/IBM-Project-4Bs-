'use strict';
// IBM Concert Platform — IBM-branded PPTX generator
// ibm-pptx skill | IBM Hong Kong | 2026
//
// LAYOUT CONSTANTS:
//   Canvas:        10" × 5.625"  (LAYOUT_16x9)
//   Left margin:   0.38"
//   Safe bottom:   5.17"  (footer at 5.325", clearance ≥ 0.15")
//
// THREE MANDATORY CHECKS applied to every element:
//   1. TEXT OVERFLOW:   min_h = ceil(chars/cpl) * (pt/72)*lsm + 0.10
//                       cpl   = floor(w * 72 / (pt * ratio))  ratio: regular=0.52 bold=0.58
//   2. CONTAINMENT:     ty + th ≤ card_y + card_h
//                       N items block = N*itemH + (N-1)*gap  (NOT N*(itemH+gap))
//   3. FOOTER ZONE:     every shape y + h ≤ 5.17"  (except slide bg, stripe, addFooter shapes)

const pptxgen = require('pptxgenjs');

// ── Brand constants ────────────────────────────────────────────────────────────
const IBM_BLUE   = '1261FD';
const IBM_WHITE  = 'FFFFFF';
const IBM_GRAY10 = 'F1F4F7';
const IBM_BORDER = 'C1C7CD';
const IBM_BLACK  = '000000';
const IBM_MUTED  = '565656';
const IBM_LIGHT  = 'D0E4FF';
const FONT       = 'IBM Plex Sans';
const TITLE      = 'IBM Concert Platform';

// ── Presentation setup ────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

// ── Shared helpers ────────────────────────────────────────────────────────────
function addFooter(slide, n, onBlue) {
  const tc = onBlue ? IBM_LIGHT : IBM_MUTED;
  const bg = onBlue ? IBM_BLUE  : IBM_WHITE;
  // thin border rule at y=5.325
  slide.addShape(pres.ShapeType.rect, { x:0, y:5.325, w:10, h:0.001, fill:{color:IBM_BORDER}, line:{color:IBM_BORDER} });
  // footer background
  slide.addShape(pres.ShapeType.rect, { x:0, y:5.326, w:10, h:0.299, fill:{color:bg}, line:{color:bg} });
  // left: deck title
  slide.addText(TITLE, { x:0.38, y:5.33, w:7, h:0.28, fontFace:FONT, fontSize:9, color:tc, valign:'middle', align:'left', margin:0 });
  // right: page number
  slide.addText(String(n).padStart(2,'0'), { x:9.20, y:5.33, w:0.42, h:0.28, fontFace:FONT, fontSize:9, color:tc, valign:'middle', align:'right', margin:0 });
}

function solidBg(slide, color) {
  slide.addShape(pres.ShapeType.rect, { x:0, y:0, w:10, h:5.625, fill:{color}, line:{color} });
}

function leftStripe(slide) {
  slide.addShape(pres.ShapeType.rect, { x:0, y:0, w:0.18, h:5.625, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — Cover  (IBM Blue)
//
// All elements left-aligned at x=0.55, width=8.90
//   Headline  44pt bold : cpl=floor(8.90*72/(44*0.58))=25  "IBM Concert Platform"=20c → 1 ln
//             min_h = 1*(44/72)*1.1+0.10 = 0.77 → h=0.84
//   Tagline   22pt      : "Unified Agentic IT Ops — from Complexity to Clarity"=50c
//             cpl=floor(8.90*72/(22*0.52))=56 → 1 ln → min_h=(22/72)*1.2+0.10=0.47 → h=0.54
//   Sub       14pt 2 ln : min_h=2*(14/72)*1.5+0.10=0.68 → h=0.76
//
// Vertical stack (start y=1.30):
//   headline  y=1.30  bot=2.14
//   gap       0.14
//   tagline   y=2.28  bot=2.82
//   gap       0.14
//   sub       y=2.96  bot=3.72
//
// Confidentiality at y=5.30 (cover-only footer zone — intentional, no addFooter on cover)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_BLUE);
  // thin top accent
  slide.addShape(pres.ShapeType.rect, { x:0, y:0, w:10, h:0.06, fill:{color:IBM_WHITE,transparency:80}, line:{color:IBM_WHITE,transparency:80} });

  slide.addText('IBM Concert Platform', {
    x:0.55, y:1.30, w:8.90, h:0.84,
    fontFace:FONT, fontSize:44, bold:true, color:IBM_WHITE,
    lineSpacingMultiple:1.1, align:'left', valign:'middle'
  });
  slide.addText('Unified Agentic IT Ops — from Complexity to Clarity', {
    x:0.55, y:2.28, w:8.90, h:0.54,
    fontFace:FONT, fontSize:22, color:IBM_LIGHT,
    lineSpacingMultiple:1.2, align:'left', valign:'middle'
  });
  slide.addText('IBM Concert platform is the control plane for decisive, AI-driven operations.\nConnecting understanding, decision-making, and execution across your environment.', {
    x:0.55, y:2.96, w:8.90, h:0.76,
    fontFace:FONT, fontSize:14, color:IBM_LIGHT,
    lineSpacingMultiple:1.5, align:'left'
  });
  // Cover confidentiality line — lives in footer zone by design (no addFooter on cover)
  slide.addText('Confidential  |  IBM Hong Kong  |  2026', {
    x:0.38, y:5.30, w:6.00, h:0.28,
    fontFace:FONT, fontSize:10, color:IBM_LIGHT, valign:'middle', align:'left', margin:0
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — Agenda  (White + left stripe)
//
// Title bar: y=0.22 h=0.52
//
// 6 cards in 3×2 grid:
//   CW=2.88  CH=1.72  GX=0.18  SX=0.38  SY=0.90
//   rightEdge = 0.38+3*2.88+2*0.18 = 9.26 ✓
//   row 1: cy=0.90  bot=2.62  ✓
//   row 2: cy=0.90+1.72+0.18=2.80  bot=4.52 ≤ 5.17 ✓
//
// Card inner stack (inner pad LR=0.16):
//   accent stripe  h=0.07  at cy
//   num            h=0.42  y=cy+0.16   bot=cy+0.58  [20pt bold: (20/72)*1.1+0.10=0.41→0.42 ✓]
//   gap            0.04
//   title          h=0.36  y=cy+0.62   bot=cy+0.98  [13pt bold, 1ln: (13/72)*1.1+0.10=0.30→0.36 ✓]
//   gap            0.06
//   subtitle       h=0.56  y=cy+1.04   bot=cy+1.60  [10pt 2ln max: 2*(10/72)*1.5+0.10=0.52→0.56 ✓]
//   bottom pad     0.12
//   total = 0.07+0.16(num_top)+0.42+0.04+0.36+0.06+0.56+0.12 = 1.79 → card h=1.72 (pad absorbs)
//   containment: last_bot = cy+1.60 ≤ cy+1.72 ✓ (margin 0.12)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('Agenda', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK });

  const items = [
    { n:'01', t:'The Challenge',        s:'Why modern IT ops is broken' },
    { n:'02', t:'IBM Concert Platform', s:'The unified agentic control plane' },
    { n:'03', t:'Core Capabilities',    s:'Observe · Optimize · Protect · Resilience · Operate' },
    { n:'04', t:'Business Outcomes',    s:'Speed, risk reduction, cost savings' },
    { n:'05', t:'Why IBM?',             s:'vs Dynatrace & Datadog' },
    { n:'06', t:'Get Started',          s:'Free trial, demo, IBM HK sales' },
  ];

  const CW=2.88, CH=1.72, GX=0.18, SX=0.38, SY=0.90;
  items.forEach((it, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = SX + col*(CW + GX);   // 0.38 | 3.44 | 6.50
    const cy = SY + row*(CH + GX);   // 0.90 | 2.80
    // card bg + accent
    slide.addShape(pres.ShapeType.rect, { x:cx, y:cy, w:CW, h:CH, fill:{color:IBM_GRAY10}, line:{color:IBM_BORDER} });
    slide.addShape(pres.ShapeType.rect, { x:cx, y:cy, w:CW, h:0.07, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    // number
    slide.addText(it.n, { x:cx+0.16, y:cy+0.16, w:CW-0.32, h:0.42, fontFace:FONT, fontSize:20, bold:true, color:IBM_BLUE, align:'left' });
    // title
    slide.addText(it.t, { x:cx+0.16, y:cy+0.62, w:CW-0.32, h:0.36, fontFace:FONT, fontSize:13, bold:true, color:IBM_BLACK, align:'left' });
    // subtitle
    slide.addText(it.s, { x:cx+0.16, y:cy+1.04, w:CW-0.32, h:0.56, fontFace:FONT, fontSize:10, color:IBM_MUTED, lineSpacingMultiple:1.5, align:'left' });
  });

  addFooter(slide, 2, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — The Challenge  (White + left stripe)
//
// Left blue stat box: x=0.38 y=1.18 w=2.72 h=2.40
//   bot = 3.58 ✓
//   stat num:  y=SBY+0.14  h=0.86  [48pt bold: (48/72)*1.1+0.10=0.83→0.86 ✓]
//              bot=SBY+1.00
//   body text: y=SBY+1.10  h=0.88  cpl=floor(2.44*72/(10*0.52))=33  83c→3ln
//              min_h=3*(10/72)*1.5+0.10=0.73→h=0.88  bot=SBY+1.98 ✓
//   source:    y=SBY+2.06  h=0.26  bot=SBY+2.32 ≤ SBY+2.40 ✓
//
// Right pain list: x=3.26 y=1.18 w=6.36
//   header: h=0.38  bot=1.56
//   7 bullets × (h=0.46, gap=0.10)  [10pt 1ln: (10/72)*1.5+0.10=0.31→0.46 safe]
//   block = 7*0.46+6*0.10 = 3.22+0.60 = 3.82"  → 7 too tall
//   Reduce to 6 bullets × (h=0.44, gap=0.08) = 6*0.44+5*0.08=2.64+0.40=3.04"
//   start y=1.64  bot=1.64+3.04=4.68 ≤ 5.17 ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('The Challenge', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK });
  slide.addText('Complexity is outpacing IT operations', { x:0.55, y:0.76, w:9.00, h:0.36, fontFace:FONT, fontSize:13, color:IBM_MUTED });

  // Blue stat box
  const SBX=0.38, SBY=1.18, SBW=2.72, SBH=2.40;
  slide.addShape(pres.ShapeType.rect, { x:SBX, y:SBY, w:SBW, h:SBH, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
  // big number
  slide.addText('71%', {
    x:SBX, y:SBY+0.14, w:SBW, h:0.86,
    fontFace:FONT, fontSize:48, bold:true, color:IBM_WHITE, align:'center', valign:'middle'
  });
  // body text — cpl=floor(2.44*72/(10*0.52))=33, 83c → 3 ln, min_h=0.73 → h=0.88
  slide.addText('of IT leaders say operational complexity has increased significantly in the last two years', {
    x:SBX+0.14, y:SBY+1.10, w:SBW-0.28, h:0.88,
    fontFace:FONT, fontSize:10, color:IBM_LIGHT, align:'center', lineSpacingMultiple:1.5
  });
  // source
  slide.addText('IBM Institute for Business Value', {
    x:SBX+0.14, y:SBY+2.06, w:SBW-0.28, h:0.26,
    fontFace:FONT, fontSize:9, color:IBM_LIGHT, align:'center', italic:true
  });

  // Right column: header + 6 bullets
  slide.addText('Key Pain Points', {
    x:3.26, y:1.18, w:6.36, h:0.38,
    fontFace:FONT, fontSize:12, bold:true, color:IBM_BLACK
  });
  const pains = [
    '• Too many alerts — not enough context to act',
    '• Slow root cause analysis across fragmented tools',
    '• Growing complexity from AI and hybrid cloud',
    '• Teams siloed — no shared operational picture',
    '• Reactive operations — incidents found too late',
    '• Rising cloud costs with limited optimization',
  ];
  // 10pt 1ln: cpl=floor(6.26*72/(10*0.52))=86 → all ≤86c → 1 ln
  // min_h=(10/72)*1.5+0.10=0.31 → h=0.44  gap=0.08  block=6*0.44+5*0.08=3.04
  // startY=1.64  bot=4.68 ≤ 5.17 ✓
  const PAIN_START = 1.64, PAIN_H = 0.44, PAIN_GAP = 0.08;
  pains.forEach((p, i) => {
    const py = PAIN_START + i*(PAIN_H + PAIN_GAP);
    slide.addText(p, {
      x:3.26, y:py, w:6.36, h:PAIN_H,
      fontFace:FONT, fontSize:10, color:IBM_BLACK, lineSpacingMultiple:1.5, align:'left'
    });
  });

  addFooter(slide, 3, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 4 — Platform Overview  (IBM Blue)
//
// 3 pillar cards: PW=2.88 PH=3.64 PG=0.18 PSX=0.55 PSY=1.28
//   col x: 0.55 | 3.61 | 6.67   rightEdge=9.55 ✓
//   bot = 1.28+3.64 = 4.92 ≤ 5.17 ✓
//
// Card inner stack (inner pad LR=0.18):
//   label   h=0.28  y=PSY+0.16  bot=PSY+0.44  [9pt: min_h=0.23 ✓]
//   gap     0.08
//   title   h=0.72  y=PSY+0.52  bot=PSY+1.24  [16pt bold 2ln: 2*(16/72)*1.2+0.10=0.64→0.72 ✓]
//   gap     0.08
//   divider h=0.02  y=PSY+1.32  bot=PSY+1.34
//   gap     0.08
//   4 bullets h=0.50 gap=0.04 → block=4*0.50+3*0.04=2.12  [10pt 1ln max=2.50": cpl=32]
//   bullets start y=PSY+1.44  last_bot=PSY+1.44+3*0.54+0.50=PSY+1.44+2.12=PSY+3.56 ≤ PSY+3.64 ✓
//
// Outcome tags: aligned exactly with pillar card left edges (PSX + i*(PW+PG))
//   h=0.26  y=PSY+PH+0.06=4.98  bot=5.24 ≤ 5.17? 5.24 > 5.17 — move up
//   → y=4.88  bot=5.14 ≤ 5.17 ✓  (0.03" clearance)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_BLUE);
  slide.addText(TITLE, {
    x:0.55, y:0.22, w:9.00, h:0.56,
    fontFace:FONT, fontSize:28, bold:true, color:IBM_WHITE
  });
  slide.addText('A unified control plane: Understand · Decide · Act across your entire environment', {
    x:0.55, y:0.76, w:9.00, h:0.44,
    fontFace:FONT, fontSize:12, color:IBM_LIGHT, lineSpacingMultiple:1.4
  });

  const pillars = [
    {
      label: 'UNDERSTAND',
      title: 'Contextualised\nReal-Time Data',
      bullets: [
        '200+ integrations, open ecosystem',
        'Connect signals across all domains',
        'Understand dependencies & root cause',
        'Build context as systems evolve',
      ],
    },
    {
      label: 'DECIDE',
      title: 'Multi-Layer\nAgentic AI',
      bullets: [
        'AI prioritises by business impact',
        'Concert Assistant — explain & advise',
        'Proactive issue detection before impact',
        'Unified risk scoring across workloads',
      ],
    },
    {
      label: 'ACT',
      title: 'Coordinated\nExecution',
      bullets: [
        '160+ workflow integrations',
        'Low-code automated remediation',
        'Concert Assistant creates PRs',
        'Initiate actions in systems of record',
      ],
    },
  ];

  // cpl check for bullet text (10pt in PW-0.36=2.52"):
  //   cpl=floor(2.52*72/(10*0.52))=34  longest='200+ integrations, open ecosystem'=34c → 1 ln ✓
  //   'Concert Assistant creates PRs automatically' trimmed to 32c ✓
  const PW=2.88, PH=3.64, PG=0.18, PSX=0.55, PSY=1.28;
  // stack offsets:
  const LABEL_Y  = PSY + 0.16;  // 1.44
  const TITLE_Y  = PSY + 0.52;  // 1.80
  const DIV_Y    = PSY + 1.32;  // 2.60
  const BULL_Y0  = PSY + 1.44;  // 2.72  (gap after divider = 0.10)
  const BULL_H   = 0.50;
  const BULL_GAP = 0.04;

  pillars.forEach((p, i) => {
    const px = PSX + i*(PW + PG);  // 0.55 | 3.61 | 6.67
    // card
    slide.addShape(pres.ShapeType.rect, { x:px, y:PSY, w:PW, h:PH, fill:{color:IBM_WHITE,transparency:92}, line:{color:IBM_LIGHT} });
    // label
    slide.addText(p.label, {
      x:px+0.18, y:LABEL_Y, w:PW-0.36, h:0.28,
      fontFace:FONT, fontSize:9, bold:true, color:IBM_LIGHT, align:'left'
    });
    // title (2 lines)
    slide.addText(p.title, {
      x:px+0.18, y:TITLE_Y, w:PW-0.36, h:0.72,
      fontFace:FONT, fontSize:16, bold:true, color:IBM_WHITE, lineSpacingMultiple:1.2
    });
    // divider
    slide.addShape(pres.ShapeType.rect, { x:px+0.18, y:DIV_Y, w:PW-0.36, h:0.02, fill:{color:IBM_LIGHT}, line:{color:IBM_LIGHT} });
    // bullets  (last bot = BULL_Y0 + 3*(BULL_H+BULL_GAP) + BULL_H = 2.72+1.62+0.50=4.84 ≤ 4.92 ✓)
    p.bullets.forEach((b, bi) => {
      const by = BULL_Y0 + bi*(BULL_H + BULL_GAP);
      slide.addText('— ' + b, {
        x:px+0.18, y:by, w:PW-0.36, h:BULL_H,
        fontFace:FONT, fontSize:10, color:IBM_LIGHT, lineSpacingMultiple:1.5
      });
    });
  });

  // Outcome tags — aligned to pillar card left edges, same width as cards
  // y=4.88 h=0.26 bot=5.14 ≤ 5.17 ✓
  ['Increased Speed', 'Reduced Risk', 'Reduced Cost'].forEach((o, i) => {
    const ox = PSX + i*(PW + PG);   // exactly matches pillar card x: 0.55 | 3.61 | 6.67
    slide.addShape(pres.ShapeType.rect, { x:ox, y:4.88, w:PW, h:0.26, fill:{color:IBM_WHITE,transparency:75}, line:{color:IBM_LIGHT} });
    slide.addText(o, {
      x:ox, y:4.88, w:PW, h:0.26,
      fontFace:FONT, fontSize:9, bold:true, color:IBM_LIGHT, align:'center', valign:'middle'
    });
  });

  addFooter(slide, 4, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5 — Core Capabilities  (White + left stripe)
//
// Row 1: 3 cards  CW=2.88 CRDH_R1=2.12 GAP=0.18 SX=0.38 R1Y=1.16
//   x: 0.38 | 3.44 | 6.50   rightEdge=9.38 ✓   bot=3.28 ✓
//
// Row 2: 2 cards  R2W=4.44 CRDH_R2=1.71 GAP=0.18 SX=0.38 R2Y=3.46
//   x: 0.38 | 5.00   rightEdge=0.38+2*4.44+0.18=9.44 ✓
//   ⚠️  R2Y+CRDH_R2 = 3.46+1.71 = 5.17 ≤ 5.17 ✓
//
// Card inner (shared for both rows, descH computed per row):
//   accent   h=0.07  at cy
//   name     h=0.38  y=cy+0.14   [15pt bold: (15/72)*1.1+0.10=0.33→0.38 ✓]
//   pwrby    h=0.28  y=cy+0.54   [9.5pt: min_h=0.24 ✓]
//   divider  h=0.02  y=cy+0.84
//   desc     h=descH y=cy+0.90   descH = cardH - 0.90 - 0.12 (bottom pad)
//   R1: descH=2.12-0.90-0.12=1.10  10pt in 2.56": cpl=floor(2.56*72/(10*0.52))=35
//       longest desc ≈105c → 3ln → min_h=3*(10/72)*1.5+0.10=0.73 → 1.10 ✓
//   R2: descH=1.71-0.90-0.12=0.69  10pt in 4.12": cpl=floor(4.12*72/(10*0.52))=57
//       longest desc ≈90c → 2ln → min_h=2*(10/72)*1.5+0.10=0.52 → 0.69 ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('Core Capabilities', {
    x:0.55, y:0.22, w:9.00, h:0.56,
    fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK
  });
  slide.addText('Five modular capabilities — each individually deployable, all more powerful together.', {
    x:0.55, y:0.76, w:9.00, h:0.34,
    fontFace:FONT, fontSize:11, color:IBM_MUTED
  });

  const caps = [
    { nm:'Observe',    pw:'Instana & SevOne',  d:'Full-stack observability across apps, infra, and AI workloads. Detect issues faster with connected telemetry.' },
    { nm:'Optimize',   pw:'Turbonomic',         d:'Resource optimisation aligned to application demand. Manage performance and cost — including GPU for AI.' },
    { nm:'Protect',    pw:'Concert',            d:'Proactively identify and remediate vulnerabilities, certificate risks, and code-level security issues.' },
    { nm:'Resilience', pw:'Concert & NS1',      d:'Maintain reliability with unified telemetry, guided remediation, and DNS failover across domains.' },
    { nm:'Operate',    pw:'AIOps & Concert',    d:'Orchestrate incident response with low-code workflows and 160+ integrations across events and teams.' },
  ];

  const R1W=2.88, R2W=4.44, GAP=0.18, SX=0.38;
  const R1Y=1.16, R2Y=3.46;
  const CRDH_R1=2.12;
  const CRDH_R2=1.71;  // 5.17 - 3.46 = 1.71 — footer-safe

  const drawCapCard = (sl, cx, cy, cw, cardH, cap) => {
    const descH = +(cardH - 0.90 - 0.12).toFixed(2);  // bottom pad = 0.12
    // card bg + accent bar
    sl.addShape(pres.ShapeType.rect, { x:cx, y:cy, w:cw, h:cardH, fill:{color:IBM_GRAY10}, line:{color:IBM_BORDER} });
    sl.addShape(pres.ShapeType.rect, { x:cx, y:cy, w:cw, h:0.07, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    // capability name  cy+0.14 → cy+0.52
    sl.addText(cap.nm, {
      x:cx+0.16, y:cy+0.14, w:cw-0.32, h:0.38,
      fontFace:FONT, fontSize:15, bold:true, color:IBM_BLUE
    });
    // powered by  cy+0.54 → cy+0.82
    sl.addText('Powered by ' + cap.pw, {
      x:cx+0.16, y:cy+0.54, w:cw-0.32, h:0.28,
      fontFace:FONT, fontSize:9.5, color:IBM_MUTED, italic:true
    });
    // divider  cy+0.84
    sl.addShape(pres.ShapeType.rect, { x:cx+0.16, y:cy+0.84, w:cw-0.32, h:0.02, fill:{color:IBM_BORDER}, line:{color:IBM_BORDER} });
    // description  cy+0.90 → cy+0.90+descH ≤ cy+cardH ✓
    sl.addText(cap.d, {
      x:cx+0.16, y:cy+0.90, w:cw-0.32, h:descH,
      fontFace:FONT, fontSize:10, color:IBM_BLACK, lineSpacingMultiple:1.5
    });
  };

  // Row 1: i=0→x=0.38, i=1→x=3.44, i=2→x=6.50
  caps.slice(0,3).forEach((cap, i) => drawCapCard(slide, SX + i*(R1W+GAP), R1Y, R1W, CRDH_R1, cap));
  // Row 2: i=0→x=0.38, i=1→x=5.00
  caps.slice(3,5).forEach((cap, i) => drawCapCard(slide, SX + i*(R2W+GAP), R2Y, R2W, CRDH_R2, cap));

  addFooter(slide, 5, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 6 — Business Outcomes  (Cool Gray 10 + left stripe)
//
// 4 stat boxes:  SW=2.20 SH=1.50 SGAP=0.18 SX=0.38 SY=1.16
//   x: 0.38 | 2.76 | 5.14 | 7.52   rightEdge=7.52+2.20=9.72 ✓
//   bot=1.16+1.50=2.66 ✓
//   accent  h=0.07  at SY
//   number  h=0.70  y=SY+0.14   [34pt bold: (34/72)*1.1+0.10=0.62→0.70 ✓]
//   label   h=0.52  y=SY+0.92   [10pt 2ln: 2*(10/72)*1.5+0.10=0.52 exactly → h=0.52 ✓]
//   bot edge: SY+0.92+0.52=1.16+1.44=2.60 ≤ SY+SH=2.66 ✓ (0.06 pad)
//
// 3 outcome cards:  CW=2.90 CH=2.26 CGAP=0.26 CX=0.38 CY=2.84
//   x: 0.38 | 3.54 | 6.70   rightEdge=6.70+2.90=9.60 ✓
//   bot=2.84+2.26=5.10 ≤ 5.17 ✓
//   accent  h=0.07
//   title   h=0.38  y=CY+0.14   [12pt bold: min_h=0.28→0.38 ✓]
//   divider h=0.02  y=CY+0.58
//   3 bullets h=0.50 gap=0.06 → block=3*0.50+2*0.06=1.62  [10pt 2ln: 2*(10/72)*1.5+0.10=0.52→0.50 is thin, use h=0.52]
//   block=3*0.52+2*0.06=1.68
//   bullets start y=CY+0.68  last_bot=CY+0.68+2*0.58+0.52=CY+0.68+1.68=CY+2.36
//   CY+2.36=5.20 > 5.17 ← OVERFLOW — reduce CH or shift CY up
//   Fix: CH=2.20, CY=2.84, bot=5.04 ≤ 5.17 ✓
//   bullets: start y=CY+0.68 block=1.68 → last_bot=CY+0.68+1.68=CY+2.36=5.20 > 5.04
//   Fix bullet h=0.46 gap=0.06: block=3*0.46+2*0.06=1.50 → last_bot=CY+0.68+1.50=CY+2.18=5.02 ≤ 5.04 ✓
//   10pt 1ln: cpl=floor(2.62*72/(10*0.52))=36  longest='Compliance & audit readiness'=28c → 1ln ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_GRAY10); leftStripe(slide);
  slide.addText('Proven Business Outcomes', {
    x:0.55, y:0.22, w:9.00, h:0.56,
    fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK
  });
  slide.addText('Measurable impact across speed, risk, and cost — from day one', {
    x:0.55, y:0.76, w:9.00, h:0.34,
    fontFace:FONT, fontSize:11, color:IBM_MUTED
  });

  // Stat boxes
  const STATS = [
    { n:'90%',  l:'reduction in\nmean time to resolve' },
    { n:'75%',  l:'fewer critical\nvulnerabilities open' },
    { n:'40%',  l:'cloud cost savings\nvia optimization' },
    { n:'160+', l:'workflow\nintegrations' },
  ];
  const SW=2.20, SH=1.50, SGAP=0.18, SX=0.38, SY=1.16;
  STATS.forEach((st, i) => {
    const sx = SX + i*(SW + SGAP);  // 0.38 | 2.76 | 5.14 | 7.52
    slide.addShape(pres.ShapeType.rect, { x:sx, y:SY, w:SW, h:SH, fill:{color:IBM_WHITE}, line:{color:IBM_BORDER} });
    slide.addShape(pres.ShapeType.rect, { x:sx, y:SY, w:SW, h:0.07, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    slide.addText(st.n, {
      x:sx+0.10, y:SY+0.14, w:SW-0.20, h:0.70,
      fontFace:FONT, fontSize:34, bold:true, color:IBM_BLUE, align:'center', valign:'middle'
    });
    slide.addText(st.l, {
      x:sx+0.10, y:SY+0.92, w:SW-0.20, h:0.52,
      fontFace:FONT, fontSize:10, color:IBM_MUTED, align:'center', lineSpacingMultiple:1.5
    });
  });

  // Outcome cards
  const OCARDS = [
    { t:'Increased Speed', b:['Accelerate incident resolution', 'Proactive issue detection', 'Faster app delivery cycles'] },
    { t:'Reduced Risk',    b:['Unified vulnerability posture',  'Certificate risk management', 'Compliance & audit readiness'] },
    { t:'Reduced Cost',    b:['AI-driven cloud optimization',   'Tool consolidation savings',  'Automated workflow ROI'] },
  ];
  const CW=2.90, CH=2.20, CGAP=0.26, CX=0.38, CY=2.84;
  // bullet: h=0.46 gap=0.06  block=3*0.46+2*0.06=1.50
  // last_bot = CY+0.68+1.50 = CY+2.18 = 5.02 ≤ CY+CH=5.04 ✓
  const OBULLET_H=0.46, OBULLET_GAP=0.06;
  OCARDS.forEach((c, i) => {
    const cx = CX + i*(CW + CGAP);  // 0.38 | 3.54 | 6.70
    slide.addShape(pres.ShapeType.rect, { x:cx, y:CY, w:CW, h:CH, fill:{color:IBM_WHITE}, line:{color:IBM_BORDER} });
    slide.addShape(pres.ShapeType.rect, { x:cx, y:CY, w:CW, h:0.07, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    // title  CY+0.14 → CY+0.52
    slide.addText(c.t, {
      x:cx+0.14, y:CY+0.14, w:CW-0.28, h:0.38,
      fontFace:FONT, fontSize:12, bold:true, color:IBM_BLUE
    });
    // divider  CY+0.58
    slide.addShape(pres.ShapeType.rect, { x:cx+0.14, y:CY+0.58, w:CW-0.28, h:0.02, fill:{color:IBM_BORDER}, line:{color:IBM_BORDER} });
    // bullets start CY+0.68
    c.b.forEach((blt, bi) => {
      const by = CY + 0.68 + bi*(OBULLET_H + OBULLET_GAP);
      slide.addText('• ' + blt, {
        x:cx+0.14, y:by, w:CW-0.28, h:OBULLET_H,
        fontFace:FONT, fontSize:10, color:IBM_BLACK, lineSpacingMultiple:1.5
      });
    });
  });

  addFooter(slide, 6, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 7 — Why IBM Concert?  (White + left stripe)
//
// Left differentiators: x=0.38 w=4.52  startY=0.84
//   DTH=0.36 (12pt bold title)  DBH=0.52 (10pt body)  DGAP=0.06 (title-to-body gap)
//   IGAP=0.10 (body-to-next-title gap)
//   ITEM_STEP = DTH+DBH+DGAP+IGAP = 0.36+0.52+0.06+0.10 = 1.04
//   4 items: item[3] title y = 0.84+3*1.04 = 3.96
//            item[3] body  y = 3.96+0.36+0.06 = 4.38
//            item[3] body bot = 4.38+0.52 = 4.90 ≤ 5.17 ✓
//   body 10pt in 4.36": cpl=floor(4.36*72/(10*0.52))=60
//     longest='Concert supports on-prem and air-gapped deployments.'=52c→1ln
//     worst=2ln→min_h=2*(10/72)*1.5+0.10=0.52 → h=0.52 ✓
//
// Right comparison table: TX=5.22  col widths=[1.70, 1.06, 1.00, 0.96]  total=4.72  end=9.94 ✓
//   TABLE_Y=0.84  HDR_H=0.42  ROW_H=0.48  5 rows
//   table bot = 0.84+0.42+5*0.48 = 0.84+0.42+2.40 = 3.66 ≤ 5.17 ✓
//   9pt in 1.06": cpl=floor(0.94*72/(9*0.52))=14 → cell text ≤14c ✓
//   Alignment: col[0] left, cols[1-3] center, all valign middle
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('Why IBM Concert Platform?', {
    x:0.55, y:0.22, w:9.00, h:0.56,
    fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK
  });

  const diffs = [
    {
      t: 'On-Prem & SaaS — Your Choice',
      b: 'Datadog & New Relic are SaaS-only. Concert runs on-prem, SaaS, and air-gapped environments.',
    },
    {
      t: 'Truly Open — No Rip & Replace',
      b: '200+ integrations. Concert makes your existing stack smarter — no IBM-only lock-in required.',
    },
    {
      t: 'AI That Acts — Not Just Analyses',
      b: 'Concert Assistant creates PRs automatically. Dynatrace and Datadog only explain and recommend.',
    },
    {
      t: 'Unified Platform — One Identity',
      b: 'Single data layer, shared identity, unified workflows. No manual stitching across siloed tools.',
    },
  ];

  // item layout verified:
  //   item[i] title y = DSY + i*ITEM_STEP
  //   item[i] body  y = title_y + DTH + DGAP
  //   item[3] body bot = 0.84+3*1.04+0.36+0.06+0.52 = 4.90 ≤ 5.17 ✓
  const DSY=0.84, DTH=0.36, DBH=0.52, DGAP=0.06, IGAP=0.10;
  const ITEM_STEP = DTH + DBH + DGAP + IGAP;  // = 1.04
  diffs.forEach((d, i) => {
    const ty = DSY + i*ITEM_STEP;
    const by = ty + DTH + DGAP;
    // blue accent tick
    slide.addShape(pres.ShapeType.rect, { x:0.38, y:ty+0.06, w:0.06, h:DTH-0.06, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    slide.addText(d.t, {
      x:0.56, y:ty, w:4.52, h:DTH,
      fontFace:FONT, fontSize:12, bold:true, color:IBM_BLACK, align:'left'
    });
    slide.addText(d.b, {
      x:0.56, y:by, w:4.52, h:DBH,
      fontFace:FONT, fontSize:10, color:IBM_MUTED, lineSpacingMultiple:1.5, align:'left'
    });
  });

  // Comparison table
  const TX=5.22;
  const CWS  = [1.70, 1.06, 1.00, 0.96];
  const CXS  = [TX, TX+1.70, TX+2.76, TX+3.76];
  const HDR_H=0.42, ROW_H=0.48;
  const TABLE_Y = 0.84;

  const HDRS = ['Capability', 'IBM Concert', 'Dynatrace', 'Datadog'];
  HDRS.forEach((h, ci) => {
    slide.addShape(pres.ShapeType.rect, { x:CXS[ci], y:TABLE_Y, w:CWS[ci], h:HDR_H, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    slide.addText(h, {
      x:CXS[ci]+0.06, y:TABLE_Y, w:CWS[ci]-0.12, h:HDR_H,
      fontFace:FONT, fontSize:9, bold:true, color:IBM_WHITE,
      align: ci===0 ? 'left' : 'center', valign:'middle'
    });
  });

  const rows = [
    ['On-Prem deploy', '✅ Yes',     '✅ Yes',     '❌ No'],
    ['Open ecosystem', '✅ 200+',    '⚠️ Limited', '✅ 600+'],
    ['AI creates PRs', '✅ Yes',     '❌ No',      '✅ Yes'],
    ['Unified platform','✅ Yes',    '⚠️ Partial', '⚠️ Partial'],
    ['Agentic ITOps',  '✅ Full',    '⚠️ Detect',  '⚠️ Detect'],
  ];
  rows.forEach((row, ri) => {
    const ry = TABLE_Y + HDR_H + ri*ROW_H;
    const bg = ri % 2 === 0 ? IBM_GRAY10 : IBM_WHITE;
    row.forEach((cell, ci) => {
      slide.addShape(pres.ShapeType.rect, { x:CXS[ci], y:ry, w:CWS[ci], h:ROW_H, fill:{color:bg}, line:{color:IBM_BORDER} });
      slide.addText(cell, {
        x:CXS[ci]+0.06, y:ry, w:CWS[ci]-0.12, h:ROW_H,
        fontFace:FONT, fontSize:9,
        color: ci===1 ? IBM_BLUE : IBM_BLACK,
        bold:  ci===1,
        align: ci===0 ? 'left' : 'center',
        valign: 'middle'
      });
    });
  });

  addFooter(slide, 7, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 8 — Get Started  (IBM Blue)
//
// 3 step cards: NW=2.88 NH=3.10 NG=0.18 NX=0.55 NSY=1.24
//   x: 0.55 | 3.61 | 6.67   rightEdge=9.55 ✓
//   bot=1.24+3.10=4.34 ≤ 5.17 ✓
//
// Card inner stack (inner pad LR=0.16):
//   num    h=0.50  y=NSY+0.18   bot=NSY+0.68  [26pt bold: (26/72)*1.1+0.10=0.50 ✓]
//   title  h=0.46  y=NSY+0.76   bot=NSY+1.22  [14pt bold 1ln: (14/72)*1.1+0.10=0.31→0.46 ✓]
//   div    h=0.02  y=NSY+1.30
//   body   h=1.02  y=NSY+1.40   bot=NSY+2.42  [10pt 4ln in 2.56": cpl=35, 121c→4ln, 4*(10/72)*1.5+0.10=0.94→1.02 ✓]
//   cta    h=0.36  y=NSY+2.50   bot=NSY+2.86 ≤ NSY+3.10 ✓
//
// Footer: addFooter(slide, 8, true)  ← NEVER a manual text box at y > 5.17
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_BLUE);
  slide.addText('Get Started with IBM Concert Platform', {
    x:0.55, y:0.22, w:9.00, h:0.56,
    fontFace:FONT, fontSize:28, bold:true, color:IBM_WHITE
  });
  slide.addText('Three ways to begin your journey today', {
    x:0.55, y:0.76, w:9.00, h:0.40,
    fontFace:FONT, fontSize:14, color:IBM_LIGHT
  });

  const steps = [
    {
      n: '01',
      t: 'Start Your Free Trial',
      b: '30-day, fully provisioned experience. Explore the platform with sample data or upload your own for a personalised trial.',
      c: 'ibm.com/concert',
    },
    {
      n: '02',
      t: 'Request a Demo',
      b: 'Get a customised demonstration of Concert capabilities and the transformational impact they can have on your operations.',
      c: 'Book an appointment',
    },
    {
      n: '03',
      t: 'Talk to an IBM Expert',
      b: 'Connect with our IBM Hong Kong team to design the right Concert platform solution for your hybrid environment.',
      c: 'IBM Hong Kong Sales',
    },
  ];

  const NW=2.88, NH=3.10, NG=0.18, NX=0.55, NSY=1.24;
  steps.forEach((s, i) => {
    const sx = NX + i*(NW + NG);  // 0.55 | 3.61 | 6.67
    // card bg
    slide.addShape(pres.ShapeType.rect, { x:sx, y:NSY, w:NW, h:NH, fill:{color:IBM_WHITE,transparency:90}, line:{color:IBM_LIGHT} });
    // number
    slide.addText(s.n, {
      x:sx+0.16, y:NSY+0.18, w:NW-0.32, h:0.50,
      fontFace:FONT, fontSize:26, bold:true, color:IBM_WHITE, align:'left'
    });
    // title
    slide.addText(s.t, {
      x:sx+0.16, y:NSY+0.76, w:NW-0.32, h:0.46,
      fontFace:FONT, fontSize:14, bold:true, color:IBM_WHITE, align:'left'
    });
    // divider
    slide.addShape(pres.ShapeType.rect, { x:sx+0.16, y:NSY+1.30, w:NW-0.32, h:0.02, fill:{color:IBM_LIGHT}, line:{color:IBM_LIGHT} });
    // body text
    slide.addText(s.b, {
      x:sx+0.16, y:NSY+1.40, w:NW-0.32, h:1.02,
      fontFace:FONT, fontSize:10, color:IBM_LIGHT, lineSpacingMultiple:1.5, align:'left'
    });
    // CTA link
    slide.addText(s.c, {
      x:sx+0.16, y:NSY+2.50, w:NW-0.32, h:0.36,
      fontFace:FONT, fontSize:10, bold:true, color:IBM_WHITE, align:'left'
    });
  });

  // ⚠️ addFooter — NEVER put a manual text box at y > 5.17 (footer zone violation)
  addFooter(slide, 8, true);
}

// ── Write ──────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: 'outputs/ibm-concert-platform.pptx' })
  .then(() => console.log('✅  outputs/ibm-concert-platform.pptx written'))
  .catch(e  => { console.error('❌', e); process.exit(1); });
