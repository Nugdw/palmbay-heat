// Panel layouts for Palm Bay Heat covers.
//
// Every rectangle is a fraction of the finished cover, so one layout serves
// all three post sizes. A panel is either a photo panel (filled with one of
// the maker's photos, which they can pan and zoom) or an art panel (a drawn
// vector scene: a Leonida sunset or a neon bay night). The bold title block
// is drawn over the cover at `titleAt`, above a dark scrim.

export const POST_SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', width: 1080, height: 1350 },
  { id: 'landscape', label: 'Landscape · 1920 × 1080', width: 1920, height: 1080 },
];

export const COVER_LAYOUTS = [
  {
    id: 'heist',
    name: 'Heist Grid',
    titleAt: 'bottom',
    panels: [
      { x: 0.455, y: 0, w: 0.545, h: 0.775, kind: 'photo', photo: 0 },
      { x: 0, y: 0, w: 0.455, h: 0.335, kind: 'photo', photo: 1 },
      { x: 0, y: 0.335, w: 0.455, h: 0.255, kind: 'art', art: 'sunset' },
      { x: 0, y: 0.59, w: 0.455, h: 0.185, kind: 'photo', photo: 2 },
      { x: 0, y: 0.775, w: 1, h: 0.225, kind: 'photo', photo: 1, panY: -0.55 },
    ],
  },
  {
    id: 'marina',
    name: 'Marina Split',
    titleAt: 'bottom',
    panels: [
      { x: 0, y: 0, w: 0.58, h: 1, kind: 'photo', photo: 0 },
      { x: 0.58, y: 0, w: 0.42, h: 0.5, kind: 'photo', photo: 1 },
      { x: 0.58, y: 0.5, w: 0.42, h: 0.25, kind: 'art', art: 'neon' },
      { x: 0.58, y: 0.75, w: 0.42, h: 0.25, kind: 'photo', photo: 2 },
    ],
  },
  {
    id: 'quad',
    name: 'Quad Strip',
    titleAt: 'bottom',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.36, kind: 'photo', photo: 0 },
      { x: 0.5, y: 0, w: 0.5, h: 0.36, kind: 'art', art: 'sunset' },
      { x: 0, y: 0.36, w: 0.5, h: 0.36, kind: 'photo', photo: 1 },
      { x: 0.5, y: 0.36, w: 0.5, h: 0.36, kind: 'photo', photo: 2 },
      { x: 0, y: 0.72, w: 1, h: 0.28, kind: 'art', art: 'neon' },
    ],
  },
];

export function layoutById(id) {
  return COVER_LAYOUTS.find((layout) => layout.id === id) ?? COVER_LAYOUTS[0];
}

export function sizeById(id) {
  return POST_SIZES.find((size) => size.id === id) ?? POST_SIZES[0];
}

// Fresh per-panel editing state (which photo fills the panel, and how the
// photo is framed inside it) built from a layout's defaults.
export function freshPanelStates(layout, photoCount) {
  return layout.panels.map((panel) => ({
    photo: panel.kind === 'photo' ? Math.min(panel.photo, Math.max(0, photoCount - 1)) : -1,
    panX: panel.panX ?? 0,
    panY: panel.panY ?? 0,
    zoom: panel.zoom ?? 1,
  }));
}
