/* ═══════════════════════════════════════════════════════
   Terry Sanford Softball — Scorebook PDF Export
   Generates a 2-page PDF: scorebook grid (landscape) +
   batting & pitching stats (landscape page 2).
   Requires jsPDF + jspdf-autotable loaded via CDN.
═══════════════════════════════════════════════════════ */

"use strict";

/* ── Demo game data, used only if the exporter is opened standalone ── */
const DEMO_GAME = {
  home: "Terry Sanford Softball",
  away: "River Dogs",
  date: "May 9, 2026",
  field: "Memorial Field",
  innings:     [0, 3, 0, 1, 0, 2, 1, 0, 0],
  awayInnings: [1, 0, 2, 0, 1, 0, 0, 0, 0],
  hits:        [1, 4, 1, 2, 0, 2, 1, 0, 0],
  awayHits:    [3, 0, 2, 1, 1, 0, 0, 0, 0],
  errors:      [0, 0, 0, 0, 0, 0, 0, 0, 0],
  awayErrors:  [0, 1, 0, 0, 0, 0, 1, 0, 0],

  lineup: [
    { num:1, name:"M. Cole",        pos:"CF", ab:4, h:2, r:2, rbi:0, bb:1, k:0, avg:".312" },
    { num:2, name:"D. Reyes",       pos:"SS", ab:5, h:1, r:1, rbi:2, bb:0, k:2, avg:".287" },
    { num:3, name:"J. Rivera",      pos:"1B", ab:4, h:3, r:1, rbi:3, bb:1, k:0, avg:".334" },
    { num:4, name:"T. Washington",  pos:"C",  ab:3, h:1, r:0, rbi:0, bb:0, k:1, avg:".298" },
    { num:5, name:"K. Peterson",    pos:"LF", ab:3, h:1, r:1, rbi:0, bb:0, k:1, avg:".271" },
    { num:6, name:"A. Santos",      pos:"3B", ab:3, h:1, r:2, rbi:2, bb:1, k:1, avg:".259" },
    { num:7, name:"R. Gomez",       pos:"RF", ab:4, h:2, r:1, rbi:1, bb:0, k:0, avg:".244" },
    { num:8, name:"L. Chen",        pos:"2B", ab:3, h:0, r:1, rbi:0, bb:1, k:1, avg:".231" },
    { num:9, name:"P. Moore",       pos:"P",  ab:2, h:0, r:0, rbi:0, bb:0, k:1, avg:".145" },
  ],

  pitching: [
    { name:"P. Moore", hand:"R", ip:"6.0", h:7, r:4, er:4, bb:2, k:8,  era:"3.24" },
    { name:"J. Davis", hand:"R", ip:"3.0", h:2, r:0, er:0, bb:1, k:4,  era:"1.87" },
  ],

  /* atBats[batter][inning 0-8]
     b: bases reached — 0=out, 1=single/walk, 2=double, 3=triple, 4=home run
     null = did not bat that inning                                         */
  atBats: [
    [{r:"K", b:0},  {r:"1B",b:1}, null,          {r:"1B",b:1}, null,         {r:"BB",b:1}, null,         {r:"F8",b:0}, null        ],
    [{r:"G6",b:0},  {r:"G4",b:0}, null,           null,         {r:"K", b:0}, null,         {r:"2B",b:2}, null,         {r:"K", b:0}],
    [{r:"BB",b:1},  {r:"2B",b:2}, null,           null,         {r:"1B",b:1}, null,         {r:"HR",b:4}, null,         {r:"G4",b:0}],
    [{r:"F8",b:0},  {r:"K", b:0}, {r:"1B",b:1},  null,         {r:"G5",b:0}, null,          null,        {r:"1B",b:1}, null        ],
    [null,          {r:"1B",b:1}, {r:"K", b:0},   null,         {r:"F7",b:0}, null,         {r:"K", b:0}, null,         null        ],
    [null,          {r:"HR",b:4}, {r:"K", b:0},  {r:"BB",b:1},  null,        {r:"G6",b:0},  null,         null,         null        ],
    [null,          {r:"1B",b:1}, {r:"G4",b:0},   null,          null,        {r:"2B",b:2},  null,        {r:"F9",b:0}, null        ],
    [null,          {r:"BB",b:1}, {r:"K", b:0},  {r:"1B",b:1},  null,        {r:"G6",b:0},  null,         null,         null        ],
    [null,          {r:"K", b:0}, {r:"G1",b:0},   null,          null,         null,          null,         null,         null        ],
  ],
};

function padScorebookArray(values, length, fallback = 0) {
  const arr = Array.isArray(values) ? values.slice(0, length) : [];
  while (arr.length < length) arr.push(fallback);
  return arr.map(v => Number(v) || 0);
}

function normalizeScorebookGame(data) {
  const src = data || DEMO_GAME;
  const inningCount = Math.max(
    9,
    Number(src.totalInnings) || 0,
    Array.isArray(src.innings) ? src.innings.length : 0,
    Array.isArray(src.awayInnings) ? src.awayInnings.length : 0
  );
  const lineup = Array.isArray(src.lineup) ? src.lineup : [];
  const atBats = lineup.map((_, i) => {
    const row = Array.isArray(src.atBats?.[i]) ? src.atBats[i].slice(0, inningCount) : [];
    while (row.length < inningCount) row.push(null);
    return row;
  });
  const homeHits = padScorebookArray(src.hits, inningCount);
  const awayHits = padScorebookArray(src.awayHits, inningCount);

  if (!Array.isArray(src.hits) || !Array.isArray(src.awayHits)) {
    atBats.forEach(row => {
      row.forEach((ab, idx) => {
        if (!ab || !['1B', '2B', '3B', 'HR'].includes(ab.r)) return;
        if (src.ourTeamRole === 'away') awayHits[idx]++;
        else homeHits[idx]++;
      });
    });
  }

  return {
    ...src,
    home: src.home || 'Home',
    away: src.away || 'Away',
    date: src.date || new Date().toLocaleDateString(),
    field: src.field || '',
    innings: padScorebookArray(src.innings, inningCount),
    awayInnings: padScorebookArray(src.awayInnings, inningCount),
    hits: homeHits,
    awayHits,
    errors: padScorebookArray(src.errors, inningCount),
    awayErrors: padScorebookArray(src.awayErrors, inningCount),
    lineup,
    pitching: Array.isArray(src.pitching) ? src.pitching : [],
    atBats,
    inningCount,
  };
}

/* ── Color palette (matches Terry Sanford Softball design tokens) ── */
const C = {
  ink:   [16,  24,  32],
  slate: [30,  41,  51],
  steel: [138, 146, 155],
  muted: [199, 204, 209],
  white: [247, 247, 244],
  amber: [213, 0, 70],
  green: [34,  197, 94],
  red:   [239, 68,  68],
  light: [248, 249, 250],
  line:  [220, 224, 228],
};

function fill(doc, color)  { doc.setFillColor(...color);  }
function draw(doc, color)  { doc.setDrawColor(...color);  }
function color(doc, color) { doc.setTextColor(...color);  }

/* ── Draw one at-bat cell with a baseball diamond ── */
function drawCell(doc, x, y, cw, ch, ab) {
  fill(doc, C.light);
  doc.rect(x, y, cw, ch, 'F');
  if (!ab) return;

  const cx = x + cw * 0.54;
  const cy = y + ch * 0.46;
  const r  = Math.min(cw, ch) * 0.21;

  // Diamond corner points (home=bottom, 1B=right, 2B=top, 3B=left)
  const home = [cx,     cy + r];
  const fst  = [cx + r, cy    ];
  const sec  = [cx,     cy - r];
  const thd  = [cx - r, cy    ];

  const isOut = ab.b === 0;

  // Gray outline diamond
  draw(doc, C.muted);
  doc.setLineWidth(0.5);
  doc.line(...home, ...fst);
  doc.line(...fst,  ...sec);
  doc.line(...sec,  ...thd);
  doc.line(...thd,  ...home);

  if (!isOut) {
    // Amber base-path lines for bases reached
    draw(doc, C.amber);
    doc.setLineWidth(2);
    if (ab.b >= 1) doc.line(...home, ...fst);
    if (ab.b >= 2) doc.line(...fst,  ...sec);
    if (ab.b >= 3) doc.line(...sec,  ...thd);
    if (ab.b >= 4) doc.line(...thd,  ...home);
    // Filled dot at home plate for HR
    if (ab.b === 4) {
      fill(doc, C.amber);
      doc.circle(home[0], home[1], 2.2, 'F');
    }
  } else {
    // Red X for outs
    const d = r * 0.38;
    draw(doc, C.red);
    doc.setLineWidth(1);
    doc.line(cx - d, cy - d, cx + d, cy + d);
    doc.line(cx + d, cy - d, cx - d, cy + d);
  }

  // Result label (bottom-left)
  doc.setFont('helvetica', isOut ? 'normal' : 'bold');
  doc.setFontSize(6.5);
  color(doc, isOut ? C.steel : C.ink);
  doc.text(ab.r, x + 3, y + ch - 3.5);
}

/* ── Main PDF generator ── */
function generateScorebookPDF(gameData) {
  if (!window.jspdf) { alert("PDF library not loaded."); return; }

  const GAME = normalizeScorebookGame(gameData);
  const { jsPDF } = window.jspdf;
  // Page 1: landscape 792 × 612 pt
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });

  const W = 792, H = 612, mg = 28;
  const homeTotal = GAME.innings.reduce((a, b) => a + b, 0);
  const awayTotal = GAME.awayInnings.reduce((a, b) => a + b, 0);

  /* ═══════════ PAGE 1 — SCOREBOOK GRID ═══════════ */

  // Header bar
  fill(doc, C.ink);
  doc.rect(0, 0, W, 56, 'F');
  fill(doc, C.amber);
  doc.rect(0, 56, W, 2.5, 'F');

  // Home team
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  color(doc, C.amber);
  doc.text(GAME.home.toUpperCase(), mg, 36);

  // Score
  doc.setFontSize(26);
  color(doc, C.white);
  doc.text(String(homeTotal), W / 2 - 26, 40, { align: 'right' });
  doc.setFontSize(14);
  color(doc, C.steel);
  doc.text('—', W / 2, 40, { align: 'center' });
  doc.setFontSize(26);
  color(doc, [200, 200, 200]);
  doc.text(String(awayTotal), W / 2 + 26, 40, { align: 'left' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  color(doc, C.amber);
  doc.text('FINAL', W / 2, 52, { align: 'center' });

  // Away team / meta (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  color(doc, [200, 200, 200]);
  doc.text('vs ' + GAME.away, W - mg, 26, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  color(doc, C.steel);
  doc.text(GAME.date + '  ·  ' + GAME.field, W - mg, 40, { align: 'right' });
  doc.text('Generated by Terry Sanford Softball', W - mg, 51, { align: 'right' });

  /* ── Box Score ── */
  const bsY     = 66;
  const bsRowH  = 19;
  const bsLblW  = 100;
  const bsRHEW  = 56;
  const bsInnW  = (W - mg * 2 - bsLblW - bsRHEW) / 9;

  // Inning number labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  color(doc, C.steel);
  for (let i = 0; i < 9; i++) {
    doc.text(String(i + 1), mg + bsLblW + i * bsInnW + bsInnW / 2, bsY + 12, { align: 'center' });
  }
  ['R', 'H', 'E'].forEach((lbl, i) => {
    doc.text(lbl, mg + bsLblW + 9 * bsInnW + 8 + i * (bsRHEW / 3), bsY + 12, { align: 'center' });
  });

  const drawBoxRow = (team, runs, hits, errs, ry, isHome) => {
    doc.setFont('helvetica', isHome ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    color(doc, isHome ? C.amber : C.steel);
    doc.text(team, mg, ry + 13);

    const totR = runs.reduce((a, b) => a + b, 0);
    const totH = hits.reduce((a, b) => a + b, 0);
    const totE = errs.reduce((a, b) => a + b, 0);

    for (let i = 0; i < 9; i++) {
      const bx = mg + bsLblW + i * bsInnW;
      fill(doc, i % 2 === 0 ? C.light : C.white);
      doc.rect(bx, ry, bsInnW, bsRowH, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      color(doc, runs[i] > 0 ? (isHome ? C.amber : C.red) : C.ink);
      doc.text(String(runs[i]), bx + bsInnW / 2, ry + 13, { align: 'center' });
    }

    const statsX = mg + bsLblW + 9 * bsInnW;
    [totR, totH, totE].forEach((v, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      color(doc, i === 0 && isHome ? C.amber : C.ink);
      doc.text(String(v), statsX + 8 + i * (bsRHEW / 3), ry + 13, { align: 'center' });
    });

    draw(doc, C.line);
    doc.setLineWidth(0.5);
    doc.line(mg, ry + bsRowH, W - mg, ry + bsRowH);
  };

  drawBoxRow(GAME.away, GAME.awayInnings, GAME.awayHits, GAME.awayErrors, bsY + bsRowH, false);
  drawBoxRow(GAME.home, GAME.innings,     GAME.hits,     GAME.errors,     bsY + bsRowH * 2, true);

  draw(doc, C.steel);
  doc.setLineWidth(0.8);
  doc.rect(mg, bsY + bsRowH - 1, W - mg * 2, bsRowH * 2 + 1);

  /* ── Scorebook Grid ── */
  const gridY    = bsY + bsRowH * 3 + 8;
  const gridH    = H - gridY - mg - 14;
  const nameColW = 118;
  const statsW   = 106;
  const innColW  = (W - mg * 2 - nameColW - statsW) / 9;
  const rowH     = gridH / 10; // header + 9 batter rows

  // Header row
  fill(doc, C.slate);
  doc.rect(mg, gridY, W - mg * 2, rowH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  color(doc, C.muted);
  doc.text('#  BATTER', mg + 6, gridY + rowH / 2 + 3);
  doc.text('POS', mg + nameColW - 22, gridY + rowH / 2 + 3);

  for (let i = 0; i < 9; i++) {
    const runs = GAME.innings[i];
    const ix   = mg + nameColW + i * innColW + innColW / 2;
    color(doc, runs > 0 ? C.amber : C.muted);
    doc.text(String(i + 1), ix, gridY + rowH / 2 - 1, { align: 'center' });
    if (runs > 0) {
      doc.setFontSize(6);
      doc.text('+' + runs, ix, gridY + rowH / 2 + 6, { align: 'center' });
      doc.setFontSize(7.5);
    }
  }

  const statX      = mg + nameColW + 9 * innColW;
  const statLabels = ['AB', 'H', 'R', 'RBI', 'BB', 'K'];
  const statColW   = statsW / statLabels.length;
  color(doc, C.muted);
  statLabels.forEach((lbl, i) => {
    doc.text(lbl, statX + i * statColW + statColW / 2, gridY + rowH / 2 + 3, { align: 'center' });
  });

  // Batter rows
  GAME.lineup.forEach((batter, bi) => {
    const ry = gridY + rowH * (bi + 1);

    fill(doc, bi % 2 === 0 ? C.light : C.white);
    doc.rect(mg, ry, W - mg * 2, rowH, 'F');

    // Batter number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    color(doc, C.amber);
    doc.text(String(batter.num), mg + 5, ry + rowH / 2 + 3);

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    color(doc, C.ink);
    doc.text(batter.name, mg + 17, ry + rowH / 2 + 3);

    // Position
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    color(doc, C.steel);
    doc.text(batter.pos, mg + nameColW - 20, ry + rowH / 2 + 3);

    // At-bat cells
    for (let i = 0; i < 9; i++) {
      drawCell(doc, mg + nameColW + i * innColW + 1, ry + 1, innColW - 2, rowH - 2, GAME.atBats[bi][i]);
    }

    // Stat totals
    const vals = [batter.ab, batter.h, batter.r, batter.rbi, batter.bb, batter.k];
    vals.forEach((v, i) => {
      const isH = i === 1 && v > 0;
      doc.setFont('helvetica', isH ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      color(doc, isH ? C.green : C.ink);
      doc.text(String(v), statX + i * statColW + statColW / 2, ry + rowH / 2 + 3, { align: 'center' });
    });
  });

  // Grid lines
  draw(doc, C.steel);
  doc.setLineWidth(0.8);
  doc.rect(mg, gridY, W - mg * 2, rowH * 10);

  draw(doc, C.line);
  doc.setLineWidth(0.4);
  doc.line(mg + nameColW, gridY, mg + nameColW, gridY + rowH * 10);
  for (let i = 1; i < 9; i++) {
    doc.line(mg + nameColW + i * innColW, gridY, mg + nameColW + i * innColW, gridY + rowH * 10);
  }
  doc.line(statX, gridY, statX, gridY + rowH * 10);
  for (let i = 1; i < statLabels.length; i++) {
    doc.line(statX + i * statColW, gridY, statX + i * statColW, gridY + rowH * 10);
  }
  for (let i = 1; i <= 10; i++) {
    doc.line(mg, gridY + i * rowH, W - mg, gridY + i * rowH);
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  color(doc, C.steel);
  doc.text('TERRY SANFORD SOFTBALL · DUGOUT COMMAND CENTER', mg, H - 9);
  doc.text('Exported ' + GAME.date + '  ·  Page 1 of 2', W - mg, H - 9, { align: 'right' });

  /* ═══════════ PAGE 2 — STATS ═══════════ */
  doc.addPage('letter', 'landscape');

  // Header bar
  fill(doc, C.ink);
  doc.rect(0, 0, W, 52, 'F');
  fill(doc, C.amber);
  doc.rect(0, 52, W, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  color(doc, C.amber);
  doc.text(GAME.home.toUpperCase(), mg, 32);
  doc.setFontSize(9);
  color(doc, C.steel);
  doc.text('GAME STATISTICS', mg, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  color(doc, [200, 200, 200]);
  doc.text(GAME.date + '  ·  vs ' + GAME.away + '  ·  Final: ' + homeTotal + '–' + awayTotal, W - mg, 42, { align: 'right' });

  const sectionLabel = (text, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    color(doc, C.amber);
    doc.text(text, mg, y);
    draw(doc, C.amber);
    doc.setLineWidth(0.8);
    doc.line(mg, y + 3, W - mg, y + 3);
  };

  /* Batting stats */
  sectionLabel('BATTING', 70);

  const totals = GAME.lineup.reduce(
    (acc, p) => ({ ab: acc.ab+p.ab, h: acc.h+p.h, r: acc.r+p.r, rbi: acc.rbi+p.rbi, bb: acc.bb+p.bb, k: acc.k+p.k }),
    { ab:0, h:0, r:0, rbi:0, bb:0, k:0 }
  );

  doc.autoTable({
    startY: 78,
    margin: { left: mg, right: mg },
    tableWidth: W - mg * 2,
    head: [['#', 'Batter', 'Pos', 'AB', 'H', 'R', 'RBI', 'BB', 'K', 'AVG']],
    body: GAME.lineup.map(p => [p.num, p.name, p.pos, p.ab, p.h, p.r, p.rbi, p.bb, p.k, p.avg]),
    foot: [['', 'TOTALS', '', totals.ab, totals.h, totals.r, totals.rbi, totals.bb, totals.k, '—']],
    styles: { fontSize: 9, cellPadding: { top:5, bottom:5, left:5, right:5 }, font:'helvetica', textColor:C.ink, lineColor:C.line, lineWidth:0.5 },
    headStyles: { fillColor:C.slate, textColor:C.muted, fontStyle:'bold', fontSize:8 },
    footStyles: { fillColor:C.light, textColor:C.ink, fontStyle:'bold' },
    alternateRowStyles: { fillColor:C.light },
    columnStyles: {
      0: { cellWidth:22,  halign:'center', textColor:C.amber, fontStyle:'bold' },
      1: { cellWidth:110, fontStyle:'bold' },
      2: { cellWidth:28,  halign:'center', textColor:C.steel },
      3: { cellWidth:32,  halign:'center' },
      4: { cellWidth:32,  halign:'center' },
      5: { cellWidth:32,  halign:'center' },
      6: { cellWidth:36,  halign:'center' },
      7: { cellWidth:32,  halign:'center' },
      8: { cellWidth:32,  halign:'center' },
      9: { cellWidth:52,  halign:'right',  fontStyle:'bold' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      if (data.column.index === 4 && Number(data.cell.raw) > 0) {
        data.cell.styles.textColor = C.green;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 8 && Number(data.cell.raw) >= 2) {
        data.cell.styles.textColor = C.red;
      }
      if (data.column.index === 9) {
        if (parseFloat(data.cell.raw) >= 0.300) data.cell.styles.textColor = C.green;
      }
    },
  });

  /* Pitching stats */
  const pitchY = doc.lastAutoTable.finalY + 22;
  sectionLabel('PITCHING', pitchY);

  doc.autoTable({
    startY: pitchY + 8,
    margin: { left: mg, right: mg },
    tableWidth: W - mg * 2,
    head: [['Pitcher', '', 'IP', 'H', 'R', 'ER', 'BB', 'K', 'ERA']],
    body: GAME.pitching.map(p => [p.name, p.hand, p.ip, p.h, p.r, p.er, p.bb, p.k, p.era]),
    styles: { fontSize: 9, cellPadding: { top:5, bottom:5, left:5, right:5 }, font:'helvetica', textColor:C.ink, lineColor:C.line, lineWidth:0.5 },
    headStyles: { fillColor:C.slate, textColor:C.muted, fontStyle:'bold', fontSize:8 },
    alternateRowStyles: { fillColor:C.light },
    columnStyles: {
      0: { cellWidth:110, fontStyle:'bold' },
      1: { cellWidth:22,  halign:'center', textColor:C.steel },
      2: { cellWidth:44,  halign:'center' },
      3: { cellWidth:32,  halign:'center' },
      4: { cellWidth:32,  halign:'center' },
      5: { cellWidth:32,  halign:'center' },
      6: { cellWidth:32,  halign:'center' },
      7: { cellWidth:32,  halign:'center', textColor:C.green, fontStyle:'bold' },
      8: { cellWidth:52,  halign:'right',  fontStyle:'bold' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 8) return;
      const era = parseFloat(data.cell.raw);
      if (era < 2.5)      data.cell.styles.textColor = C.green;
      else if (era > 4.5) data.cell.styles.textColor = C.red;
    },
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  color(doc, C.steel);
  doc.text('TERRY SANFORD SOFTBALL · DUGOUT COMMAND CENTER', mg, H - 9);
  doc.text('Exported ' + GAME.date + '  ·  Page 2 of 2', W - mg, H - 9, { align: 'right' });

  doc.save('Terry_Sanford_Softball_Scorebook_' + String(GAME.date).replace(/\s/g, '_') + '.pdf');
}

/* ── Button wiring ── */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('downloadScorebookBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'Generating…';
    setTimeout(() => {
      try {
        generateScorebookPDF();
      } finally {
        btn.disabled = false;
        btn.textContent = 'Download Scorebook';
      }
    }, 60);
  });
});
