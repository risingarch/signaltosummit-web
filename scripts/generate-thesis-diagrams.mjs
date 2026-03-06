import { JSDOM } from 'jsdom';
import rough from 'roughjs';
import { writeFileSync } from 'fs';

const NAVY = '#0C1A2A';
const BLUE = '#1E90FF';
const BLUE_LIGHT = 'rgba(30, 144, 255, 0.08)';
const WHITE = '#FFFFFF';
const OUT = '/Users/KIT/signaltosummit-web/public/images/thesis';

function createSVG(width, height) {
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const doc = dom.window.document;
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  doc.body.appendChild(svg);
  return { dom, doc, svg };
}

function addText(svg, doc, x, y, text, opts = {}) {
  const {
    fontSize = 16,
    fontWeight = '700',
    fill = NAVY,
    anchor = 'middle',
    fontFamily = "'Inter', system-ui, sans-serif",
  } = opts;
  const el = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  el.setAttribute('text-anchor', anchor);
  el.setAttribute('font-family', fontFamily);
  el.setAttribute('font-size', fontSize);
  el.setAttribute('font-weight', fontWeight);
  el.setAttribute('fill', fill);
  el.textContent = text;
  svg.appendChild(el);
  return el;
}

function addMultilineText(svg, doc, x, y, lines, opts = {}) {
  const { lineHeight = 20, ...textOpts } = opts;
  lines.forEach((line, i) => {
    addText(svg, doc, x, y + i * lineHeight, line, textOpts);
  });
}

// ═══════════════════════════════════════════════
// DIAGRAM 1: Three Misreads — Triangle Layout
// ═══════════════════════════════════════════════
function diagram1() {
  const W = 720, H = 480;
  const { dom, doc, svg } = createSVG(W, H);
  const rc = rough.svg(svg);

  // Triangle positions (top, bottom-left, bottom-right)
  const boxes = [
    { x: 260, y: 20, w: 200, h: 110, title: 'Scale Failure', sub: ['Delivery becomes a manual', 'service business'] },
    { x: 30, y: 290, w: 230, h: 110, title: 'Coalition Dynamics', sub: ['Deals die from internal', 'misalignment, not product gaps'] },
    { x: 460, y: 290, w: 230, h: 110, title: 'Absorption Capacity', sub: ['The limiting factor is what', 'the org can absorb'] },
  ];

  // Draw connector lines first (behind boxes)
  const centers = boxes.map(b => ({ cx: b.x + b.w / 2, cy: b.y + b.h / 2 }));
  // Top to bottom-left
  svg.appendChild(rc.line(centers[0].cx - 40, centers[0].cy + 55, centers[1].cx + 60, centers[1].cy - 55, {
    stroke: NAVY, strokeWidth: 1.5, roughness: 0.8,
  }));
  // Top to bottom-right
  svg.appendChild(rc.line(centers[0].cx + 40, centers[0].cy + 55, centers[2].cx - 60, centers[2].cy - 55, {
    stroke: NAVY, strokeWidth: 1.5, roughness: 0.8,
  }));
  // Bottom-left to bottom-right
  svg.appendChild(rc.line(centers[1].cx + 115, centers[1].cy, centers[2].cx - 115, centers[2].cy, {
    stroke: NAVY, strokeWidth: 1.5, roughness: 0.8,
  }));

  // Draw boxes
  boxes.forEach(b => {
    svg.appendChild(rc.rectangle(b.x, b.y, b.w, b.h, {
      stroke: NAVY, strokeWidth: 2, roughness: 1.2, fill: WHITE, fillStyle: 'solid',
    }));
    addText(svg, doc, b.x + b.w / 2, b.y + 38, b.title, { fontSize: 17, fontWeight: '700' });
    addMultilineText(svg, doc, b.x + b.w / 2, b.y + 62, b.sub, {
      fontSize: 13, fontWeight: '400', fill: 'rgba(12, 26, 42, 0.65)', lineHeight: 18,
    });
  });

  // Center label
  const centerX = W / 2;
  const centerY = 230;
  svg.appendChild(rc.rectangle(centerX - 100, centerY - 18, 200, 36, {
    stroke: BLUE, strokeWidth: 1.5, roughness: 0.6, fill: BLUE_LIGHT, fillStyle: 'solid',
  }));
  addText(svg, doc, centerX, centerY + 6, 'Where Deals Fall Apart', {
    fontSize: 14, fontWeight: '600', fill: NAVY,
  });

  writeFileSync(`${OUT}/three-misreads.svg`, svg.outerHTML);
  console.log('Diagram 1: three-misreads.svg');
}

// ═══════════════════════════════════════════════
// DIAGRAM 6: Three Pressures — Vertical Stack
// ═══════════════════════════════════════════════
function diagram6() {
  const W = 480, H = 400;
  const { dom, doc, svg } = createSVG(W, H);
  const rc = rough.svg(svg);

  const blocks = [
    { y: 20, title: 'Complexity Debt', sub: 'The scale ceiling', icon: 'layers' },
    { y: 155, title: 'Proof Gaps', sub: 'The gatekeeper', icon: 'check' },
    { y: 290, title: 'Growth Pressure', sub: 'No more excuses', icon: 'arrow' },
  ];

  const boxW = 340, boxH = 100, startX = (W - boxW) / 2;

  blocks.forEach((b, i) => {
    // Box
    svg.appendChild(rc.rectangle(startX, b.y, boxW, boxH, {
      stroke: NAVY, strokeWidth: 1.8, roughness: 1.0, fill: WHITE, fillStyle: 'solid',
    }));

    // Title
    addText(svg, doc, W / 2, b.y + 40, b.title, { fontSize: 17, fontWeight: '700' });
    // Subtitle
    addText(svg, doc, W / 2, b.y + 65, b.sub, {
      fontSize: 13, fontWeight: '400', fill: 'rgba(12, 26, 42, 0.6)',
    });

    // Downward arrow connector (except after last)
    if (i < blocks.length - 1) {
      const arrowY1 = b.y + boxH + 5;
      const arrowY2 = blocks[i + 1].y - 5;
      svg.appendChild(rc.line(W / 2, arrowY1, W / 2, arrowY2, {
        stroke: NAVY, strokeWidth: 1.5, roughness: 0.7,
      }));
      // Arrowhead
      svg.appendChild(rc.line(W / 2, arrowY2, W / 2 - 8, arrowY2 - 12, {
        stroke: NAVY, strokeWidth: 1.5, roughness: 0.5,
      }));
      svg.appendChild(rc.line(W / 2, arrowY2, W / 2 + 8, arrowY2 - 12, {
        stroke: NAVY, strokeWidth: 1.5, roughness: 0.5,
      }));
    }
  });

  // Compound feedback arrow (right side, dashed feel)
  const rightX = startX + boxW + 25;
  svg.appendChild(rc.line(rightX, blocks[2].y + boxH / 2, rightX, blocks[0].y + boxH / 2, {
    stroke: BLUE, strokeWidth: 1.2, roughness: 0.8, strokeLineDash: [6, 4],
  }));
  // Arrowhead pointing up
  svg.appendChild(rc.line(rightX, blocks[0].y + boxH / 2, rightX - 7, blocks[0].y + boxH / 2 + 10, {
    stroke: BLUE, strokeWidth: 1.2, roughness: 0.5,
  }));
  svg.appendChild(rc.line(rightX, blocks[0].y + boxH / 2, rightX + 7, blocks[0].y + boxH / 2 + 10, {
    stroke: BLUE, strokeWidth: 1.2, roughness: 0.5,
  }));
  // Label
  addText(svg, doc, rightX + 2, (blocks[0].y + blocks[2].y + boxH) / 2 + 4, 'compounds', {
    fontSize: 11, fontWeight: '500', fill: BLUE, anchor: 'middle',
  });
  // Rotate the "compounds" text — add a transform via raw SVG
  const compText = svg.lastChild;
  compText.setAttribute('transform', `rotate(-90, ${rightX + 2}, ${(blocks[0].y + blocks[2].y + boxH) / 2 + 4})`);

  writeFileSync(`${OUT}/three-pressures.svg`, svg.outerHTML);
  console.log('Diagram 6: three-pressures.svg');
}

// ═══════════════════════════════════════════════
// DIAGRAM 9: Operating System — Horizontal Flow
// ═══════════════════════════════════════════════
function diagram9() {
  const W = 720, H = 220;
  const { dom, doc, svg } = createSVG(W, H);
  const rc = rough.svg(svg);

  // Outer bracket/container
  svg.appendChild(rc.rectangle(15, 15, W - 30, H - 30, {
    stroke: BLUE, strokeWidth: 1.5, roughness: 0.8, fill: BLUE_LIGHT, fillStyle: 'solid',
  }));

  // Container label at top
  addText(svg, doc, W / 2, 48, 'The Operating System', {
    fontSize: 15, fontWeight: '700', fill: NAVY,
  });

  const boxes = [
    { x: 40, title: 'Delivery System', sub: ['Scale execution by', 'removing constraints'] },
    { x: 268, title: 'Proof System', sub: ['Turn data into', 'decision-grade evidence'] },
    { x: 496, title: 'Alignment System', sub: ['Design organizational', "buy-in, don't assume it"] },
  ];

  const boxW = 195, boxH = 120, boxY = 75;

  boxes.forEach((b, i) => {
    svg.appendChild(rc.rectangle(b.x, boxY, boxW, boxH, {
      stroke: NAVY, strokeWidth: 2, roughness: 1.1, fill: WHITE, fillStyle: 'solid',
    }));
    addText(svg, doc, b.x + boxW / 2, boxY + 40, b.title, { fontSize: 16, fontWeight: '700' });
    addMultilineText(svg, doc, b.x + boxW / 2, boxY + 65, b.sub, {
      fontSize: 12, fontWeight: '400', fill: 'rgba(12, 26, 42, 0.6)', lineHeight: 17,
    });

    // Arrow to next box
    if (i < boxes.length - 1) {
      const arrowX1 = b.x + boxW + 5;
      const arrowX2 = boxes[i + 1].x - 5;
      const arrowY = boxY + boxH / 2;
      svg.appendChild(rc.line(arrowX1, arrowY, arrowX2, arrowY, {
        stroke: NAVY, strokeWidth: 1.5, roughness: 0.7,
      }));
      svg.appendChild(rc.line(arrowX2, arrowY, arrowX2 - 10, arrowY - 7, {
        stroke: NAVY, strokeWidth: 1.5, roughness: 0.5,
      }));
      svg.appendChild(rc.line(arrowX2, arrowY, arrowX2 - 10, arrowY + 7, {
        stroke: NAVY, strokeWidth: 1.5, roughness: 0.5,
      }));
    }
  });

  writeFileSync(`${OUT}/operating-system.svg`, svg.outerHTML);
  console.log('Diagram 9: operating-system.svg');
}

// Generate all three
diagram1();
diagram6();
diagram9();
console.log('All diagrams generated.');
