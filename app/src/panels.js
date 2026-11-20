// Palm Bay Heat — panel layout definitions.
//
// Every layout describes how the poster's art area is carved into panels, in
// the collage language of a big-city crime-game cover: one hero image, a few
// supporting scenes, hard white gutters between them, and a title that sits
// on top of the collage instead of inside any single panel.
//
// Coordinates are normalised to the full canvas (0..1 on both axes) so the
// same layout works at every export size. A panel is either a rectangle
// ({ x, y, w, h }) or a polygon ({ points: [[x, y], ...] }) for the slanted
// layouts. `focus` names the panel role so the renderer can give the hero
// panel the first (or the user-chosen) photograph.
//
// Plain script, no modules and no build step: everything hangs off the
// shared PBH namespace so the app also runs straight from a file:// open.

(function () {
  'use strict';

  var PBH = (window.PBH = window.PBH || {});

  // Small helpers so the layout tables below stay readable.
  function rect(x, y, w, h, role) {
    return { kind: 'rect', x: x, y: y, w: w, h: h, role: role || 'scene' };
  }
  function poly(points, role) {
    return { kind: 'poly', points: points, role: role || 'scene' };
  }

  PBH.LAYOUTS = [
    {
      id: 'classic-six',
      name: 'Classic Six',
      blurb: 'One wide hero shot over a five-panel story grid — the timeless cover collage.',
      panels: [
        rect(0.0, 0.0, 1.0, 0.46, 'hero'),
        rect(0.0, 0.46, 0.34, 0.27, 'scene'),
        rect(0.34, 0.46, 0.33, 0.27, 'scene'),
        rect(0.67, 0.46, 0.33, 0.27, 'scene'),
        rect(0.0, 0.73, 0.5, 0.27, 'scene'),
        rect(0.5, 0.73, 0.5, 0.27, 'scene'),
      ],
    },
    {
      id: 'diagonal-heat',
      name: 'Diagonal Heat',
      blurb: 'Slanted blades of action cutting across the poster, all speed and glare.',
      panels: [
        poly([[0, 0], [1, 0], [1, 0.34], [0, 0.52]], 'hero'),
        poly([[0, 0.52], [1, 0.34], [1, 0.62], [0, 0.78]], 'scene'),
        poly([[0, 0.78], [0.52, 0.68], [0.52, 1], [0, 1]], 'scene'),
        poly([[0.52, 0.68], [1, 0.62], [1, 1], [0.52, 1]], 'scene'),
      ],
    },
    {
      id: 'portrait-star',
      name: 'Portrait Star',
      blurb: 'A tall centre portrait flanked by two columns of supporting scenes.',
      panels: [
        rect(0.0, 0.0, 0.26, 0.5, 'scene'),
        rect(0.0, 0.5, 0.26, 0.5, 'scene'),
        rect(0.26, 0.0, 0.48, 1.0, 'hero'),
        rect(0.74, 0.0, 0.26, 0.5, 'scene'),
        rect(0.74, 0.5, 0.26, 0.5, 'scene'),
      ],
    },
    {
      id: 'story-strip',
      name: 'Story Strip',
      blurb: 'Four horizontal film strips stacked like frames from the trailer.',
      panels: [
        rect(0.0, 0.0, 1.0, 0.28, 'hero'),
        rect(0.0, 0.28, 1.0, 0.24, 'scene'),
        rect(0.0, 0.52, 1.0, 0.24, 'scene'),
        rect(0.0, 0.76, 1.0, 0.24, 'scene'),
      ],
    },
    {
      id: 'quad-vice',
      name: 'Quad Vice',
      blurb: 'A bold two-by-two grid — four postcards from the bay, no wasted space.',
      panels: [
        rect(0.0, 0.0, 0.5, 0.5, 'hero'),
        rect(0.5, 0.0, 0.5, 0.5, 'scene'),
        rect(0.0, 0.5, 0.5, 0.5, 'scene'),
        rect(0.5, 0.5, 0.5, 0.5, 'scene'),
      ],
    },
    {
      id: 'single-icon',
      name: 'Single Icon',
      blurb: 'One full-bleed image, poster-minimal: the photo does all the talking.',
      panels: [rect(0.0, 0.0, 1.0, 1.0, 'hero')],
    },
  ];

  PBH.getLayout = function (id) {
    for (var i = 0; i < PBH.LAYOUTS.length; i++) {
      if (PBH.LAYOUTS[i].id === id) return PBH.LAYOUTS[i];
    }
    return PBH.LAYOUTS[0];
  };

  // The bounding box of a panel in normalised coordinates; the renderer uses
  // it to fit photographs and to place per-panel focal points.
  PBH.panelBounds = function (panel) {
    if (panel.kind === 'rect') {
      return { x: panel.x, y: panel.y, w: panel.w, h: panel.h };
    }
    var minX = 1, minY = 1, maxX = 0, maxY = 0;
    panel.points.forEach(function (p) {
      minX = Math.min(minX, p[0]);
      minY = Math.min(minY, p[1]);
      maxX = Math.max(maxX, p[0]);
      maxY = Math.max(maxY, p[1]);
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  };
})();
