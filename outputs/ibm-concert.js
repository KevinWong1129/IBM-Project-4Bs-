'use strict';
const pptxgen = require('pptxgenjs');

// ── IBM Brand Constants ──────────────────────────────────────────────────────
const IBM_BLUE   = '1261FD';
const IBM_WHITE  = 'FFFFFF';
const IBM_GRAY10 = 'F1F4F7';
const IBM_BORDER = 'C1C7CD';
const IBM_BLACK  = '000000';
const IBM_MUTED  = '565656';
const IBM_LIGHT  = 'D0E4FF';
const FONT       = 'IBM Plex Sans';
const DECK_TITLE = 'IBM Concert Platform';
const SAFE_BOTTOM = 5.17;

// ── Helpers ──────────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title  = DECK_TITLE;

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

function blueBg(slide) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
  });
}

function whiteBg(slide) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
}

function grayBg(slide) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: IBM_GRAY10 }, line: { color: IBM_GRAY10 }
  });
}

// Left accent stripe
function accentStripe(slide, color) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: color || IBM_LIGHT }, line: { color: color || IBM_LIGHT }
  });
}

// ── Slide 1: Cover ────────────────────────────────────────────────────────────
(function slide1() {
  const s = pres.addSlide();
  blueBg(s);
  // Left accent stripe in white
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  // IBM logo area (text placeholder)
  s.addText('IBM', {
    x: 0.38, y: 0.38, w: 1.6, h: 0.44,
    fontFace: FONT, fontSize: 28, bold: true, color: IBM_WHITE,
    valign: 'top', align: 'left', margin: 0
  });
  // Headline
  s.addText('IBM Concert\nPlatform', {
    x: 0.38, y: 1.10, w: 8.5, h: 1.60,
    fontFace: FONT, fontSize: 44, bold: true, color: IBM_WHITE,
    valign: 'top', align: 'left', margin: 0, lineSpacingMultiple: 1.1
  });
  // Tagline
  s.addText('Agentic IT Operations — Unified, Intelligent, Automated', {
    x: 0.38, y: 2.90, w: 8.5, h: 0.42,
    fontFace: FONT, fontSize: 16, bold: false, color: IBM_LIGHT,
    valign: 'top', align: 'left', margin: 0
  });
  // Divider rule
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 3.44, w: 3.20, h: 0.022,
    fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
  });
  // Audience / event line
  s.addText('Client Presentation  |  2026', {
    x: 0.38, y: 3.54, w: 6, h: 0.32,
    fontFace: FONT, fontSize: 12, color: IBM_LIGHT,
    valign: 'top', align: 'left', margin: 0
  });
  // Confidentiality line
  s.addText('Confidential  |  IBM Hong Kong  |  2026', {
    x: 0.38, y: 4.90, w: 6, h: 0.26,
    fontFace: FONT, fontSize: 10, color: IBM_LIGHT,
    valign: 'top', align: 'left', margin: 0
  });
})();

// ── Slide 2: Agenda ───────────────────────────────────────────────────────────
(function slide2() {
  const s = pres.addSlide();
  whiteBg(s);
  accentStripe(s, IBM_BLUE);
  s.addText('Agenda', {
    x: 0.38, y: 0.28, w: 9, h: 0.50,
    fontFace: FONT, fontSize: 24, bold: true, color: IBM_BLACK,
    valign: 'top', align: 'left', margin: 0
  });
  // Divider under title
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 0.84, w: 9.24, h: 0.022,
    fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
  });

  const items = [
    { num: '01', title: 'The IT Ops Challenge', sub: 'Fragmented visibility, alert fatigue & risk gaps' },
    { num: '02', title: 'IBM Concert Platform', sub: 'Agentic IT Ops across hybrid environments' },
    { num: '03', title: 'Key Capabilities', sub: 'Observe · Optimize · Protect · Resilience' },
    { num: '04', title: 'Business Outcomes', sub: 'Faster resolution, lower risk, real ROI' },
    { num: '05', title: 'Why IBM?', sub: 'AI-driven, open, and enterprise-proven' },
    { num: '06', title: 'Next Steps', sub: 'Trial, demo, and contact information' },
  ];

  // 3-col × 2-row grid  cardW=2.88 cardH=1.72 gapX=0.18 startX=0.38 startY=1.00
  const cardW = 2.88, cardH = 1.72, gapX = 0.18, startX = 0.38, startY = 1.00;
  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx  = startX + col * (cardW + gapX);
    const cy  = startY + row * (cardH + 0.18);

    // card bg
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: IBM_GRAY10 }, line: { color: IBM_BORDER }
    });
    // number
    s.addText(item.num, {
      x: cx + 0.18, y: cy + 0.16, w: 0.70, h: 0.42,
      fontFace: FONT, fontSize: 20, bold: true, color: IBM_BLUE,
      valign: 'top', align: 'left', margin: 0
    });
    // title
    s.addText(item.title, {
      x: cx + 0.18, y: cy + 0.62, w: cardW - 0.36, h: 0.38,
      fontFace: FONT, fontSize: 13, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // subtitle
    s.addText(item.sub, {
      x: cx + 0.18, y: cy + 1.04, w: cardW - 0.36, h: 0.56,
      fontFace: FONT, fontSize: 10, bold: false, color: IBM_MUTED,
      valign: 'top', align: 'left', margin: 0
    });
  });

  addFooter(s, 2, false);
})();

// ── Slide 3: The Challenge ────────────────────────────────────────────────────
(function slide3() {
  const s = pres.addSlide();
  whiteBg(s);
  accentStripe(s, IBM_BLUE);
  s.addText('The IT Operations Challenge', {
    x: 0.38, y: 0.28, w: 9, h: 0.50,
    fontFace: FONT, fontSize: 24, bold: true, color: IBM_BLACK,
    valign: 'top', align: 'left', margin: 0
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 0.84, w: 9.24, h: 0.022,
    fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
  });

  // Left: stat callouts  statW=2.20 statH=1.50
  const stats = [
    { num: '70%', label: 'of IT incidents caused by undetected vulnerabilities' },
    { num: '3×', label: 'more tools than needed — alert fatigue is critical' },
    { num: '60%', label: 'of compliance failures stem from certificate & CVE blind spots' },
  ];
  stats.forEach((st, i) => {
    const sx = 0.38;
    const sy = 1.00 + i * 1.34;
    s.addShape(pres.ShapeType.rect, {
      x: sx, y: sy, w: 2.60, h: 1.20,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    s.addText(st.num, {
      x: sx + 0.14, y: sy + 0.12, w: 2.32, h: 0.72,
      fontFace: FONT, fontSize: 34, bold: true, color: IBM_WHITE,
      valign: 'top', align: 'left', margin: 0
    });
    s.addText(st.label, {
      x: sx + 0.14, y: sy + 0.78, w: 2.32, h: 0.36,
      fontFace: FONT, fontSize: 9, color: IBM_LIGHT,
      valign: 'top', align: 'left', margin: 0
    });
  });

  // Right: pain points
  const pains = [
    'Fragmented tools create blind spots across hybrid environments',
    'No unified view of application risk and operational health',
    'CVEs, certificates & compliance managed in silos',
    'Alert overload slows incident response time',
    'Manual remediation increases error rates & cost',
    'AI workload complexity demands new optimization models',
    'Audit readiness is reactive, not continuous',
    'Too little context — can\'t prioritize what matters most',
  ];
  s.addText('Common Pain Points', {
    x: 3.26, y: 1.00, w: 6.36, h: 0.32,
    fontFace: FONT, fontSize: 13, bold: true, color: IBM_BLACK,
    valign: 'top', align: 'left', margin: 0
  });
  pains.forEach((pain, i) => {
    const row = i % 4;
    const col = Math.floor(i / 4);
    const px  = 3.26 + col * 3.10;
    const py  = 1.40 + row * 0.62;
    // bullet marker
    s.addShape(pres.ShapeType.rect, {
      x: px, y: py + 0.10, w: 0.08, h: 0.08,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    s.addText(pain, {
      x: px + 0.16, y: py, w: 2.80, h: 0.52,
      fontFace: FONT, fontSize: 10, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
  });

  addFooter(s, 3, false);
})();

// ── Slide 4: Platform Intro (3-pillar) ────────────────────────────────────────
(function slide4() {
  const s = pres.addSlide();
  blueBg(s);
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  s.addText('IBM Concert Platform', {
    x: 0.38, y: 0.26, w: 9, h: 0.46,
    fontFace: FONT, fontSize: 24, bold: true, color: IBM_WHITE,
    valign: 'top', align: 'left', margin: 0
  });
  s.addText('An agentic IT operations platform that creates a unified operational layer across hybrid environments', {
    x: 0.38, y: 0.78, w: 9.24, h: 0.36,
    fontFace: FONT, fontSize: 12, color: IBM_LIGHT,
    valign: 'top', align: 'left', margin: 0
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 1.20, w: 9.24, h: 0.022,
    fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
  });

  // 3 pillars  cardW=2.88 cardH=3.64 gapX=0.18 startX=0.55
  const pillars = [
    {
      label: 'UNDERSTAND',
      title: 'Unified\nApplication\nContext',
      bullets: [
        'Ingest data from repos, images & environments',
        'Build topology & dependency maps',
        'Prioritize risk across all dimensions',
        'AI-driven insights via watsonx',
      ],
    },
    {
      label: 'DECIDE',
      title: 'Intelligent\nRisk\nPrioritization',
      bullets: [
        'CVE blast-radius analysis across topology',
        'Compliance & certificate posture scoring',
        'Role-aligned dashboards for all personas',
        'Context-aware remediation recommendations',
      ],
    },
    {
      label: 'ACT',
      title: 'Automated\nRemediation\n& Workflows',
      bullets: [
        'Ticket creation from dimension findings',
        'Concert Workflows for task automation',
        'ROI tracking via Manual Execution Time',
        'Transparent, auditable AI-driven actions',
      ],
    },
  ];

  const cardW = 2.88, cardH = 3.64, gapX = 0.18, startX = 0.55, startY = 1.34;
  pillars.forEach((p, i) => {
    const cx = startX + i * (cardW + gapX);
    // card bg
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: startY, w: cardW, h: cardH,
      fill: { color: '1A4FBE' }, line: { color: IBM_LIGHT }
    });
    // label
    s.addText(p.label, {
      x: cx + 0.18, y: startY + 0.14, w: cardW - 0.36, h: 0.28,
      fontFace: FONT, fontSize: 9, bold: true, color: IBM_LIGHT,
      valign: 'top', align: 'left', margin: 0
    });
    // title
    s.addText(p.title, {
      x: cx + 0.18, y: startY + 0.48, w: cardW - 0.36, h: 0.74,
      fontFace: FONT, fontSize: 16, bold: true, color: IBM_WHITE,
      valign: 'top', align: 'left', margin: 0, lineSpacingMultiple: 1.2
    });
    // divider
    s.addShape(pres.ShapeType.rect, {
      x: cx + 0.18, y: startY + 1.36, w: cardW - 0.36, h: 0.022,
      fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
    });
    // bullets  4 items  itemH=0.52 itemGap=0.04
    p.bullets.forEach((b, j) => {
      const by = startY + 1.50 + j * (0.52 + 0.04);
      s.addShape(pres.ShapeType.rect, {
        x: cx + 0.18, y: by + 0.10, w: 0.08, h: 0.08,
        fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
      });
      s.addText(b, {
        x: cx + 0.32, y: by, w: cardW - 0.50, h: 0.52,
        fontFace: FONT, fontSize: 10, color: IBM_LIGHT,
        valign: 'top', align: 'left', margin: 0
      });
    });
  });

  addFooter(s, 4, true);
})();

// ── Slide 5: Capabilities ─────────────────────────────────────────────────────
(function slide5() {
  const s = pres.addSlide();
  whiteBg(s);
  accentStripe(s, IBM_BLUE);
  s.addText('Concert Platform Capabilities', {
    x: 0.38, y: 0.28, w: 9, h: 0.46,
    fontFace: FONT, fontSize: 24, bold: true, color: IBM_BLACK,
    valign: 'top', align: 'left', margin: 0
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 0.80, w: 9.24, h: 0.022,
    fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
  });

  // Row 1: 3 cards  startY=0.96  cardW=2.88 cardH=2.12
  const R1_startY = 0.96;
  const CRDH_R1   = 2.12;
  const cardW     = 2.88;
  const gapX      = 0.18;
  const startX    = 0.38;

  const row1 = [
    { name: 'Observe', powered: 'Powered by Instana', desc: 'Full-stack observability across applications, infrastructure, and AI workloads. Connects telemetry into shared context for faster detection and improved reliability.' },
    { name: 'Optimize', powered: 'Powered by Turbonomic', desc: 'Resource optimization that aligns infrastructure to application demand. Manages performance and cost across hybrid cloud, including GPU optimization for AI workloads.' },
    { name: 'Protect', powered: 'Powered by Concert', desc: 'Continuously identifies operational exposures across code, runtime, and dependencies. Prioritizes vulnerabilities by business impact and automates remediation.' },
  ];

  row1.forEach((cap, i) => {
    const cx = startX + i * (cardW + gapX);
    const cy = R1_startY;
    // top accent
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cardW, h: 0.07,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    // card bg
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: cy + 0.07, w: cardW, h: CRDH_R1 - 0.07,
      fill: { color: IBM_GRAY10 }, line: { color: IBM_BORDER }
    });
    // name
    s.addText(cap.name, {
      x: cx + 0.18, y: cy + 0.14, w: cardW - 0.36, h: 0.38,
      fontFace: FONT, fontSize: 15, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    // powered-by
    s.addText(cap.powered, {
      x: cx + 0.18, y: cy + 0.54, w: cardW - 0.36, h: 0.28,
      fontFace: FONT, fontSize: 9.5, color: IBM_MUTED,
      valign: 'top', align: 'left', margin: 0
    });
    // divider
    s.addShape(pres.ShapeType.rect, {
      x: cx + 0.18, y: cy + 0.84, w: cardW - 0.36, h: 0.022,
      fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
    });
    // desc
    s.addText(cap.desc, {
      x: cx + 0.18, y: cy + 0.90, w: cardW - 0.36, h: 1.05,
      fontFace: FONT, fontSize: 10, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
  });

  // Row 2: 2 cards  cardW=4.44
  const R1_bottom  = R1_startY + CRDH_R1;   // = 3.08
  const R2_startY  = R1_bottom + 0.18;       // = 3.26
  const CRDH_R2    = SAFE_BOTTOM - R2_startY; // = 5.17 - 3.26 = 1.91
  const cardW_R2   = 4.44;

  const row2 = [
    { name: 'Resilience', powered: 'Concert Resilience', desc: 'Unifies telemetry across domains to show resilience posture and provide guided remediation, reducing downtime and accelerating recovery.' },
    { name: 'Concert Workflows', powered: 'Automation Engine', desc: 'Automates repetitive IT tasks and integrates with existing tools. ROI tracking via Manual Execution Time (MET) shows time saved per workflow run.' },
  ];

  row2.forEach((cap, i) => {
    const cx = startX + i * (cardW_R2 + gapX);
    const cy = R2_startY;
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: cy, w: cardW_R2, h: 0.07,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: cy + 0.07, w: cardW_R2, h: CRDH_R2 - 0.07,
      fill: { color: IBM_GRAY10 }, line: { color: IBM_BORDER }
    });
    s.addText(cap.name, {
      x: cx + 0.18, y: cy + 0.14, w: cardW_R2 - 0.36, h: 0.38,
      fontFace: FONT, fontSize: 15, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    s.addText(cap.powered, {
      x: cx + 0.18, y: cy + 0.54, w: cardW_R2 - 0.36, h: 0.28,
      fontFace: FONT, fontSize: 9.5, color: IBM_MUTED,
      valign: 'top', align: 'left', margin: 0
    });
    s.addShape(pres.ShapeType.rect, {
      x: cx + 0.18, y: cy + 0.84, w: cardW_R2 - 0.36, h: 0.022,
      fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
    });
    // desc height = CRDH_R2 - 0.90 - 0.12 = 1.91 - 0.90 - 0.12 = 0.89
    const descH = CRDH_R2 - 0.90 - 0.12;
    s.addText(cap.desc, {
      x: cx + 0.18, y: cy + 0.90, w: cardW_R2 - 0.36, h: descH,
      fontFace: FONT, fontSize: 10, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
  });

  addFooter(s, 5, false);
})();

// ── Slide 6: Outcomes / ROI ───────────────────────────────────────────────────
(function slide6() {
  const s = pres.addSlide();
  grayBg(s);
  accentStripe(s, IBM_BLUE);
  s.addText('Business Outcomes & ROI', {
    x: 0.38, y: 0.28, w: 9, h: 0.46,
    fontFace: FONT, fontSize: 24, bold: true, color: IBM_BLACK,
    valign: 'top', align: 'left', margin: 0
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 0.80, w: 9.24, h: 0.022,
    fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
  });

  // Stat callouts row  statW=2.20 statH=1.50 gap=0.18 startY=1.00
  const stats = [
    { num: 'Faster', label: 'Mean time to resolution via correlated signal analysis' },
    { num: 'ROI', label: 'Tracked per workflow via Manual Execution Time (MET) dashboard' },
    { num: 'Unified', label: 'Single pane of glass across observability, risk & resilience' },
    { num: 'Agentic', label: 'AI-driven analysis, decision, and execution with auditability' },
  ];
  const statW = 2.10, statH = 1.50, statGap = 0.18, statStartX = 0.38, statStartY = 1.00;
  stats.forEach((st, i) => {
    const sx = statStartX + i * (statW + statGap);
    s.addShape(pres.ShapeType.rect, {
      x: sx, y: statStartY, w: statW, h: statH,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    s.addText(st.num, {
      x: sx + 0.14, y: statStartY + 0.12, w: statW - 0.28, h: 0.72,
      fontFace: FONT, fontSize: 28, bold: true, color: IBM_WHITE,
      valign: 'middle', align: 'left', margin: 0
    });
    s.addText(st.label, {
      x: sx + 0.14, y: statStartY + 0.84, w: statW - 0.28, h: 0.60,
      fontFace: FONT, fontSize: 9, color: IBM_LIGHT,
      valign: 'top', align: 'left', margin: 0
    });
  });

  // 3 outcome columns startY=2.68
  const outcomes = [
    {
      title: 'Detect & Resolve',
      points: [
        'Correlates logs, metrics, events & alerts',
        'Explains root cause via Concert Assistant',
        'Reduces mean time to resolution',
        'Observe provides full-stack visibility',
      ],
    },
    {
      title: 'Optimize & Save',
      points: [
        'Aligns infrastructure to application demand',
        'Manages hybrid-cloud performance & cost',
        'GPU allocation optimized for AI workloads',
        'Automation saves measurable team hours',
      ],
    },
    {
      title: 'Protect & Comply',
      points: [
        'Prioritizes CVEs by blast-radius & impact',
        'Remediates certificates before expiry',
        'Continuous compliance posture monitoring',
        'Audit-ready reporting at all times',
      ],
    },
  ];
  const colW = 2.88, colH = 2.38, colGap = 0.18, colStartX = 0.38, colStartY = 2.68;
  outcomes.forEach((col, i) => {
    const cx = colStartX + i * (colW + colGap);
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: colStartY, w: colW, h: colH,
      fill: { color: IBM_WHITE }, line: { color: IBM_BORDER }
    });
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: colStartY, w: colW, h: 0.07,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    s.addText(col.title, {
      x: cx + 0.14, y: colStartY + 0.12, w: colW - 0.28, h: 0.36,
      fontFace: FONT, fontSize: 13, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    col.points.forEach((pt, j) => {
      const py = colStartY + 0.58 + j * 0.42;
      s.addShape(pres.ShapeType.rect, {
        x: cx + 0.14, y: py + 0.08, w: 0.08, h: 0.08,
        fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
      });
      s.addText(pt, {
        x: cx + 0.28, y: py, w: colW - 0.44, h: 0.38,
        fontFace: FONT, fontSize: 10, color: IBM_BLACK,
        valign: 'top', align: 'left', margin: 0
      });
    });
  });

  addFooter(s, 6, false);
})();

// ── Slide 7: Why IBM? ─────────────────────────────────────────────────────────
(function slide7() {
  const s = pres.addSlide();
  whiteBg(s);
  accentStripe(s, IBM_BLUE);
  s.addText('Why IBM Concert?', {
    x: 0.38, y: 0.28, w: 9, h: 0.46,
    fontFace: FONT, fontSize: 24, bold: true, color: IBM_BLACK,
    valign: 'top', align: 'left', margin: 0
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 0.80, w: 9.24, h: 0.022,
    fill: { color: IBM_BORDER }, line: { color: IBM_BORDER }
  });

  // Left: differentiators list
  const diffs = [
    { title: 'Agentic IT Ops', body: 'AI-driven assistants automate analysis, decisions, and execution — with full transparency and auditability across your teams.' },
    { title: 'Unified Operational Layer', body: 'One platform connects observability (Instana), optimization (Turbonomic), vulnerability management, and resilience workflows.' },
    { title: 'Hybrid & Cloud-Native', body: 'Supports on-premises (x86 VMs, Kubernetes, OpenShift) and SaaS. Integrates with ServiceNow, GitHub, Jira, and more.' },
    { title: 'Persona-Driven UX', body: 'Tailored experiences for developers, security teams, operations, and executives — all on the same underlying data model.' },
  ];
  diffs.forEach((d, i) => {
    const dy = 1.00 + i * 1.02;
    s.addShape(pres.ShapeType.rect, {
      x: 0.38, y: dy, w: 0.07, h: 0.60,
      fill: { color: IBM_BLUE }, line: { color: IBM_BLUE }
    });
    s.addText(d.title, {
      x: 0.56, y: dy, w: 4.40, h: 0.30,
      fontFace: FONT, fontSize: 13, bold: true, color: IBM_BLACK,
      valign: 'top', align: 'left', margin: 0
    });
    s.addText(d.body, {
      x: 0.56, y: dy + 0.32, w: 4.40, h: 0.62,
      fontFace: FONT, fontSize: 10, color: IBM_MUTED,
      valign: 'top', align: 'left', margin: 0
    });
  });

  // Right: comparison table  startX=5.20
  const tableX   = 5.20;
  const tableY   = 1.00;
  const colWidths = [2.40, 1.05, 1.05];
  const rows = [
    ['Capability',             'Concert', 'Others'],
    ['Unified AIOps platform', '✓',       '~'],
    ['Agentic AI automation',  '✓',       '✗'],
    ['CVE blast-radius view',  '✓',       '~'],
    ['Workflow ROI tracking',  '✓',       '✗'],
    ['GPU workload optimize',  '✓',       '✗'],
    ['Open hybrid support',    '✓',       '~'],
  ];
  const rowH = 0.44;
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const rx = tableX + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
      const ry = tableY + ri * rowH;
      const isHeader = ri === 0;
      const bgColor  = isHeader ? IBM_BLUE : (ri % 2 === 0 ? IBM_GRAY10 : IBM_WHITE);
      const txtColor = isHeader ? IBM_WHITE : IBM_BLACK;
      s.addShape(pres.ShapeType.rect, {
        x: rx, y: ry, w: colWidths[ci], h: rowH,
        fill: { color: bgColor }, line: { color: IBM_BORDER }
      });
      s.addText(cell, {
        x: rx + 0.08, y: ry + 0.04, w: colWidths[ci] - 0.16, h: rowH - 0.08,
        fontFace: FONT, fontSize: 9, bold: isHeader, color: txtColor,
        valign: 'middle', align: ci === 0 ? 'left' : 'center', margin: 0
      });
    });
  });

  addFooter(s, 7, false);
})();

// ── Slide 8: Next Steps ────────────────────────────────────────────────────────
(function slide8() {
  const s = pres.addSlide();
  blueBg(s);
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: IBM_WHITE }, line: { color: IBM_WHITE }
  });
  s.addText('Next Steps', {
    x: 0.38, y: 0.26, w: 9, h: 0.46,
    fontFace: FONT, fontSize: 24, bold: true, color: IBM_WHITE,
    valign: 'top', align: 'left', margin: 0
  });
  s.addText('Let us help you get started with IBM Concert Platform', {
    x: 0.38, y: 0.78, w: 9.24, h: 0.36,
    fontFace: FONT, fontSize: 12, color: IBM_LIGHT,
    valign: 'top', align: 'left', margin: 0
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0.38, y: 1.20, w: 9.24, h: 0.022,
    fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
  });

  // 3 next-step cards  cardW=2.88 cardH=2.80 gapX=0.18 startX=0.55
  const steps = [
    { num: '01', title: 'Schedule a Live Demo', body: 'Experience the Concert Platform Arena view, risk prioritization, and agentic workflows in a guided 30-minute session with an IBM specialist.' },
    { num: '02', title: 'Start a Proof of Concept', body: 'Deploy Concert on your hybrid environment with IBM support. Ingest your application data and see real CVE and compliance insights within days.' },
    { num: '03', title: 'Contact IBM Hong Kong', body: 'Reach your IBM account team to discuss licensing, deployment options, and integration with your existing toolchain and cloud strategy.' },
  ];

  const cardW = 2.88, cardH = 2.80, gapX = 0.18, startX = 0.55, startY = 1.40;
  steps.forEach((st, i) => {
    const cx = startX + i * (cardW + gapX);
    // card bg
    s.addShape(pres.ShapeType.rect, {
      x: cx, y: startY, w: cardW, h: cardH,
      fill: { color: '1A4FBE' }, line: { color: IBM_LIGHT }
    });
    // number
    s.addText(st.num, {
      x: cx + 0.18, y: startY + 0.16, w: 0.70, h: 0.50,
      fontFace: FONT, fontSize: 24, bold: true, color: IBM_LIGHT,
      valign: 'top', align: 'left', margin: 0
    });
    // title
    s.addText(st.title, {
      x: cx + 0.18, y: startY + 0.74, w: cardW - 0.36, h: 0.50,
      fontFace: FONT, fontSize: 14, bold: true, color: IBM_WHITE,
      valign: 'top', align: 'left', margin: 0
    });
    // divider
    s.addShape(pres.ShapeType.rect, {
      x: cx + 0.18, y: startY + 1.30, w: cardW - 0.36, h: 0.022,
      fill: { color: IBM_LIGHT }, line: { color: IBM_LIGHT }
    });
    // body
    s.addText(st.body, {
      x: cx + 0.18, y: startY + 1.40, w: cardW - 0.36, h: 1.22,
      fontFace: FONT, fontSize: 10, color: IBM_LIGHT,
      valign: 'top', align: 'left', margin: 0
    });
  });

  addFooter(s, 8, true);
})();

// ── Write file ────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: 'outputs/ibm-concert.pptx' })
  .then(() => console.log('✅ outputs/ibm-concert.pptx written'))
  .catch(err => { console.error('ERROR:', err); process.exit(1); });
