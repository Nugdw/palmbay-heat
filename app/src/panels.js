// panels.js — panel layout definitions for Palm Bay Heat.
// Each layout is a list of panels in normalised 0..1 coordinates.
// A panel may carry a slant (degrees) for the classic angled-cut look,
// a tint name, and a focus hint used when no per-panel photo is set.
"use strict";

const PANEL_LAYOUTS = [
  {
    id: "collage-hero",
    name: "Collage Hero",
    blurb: "One tall hero on the left, three stacked scenes on the right.",
    panels: [
      { x: 0.00, y: 0.00, w: 0.52, h: 1.00, slant: 0,  tint: "none",   label: "Hero" },
      { x: 0.52, y: 0.00, w: 0.48, h: 0.34, slant: -4, tint: "warm",   label: "Chase" },
      { x: 0.52, y: 0.34, w: 0.48, h: 0.33, slant: 3,  tint: "teal",   label: "Beach" },
      { x: 0.52, y: 0.67, w: 0.48, h: 0.33, slant: -3, tint: "magenta", label: "Night" },
    ],
  },
  {
    id: "triptych-slant",
    name: "Triptych Slant",
    blurb: "Three bold angled columns, poster-style.",
    panels: [
      { x: 0.00, y: 0.00, w: 0.36, h: 1.00, slant: -5, tint: "warm",    label: "Left" },
      { x: 0.34, y: 0.00, w: 0.34, h: 1.00, slant: 0,  tint: "none",    label: "Centre" },
      { x: 0.66, y: 0.00, w: 0.34, h: 1.00, slant: 5,  tint: "teal",    label: "Right" },
    ],
  },
  {
    id: "grid-six",
    name: "Grid Six",
    blurb: "Six equal story panels in a 3 by 2 grid.",
    panels: [
      { x: 0.00, y: 0.00, w: 0.333, h: 0.50, slant: 0, tint: "warm",    label: "One" },
      { x: 0.333, y: 0.00, w: 0.334, h: 0.50, slant: 0, tint: "none",   label: "Two" },
      { x: 0.667, y: 0.00, w: 0.333, h: 0.50, slant: 0, tint: "teal",   label: "Three" },
      { x: 0.00, y: 0.50, w: 0.333, h: 0.50, slant: 0, tint: "teal",    label: "Four" },
      { x: 0.333, y: 0.50, w: 0.334, h: 0.50, slant: 0, tint: "magenta", label: "Five" },
      { x: 0.667, y: 0.50, w: 0.333, h: 0.50, slant: 0, tint: "warm",   label: "Six" },
    ],
  },
  {
    id: "widescreen-duo",
    name: "Widescreen Duo",
    blurb: "Two cinematic bands split by a diagonal seam.",
    panels: [
      { x: 0.00, y: 0.00, w: 1.00, h: 0.58, slant: -3, tint: "warm", label: "Skyline" },
      { x: 0.00, y: 0.55, w: 1.00, h: 0.45, slant: 2,  tint: "teal", label: "Street" },
    ],
  },
  {
    id: "magazine-five",
    name: "Magazine Five",
    blurb: "A centre portrait framed by four corner moments.",
    panels: [
      { x: 0.30, y: 0.08, w: 0.40, h: 0.84, slant: 0,  tint: "none",    label: "Star" },
      { x: 0.00, y: 0.00, w: 0.32, h: 0.50, slant: -4, tint: "warm",    label: "Top left" },
      { x: 0.68, y: 0.00, w: 0.32, h: 0.50, slant: 4,  tint: "magenta", label: "Top right" },
      { x: 0.00, y: 0.50, w: 0.32, h: 0.50, slant: 3,  tint: "teal",    label: "Bottom left" },
      { x: 0.68, y: 0.50, w: 0.32, h: 0.50, slant: -3, tint: "warm",   label: "Bottom right" },
    ],
  },
];

function getPanelLayout(id) {
  return PANEL_LAYOUTS.find((layout) => layout.id === id) || PANEL_LAYOUTS[0];
}

// Cover output sizes for common post formats.
const COVER_SIZES = [
  { id: "landscape", name: "Landscape 1920 × 1080", width: 1920, height: 1080 },
  { id: "portrait", name: "Portrait 1080 × 1350", width: 1080, height: 1350 },
  { id: "square", name: "Square 1080 × 1080", width: 1080, height: 1080 },
];

function getCoverSize(id) {
  return COVER_SIZES.find((size) => size.id === id) || COVER_SIZES[0];
}

window.PalmBayPanels = { PANEL_LAYOUTS, COVER_SIZES, getPanelLayout, getCoverSize };
