'use strict';
// IBM Concert Platform — Architecture Deck
// ibm-pptx skill v2.0 | IBM Hong Kong | 2026
//
// CANVAS:       10" × 5.625"  (LAYOUT_16x9)
// LEFT MARGIN:  0.38" (stripe slides) / 0.55" (titles)
// SAFE BOTTOM:  5.17"  — every content shape: y + h ≤ 5.17"
//
// SAFETY RULES (from SKILL.md §4.5):
//   RULE 1 — TEXT OVERFLOW:  min_h = ceil(chars/cpl)*(pt/72)*lsm + 0.10
//                             cpl   = floor(w*72/(pt*ratio))  regular=0.52 bold=0.58
//   RULE 2 — CONTAINMENT:    ty+th ≤ card_y+card_h  |  N-1 gap rule
//   RULE 3 — FOOTER ZONE:    y+h ≤ 5.17" for all content shapes

const pptxgen = require('pptxgenjs');

// ── Brand constants (SKILL.md §4.1) ──────────────────────────────────────────
const IBM_BLUE   = '1261FD';
const IBM_WHITE  = 'FFFFFF';
const IBM_GRAY10 = 'F1F4F7';
const IBM_BORDER = 'C1C7CD';
const IBM_BLACK  = '000000';
const IBM_MUTED  = '565656';
const IBM_LIGHT  = 'D0E4FF';
const FONT       = 'IBM Plex Sans';
const TITLE      = 'IBM Concert Platform — Architecture';

// ── Setup ─────────────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

// ── Helpers (SKILL.md §4.3) ───────────────────────────────────────────────────
function addFooter(slide, n, onBlue) {
  const tc = onBlue ? IBM_LIGHT : IBM_MUTED;
  const bg = onBlue ? IBM_BLUE  : IBM_WHITE;
  slide.addShape(pres.ShapeType.rect, { x:0, y:5.325, w:10, h:0.001, fill:{color:IBM_BORDER}, line:{color:IBM_BORDER} });
  slide.addShape(pres.ShapeType.rect, { x:0, y:5.326, w:10, h:0.299, fill:{color:bg},         line:{color:bg} });
  slide.addText(TITLE,                     { x:0.38, y:5.33, w:7,    h:0.28, fontFace:FONT, fontSize:9, color:tc, valign:'middle', align:'left',  margin:0 });
  slide.addText(String(n).padStart(2,'0'), { x:9.20, y:5.33, w:0.42, h:0.28, fontFace:FONT, fontSize:9, color:tc, valign:'middle', align:'right', margin:0 });
}
function solidBg(slide, color) {
  slide.addShape(pres.ShapeType.rect, { x:0, y:0, w:10, h:5.625, fill:{color}, line:{color} });
}
function leftStripe(slide) {
  slide.addShape(pres.ShapeType.rect, { x:0, y:0, w:0.18, h:5.625, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — Cover  (IBM Blue)  ← SKILL.md §4.4 template
//
// Overflow checks (RULE 1):
//   Headline "IBM Concert Platform" 44pt bold: 20c, cpl=floor(8.90*72/(44*0.58))=25 → 1ln
//     min_h=1*(44/72)*1.1+0.10=0.77 → h=0.84 ✓
//   Tagline 22pt: "Platform Architecture — Layers, Agents & Integrations" 51c
//     cpl=floor(8.90*72/(22*0.52))=56 → 1ln → min_h=(22/72)*1.2+0.10=0.47 → h=0.54 ✓
//   Sub 14pt 2ln: min_h=2*(14/72)*1.5+0.10=0.68 → h=0.76 ✓
//
// Stack (RULE 3): headline bot=2.14, tagline y=2.28 bot=2.82, sub y=2.96 bot=3.72 ≤ 5.17 ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_BLUE);
  slide.addShape(pres.ShapeType.rect, { x:0, y:0, w:10, h:0.06, fill:{color:IBM_WHITE,transparency:80}, line:{color:IBM_WHITE,transparency:80} });

  slide.addText('IBM Concert Platform', {
    x:0.55, y:1.30, w:8.90, h:0.84,
    fontFace:FONT, fontSize:44, bold:true, color:IBM_WHITE,
    lineSpacingMultiple:1.1, align:'left', valign:'middle'
  });
  slide.addText('Platform Architecture — Layers, Agents & Integrations', {
    x:0.55, y:2.28, w:8.90, h:0.54,
    fontFace:FONT, fontSize:22, color:IBM_LIGHT,
    lineSpacingMultiple:1.2, align:'left', valign:'middle'
  });
  slide.addText('A deep-dive into the layered architecture powering unified,\nagentic IT operations across hybrid cloud environments.', {
    x:0.55, y:2.96, w:8.90, h:0.76,
    fontFace:FONT, fontSize:14, color:IBM_LIGHT, lineSpacingMultiple:1.5, align:'left'
  });
  // cover confidentiality — intentionally in footer zone, no addFooter on cover
  slide.addText('Confidential  |  IBM Hong Kong  |  2026', {
    x:0.38, y:5.30, w:6.00, h:0.28,
    fontFace:FONT, fontSize:10, color:IBM_LIGHT, valign:'middle', align:'left', margin:0
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — Agenda  (White + left stripe)
//
// 6 cards in 3×2 grid (SKILL.md §4.6 canonical):
//   CW=2.88  CH=1.72  GX=0.18  SX=0.38  SY=0.90
//   rightEdge=9.26 ✓  row1 bot=2.62 ✓  row2 bot=4.52 ≤ 5.17 ✓
//
// Card inner (RULE 2 containment):
//   accent h=0.07  num y=cy+0.16 h=0.42  title y=cy+0.62 h=0.36  sub y=cy+1.04 h=0.56
//   last_bot=cy+1.60 ≤ cy+1.72 ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('Agenda', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK });

  const items = [
    { n:'01', t:'Architecture in Context',     s:'Why a layered platform matters' },
    { n:'02', t:'Platform Architecture',       s:'Four-layer technical overview' },
    { n:'03', t:'Data & Integration Layer',    s:'Federated GraphQL data access' },
    { n:'04', t:'AI & Agentic Engine',         s:'Multi-level AI orchestration' },
    { n:'05', t:'Deployment Models',           s:'SaaS, On-Prem, Hybrid Cloud' },
    { n:'06', t:'Get Started',                 s:'Free trial, demo, IBM HK sales' },
  ];

  const CW=2.88, CH=1.72, GX=0.18, SX=0.38, SY=0.90;
  items.forEach((it, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = SX + col*(CW + GX);  // 0.38 | 3.44 | 6.50
    const cy = SY + row*(CH + GX);  // 0.90 | 2.80
    slide.addShape(pres.ShapeType.rect, { x:cx, y:cy, w:CW, h:CH, fill:{color:IBM_GRAY10}, line:{color:IBM_BORDER} });
    slide.addShape(pres.ShapeType.rect, { x:cx, y:cy, w:CW, h:0.07, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    slide.addText(it.n, { x:cx+0.16, y:cy+0.16, w:CW-0.32, h:0.42, fontFace:FONT, fontSize:20, bold:true, color:IBM_BLUE, align:'left' });
    slide.addText(it.t, { x:cx+0.16, y:cy+0.62, w:CW-0.32, h:0.36, fontFace:FONT, fontSize:13, bold:true, color:IBM_BLACK, align:'left' });
    slide.addText(it.s, { x:cx+0.16, y:cy+1.04, w:CW-0.32, h:0.56, fontFace:FONT, fontSize:10, color:IBM_MUTED, lineSpacingMultiple:1.5, align:'left' });
  });

  addFooter(slide, 2, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — Architecture in Context  (White + left stripe)
//
// Left stat box: x=0.38 y=1.18 w=2.72 h=2.40 → bot=3.58 ✓
//   Big number 48pt: h=0.86  bot=SBY+1.00 ✓
//   Body 10pt: "of IT leaders say existing tools create fragmented silos that delay response"
//     =72c  cpl=floor(2.44*72/(10*0.52))=33 → ceil(72/33)=3ln → min_h=3*(10/72)*1.5+0.10=0.73 → h=0.88 ✓
//     y=SBY+1.10  bot=SBY+1.98 ✓
//   Source 9pt: h=0.26  y=SBY+2.06  bot=SBY+2.32 ≤ SBY+2.40 ✓
//
// Right challenge list: x=3.26 y=1.18 w=6.36
//   header h=0.38  bot=1.56
//   6 bullets h=0.44 gap=0.08  block=6*0.44+5*0.08=3.04
//   startY=1.64  lastBot=4.68 ≤ 5.17 ✓
//   cpl=floor(6.26*72/(10*0.52))=86 → all ≤86c → 1 line ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('Architecture in Context', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK });
  slide.addText('Why Concert platform needs a unified, layered architecture', { x:0.55, y:0.76, w:9.00, h:0.36, fontFace:FONT, fontSize:13, color:IBM_MUTED });

  // Left stat box
  const SBX=0.38, SBY=1.18, SBW=2.72, SBH=2.40;
  slide.addShape(pres.ShapeType.rect, { x:SBX, y:SBY, w:SBW, h:SBH, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
  slide.addText('3+', {
    x:SBX, y:SBY+0.14, w:SBW, h:0.86,
    fontFace:FONT, fontSize:48, bold:true, color:IBM_WHITE, align:'center', valign:'middle'
  });
  // 72c → 3 lines → h=0.88 ✓
  slide.addText('of IT leaders say existing tools create fragmented silos that delay response', {
    x:SBX+0.14, y:SBY+1.10, w:SBW-0.28, h:0.88,
    fontFace:FONT, fontSize:10, color:IBM_LIGHT, align:'center', lineSpacingMultiple:1.5
  });
  slide.addText('IBM Institute for Business Value', {
    x:SBX+0.14, y:SBY+2.06, w:SBW-0.28, h:0.26,
    fontFace:FONT, fontSize:9, color:IBM_LIGHT, align:'center', italic:true
  });

  // Right list
  slide.addText('Why a Unified Architecture?', { x:3.26, y:1.18, w:6.36, h:0.38, fontFace:FONT, fontSize:12, bold:true, color:IBM_BLACK });
  const challenges = [
    '• Data scattered across tools with no unified layer',
    '• AI insights siloed — no cross-domain correlation',
    '• Manual stitching of events, alerts, and workflows',
    '• No shared identity or context across products',
    '• Repeated data ingestion per tool — costly overhead',
    '• Slow time to value without a common platform base',
  ];
  // h=0.44 gap=0.08  startY=1.64  lastBot=1.64+5*0.52+0.44=4.68 ✓
  const PAIN_START=1.64, PAIN_H=0.44, PAIN_GAP=0.08;
  challenges.forEach((p, i) => {
    slide.addText(p, {
      x:3.26, y:PAIN_START + i*(PAIN_H+PAIN_GAP), w:6.36, h:PAIN_H,
      fontFace:FONT, fontSize:10, color:IBM_BLACK, lineSpacingMultiple:1.5, align:'left'
    });
  });

  addFooter(slide, 3, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 4 — Platform Architecture Overview  (IBM Blue)
//
// 4-layer architecture diagram using horizontal band cards
//   Canvas width for bands: x=0.38 w=9.24 (full width minus margins)
//   Band height: BAND_H=0.92  Gap between bands: BAND_GAP=0.10
//   startY=1.20
//   4 bands: total height = 4*0.92+3*0.10 = 3.68+0.30 = 3.98
//   lastBand bot = 1.20+3.98 = 5.18 > 5.17 ← too tall by 0.01"
//   Fix: BAND_H=0.90, GAP=0.10 → 4*0.90+3*0.10 = 3.60+0.30 = 3.90
//   lastBand bot = 1.20+3.90 = 5.10 ≤ 5.17 ✓
//
// Band label 11pt bold:  cpl=floor(2.20*72/(11*0.52))=27  all ≤27c ✓  h=0.38 ✓
// Band pills 9pt: w=1.30 h=0.38  cpl=floor(1.14*72/(9*0.52))=17  all ≤17c ✓
//   pill x positions: label_x + label_w + 0.10 + j*(pill_w + pill_gap)
//   label x=0.54 w=2.16  pills start x=2.80  pill_w=1.30 pill_gap=0.10
//   max 5 pills: 2.80+5*1.30+4*0.10 = 2.80+6.50+0.40 = 9.70 ≤ 9.62 — too wide
//   Use 4 pills max or reduce pill_w to 1.22: 2.80+4*1.22+3*0.10 = 2.80+4.88+0.30 = 7.98 ✓
//   Use pill_w=1.34 for 4 pills: 2.80+4*1.34+3*0.10 = 2.80+5.36+0.30 = 8.46 ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_BLUE);
  slide.addText(TITLE, { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_WHITE });
  slide.addText('Four layers working together: Integrate → Store → Decide → Act', {
    x:0.55, y:0.76, w:9.00, h:0.38, fontFace:FONT, fontSize:12, color:IBM_LIGHT, lineSpacingMultiple:1.4
  });

  // BAND constants
  const BX=0.38, BW=9.24, BAND_H=0.90, BAND_GAP=0.10, BY0=1.20;
  const LW=2.16, LX=BX+0.16;           // label column
  const PX0=LX+LW+0.14;                // pills start x = 2.46
  const PW=1.34, PH=0.52, PGAP=0.10;   // pill dims
  // pill y-center offset inside band: (BAND_H-PH)/2 = (0.90-0.52)/2 = 0.19
  const PY_OFF = (BAND_H - PH) / 2;    // = 0.19

  const layers = [
    {
      label: 'VISUALISATION',
      sub:   'Platform Experience',
      color: '0F5FD8',  // darker IBM Blue variant for distinction
      pills: ['Platform Homepage', 'AI Dashboards', 'Contextual UI', 'Concert Data Apps'],
    },
    {
      label: 'AI & AGENTS',
      sub:   'Agentic Intelligence',
      color: '1A4FC4',
      pills: ['Unified AI Assistant', 'Coordinator Agent', 'Capability Agents', 'Vector Database'],
    },
    {
      label: 'DATA ACCESS',
      sub:   'Federated GraphQL Layer',
      color: '1261FD',
      pills: ['GraphQL API', 'Entity Matching', 'Relationship Graph', 'Common Data Model'],
    },
    {
      label: 'DATA INGESTION',
      sub:   'Integration & Collection',
      color: '0A3DB5',
      pills: ['Instana / SevOne', 'Turbonomic', 'AIOps / Concert', '160+ Connectors'],
    },
  ];

  // Render bottom-up (layer 0 = top = Visualisation)
  layers.forEach((layer, i) => {
    const by = BY0 + i*(BAND_H + BAND_GAP);
    // band bg
    slide.addShape(pres.ShapeType.rect, { x:BX, y:by, w:BW, h:BAND_H, fill:{color:layer.color}, line:{color:IBM_LIGHT,transparency:60} });
    // left label area (slightly lighter)
    slide.addShape(pres.ShapeType.rect, { x:BX, y:by, w:LW+0.30, h:BAND_H, fill:{color:IBM_WHITE,transparency:88}, line:{color:IBM_WHITE,transparency:88} });
    // layer label
    slide.addText(layer.label, {
      x:LX, y:by+0.08, w:LW, h:0.32,
      fontFace:FONT, fontSize:9, bold:true, color:IBM_WHITE, align:'left'
    });
    slide.addText(layer.sub, {
      x:LX, y:by+0.42, w:LW, h:0.34,
      fontFace:FONT, fontSize:9, color:IBM_LIGHT, align:'left', italic:true
    });
    // pills
    // pill bot = by + PY_OFF + PH = by+0.19+0.52 = by+0.71 ≤ by+0.90 ✓
    layer.pills.forEach((pill, j) => {
      const px = PX0 + j*(PW + PGAP);
      slide.addShape(pres.ShapeType.rect, { x:px, y:by+PY_OFF, w:PW, h:PH, fill:{color:IBM_WHITE,transparency:85}, line:{color:IBM_LIGHT} });
      slide.addText(pill, {
        x:px, y:by+PY_OFF, w:PW, h:PH,
        fontFace:FONT, fontSize:8.5, color:IBM_WHITE, align:'center', valign:'middle'
      });
    });
  });

  // Bottom annotation: flow labels (y=4.88 h=0.26 → bot=5.14 ≤ 5.17 ✓)
  // 9pt min_h=(9/72)*1.4+0.08=0.255 → h=0.26 ✓
  slide.addText('← Data flows upward through layers  ·  Actions flow downward →', {
    x:BX, y:4.88, w:BW, h:0.26,
    fontFace:FONT, fontSize:9, color:IBM_LIGHT, align:'center', italic:true
  });

  addFooter(slide, 4, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5 — Data & Integration Layer  (White + left stripe)
//
// Two column layout: left=integration types, right=data access layer detail
//
// Left column: x=0.38 w=4.40
//   Title h=0.52  y=0.22  ← slide title
//   Subtitle h=0.34  y=0.76
//   Section header h=0.34  y=1.18  "KEY INTEGRATIONS"
//   5 integration category cards: CW=4.22 CH=0.56 GY=0.08  startY=1.58
//     5*0.56+4*0.08 = 2.80+0.32 = 3.12
//     lastBot = 1.58+3.12 = 4.70 ≤ 5.17 ✓
//     Card inner: icon label 9pt  value 10pt bold — both in single text ✓
//
// Right column: x=4.96 w=4.66
//   Section header y=1.18 h=0.34
//   3 detail cards: CW=4.66 CH=1.04 GY=0.12  startY=1.58
//     3*1.04+2*0.12 = 3.12+0.24 = 3.36
//     lastBot = 1.58+3.36 = 4.94 ≤ 5.17 ✓
//   Card inner: title 11pt bold h=0.30, body 9.5pt 2ln h=0.50  gap=0.10
//     containment: 0.14+0.30+0.10+0.50+0.10 = 1.14 > 1.04 ← overflow
//     Fix: CH=1.14 → lastBot=1.58+3*1.14+2*0.12=1.58+3.42+0.24=5.24 > 5.17
//     Fix2: reduce to CH=1.00, body 9pt 2ln: min_h=2*(9/72)*1.4+0.10=0.45 → h=0.46
//       stack: top(0.12)+title(0.28)+gap(0.08)+body(0.46)+bot(0.06) = 1.00 ✓
//       lastBot = 1.58+3*1.00+2*0.12 = 1.58+3.24 = 4.82 ≤ 5.17 ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('Data & Integration Layer', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK });
  slide.addText('How Concert platform connects and unifies data from every source', { x:0.55, y:0.76, w:9.00, h:0.34, fontFace:FONT, fontSize:11, color:IBM_MUTED });

  // ── LEFT: Key Integrations ──────────────────────────────────────────────────
  slide.addText('KEY INTEGRATIONS', {
    x:0.38, y:1.18, w:4.22, h:0.34,
    fontFace:FONT, fontSize:10, bold:true, color:IBM_BLUE, align:'left'
  });

  const intgCategories = [
    { cat:'Observability & Monitoring', tools:'Instana (APM), SevOne (Network), Prometheus' },
    { cat:'Optimization & Cloud',       tools:'Turbonomic, AWS EC2, OpenShift, Kubernetes' },
    { cat:'Security & Compliance',      tools:'Concert Protect, Vulnerability scanners, CSPM' },
    { cat:'ITSM & Workflows',           tools:'ServiceNow, Jira, PagerDuty, Slack, 160+' },
    { cat:'DevOps & IaC',               tools:'GitHub, Jenkins, Terraform, ArgoCD, Ansible' },
  ];
  // card: CW=4.22 CH=0.56 GY=0.08
  // cat label 9pt bold: cpl=floor(4.06*72/(9*0.52))=62  all ≤62c → 1ln ✓ h=0.22
  // tools 9pt: cpl=floor(4.06*72/(9*0.52))=62  all ≤62c → 1ln ✓ h=0.22
  // stack: top(0.06)+cat(0.22)+gap(0.04)+tools(0.22)+bot(0.02) = 0.56 ✓
  const ICW=4.22, ICH=0.56, IGY=0.08, ICX=0.38, ICY0=1.58;
  intgCategories.forEach((ig, i) => {
    const icy = ICY0 + i*(ICH+IGY);
    slide.addShape(pres.ShapeType.rect, { x:ICX, y:icy, w:ICW, h:ICH, fill:{color:IBM_GRAY10}, line:{color:IBM_BORDER} });
    slide.addShape(pres.ShapeType.rect, { x:ICX, y:icy, w:0.04, h:ICH, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    slide.addText(ig.cat, {
      x:ICX+0.12, y:icy+0.06, w:ICW-0.16, h:0.22,
      fontFace:FONT, fontSize:9, bold:true, color:IBM_BLACK, align:'left'
    });
    slide.addText(ig.tools, {
      x:ICX+0.12, y:icy+0.32, w:ICW-0.16, h:0.22,
      fontFace:FONT, fontSize:9, color:IBM_MUTED, align:'left'
    });
  });

  // ── RIGHT: Data Access Layer ────────────────────────────────────────────────
  slide.addText('DATA ACCESS LAYER (DAL)', {
    x:4.96, y:1.18, w:4.66, h:0.34,
    fontFace:FONT, fontSize:10, bold:true, color:IBM_BLUE, align:'left'
  });

  const dalCards = [
    {
      t: 'Federated GraphQL API',
      b: 'Real-time, federated GraphQL foundation unifying data across all capabilities. Humans and agents query the same model.',
    },
    {
      t: 'Common Entity Data Model',
      b: 'Shared model for entities and signals. Enables consistent discovery, correlation, and traversal — removing fragmentation.',
    },
    {
      t: 'Entity Matching & Relationships',
      b: 'Services connect metadata and data across products. Correlated data flows to consuming apps and AI agents via graph traversal.',
    },
  ];
  // CH=1.00  stack: top(0.12)+title(0.28)+gap(0.08)+body(0.46)+bot(0.06) = 1.00 ✓
  // body 9pt 2ln: min_h=2*(9/72)*1.4+0.10=0.45 → h=0.46 ✓
  // lastBot = 1.58+3*1.00+2*0.12 = 4.82 ≤ 5.17 ✓
  const DCW=4.66, DCH=1.00, DGY=0.12, DCX=4.96, DCY0=1.58;
  dalCards.forEach((dc, i) => {
    const dcy = DCY0 + i*(DCH+DGY);
    slide.addShape(pres.ShapeType.rect, { x:DCX, y:dcy, w:DCW, h:DCH, fill:{color:IBM_GRAY10}, line:{color:IBM_BORDER} });
    slide.addShape(pres.ShapeType.rect, { x:DCX, y:dcy, w:DCW, h:0.06, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    // title: 11pt bold 1ln  cpl=floor(4.50*72/(11*0.58))=51  all ≤51c ✓  min_h=(11/72)*1.1+0.10=0.27 → h=0.28 ✓
    slide.addText(dc.t, {
      x:DCX+0.14, y:dcy+0.12, w:DCW-0.28, h:0.28,
      fontFace:FONT, fontSize:11, bold:true, color:IBM_BLUE
    });
    // body: 9pt 2ln → h=0.46 ✓
    slide.addText(dc.b, {
      x:DCX+0.14, y:dcy+0.48, w:DCW-0.28, h:0.46,
      fontFace:FONT, fontSize:9, color:IBM_BLACK, lineSpacingMultiple:1.4
    });
  });

  addFooter(slide, 5, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 6 — AI & Agentic Engine  (Cool Gray 10 + left stripe)
//
// Header area: y=0.22 h=0.52 (title)  y=0.76 h=0.34 (sub)
//
// Left: Agent hierarchy diagram  x=0.38 w=4.34
//   3 agent tier boxes stacked vertically
//   TIER_W=4.34  TIER_H=0.96  TIER_GAP=0.10  startY=1.18
//   3*0.96+2*0.10 = 2.88+0.20 = 3.08  lastBot=1.18+3.08=4.26 ≤ 5.17 ✓
//   Inner: label 9pt h=0.24  bullets 2× 9pt h=0.24 each  gap=0.04
//     stack: top(0.12)+label(0.24)+gap(0.04)+bullet0(0.24)+gap(0.04)+bullet1(0.24)+bot(0.04)=0.96 ✓
//
// Right: AI differentiators  x=4.96 w=4.66
//   4 items: DSY=1.18  DTH=0.34  DBH=0.52  DGAP=0.06  IGAP=0.10
//   ITEM_STEP=0.34+0.52+0.06+0.10=1.02
//   item[3] body bot = 1.18+3*1.02+0.34+0.06+0.52 = 1.18+3.06+0.92 = 5.16 ≤ 5.17 ✓ (0.01" margin)
//   body 9.5pt 2ln: cpl=floor(4.50*72/(9.5*0.52))=65  longest≈90c→2ln
//     min_h=2*(9.5/72)*1.5+0.10=0.50 → h=0.52 ✓
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_GRAY10); leftStripe(slide);
  slide.addText('AI & Agentic Engine', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK });
  slide.addText('Multi-level AI orchestration powering decisive, automated operations', { x:0.55, y:0.76, w:9.00, h:0.34, fontFace:FONT, fontSize:11, color:IBM_MUTED });

  // ── LEFT: Agent Hierarchy ───────────────────────────────────────────────────
  const agentTiers = [
    {
      label: 'UNIFIED AI ASSISTANT',
      color: IBM_BLUE,
      bullets: [
        'Single interface for questions, insights, and actions',
        'Synthesises expertise across all operational domains',
      ],
    },
    {
      label: 'COORDINATOR AGENT',
      color: '0F4FC8',
      bullets: [
        'Selects and sequences capability agents dynamically',
        'Maintains cross-domain context · coordinates execution',
      ],
    },
    {
      label: 'CAPABILITY AGENTS',
      color: '0A3DB5',
      bullets: [
        'Observe · Optimize · Protect · Resilience · Operate',
        'Investigation, prioritisation, and execution per domain',
      ],
    },
  ];

  // TIER_W=4.34  TIER_H=0.96  TIER_GAP=0.10  startY=1.18
  // stack: top(0.12)+label(0.24)+gap(0.04)+b0(0.24)+gap(0.04)+b1(0.24)+bot(0.04) = 0.96 ✓
  const TW=4.34, TH=0.96, TG=0.10, TX=0.38, TY0=1.18;
  agentTiers.forEach((tier, i) => {
    const ty = TY0 + i*(TH+TG);
    slide.addShape(pres.ShapeType.rect, { x:TX, y:ty, w:TW, h:TH, fill:{color:tier.color}, line:{color:tier.color} });
    slide.addText(tier.label, {
      x:TX+0.14, y:ty+0.12, w:TW-0.28, h:0.24,
      fontFace:FONT, fontSize:9, bold:true, color:IBM_LIGHT, align:'left'
    });
    tier.bullets.forEach((b, bi) => {
      slide.addText('— ' + b, {
        x:TX+0.14, y:ty+0.40+(bi*0.28), w:TW-0.28, h:0.24,
        fontFace:FONT, fontSize:8.5, color:IBM_LIGHT, lineSpacingMultiple:1.3, align:'left'
      });
    });
    // connector tick between tiers — thin centred line, visible at any size
    if (i < 2) {
      const arrowY = ty + TH + 0.03;
      slide.addShape(pres.ShapeType.rect, {
        x:TX + TW/2 - 0.30, y:arrowY, w:0.60, h:0.04,
        fill:{ color:IBM_MUTED }, line:{ color:IBM_MUTED }
      });
    }
  });
  // lastBot = 1.18 + 3*0.96 + 2*0.10 = 1.18+3.08 = 4.26 ✓

  // ── RIGHT: AI Differentiators ────────────────────────────────────────────────
  const aiDiffs = [
    {
      t: 'Deterministic Root Cause First',
      b: 'Platform identifies root cause deterministically before invoking LLMs — reducing hallucination risk and token costs.',
    },
    {
      t: 'Multi-Level AI Orchestration',
      b: 'Swarm architecture: agents collaborate, escalate, and resolve across observability, security, and network domains.',
    },
    {
      t: 'Code Agent — Creates PRs',
      b: 'IBM Research-powered coding agent identifies root cause and generates pull requests — without exporting your data.',
    },
    {
      t: 'Vector Database Context',
      b: 'Rich semantic context enhances agent requests with environment knowledge for accurate, grounded recommendations.',
    },
  ];

  // ITEM_STEP=1.02  item[3] body bot = 1.18+3*1.02+0.34+0.06+0.52=5.16 ≤ 5.17 ✓
  const DSY=1.18, DTH=0.34, DBH=0.52, DGAP=0.06, IGAP=0.10;
  const ITEM_STEP = DTH+DBH+DGAP+IGAP;  // 1.02
  aiDiffs.forEach((d, i) => {
    const ty = DSY + i*ITEM_STEP;
    const by = ty + DTH + DGAP;
    slide.addShape(pres.ShapeType.rect, { x:4.90, y:ty+0.06, w:0.06, h:DTH-0.06, fill:{color:IBM_BLUE}, line:{color:IBM_BLUE} });
    slide.addText(d.t, {
      x:5.08, y:ty, w:4.54, h:DTH,
      fontFace:FONT, fontSize:11, bold:true, color:IBM_BLACK, align:'left'
    });
    slide.addText(d.b, {
      x:5.08, y:by, w:4.54, h:DBH,
      fontFace:FONT, fontSize:9.5, color:IBM_MUTED, lineSpacingMultiple:1.5, align:'left'
    });
  });

  addFooter(slide, 6, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 7 — Deployment Models  (White + left stripe)
//
// 3 deployment model cards side-by-side
//   CW=2.88  CH=3.20  GAP=0.18  startX=0.55  startY=1.16
//   rightEdge=0.55+3*2.88+2*0.18=9.55 ✓
//   bot=1.16+3.20=4.36 ≤ 5.17 ✓
//
// Card inner (innerPadLR=0.16):
//   accent  h=0.07  y=cy
//   icon    h=0.34  y=cy+0.14   [label 12pt bold]
//   title   h=0.34  y=cy+0.52   [12pt bold, 1ln: (12/72)*1.1+0.10=0.28 → 0.34 ✓]
//   sub     h=0.26  y=cy+0.90   [9pt 1ln: (9/72)*1.4+0.10=0.28 → 0.26 use 0.28]
//   divider h=0.02  y=cy+1.22
//   4 bullets h=0.42 gap=0.06 → block=4*0.42+3*0.06=1.68+0.18=1.86
//   bullets start y=cy+1.30  last_bot=cy+1.30+1.86=cy+3.16 ≤ cy+3.20 ✓
//   10pt 1ln: cpl=floor(2.56*72/(10*0.52))=35  all ≤35c ✓
//
// Note: icon area uses emoji-free text label
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_WHITE); leftStripe(slide);
  slide.addText('Deployment Models', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_BLACK });
  slide.addText('Concert platform runs where you need it — SaaS, on-premises, or both', { x:0.55, y:0.76, w:9.00, h:0.34, fontFace:FONT, fontSize:11, color:IBM_MUTED });

  const models = [
    {
      icon:  'SaaS',
      title: 'IBM Cloud — SaaS',
      sub:   'Fully managed, zero-ops',
      accent: IBM_BLUE,
      bullets: [
        'IBM-managed infrastructure',
        'Instant provisioning',
        'Monthly release cadence',
        '30-day free trial available',
      ],
    },
    {
      icon:  'On-Prem',
      title: 'On-Premises',
      sub:   'VM or Kubernetes / OCP',
      accent: '0A3DB5',
      bullets: [
        'x86 VM or OpenShift deploy',
        'Air-gap & data sovereignty',
        'v3.0 on-prem GA release',
        'IBM Z & Power roadmap',
      ],
    },
    {
      icon:  'Hybrid',
      title: 'Hybrid — Your Choice',
      sub:   'Flexibility to mix models',
      accent: '0F4FC8',
      bullets: [
        'SaaS + on-prem co-exist',
        'Phased migration support',
        'Consistent UX across envs',
        'No rip-and-replace needed',
      ],
    },
  ];

  // CH=3.20  stack verified above: last_bot=cy+3.16 ≤ cy+3.20 ✓
  const CW=2.88, CH=3.20, CG=0.18, CX=0.55, CY=1.16;
  const BULL_H=0.42, BULL_GAP=0.06;

  models.forEach((m, i) => {
    const cx = CX + i*(CW+CG);
    // card bg + accent
    slide.addShape(pres.ShapeType.rect, { x:cx, y:CY, w:CW, h:CH, fill:{color:IBM_GRAY10}, line:{color:IBM_BORDER} });
    slide.addShape(pres.ShapeType.rect, { x:cx, y:CY, w:CW, h:0.07, fill:{color:m.accent}, line:{color:m.accent} });
    // icon label (large text)  y=CY+0.14  h=0.34
    slide.addText(m.icon, {
      x:cx+0.16, y:CY+0.14, w:CW-0.32, h:0.34,
      fontFace:FONT, fontSize:12, bold:true, color:m.accent, align:'left'
    });
    // title  y=CY+0.52  h=0.34
    slide.addText(m.title, {
      x:cx+0.16, y:CY+0.52, w:CW-0.32, h:0.34,
      fontFace:FONT, fontSize:12, bold:true, color:IBM_BLACK, align:'left'
    });
    // sub  y=CY+0.90  h=0.28
    slide.addText(m.sub, {
      x:cx+0.16, y:CY+0.90, w:CW-0.32, h:0.28,
      fontFace:FONT, fontSize:9, color:IBM_MUTED, align:'left', italic:true
    });
    // divider  y=CY+1.22
    slide.addShape(pres.ShapeType.rect, { x:cx+0.16, y:CY+1.22, w:CW-0.32, h:0.02, fill:{color:IBM_BORDER}, line:{color:IBM_BORDER} });
    // bullets start y=CY+1.30  4 bullets  last_bot=CY+1.30+3*0.48+0.42=CY+3.16 ✓
    m.bullets.forEach((b, bi) => {
      slide.addText('• ' + b, {
        x:cx+0.16, y:CY+1.30+bi*(BULL_H+BULL_GAP), w:CW-0.32, h:BULL_H,
        fontFace:FONT, fontSize:10, color:IBM_BLACK, lineSpacingMultiple:1.5
      });
    });
  });

  addFooter(slide, 7, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 8 — Get Started  (IBM Blue)
//
// 3 step cards (SKILL.md §4.6 canonical):
//   NW=2.88  NH=3.10  NG=0.18  NX=0.55  NSY=1.24
//   x: 0.55 | 3.61 | 6.67   rightEdge=9.55 ✓
//   bot=1.24+3.10=4.34 ≤ 5.17 ✓
//
// Card inner (RULE 2):
//   num   h=0.50  y=NSY+0.18  bot=NSY+0.68 ✓
//   title h=0.46  y=NSY+0.76  bot=NSY+1.22 ✓  [14pt bold 1ln]
//   div   h=0.02  y=NSY+1.30
//   body  h=1.02  y=NSY+1.40  bot=NSY+2.42 ✓  [10pt 4ln cpl≈35]
//   cta   h=0.36  y=NSY+2.50  bot=NSY+2.86 ≤ NSY+3.10 ✓
//
// Footer: addFooter(slide, 8, true) — NEVER manual text at y > 5.17
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  solidBg(slide, IBM_BLUE);
  slide.addText('Get Started with IBM Concert Platform', { x:0.55, y:0.22, w:9.00, h:0.56, fontFace:FONT, fontSize:28, bold:true, color:IBM_WHITE });
  slide.addText('Three ways to explore the architecture and begin your journey', { x:0.55, y:0.76, w:9.00, h:0.40, fontFace:FONT, fontSize:14, color:IBM_LIGHT });

  const steps = [
    {
      n: '01',
      t: 'Architecture Deep-Dive',
      b: 'Request a technical architecture workshop with IBM experts. Walk through every layer and integration pattern for your environment.',
      c: 'IBM Hong Kong Sales',
    },
    {
      n: '02',
      t: 'Start Your Free Trial',
      b: '30-day, fully provisioned SaaS experience. Explore the full platform with sample data or connect your own environment.',
      c: 'ibm.com/concert',
    },
    {
      n: '03',
      t: 'Proof of Concept',
      b: 'IBM team will design and run a targeted PoC on your hybrid environment — measuring real outcomes against your use cases.',
      c: 'Book an appointment',
    },
  ];

  const NW=2.88, NH=3.10, NG=0.18, NX=0.55, NSY=1.24;
  steps.forEach((s, i) => {
    const sx = NX + i*(NW+NG);
    slide.addShape(pres.ShapeType.rect, { x:sx, y:NSY, w:NW, h:NH, fill:{color:IBM_WHITE,transparency:90}, line:{color:IBM_LIGHT} });
    slide.addText(s.n, { x:sx+0.16, y:NSY+0.18, w:NW-0.32, h:0.50, fontFace:FONT, fontSize:26, bold:true, color:IBM_WHITE, align:'left' });
    slide.addText(s.t, { x:sx+0.16, y:NSY+0.76, w:NW-0.32, h:0.46, fontFace:FONT, fontSize:14, bold:true, color:IBM_WHITE, align:'left' });
    slide.addShape(pres.ShapeType.rect, { x:sx+0.16, y:NSY+1.30, w:NW-0.32, h:0.02, fill:{color:IBM_LIGHT}, line:{color:IBM_LIGHT} });
    slide.addText(s.b, { x:sx+0.16, y:NSY+1.40, w:NW-0.32, h:1.02, fontFace:FONT, fontSize:10, color:IBM_LIGHT, lineSpacingMultiple:1.5, align:'left' });
    slide.addText(s.c, { x:sx+0.16, y:NSY+2.50, w:NW-0.32, h:0.36, fontFace:FONT, fontSize:10, bold:true, color:IBM_WHITE, align:'left' });
  });

  // RULE 3: addFooter only — no manual text at y > 5.17
  addFooter(slide, 8, true);
}

// ── Write ──────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: 'outputs/ibm-concert-architecture.pptx' })
  .then(() => console.log('✅  outputs/ibm-concert-architecture.pptx written'))
  .catch(e  => { console.error('❌', e); process.exit(1); });
