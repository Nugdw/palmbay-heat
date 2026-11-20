// Palm Bay Heat — colour grade presets.
//
// A grade is data, not code: the canvas filter chain applied to every
// photograph, the warm/cool overlay wash laid over the whole collage, how
// much film grain and vignette the finish carries, and the ink colours the
// title is lettered in. The renderer (render.js) interprets the data, so
// adding a grade never means touching the drawing code.
//
// All names and looks are this studio's own — Leonida neon-sunset finishes
// described in plain colour terms.

(function () {
  'use strict';

  var PBH = (window.PBH = window.PBH || {});

  PBH.GRADES = [
    {
      id: 'neon-sunset',
      name: 'Neon Sunset',
      blurb: 'The signature look: hot coral sky, teal shadows, everything glowing.',
      filter: 'saturate(1.45) contrast(1.12) brightness(1.04) hue-rotate(-6deg)',
      washTop: 'rgba(255, 94, 58, 0.20)',
      washBottom: 'rgba(16, 92, 110, 0.26)',
      grain: 0.5,
      vignette: 0.42,
      titleFill: ['#ffe259', '#ff7518'],
      titleStroke: '#2b0a1e',
      accent: '#19e3c2',
    },
    {
      id: 'vice-dusk',
      name: 'Vice Dusk',
      blurb: 'Magenta and electric blue, half an hour after the sun goes down.',
      filter: 'saturate(1.3) contrast(1.18) brightness(0.98) hue-rotate(12deg)',
      washTop: 'rgba(214, 38, 150, 0.22)',
      washBottom: 'rgba(24, 32, 120, 0.30)',
      grain: 0.55,
      vignette: 0.5,
      titleFill: ['#ff9de2', '#7b2ff7'],
      titleStroke: '#160a2b',
      accent: '#37c6ff',
    },
    {
      id: 'tropical-noon',
      name: 'Tropical Noon',
      blurb: 'Bleached-bright midday: hard light, pale sky, colours like a postcard.',
      filter: 'saturate(1.15) contrast(1.02) brightness(1.16)',
      washTop: 'rgba(255, 236, 170, 0.16)',
      washBottom: 'rgba(64, 170, 160, 0.14)',
      grain: 0.3,
      vignette: 0.28,
      titleFill: ['#ffffff', '#ffd23f'],
      titleStroke: '#7a2d0c',
      accent: '#ff5964',
    },
    {
      id: 'midnight-run',
      name: 'Midnight Run',
      blurb: 'Deep blue night grade with sodium-lamp warmth kept in the highlights.',
      filter: 'saturate(0.95) contrast(1.24) brightness(0.86) hue-rotate(-14deg)',
      washTop: 'rgba(10, 16, 64, 0.34)',
      washBottom: 'rgba(2, 4, 18, 0.42)',
      grain: 0.7,
      vignette: 0.62,
      titleFill: ['#cfe8ff', '#4d7cff'],
      titleStroke: '#04060f',
      accent: '#ffb347',
    },
    {
      id: 'golden-hour',
      name: 'Golden Hour',
      blurb: 'Amber everything: long shadows, honey light, calm before the job.',
      filter: 'saturate(1.25) contrast(1.08) brightness(1.08) sepia(0.28)',
      washTop: 'rgba(255, 170, 40, 0.22)',
      washBottom: 'rgba(120, 52, 10, 0.24)',
      grain: 0.45,
      vignette: 0.45,
      titleFill: ['#fff3b0', '#e09f3e'],
      titleStroke: '#33150a',
      accent: '#9e2b25',
    },
    {
      id: 'mono-heat',
      name: 'Mono Heat',
      blurb: 'Near-black-and-white with a single red accent — the art-house cut.',
      filter: 'saturate(0.25) contrast(1.3) brightness(1.02)',
      washTop: 'rgba(30, 30, 34, 0.18)',
      washBottom: 'rgba(0, 0, 0, 0.30)',
      grain: 0.8,
      vignette: 0.55,
      titleFill: ['#ffffff', '#c9c9c9'],
      titleStroke: '#0a0a0a',
      accent: '#e5383b',
    },
  ];

  PBH.getGrade = function (id) {
    for (var i = 0; i < PBH.GRADES.length; i++) {
      if (PBH.GRADES[i].id === id) return PBH.GRADES[i];
    }
    return PBH.GRADES[0];
  };
})();
