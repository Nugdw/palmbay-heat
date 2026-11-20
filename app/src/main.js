// Palm Bay Heat editor: wires the controls to the cover renderer.
//
// Flow: the three sample photos load (or the maker adds their own), panels
// take photos by click, drags frame each photo inside its panel, and the
// Export button downloads the finished cover as a full-size PNG. A `?shot=`
// query switches the page for the maker's own screenshots: `shot=cover`
// shows only the finished cover edge to edge, `shot=editor` the studio.

import { COVER_LAYOUTS, POST_SIZES, freshPanelStates, layoutById, sizeById } from './panels.js';
import { clearGradeCache } from './grade.js';
import { coverFileName, renderCover } from './render.js';

const SAMPLE_PHOTOS = [
  { src: 'samples/hero.jpg', name: 'Hero — sunset boulevard' },
  { src: 'samples/boulevard.jpg', name: 'Boulevard — neon night' },
  { src: 'samples/pier.jpg', name: 'Pier — speedboat at dusk' },
];

const params = new URLSearchParams(location.search);
const stage = document.getElementById('stage');
const state = {
  layout: layoutById(params.get('layout') ?? 'heist'),
  size: sizeById(params.get('size') ?? 'portrait'),
  photos: [],
  panels: [],
  selected: 0,
  activePhoto: 0,
  title1: params.get('title1') ?? 'PALMBAY',
  title2: params.get('title2') ?? 'HEAT',
  caption: params.get('caption') ?? 'WELCOME TO LEONIDA',
  grade: Number(params.get('grade') ?? 70),
  forExport: false,
};

let photoSeq = 0;
function loadPhoto(src, name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ id: `photo-${photoSeq++}`, src, name, img });
    img.onerror = reject;
    img.src = src;
  });
}

function redraw() {
  renderCover(stage, state);
  const label = document.getElementById('panel-label');
  if (label) {
    const panel = state.layout.panels[state.selected];
    label.textContent = panel ? `Panel ${state.selected + 1} · ${panel.kind === 'art' ? `art (${panel.art})` : 'photo'}` : '—';
  }
}

function rebuildPanels() {
  state.panels = freshPanelStates(state.layout, state.photos.length);
  state.selected = 0;
}

function buildPhotoStrip() {
  const strip = document.getElementById('photo-strip');
  if (!strip) return;
  strip.replaceChildren();
  state.photos.forEach((photo, i) => {
    const thumb = document.createElement('img');
    thumb.src = photo.src;
    thumb.alt = photo.name;
    thumb.title = photo.name;
    if (i === state.activePhoto) thumb.className = 'active';
    thumb.addEventListener('click', () => {
      state.activePhoto = i;
      const framing = state.panels[state.selected];
      if (framing && state.layout.panels[state.selected].kind === 'photo') framing.photo = i;
      buildPhotoStrip();
      redraw();
    });
    strip.appendChild(thumb);
  });
}

function fillSelect(select, items, currentId) {
  if (!select) return;
  select.replaceChildren();
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.name ?? item.label;
    if (item.id === currentId) opt.selected = true;
    select.appendChild(opt);
  }
}

function panelAt(clientX, clientY) {
  const box = stage.getBoundingClientRect();
  const fx = (clientX - box.left) / box.width;
  const fy = (clientY - box.top) / box.height;
  return state.layout.panels.findIndex(
    (p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h,
  );
}

function wireEditor() {
  fillSelect(document.getElementById('layout-select'), COVER_LAYOUTS, state.layout.id);
  fillSelect(document.getElementById('size-select'), POST_SIZES, state.size.id);
  buildPhotoStrip();

  document.getElementById('layout-select').addEventListener('change', (e) => {
    state.layout = layoutById(e.target.value);
    rebuildPanels();
    redraw();
  });
  document.getElementById('size-select').addEventListener('change', (e) => {
    state.size = sizeById(e.target.value);
    redraw();
  });
  document.getElementById('title1-input').addEventListener('input', (e) => { state.title1 = e.target.value; redraw(); });
  document.getElementById('title2-input').addEventListener('input', (e) => { state.title2 = e.target.value; redraw(); });
  document.getElementById('caption-input').addEventListener('input', (e) => { state.caption = e.target.value; redraw(); });
  document.getElementById('grade-range').addEventListener('input', (e) => {
    state.grade = Number(e.target.value);
    clearGradeCache();
    redraw();
  });
  document.getElementById('zoom-range').addEventListener('input', (e) => {
    const framing = state.panels[state.selected];
    if (framing) framing.zoom = Number(e.target.value) / 100;
    redraw();
  });
  document.getElementById('photo-file').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      const url = URL.createObjectURL(file);
      state.photos.push(await loadPhoto(url, file.name));
    }
    buildPhotoStrip();
    redraw();
  });
  document.getElementById('export-button').addEventListener('click', () => {
    const out = document.createElement('canvas');
    renderCover(out, { ...state, forExport: true });
    out.toBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = coverFileName(state);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    }, 'image/png');
  });

  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    const hit = panelAt(e.clientX, e.clientY);
    if (hit < 0) return;
    state.selected = hit;
    const framing = state.panels[hit];
    if (state.layout.panels[hit].kind === 'photo' && framing) {
      drag = { x: e.clientX, y: e.clientY, panX: framing.panX, panY: framing.panY };
      stage.setPointerCapture(e.pointerId);
    }
    const zoom = document.getElementById('zoom-range');
    if (zoom && framing) zoom.value = String(Math.round(framing.zoom * 100));
    redraw();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const framing = state.panels[state.selected];
    const panel = state.layout.panels[state.selected];
    const box = stage.getBoundingClientRect();
    framing.panX = Math.max(-1, Math.min(1, drag.panX + ((e.clientX - drag.x) / box.width / panel.w) * 0.8));
    framing.panY = Math.max(-1, Math.min(1, drag.panY + ((e.clientY - drag.y) / box.height / panel.h) * 0.8));
    redraw();
  });
  stage.addEventListener('pointerup', () => { drag = null; });
  stage.addEventListener('wheel', (e) => {
    const framing = state.panels[state.selected];
    if (!framing || state.layout.panels[state.selected].kind !== 'photo') return;
    e.preventDefault();
    framing.zoom = Math.max(1, Math.min(3, framing.zoom * (e.deltaY < 0 ? 1.07 : 0.94)));
    const zoom = document.getElementById('zoom-range');
    if (zoom) zoom.value = String(Math.round(framing.zoom * 100));
    redraw();
  }, { passive: false });
}

// Screenshot mode: only the finished cover, at the exact pixel size asked
// for, so the maker's screenshots are the app's own drawing of the cover.
function enterCoverShotMode() {
  document.body.classList.add('cover-only');
  const shotStage = document.getElementById('shot-stage');
  shotStage.hidden = false;
  shotStage.appendChild(stage);
  const w = Number(params.get('w') ?? 1280);
  const h = Number(params.get('h') ?? 720);
  state.size = { id: 'shot', width: w, height: h };
  state.selected = -1;
  stage.style.width = `${w}px`;
  stage.style.height = `${h}px`;
}

async function boot() {
  state.photos = await Promise.all(SAMPLE_PHOTOS.map((s) => loadPhoto(s.src, s.name)));
  rebuildPanels();
  if (params.get('shot') === 'cover') {
    enterCoverShotMode();
  } else {
    wireEditor();
  }
  redraw();
  document.title = 'Palm Bay Heat — ready';
}

boot();
