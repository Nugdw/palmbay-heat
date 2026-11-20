// Draws a finished Palm Bay Heat cover onto a canvas: graded photos clipped
// into the layout's panels, drawn vector art panels between them, black
// gutters with a white keyline, and the bold title block — a magenta offset
// shadow, heavy white lettering with a black outline, and the caption on a
// hot gradient strip.

import { ART_DRAWERS, gradedPhoto } from './grade.js';

const TITLE_FONT = "'Arial Black', 'Liberation Sans', 'DejaVu Sans', sans-serif";
const BODY_FONT = "'Liberation Sans', 'DejaVu Sans', sans-serif";

function panelRect(panel, W, H) {
  return { x: panel.x * W, y: panel.y * H, w: panel.w * W, h: panel.h * H };
}

// Draws one photo panel: the graded photo, cover-fitted, framed by the
// panel's pan (in panel fractions, -1..1) and zoom.
function drawPhotoPanel(ctx, rect, photo, framing, grade) {
  const art = gradedPhoto(photo, grade);
  const scale = Math.max(rect.w / art.width, rect.h / art.height) * framing.zoom;
  const dw = art.width * scale;
  const dh = art.height * scale;
  const dx = rect.x + (rect.w - dw) / 2 + framing.panX * rect.w * 0.35;
  const dy = rect.y + (rect.h - dh) / 2 + framing.panY * rect.h * 0.35;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(art, dx, dy, dw, dh);
  ctx.restore();
}

function strokePanelFrame(ctx, rect, gutter, W) {
  ctx.strokeStyle = '#07070d';
  ctx.lineWidth = gutter;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = Math.max(2, W * 0.0022);
  const inset = gutter / 2 + ctx.lineWidth;
  ctx.strokeRect(rect.x + inset, rect.y + inset, rect.w - inset * 2, rect.h - inset * 2);
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// The title block: two heavy lines, the caption on a gradient strip, a star
// badge, and the place line. Anchored to the cover's bottom over a scrim.
function drawTitleBlock(ctx, W, H, state) {
  const zoneH = H * 0.3;
  const zoneY = H - zoneH;
  const scrim = ctx.createLinearGradient(0, zoneY, 0, H);
  scrim.addColorStop(0, 'rgba(5, 4, 16, 0)');
  scrim.addColorStop(0.45, 'rgba(5, 4, 16, 0.55)');
  scrim.addColorStop(1, 'rgba(5, 4, 16, 0.88)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, zoneY, W, zoneH);

  const pad = W * 0.045;
  const line1 = (state.title1 || '').toUpperCase();
  const line2 = (state.title2 || '').toUpperCase();
  const size1 = H * 0.082;
  const size2 = H * 0.118;
  const baseY = H - H * 0.045;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';

  // One title line, skewed like a poster masthead. The skew is applied
  // around the line's own baseline so it never pushes the text off the
  // cover's left edge, and the size shrinks to fit the cover's width.
  const drawTitleLine = (text, size, y, fill, shadowed) => {
    ctx.font = `900 ${size}px ${TITLE_FONT}`;
    const maxW = W - pad * 2;
    const tw = ctx.measureText(text).width;
    if (tw > maxW) {
      size = Math.floor(size * (maxW / tw));
      ctx.font = `900 ${size}px ${TITLE_FONT}`;
    }
    ctx.save();
    ctx.translate(pad, y);
    ctx.transform(1, 0, -0.055, 1, 0, 0);
    ctx.strokeStyle = '#0a0a12';
    ctx.lineWidth = size * 0.17;
    if (shadowed) {
      ctx.fillStyle = '#ff2e88';
      ctx.strokeText(text, size * 0.05, size * 0.05);
      ctx.fillText(text, size * 0.05, size * 0.05);
    }
    ctx.fillStyle = fill;
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  if (line2) drawTitleLine(line2, size2, baseY, '#ffffff', true);
  if (line1) drawTitleLine(line1, size1, baseY - size2 * 1.04, '#ffd23e', false);
  ctx.restore();

  const caption = (state.caption || '').toUpperCase();
  if (caption) {
    const capSize = H * 0.026;
    ctx.font = `700 ${capSize}px ${BODY_FONT}`;
    const tw = ctx.measureText(caption).width;
    const stripW = tw + capSize * 1.7;
    const stripH = capSize * 1.9;
    const stripX = pad;
    const stripY = baseY - size2 * 1.04 - size1 - stripH * 1.15;
    const stripGrad = ctx.createLinearGradient(stripX, 0, stripX + stripW, 0);
    stripGrad.addColorStop(0, '#ff2e88');
    stripGrad.addColorStop(1, '#ff7b3d');
    ctx.save();
    ctx.translate(stripX, stripY);
    ctx.transform(1, 0, -0.055, 1, 0, 0);
    ctx.fillStyle = stripGrad;
    ctx.fillRect(0, 0, stripW, stripH);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(caption, capSize * 0.85, stripH * 0.54);
    ctx.restore();
  }

  const badgeR = H * 0.045;
  const badgeX = W - pad - badgeR;
  const badgeY = H - pad - badgeR;
  const badgeGrad = ctx.createLinearGradient(badgeX - badgeR, badgeY - badgeR, badgeX + badgeR, badgeY + badgeR);
  badgeGrad.addColorStop(0, '#ff2e88');
  badgeGrad.addColorStop(1, '#7b2ff7');
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, W * 0.003);
  ctx.stroke();
  drawStar(ctx, badgeX, badgeY, badgeR * 0.58, '#ffffff');

  ctx.font = `700 ${H * 0.02}px ${BODY_FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('L E O N I D A · P A L M  B A Y', badgeX - badgeR * 1.5, H - H * 0.045);
  ctx.textAlign = 'left';
}

// Renders the whole cover. `state` carries the layout, the photos, the
// per-panel framing, the texts and the grade. When `state.selected` names a
// panel and `state.forExport` is false, that panel gets a dashed outline —
// the editor's selection marker, never part of an exported cover.
export function renderCover(canvas, state) {
  const { width: W, height: H } = state.size;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const layout = state.layout;
  const gutter = Math.max(6, W * 0.012);

  ctx.fillStyle = '#07070d';
  ctx.fillRect(0, 0, W, H);

  layout.panels.forEach((panel, i) => {
    const rect = panelRect(panel, W, H);
    if (panel.kind === 'art') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      ART_DRAWERS[panel.art](ctx, rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    } else {
      const framing = state.panels[i];
      const photo = state.photos[framing.photo] ?? state.photos[0];
      if (photo) drawPhotoPanel(ctx, rect, photo, framing, state.grade);
    }
    strokePanelFrame(ctx, rect, gutter, W);
  });

  drawTitleBlock(ctx, W, H, state);

  if (!state.forExport && state.selected >= 0) {
    const rect = panelRect(layout.panels[state.selected], W, H);
    ctx.save();
    ctx.strokeStyle = '#ffd23e';
    ctx.lineWidth = Math.max(3, W * 0.004);
    ctx.setLineDash([W * 0.02, W * 0.012]);
    ctx.strokeRect(rect.x + gutter, rect.y + gutter, rect.w - gutter * 2, rect.h - gutter * 2);
    ctx.restore();
  }
  return canvas;
}

export function coverFileName(state) {
  const slug = `${state.title1} ${state.title2}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug || 'palmbay-heat'}-cover-${state.size.width}x${state.size.height}.png`;
}
