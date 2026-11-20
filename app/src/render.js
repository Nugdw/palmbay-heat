// render.js — canvas rendering for Palm Bay Heat cover posters.
// Draws the multi-panel collage, title treatment, price sticker and
// platform badges onto a 2D canvas at the requested poster size.
// All state arrives as one plain options object from main.js.

import { filterString } from "./grade.js";

// Cover-crop an image into a rectangle (like CSS background-size: cover).
function drawCover(ctx, img, x, y, w, h) {
  if (!img || !img.width) {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "#ff9a3d");
    grad.addColorStop(1, "#20365e");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    return;
  }
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

// Soft photographic vignette: darken the poster edges so the centre
// panels and title hold the eye, like a printed cover under glass.
function drawVignette(ctx, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.hypot(cx, cy);
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.42, cx, cy, radius);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.78, "rgba(8,2,14,0.18)");
  grad.addColorStop(1, "rgba(8,2,14,0.52)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawGrain(ctx, w, h, amount, seed) {
  if (amount <= 0) return;
  // Deterministic pseudo-random grain so exports look stable frame to frame.
  let s = seed * 2654435761 % 4294967296;
  const dots = Math.floor(w * h * amount * 0.02);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < dots; i++) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const gx = (s / 4294967296) * w;
    s = (s * 1664525 + 1013904223) % 4294967296;
    const gy = (s / 4294967296) * h;
    ctx.fillRect(gx, gy, 1.4, 1.4);
  }
}

function drawSticker(ctx, cx, cy, r, price, tagline) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  ctx.beginPath();
  // Starburst sticker: alternating radii around the circle.
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    const rad = i % 2 === 0 ? r : r * 0.86;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffd21f";
  ctx.fill();
  ctx.lineWidth = r * 0.05;
  ctx.strokeStyle = "#14100a";
  ctx.stroke();
  ctx.fillStyle = "#14100a";
  ctx.textAlign = "center";
  ctx.font = `900 ${r * 0.52}px Impact, 'Arial Black', sans-serif`;
  ctx.fillText(price, 0, r * 0.1);
  ctx.font = `700 ${r * 0.2}px Arial, sans-serif`;
  ctx.fillText(tagline, 0, r * 0.48);
  ctx.restore();
}

function drawTitle(ctx, w, h, title, subtitle) {
  const lines = title.toUpperCase().split("\n");
  ctx.save();
  ctx.textAlign = "center";
  const base = h * 0.86;
  const size = Math.min(w * 0.16, h * 0.15);
  lines.forEach((line, i) => {
    const y = base - (lines.length - 1 - i) * size * 1.02;
    ctx.font = `900 ${size}px Impact, 'Arial Black', sans-serif`;
    ctx.lineWidth = size * 0.14;
    ctx.strokeStyle = "#12060f";
    ctx.strokeText(line, w / 2, y);
    const grad = ctx.createLinearGradient(0, y - size, 0, y);
    grad.addColorStop(0, "#ffe259");
    grad.addColorStop(0.55, "#ffa751");
    grad.addColorStop(1, "#ff2e88");
    ctx.fillStyle = grad;
    ctx.fillText(line, w / 2, y);
  });
  if (subtitle) {
    ctx.font = `700 ${size * 0.24}px Arial, sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 8;
    ctx.fillText(subtitle.toUpperCase(), w / 2, base + size * 0.42);
  }
  ctx.restore();
}

// Main entry: render one poster.
// opts: { layout, images: Map<sampleId, HTMLImageElement|null>, grade,
//         title, subtitle, price, tagline, showSticker }
export function renderPoster(ctx, w, h, opts) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0b0b12";
  ctx.fillRect(0, 0, w, h);
  const gutter = Math.max(4, w * 0.008);
  for (const panel of opts.layout.panels) {
    const x = panel.x * w + gutter / 2;
    const y = panel.y * h + gutter / 2;
    const pw = panel.w * w - gutter;
    const ph = panel.h * h - gutter;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, pw, ph);
    ctx.clip();
    ctx.filter = filterString(opts.grade);
    drawCover(ctx, opts.images.get(panel.sample), x, y, pw, ph);
    ctx.filter = "none";
    if (opts.grade.tint) {
      ctx.fillStyle = opts.grade.tint;
      ctx.fillRect(x, y, pw, ph);
    }
    ctx.restore();
    ctx.strokeStyle = "#f5f0e6";
    ctx.lineWidth = gutter * 0.55;
    ctx.strokeRect(x, y, pw, ph);
  }
  // Darken the lower third so the title always reads cleanly.
  const shade = ctx.createLinearGradient(0, h * 0.55, 0, h);
  shade.addColorStop(0, "rgba(5,2,10,0)");
  shade.addColorStop(1, "rgba(5,2,10,0.72)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  drawTitle(ctx, w, h, opts.title, opts.subtitle);
  if (opts.showSticker) {
    drawSticker(ctx, w * 0.86, h * 0.16, Math.min(w, h) * 0.11, opts.price, opts.tagline);
  }
  // Rating-style badge, bottom-left.
  ctx.save();
  ctx.fillStyle = "#f5f0e6";
  ctx.fillRect(w * 0.03, h * 0.9, w * 0.075, h * 0.075);
  ctx.fillStyle = "#14100a";
  ctx.textAlign = "center";
  ctx.font = `900 ${h * 0.045}px Impact, 'Arial Black', sans-serif`;
  ctx.fillText("18", w * 0.03 + w * 0.0375, h * 0.9 + h * 0.055);
  ctx.restore();
  drawVignette(ctx, w, h);
  drawGrain(ctx, w, h, opts.grade.grain, 7);
}
