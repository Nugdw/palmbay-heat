// panels.js — panel layout definitions for Palm Bay Heat.
// Each layout is a list of panels in normalised poster coordinates
// (x, y, w, h in 0..1 fractions of the poster). Every panel names the
// sample scene it shows by default and a caption used in the UI.
// Pure data + tiny helpers; no DOM access here.

export const SAMPLES = [
  { id: "hero", label: "Sunset Boulevard", src: "samples/hero.jpg" },
  { id: "pier", label: "Neon Pier", src: "samples/pier.jpg" },
  { id: "boulevard", label: "Ocean Drive", src: "samples/boulevard.jpg" },
];

export const LAYOUTS = [
  {
    id: "classic",
    label: "Classic Collage",
    panels: [
      { sample: "hero", x: 0.0, y: 0.0, w: 0.62, h: 0.58 },
      { sample: "pier", x: 0.62, y: 0.0, w: 0.38, h: 0.34 },
      { sample: "boulevard", x: 0.62, y: 0.34, w: 0.38, h: 0.24 },
      { sample: "pier", x: 0.0, y: 0.58, w: 0.34, h: 0.42 },
      { sample: "boulevard", x: 0.34, y: 0.58, w: 0.33, h: 0.42 },
      { sample: "hero", x: 0.67, y: 0.58, w: 0.33, h: 0.42 },
    ],
  },
  {
    id: "triptych",
    label: "Vertical Triptych",
    panels: [
      { sample: "hero", x: 0.0, y: 0.0, w: 0.34, h: 1.0 },
      { sample: "pier", x: 0.34, y: 0.0, w: 0.33, h: 1.0 },
      { sample: "boulevard", x: 0.67, y: 0.0, w: 0.33, h: 1.0 },
    ],
  },
  {
    id: "hero-band",
    label: "Hero + Film Strip",
    panels: [
      { sample: "hero", x: 0.0, y: 0.0, w: 1.0, h: 0.68 },
      { sample: "pier", x: 0.0, y: 0.68, w: 0.34, h: 0.32 },
      { sample: "boulevard", x: 0.34, y: 0.68, w: 0.33, h: 0.32 },
      { sample: "hero", x: 0.67, y: 0.68, w: 0.33, h: 0.32 },
    ],
  },
  {
    id: "grid",
    label: "Four-Up Grid",
    panels: [
      { sample: "hero", x: 0.0, y: 0.0, w: 0.5, h: 0.5 },
      { sample: "pier", x: 0.5, y: 0.0, w: 0.5, h: 0.5 },
      { sample: "boulevard", x: 0.0, y: 0.5, w: 0.5, h: 0.5 },
      { sample: "pier", x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export function sampleById(id) {
  return SAMPLES.find((s) => s.id === id) || SAMPLES[0];
}
