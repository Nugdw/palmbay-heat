// render.js — canvas rendering for Palm Bay Heat covers.
// Draws graded photos into slanted panels, adds halftone texture, bold
// display lettering, price stickers and badges, all original artwork.
"use strict";

const { getPanelLayout, getCoverSize } = window.PalmBayPanels;
const { getGradePreset, applyGradeToPixels, PANEL_TINTS } = window.PalmBayGrade;

// Built-in gradient scene used when the user has not supplied a photo.
// Painted fresh each call so the default cover always looks intentional.
function paintFallbackScene(ctx, w, h, seedHue) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, `hsl(${seedHue + 265} 72% 30%)`);
  sky.addColorStop(0.45, `hsl(${seedHue + 330} 85% 58%)`);
  sky.addColorStop(0.72, `hsl(${seedHue + 18} 95% 60%)`);
  sky.addColorStop(1, `hsl(${seedHue + 200} 70% 22%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Sun disc low on the horizon.
  const sunY = h * 0.66;
  ctx.fillStyle = "rgba(255, 214, 120, 0.95)";
  ctx.beginPath();
  ctx.arc(w * 0.5, sunY, h * 0.16, 0, Math.PI * 2);
  ctx.fill();
  // Palm silhouettes.
  ctx.fillStyle = "rgba(12, 8, 24, 0.92)";
  drawPalmSilhouette(ctx, w * 0.16, h * 0.98, h * 0.52);
  drawPalmSilhouette(ctx, w * 0.86, h * 0.99, h * 0.42);
  // Sea / boulevard band.
  ctx.fillStyle = "rgba(8, 30, 48, 0.9)";
  ctx.fillRect(0, h * 0.82, w, h * 0.18);
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  for (let i = 0; i < 7; i++) ctx.fillRect(w * (0.06 + i * 0.14), h * 0.90, w * 0.07, 3);
}

function drawPalmSilhouette(ctx, baseX, baseY, height) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(12, 8, 24, 0.92)";
  ctx.lineWidth = Math.max(4, height * 0.035);
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(baseX + height * 0.10, baseY - height * 0.6, baseX + height * 0.22, baseY - height);
  ctx.stroke();
  const topX = baseX + height * 0.22, topY = baseY - height;
  ctx.lineWidth = Math.max(3, height * 0.022);
  for (let frond = 0; frond < 6; frond++) {
    const angle = Math.PI * (0.08 + frond * 0.17);
    const len = height * (0.34 + (frond % 2) * 0.08);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(angle) * len * 0.6, topY - Math.sin(angle) * len * 0.55 - len * 0.10,
      topX + Math.cos(angle) * len, topY - Math.sin(angle) * len * 0.28 + len * 0.22,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// Draw one image covering a rectangle (cover-fit), honouring per-photo
// zoom and focal offset stored on the photo state object.
function drawImageCover(ctx, image, x, y, w, h, photo) {
  const zoom = photo && photo.zoom ? photo.zoom : 1;
  const focusX = photo && typeof photo.focusX === "number" ? photo.focusX : 0.5;
  const focusY = photo && typeof photo.focusY === "number" ? photo.focusY : 0.5;
  const scale = Math.max(w / image.width, h / image.height) * zoom;
  const drawW = image.width * scale, drawH = image.height * scale;
  const dx = x + (w - drawW) * focusX;
  const dy = y + (h - drawH) * focusY;
  ctx.drawImage(image, dx, dy, drawW, drawH);
}

// Grade a photo once per (photo, preset, panel size bucket) via offscreen canvas.
const gradeCache = new WeakMap();
function gradedPanelCanvas(photo, preset, targetW, targetH) {
  if (!photo || !photo.image) return null;
  if (preset.id === "clean") return photo.image;
  let byPreset = gradeCache.get(photo.image);
  if (!byPreset) { byPreset = new Map(); gradeCache.set(photo.image, byPreset); }
  const key = `${preset.id}:${Math.round(targetW / 60)}x${Math.round(targetH / 60)}`;
  if (byPreset.has(key)) return byPreset.get(key);
  const work = document.createElement("canvas");
  const maxSide = 720;
  const ratio = Math.min(1, maxSide / Math.max(photo.image.width, photo.image.height));
  work.width = Math.max(2, Math.round(photo.image.width * ratio));
  work.height = Math.max(2, Math.round(photo.image.height * ratio));
  const wctx = work.getContext("2d", { willReadFrequently: true });
  wctx.drawImage(photo.image, 0, 0, work.width, work.height);
  const pixels = wctx.getImageData(0, 0, work.width, work.height);
  applyGradeToPixels(pixels, preset);
  wctx.putImageData(pixels, 0, 0);
  byPreset.set(key, work);
  return work;
}

function clipPanelPath(ctx, panel, W, H, gutter) {
  const x = panel.x * W + gutter, y = panel.y * H + gutter;
  const w = panel.w * W - gutter * 2, h = panel.h * H - gutter * 2;
  const slantPx = Math.tan(((panel.slant || 0) * Math.PI) / 180) * h * 0.5;
  ctx.beginPath();
  ctx.moveTo(x - slantPx, y);
  ctx.lineTo(x + w + slantPx, y);
  ctx.lineTo(x + w - slantPx, y + h);
  ctx.lineTo(x + slantPx, y + h);
  ctx.closePath();
  return { x, y, w, h };
}

function drawHalftone(ctx, W, H, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  const gap = Math.max(10, W / 90);
  for (let row = 0, y = gap * 0.5; y < H; row++, y += gap) {
    for (let x = gap * (0.5 + (row % 2) * 0.5); x < W; x += gap) {
      ctx.beginPath(); ctx.arc(x, y, gap * 0.07, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawTitleLettering(ctx, state, W, H) {
  const title = (state.title || "PALM BAY HEAT").toUpperCase();
  const subtitle = (state.subtitle || "LEONIDA").toUpperCase();
  ctx.save();
  ctx.textAlign = "center";
  // Stacked block lettering with hard offset shadow, poster style.
  const fontSize = Math.min(W * 0.115, H * 0.16);
  ctx.font = `900 ${fontSize}px "Arial Black", "Segoe UI", system-ui, sans-serif`;
  const lines = wrapTitleLines(ctx, title, W * 0.92);
  const blockH = lines.length * fontSize * 0.94;
  let y = H - blockH - H * 0.075;
  // Backing slash band.
  ctx.fillStyle = "rgba(10, 6, 26, 0.55)";
  ctx.fillRect(0, y - fontSize * 0.78, W, blockH + fontSize * 1.05);
  for (const line of lines) {
    ctx.lineWidth = fontSize * 0.16;
    ctx.strokeStyle = "#12082b";
    ctx.strokeText(line, W / 2, y);
    const fill = ctx.createLinearGradient(0, y - fontSize, 0, y);
    fill.addColorStop(0, "#fff7d6"); fill.addColorStop(0.55, "#ffd23e"); fill.addColorStop(1, "#ff5e3a");
    ctx.fillStyle = fill;
    ctx.fillText(line, W / 2, y);
    y += fontSize * 0.94;
  }
  if (subtitle) {
    ctx.font = `700 ${fontSize * 0.30}px "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = "#7ef0e6";
    const spaced = subtitle.split("").join("  ");
    ctx.fillText(spaced, W / 2, H - H * 0.028);
  }
  ctx.restore();
}

function wrapTitleLines(ctx, title, maxWidth) {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [title];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const trial = `${current} ${words[i]}`;
    if (ctx.measureText(trial).width > maxWidth && current) {
      lines.push(current); current = words[i];
    } else current = trial;
  }
  lines.push(current);
  return lines.slice(0, 3);
}

function drawPriceSticker(ctx, state, W, H) {
  if (!state.showSticker) return;
  ctx.save();
  const cx = W * 0.885, cy = H * 0.115, radius = Math.min(W, H) * 0.105;
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  // Starburst sticker.
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.82;
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffcf3f";
  ctx.fill();
  ctx.lineWidth = radius * 0.07; ctx.strokeStyle = "#16102e"; ctx.stroke();
  ctx.fillStyle = "#16102e";
  ctx.textAlign = "center";
  ctx.font = `900 ${radius * 0.52}px "Arial Black", system-ui, sans-serif`;
  ctx.fillText(state.stickerPrice || "$69", 0, radius * 0.05);
  ctx.font = `700 ${radius * 0.26}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillText(state.stickerNote || "OUT NOW", 0, radius * 0.42);
  ctx.restore();
}

function drawCornerBadge(ctx, state, W, H) {
  if (!state.showBadge) return;
  ctx.save();
  const label = (state.badgeText || "18+ · LEONIDA").toUpperCase();
  ctx.font = `800 ${Math.max(15, W * 0.020)}px "Segoe UI", system-ui, sans-serif`;
  const padX = W * 0.014, textW = ctx.measureText(label).width;
  const boxW = textW + padX * 2, boxH = W * 0.042;
  ctx.fillStyle = "#e8232a";
  ctx.fillRect(W * 0.022, H * 0.022, boxW, boxH);
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
  ctx.strokeRect(W * 0.022, H * 0.022, boxW, boxH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(label, W * 0.022 + padX, H * 0.022 + boxH / 2 + 1);
  ctx.restore();
}

// Soft vignette that darkens the cover edges so the centre art and the
// title block hold the eye — radial falloff, transparent at the middle.
function drawEdgeVignette(ctx, W, H) {
  ctx.save();
  const radius = Math.hypot(W, H) * 0.62;
  const glow = ctx.createRadialGradient(W / 2, H / 2, radius * 0.45, W / 2, H / 2, radius);
  glow.addColorStop(0, "rgba(8, 4, 20, 0)");
  glow.addColorStop(0.78, "rgba(8, 4, 20, 0.12)");
  glow.addColorStop(1, "rgba(8, 4, 20, 0.42)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Main entry: render the full cover described by state onto canvas.
function renderCover(canvas, state) {
  const size = getCoverSize(state.sizeId);
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  const W = size.width, H = size.height;
  const layout = getPanelLayout(state.layoutId);
  const preset = getGradePreset(state.gradeId);

  // Backdrop: near-black plum so gutters read as printed seams.
  ctx.fillStyle = "#0d0719";
  ctx.fillRect(0, 0, W, H);

  const gutter = Math.max(5, W * 0.006);
  layout.panels.forEach((panel, index) => {
    const rect = clipPanelPath(ctx, panel, W, H, gutter);
    ctx.save();
    ctx.clip();
    const photo = pickPhotoForPanel(state, index);
    if (photo && photo.image) {
      const graded = gradedPanelCanvas(photo, preset, rect.w, rect.h);
      drawImageCover(ctx, graded, rect.x - rect.h * 0.10, rect.y, rect.w + rect.h * 0.20, rect.h, photo);
    } else {
      paintFallbackScene(ctx, W, H, index * 47);
      ctx.translate(rect.x - panel.x * W, rect.y - panel.y * H);
      // Re-paint inside the translated clip so the scene fills the panel.
      ctx.translate(-(rect.x - panel.x * W), -(rect.y - panel.y * H));
      paintFallbackScene(ctx, W, H, index * 47);
    }
    const tint = PANEL_TINTS[panel.tint];
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(rect.x - 4, rect.y - 4, rect.w + 8, rect.h + 8); }
    // Inner shadow at the panel foot for depth.
    const foot = ctx.createLinearGradient(0, rect.y + rect.h * 0.7, 0, rect.y + rect.h);
    foot.addColorStop(0, "rgba(0,0,0,0)"); foot.addColorStop(1, "rgba(0,0,0,0.38)");
    ctx.fillStyle = foot;
    ctx.fillRect(rect.x - 4, rect.y, rect.w + 8, rect.h + 4);
    ctx.restore();
    // Seam stroke.
    clipPanelPath(ctx, panel, W, H, gutter);
    ctx.lineWidth = Math.max(3, W * 0.0035);
    ctx.strokeStyle = "#0d0719";
    ctx.stroke();
  });

  if (state.halftone) drawHalftone(ctx, W, H, 0.10);
  drawEdgeVignette(ctx, W, H);
  drawTitleLettering(ctx, state, W, H);
  drawPriceSticker(ctx, state, W, H);
  drawCornerBadge(ctx, state, W, H);
  return canvas;
}

function pickPhotoForPanel(state, panelIndex) {
  if (!state.photos || state.photos.length === 0) return null;
  if (state.fillMode === "per-panel") {
    return state.photos[panelIndex % state.photos.length] || null;
  }
  return state.photos[0];
}

function exportCoverPng(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename || "palm-bay-heat-cover.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

window.PalmBayRender = { renderCover, exportCoverPng, paintFallbackScene };
