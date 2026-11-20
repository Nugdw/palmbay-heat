// main.js — UI controller for Palm Bay Heat — Leonida Cover Studio.
// Wires the control panel to the renderer: layout picker, colour grade,
// editable title/subtitle, price sticker, per-panel photo upload, poster
// size presets, and PNG export. Vanilla JS, no build step.

import { LAYOUTS, SAMPLES, layoutById, sampleById } from "./panels.js";
import { GRADES, gradeById } from "./grade.js";
import { renderPoster } from "./render.js";

const canvas = document.getElementById("poster");
const ctx = canvas.getContext("2d");

const state = {
  layoutId: "classic",
  gradeId: "sunset",
  title: "PALM BAY\nHEAT",
  subtitle: "Welcome back to Leonida",
  price: "$69",
  tagline: "OUT NOW",
  showSticker: true,
  sizeId: "portrait",
  images: new Map(), // sampleId -> HTMLImageElement | null
};

const SIZES = {
  portrait: { label: "Portrait 2:3", w: 1000, h: 1500 },
  landscape: { label: "Landscape 3:2", w: 1500, h: 1000 },
  square: { label: "Square 1:1", w: 1200, h: 1200 },
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function redraw() {
  const size = SIZES[state.sizeId];
  canvas.width = size.w;
  canvas.height = size.h;
  renderPoster(ctx, size.w, size.h, {
    layout: layoutById(state.layoutId),
    images: state.images,
    grade: gradeById(state.gradeId),
    title: state.title,
    subtitle: state.subtitle,
    price: state.price,
    tagline: state.tagline,
    showSticker: state.showSticker,
  });
  const status = document.getElementById("status");
  if (status) {
    status.textContent =
      `${layoutById(state.layoutId).label} · ${gradeById(state.gradeId).label} · ` +
      `${size.w}×${size.h}px`;
  }
}

function fillSelect(id, items, value) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = item.label;
    if (item.id === value) opt.selected = true;
    el.appendChild(opt);
  }
  return el;
}

function buildPanelUploads() {
  const host = document.getElementById("panel-uploads");
  host.innerHTML = "";
  for (const sample of SAMPLES) {
    const row = document.createElement("label");
    row.className = "upload-row";
    const span = document.createElement("span");
    span.textContent = sample.label;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      state.images.set(sample.id, await loadImage(url));
      redraw();
    });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "Reset";
    reset.addEventListener("click", async (ev) => {
      ev.preventDefault();
      state.images.set(sample.id, await loadImage(sampleById(sample.id).src));
      redraw();
    });
    row.append(span, input, reset);
    host.appendChild(row);
  }
}

function bindControls() {
  fillSelect("layout-select", LAYOUTS, state.layoutId)
    .addEventListener("change", (e) => { state.layoutId = e.target.value; redraw(); });
  fillSelect("grade-select", GRADES, state.gradeId)
    .addEventListener("change", (e) => { state.gradeId = e.target.value; redraw(); });
  fillSelect("size-select",
    Object.entries(SIZES).map(([id, s]) => ({ id, label: s.label })), state.sizeId)
    .addEventListener("change", (e) => { state.sizeId = e.target.value; redraw(); });

  const titleInput = document.getElementById("title-input");
  titleInput.value = state.title;
  titleInput.addEventListener("input", () => { state.title = titleInput.value; redraw(); });

  const subInput = document.getElementById("subtitle-input");
  subInput.value = state.subtitle;
  subInput.addEventListener("input", () => { state.subtitle = subInput.value; redraw(); });

  const priceInput = document.getElementById("price-input");
  priceInput.value = state.price;
  priceInput.addEventListener("input", () => { state.price = priceInput.value; redraw(); });

  const stickerToggle = document.getElementById("sticker-toggle");
  stickerToggle.checked = state.showSticker;
  stickerToggle.addEventListener("change", () => {
    state.showSticker = stickerToggle.checked;
    redraw();
  });

  document.getElementById("shuffle-btn").addEventListener("click", () => {
    const order = [...LAYOUTS];
    const next = order[(order.findIndex((l) => l.id === state.layoutId) + 1) % order.length];
    state.layoutId = next.id;
    document.getElementById("layout-select").value = next.id;
    redraw();
  });

  document.getElementById("export-btn").addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = "palm-bay-heat-cover.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  });
}

async function init() {
  for (const sample of SAMPLES) {
    state.images.set(sample.id, await loadImage(sample.src));
  }
  buildPanelUploads();
  bindControls();
  redraw();
}

init();
