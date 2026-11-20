// The Palm Bay grade: turns an ordinary photo into flat, punchy cover-art
// colour — lifted saturation, a gentle posterise so shapes read as vector
// panels, purple pushed into the shadows and a sunset wash over the top.
// Also draws the two vector art panels (Leonida sunset, neon bay night)
// that sit between the photo panels.

const gradedCache = new Map();

function cacheKey(photo, grade) {
  return `${photo.id}|${grade}`;
}

// A graded copy of a photo, drawn once and cached. `grade` runs 0..100.
export function gradedPhoto(photo, grade) {
  const key = cacheKey(photo, grade);
  const hit = gradedCache.get(key);
  if (hit) return hit;

  const img = photo.img;
  const scale = Math.min(1, 1100 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(2, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  const g = grade / 100;

  ctx.filter = `saturate(${1 + g * 0.75}) contrast(${1 + g * 0.22}) brightness(${1 + g * 0.03})`;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';

  if (g > 0.02) {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    const levels = Math.round(30 - g * 16);
    const blend = g * 0.5;
    for (let i = 0; i < px.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const v = px[i + c];
        const flat = Math.round((v / 255) * levels) * (255 / levels);
        px[i + c] = v + (flat - v) * blend;
      }
      const lum = (px[i] + px[i + 1] + px[i + 2]) / 765;
      const shadow = (1 - lum) * g;
      px[i] += shadow * 16;
      px[i + 2] += shadow * 30;
    }
    ctx.putImageData(data, 0, 0);
  }

  const wash = ctx.createLinearGradient(0, 0, 0, canvas.height);
  wash.addColorStop(0, `rgba(255, 128, 56, ${0.13 * g})`);
  wash.addColorStop(0.55, 'rgba(255, 64, 128, 0)');
  wash.addColorStop(1, `rgba(120, 16, 110, ${0.17 * g})`);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  gradedCache.set(key, canvas);
  return canvas;
}

export function clearGradeCache() {
  gradedCache.clear();
}

// A palm silhouette: a curved trunk with seven drooping fronds, drawn at
// (x, y) with height `s`. `flip` mirrors it for the other side of a panel.
export function drawPalmSilhouette(ctx, x, y, s, flip = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip, 1);
  ctx.fillStyle = '#170a24';
  ctx.strokeStyle = '#170a24';
  const trunkTopX = s * 0.16;
  ctx.beginPath();
  ctx.moveTo(-s * 0.06, 0);
  ctx.quadraticCurveTo(s * 0.03, -s * 0.5, trunkTopX - s * 0.045, -s * 0.98);
  ctx.lineTo(trunkTopX + s * 0.05, -s * 0.98);
  ctx.quadraticCurveTo(s * 0.13, -s * 0.5, s * 0.07, 0);
  ctx.closePath();
  ctx.fill();
  ctx.lineCap = 'round';
  for (let f = 0; f < 7; f++) {
    const ang = Math.PI * (0.08 + (f / 6) * 0.84);
    const reach = s * (0.52 + 0.16 * Math.sin(f * 2.3));
    const ex = trunkTopX + Math.cos(ang) * reach * (f < 3 ? -1 : 1) * (f === 3 ? 0.2 : 1);
    const ey = -s * 0.98 - Math.sin(ang) * s * 0.1 + s * 0.24;
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(trunkTopX, -s * 0.98);
    ctx.quadraticCurveTo(trunkTopX + (ex - trunkTopX) * 0.5, -s * 1.16, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

// Art panel: a striped retro sun sinking into a turquoise sea, palms on
// both shores, over a magenta-to-gold sky.
export function drawSunsetArt(ctx, x, y, w, h) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#3d1566');
  sky.addColorStop(0.45, '#c92a6d');
  sky.addColorStop(0.72, '#ff7b3d');
  sky.addColorStop(1, '#ffc93d');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  const sunR = h * 0.3;
  const sunX = x + w * 0.5;
  const sunY = y + h * 0.62;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h * 0.72);
  ctx.clip();
  const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sunGrad.addColorStop(0, '#ffe95e');
  sunGrad.addColorStop(1, '#ff5e62');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(61, 21, 102, 0.55)';
  for (let s = 0; s < 4; s++) {
    ctx.fillRect(x, sunY + sunR * (0.08 + s * 0.2), w, h * (0.012 + s * 0.006));
  }
  ctx.restore();

  ctx.fillStyle = '#0e7f86';
  ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
  ctx.fillStyle = 'rgba(255, 233, 94, 0.5)';
  for (let r = 0; r < 4; r++) {
    const rw = sunR * (1.5 - r * 0.28);
    ctx.fillRect(sunX - rw / 2, y + h * (0.76 + r * 0.06), rw, h * 0.014);
  }

  drawPalmSilhouette(ctx, x + w * 0.13, y + h * 0.98, h * 0.6, 1);
  drawPalmSilhouette(ctx, x + w * 0.9, y + h * 0.99, h * 0.7, -1);
}

// Art panel: the bay at night — a perspective neon grid, a glowing ring
// moon and one black palm against deep teal.
export function drawNeonArt(ctx, x, y, w, h) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#04182e');
  sky.addColorStop(0.6, '#07304a');
  sky.addColorStop(1, '#0a4a56');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  const moonX = x + w * 0.68;
  const moonY = y + h * 0.34;
  const moonR = h * 0.2;
  ctx.save();
  ctx.shadowColor = '#2ee6ff';
  ctx.shadowBlur = h * 0.09;
  ctx.strokeStyle = '#2ee6ff';
  ctx.lineWidth = h * 0.035;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const horizon = y + h * 0.66;
  ctx.strokeStyle = 'rgba(255, 46, 136, 0.75)';
  ctx.lineWidth = Math.max(1.5, h * 0.008);
  for (let v = -6; v <= 6; v++) {
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + v * w * 0.045, horizon);
    ctx.lineTo(x + w / 2 + v * w * 0.17, y + h);
    ctx.stroke();
  }
  for (let rLine = 0; rLine < 5; rLine++) {
    const yy = horizon + (h * 0.34 * (rLine + 1) * (rLine + 1)) / 25;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(4, 24, 46, 0.9)';
  ctx.fillRect(x, y + h * 0.94, w, h * 0.06);

  drawPalmSilhouette(ctx, x + w * 0.24, y + h * 1.0, h * 0.62, 1);
}

export const ART_DRAWERS = { sunset: drawSunsetArt, neon: drawNeonArt };
