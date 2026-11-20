// grade.js — colour-grade presets for Palm Bay Heat.
// A grade is a plain recipe: CSS-filter style adjustments applied per panel
// image while drawing, plus an optional warm/cool tint overlay colour and
// a grain amount. render.js consumes these recipes; nothing here touches
// the DOM, so presets stay easy to add and unit-check in the console.

export const GRADES = [
  {
    id: "sunset",
    label: "Leonida Sunset",
    brightness: 1.06,
    contrast: 1.12,
    saturate: 1.35,
    hueRotate: -6,
    tint: "rgba(255, 122, 26, 0.14)",
    grain: 0.05,
  },
  {
    id: "neon",
    label: "Neon Nights",
    brightness: 0.98,
    contrast: 1.22,
    saturate: 1.55,
    hueRotate: 12,
    tint: "rgba(255, 0, 128, 0.10)",
    grain: 0.07,
  },
  {
    id: "golden",
    label: "Golden Hour",
    brightness: 1.12,
    contrast: 1.05,
    saturate: 1.2,
    hueRotate: -14,
    tint: "rgba(255, 190, 60, 0.16)",
    grain: 0.04,
  },
  {
    id: "noir",
    label: "Midnight Noir",
    brightness: 0.9,
    contrast: 1.3,
    saturate: 0.55,
    hueRotate: 0,
    tint: "rgba(20, 40, 90, 0.18)",
    grain: 0.1,
  },
  {
    id: "clean",
    label: "Clean Print",
    brightness: 1.0,
    contrast: 1.0,
    saturate: 1.0,
    hueRotate: 0,
    tint: "rgba(0, 0, 0, 0)",
    grain: 0.0,
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// Build the canvas filter string for a grade recipe.
export function filterString(grade) {
  return (
    `brightness(${grade.brightness}) contrast(${grade.contrast}) ` +
    `saturate(${grade.saturate}) hue-rotate(${grade.hueRotate}deg)`
  );
}
