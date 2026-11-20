// grade.js — colour grade presets for Palm Bay Heat.
// A grade is applied per pixel on an offscreen copy of each panel photo,
// then composited by render.js. Presets are plain data plus one applier.
"use strict";

const GRADE_PRESETS = [
  {
    id: "leonida-sunset",
    name: "Leonida Sunset",
    blurb: "Hot oranges, lifted shadows, teal pushed into the sky.",
    warmth: 0.22, saturation: 1.28, contrast: 1.12, brightness: 1.03,
    tealShadows: 0.16, fade: 0.05,
  },
  {
    id: "neon-nights",
    name: "Neon Nights",
    blurb: "Magenta and cyan split, deep blacks, electric saturation.",
    warmth: -0.06, saturation: 1.45, contrast: 1.22, brightness: 0.98,
    tealShadows: 0.30, fade: 0.0,
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    blurb: "Soft warm glow, gentle contrast, holiday-postcard skin.",
    warmth: 0.34, saturation: 1.12, contrast: 0.96, brightness: 1.07,
    tealShadows: 0.04, fade: 0.10,
  },
  {
    id: "vice-teal",
    name: "Vice Teal",
    blurb: "Cool aqua wash with punchy highlights.",
    warmth: -0.20, saturation: 1.18, contrast: 1.08, brightness: 1.02,
    tealShadows: 0.38, fade: 0.03,
  },
  {
    id: "print-poster",
    name: "Print Poster",
    blurb: "Flat, faded, slightly posterised — like a newsstand cover.",
    warmth: 0.08, saturation: 0.92, contrast: 1.05, brightness: 1.05,
    tealShadows: 0.08, fade: 0.22, posterise: 18,
  },
  {
    id: "clean",
    name: "Clean",
    blurb: "No grade — the photo exactly as supplied.",
    warmth: 0, saturation: 1, contrast: 1, brightness: 1,
    tealShadows: 0, fade: 0,
  },
];

function getGradePreset(id) {
  return GRADE_PRESETS.find((preset) => preset.id === id) || GRADE_PRESETS[0];
}

function clampByte(value) {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

// Apply a preset to ImageData in place and return it.
function applyGradeToPixels(imageData, preset) {
  const data = imageData.data;
  const warmR = 1 + preset.warmth;
  const warmB = 1 - preset.warmth;
  const intercept = 128 * (1 - preset.contrast) + 255 * preset.fade * 0.5;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    // Brightness and contrast around the midpoint.
    r = r * preset.brightness * preset.contrast + intercept;
    g = g * preset.brightness * preset.contrast + intercept;
    b = b * preset.brightness * preset.contrast + intercept;
    // Saturation around luminance.
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = lum + (r - lum) * preset.saturation;
    g = lum + (g - lum) * preset.saturation;
    b = lum + (b - lum) * preset.saturation;
    // Warmth split.
    r *= warmR; b *= warmB;
    // Teal into the shadows, fading out towards the highlights.
    const shadowWeight = Math.max(0, 1 - lum / 255) * preset.tealShadows;
    g += 42 * shadowWeight; b += 55 * shadowWeight; r -= 18 * shadowWeight;
    // Optional posterise for the print look.
    if (preset.posterise) {
      const step = 255 / preset.posterise;
      r = Math.round(r / step) * step;
      g = Math.round(g / step) * step;
      b = Math.round(b / step) * step;
    }
    // Fade lifts the black point.
    const lift = preset.fade * 28;
    data[i] = clampByte(r + lift);
    data[i + 1] = clampByte(g + lift);
    data[i + 2] = clampByte(b + lift);
  }
  return imageData;
}

// Small per-panel tint overlays used by the layouts in panels.js.
const PANEL_TINTS = {
  none: null,
  warm: "rgba(255, 138, 61, 0.16)",
  teal: "rgba(20, 184, 196, 0.16)",
  magenta: "rgba(255, 62, 165, 0.15)",
};

window.PalmBayGrade = { GRADE_PRESETS, PANEL_TINTS, getGradePreset, applyGradeToPixels };
