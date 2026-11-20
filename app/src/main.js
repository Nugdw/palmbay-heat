// main.js — UI controller for Palm Bay Heat — Leonida Cover Studio.
// Wires the controls to the render pipeline, manages photo state,
// sample scenes, per-panel assignment and PNG export. No build step.
"use strict";

const { PANEL_LAYOUTS, COVER_SIZES } = window.PalmBayPanels;
const { GRADE_PRESETS } = window.PalmBayGrade;
const { renderCover, exportCoverPng } = window.PalmBayRender;

const state = {
  title: "PALM BAY HEAT",
  subtitle: "LEONIDA",
  layoutId: "collage-hero",
  sizeId: "landscape",
  gradeId: "leonida-sunset",
  fillMode: "single",
  halftone: true,
  showSticker: true,
  stickerPrice: "$69",
  stickerNote: "OUT NOW",
  showBadge: true,
  badgeText: "18+ · LEONIDA",
  photos: [], // { name, image, zoom, focusX, focusY }
  activePhotoIndex: 0,
};

const els = {};
function grabElements() {
  const ids = [
    "coverCanvas", "titleInput", "subtitleInput", "layoutSelect", "sizeSelect",
    "gradeSelect", "fillModeSelect", "halftoneToggle", "stickerToggle",
    "stickerPriceInput", "stickerNoteInput", "badgeToggle", "badgeTextInput",
    "photoInput", "sampleButtons", "photoList", "zoomRange", "focusXRange",
    "focusYRange", "exportButton", "randomButton", "statusLine", "gradeBlurb",
  ];
  for (const id of ids) els[id] = document.getElementById(id);
}

let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderCover(els.coverCanvas, state);
    updateStatusLine();
  });
}

function updateStatusLine() {
  const size = COVER_SIZES.find((s) => s.id === state.sizeId);
  const layout = PANEL_LAYOUTS.find((l) => l.id === state.layoutId);
  const photoText = state.photos.length === 0
    ? "built-in sunset scene"
    : `${state.photos.length} photo${state.photos.length > 1 ? "s" : ""} loaded`;
  els.statusLine.textContent =
    `${layout.name} · ${size.width} × ${size.height} · ${photoText} · ready to export`;
}

function fillSelect(select, items, current) {
  select.innerHTML = "";
  for (const item of items) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    if (item.id === current) option.selected = true;
    select.appendChild(option);
  }
}

function loadPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ name: file.name, image, zoom: 1, focusX: 0.5, focusY: 0.5, objectUrl: url });
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not load ${file.name}`)); };
    image.src = url;
  });
}

function loadSamplePhoto(path, label) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ name: label, image, zoom: 1, focusX: 0.5, focusY: 0.5 });
    image.onerror = () => reject(new Error(`Sample ${label} failed to load`));
    image.src = path;
  });
}

function refreshPhotoList() {
  els.photoList.innerHTML = "";
  state.photos.forEach((photo, index) => {
    const row = document.createElement("div");
    row.className = "photo-row" + (index === state.activePhotoIndex ? " active" : "");
    const label = document.createElement("button");
    label.type = "button";
    label.className = "photo-pick";
    label.textContent = `${index + 1}. ${photo.name} — ${photo.image.width}×${photo.image.height}`;
    label.addEventListener("click", () => {
      state.activePhotoIndex = index;
      syncPhotoSliders();
      refreshPhotoList();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "photo-remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      const [gone] = state.photos.splice(index, 1);
      if (gone && gone.objectUrl) URL.revokeObjectURL(gone.objectUrl);
      state.activePhotoIndex = Math.max(0, Math.min(state.activePhotoIndex, state.photos.length - 1));
      syncPhotoSliders();
      refreshPhotoList();
      scheduleRender();
    });
    row.append(label, remove);
    els.photoList.appendChild(row);
  });
  if (state.photos.length === 0) {
    const empty = document.createElement("p");
    empty.className = "photo-empty";
    empty.textContent = "No photos yet — the cover uses the built-in Palm Bay sunset scene.";
    els.photoList.appendChild(empty);
  }
}

function activePhoto() {
  return state.photos[state.activePhotoIndex] || null;
}

function syncPhotoSliders() {
  const photo = activePhoto();
  const disabled = !photo;
  for (const slider of [els.zoomRange, els.focusXRange, els.focusYRange]) slider.disabled = disabled;
  if (photo) {
    els.zoomRange.value = String(photo.zoom);
    els.focusXRange.value = String(photo.focusX);
    els.focusYRange.value = String(photo.focusY);
  }
}

function bindControls() {
  els.titleInput.addEventListener("input", () => { state.title = els.titleInput.value; scheduleRender(); });
  els.subtitleInput.addEventListener("input", () => { state.subtitle = els.subtitleInput.value; scheduleRender(); });
  els.layoutSelect.addEventListener("change", () => { state.layoutId = els.layoutSelect.value; scheduleRender(); });
  els.sizeSelect.addEventListener("change", () => { state.sizeId = els.sizeSelect.value; scheduleRender(); });
  els.gradeSelect.addEventListener("change", () => {
    state.gradeId = els.gradeSelect.value;
    const preset = GRADE_PRESETS.find((p) => p.id === state.gradeId);
    els.gradeBlurb.textContent = preset ? preset.blurb : "";
    scheduleRender();
  });
  els.fillModeSelect.addEventListener("change", () => { state.fillMode = els.fillModeSelect.value; scheduleRender(); });
  els.halftoneToggle.addEventListener("change", () => { state.halftone = els.halftoneToggle.checked; scheduleRender(); });
  els.stickerToggle.addEventListener("change", () => { state.showSticker = els.stickerToggle.checked; scheduleRender(); });
  els.stickerPriceInput.addEventListener("input", () => { state.stickerPrice = els.stickerPriceInput.value; scheduleRender(); });
  els.stickerNoteInput.addEventListener("input", () => { state.stickerNote = els.stickerNoteInput.value; scheduleRender(); });
  els.badgeToggle.addEventListener("change", () => { state.showBadge = els.badgeToggle.checked; scheduleRender(); });
  els.badgeTextInput.addEventListener("input", () => { state.badgeText = els.badgeTextInput.value; scheduleRender(); });

  els.photoInput.addEventListener("change", async () => {
    const files = Array.from(els.photoInput.files || []);
    for (const file of files) {
      try {
        const photo = await loadPhotoFile(file);
        state.photos.push(photo);
      } catch (error) {
        els.statusLine.textContent = error.message;
      }
    }
    state.activePhotoIndex = Math.max(0, state.photos.length - 1);
    els.photoInput.value = "";
    syncPhotoSliders();
    refreshPhotoList();
    scheduleRender();
  });

  els.zoomRange.addEventListener("input", () => {
    const photo = activePhoto(); if (!photo) return;
    photo.zoom = Number(els.zoomRange.value); scheduleRender();
  });
  els.focusXRange.addEventListener("input", () => {
    const photo = activePhoto(); if (!photo) return;
    photo.focusX = Number(els.focusXRange.value); scheduleRender();
  });
  els.focusYRange.addEventListener("input", () => {
    const photo = activePhoto(); if (!photo) return;
    photo.focusY = Number(els.focusYRange.value); scheduleRender();
  });

  els.sampleButtons.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-sample]");
    if (!button) return;
    button.disabled = true;
    try {
      const photo = await loadSamplePhoto(button.dataset.sample, button.dataset.label);
      state.photos.push(photo);
      state.activePhotoIndex = state.photos.length - 1;
      syncPhotoSliders();
      refreshPhotoList();
      scheduleRender();
    } catch (error) {
      els.statusLine.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  els.randomButton.addEventListener("click", () => {
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    state.layoutId = pick(PANEL_LAYOUTS).id;
    state.gradeId = pick(GRADE_PRESETS).id;
    els.layoutSelect.value = state.layoutId;
    els.gradeSelect.value = state.gradeId;
    const preset = GRADE_PRESETS.find((p) => p.id === state.gradeId);
    els.gradeBlurb.textContent = preset ? preset.blurb : "";
    scheduleRender();
  });

  els.exportButton.addEventListener("click", () => {
    renderCover(els.coverCanvas, state);
    const safeTitle = (state.title || "palm-bay-heat").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    exportCoverPng(els.coverCanvas, `${safeTitle}-${state.sizeId}.png`);
    els.statusLine.textContent = `Exported ${safeTitle}-${state.sizeId}.png`;
  });
}

function initialiseStudio() {
  grabElements();
  fillSelect(els.layoutSelect, PANEL_LAYOUTS, state.layoutId);
  fillSelect(els.sizeSelect, COVER_SIZES, state.sizeId);
  fillSelect(els.gradeSelect, GRADE_PRESETS, state.gradeId);
  const preset = GRADE_PRESETS.find((p) => p.id === state.gradeId);
  els.gradeBlurb.textContent = preset ? preset.blurb : "";
  bindControls();
  syncPhotoSliders();
  refreshPhotoList();
  scheduleRender();
}

document.addEventListener("DOMContentLoaded", initialiseStudio);
