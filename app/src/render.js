// Palm Bay Heat — canvas renderer.
//
// Everything the poster is, is drawn here: the panel collage with hard white
// gutters, a colour grade over every photograph, the big lettered title, the
// price sticker and rating badge, and the grain-and-vignette finish. The
// renderer is pure canvas 2D — no libraries — and works the same for the
// on-screen preview and the exported PNG, because both call drawCover().
//
// When the user has not loaded a photograph, panels are filled with a
// procedural Leonida sunset scene (makeSceneCanvas): sky, sun, sea, skyline
// and palm silhouettes, drawn from a seeded random generator so a given
// panel looks the same on every render and every export.

(function () {
  'use strict';

  var PBH = (window.PBH = window.PBH || {});

  PBH.FORMATS = [
    { id: 'poster', name: 'Poster 2:3', w: 1080, h: 1620 },
    { id: 'portrait', name: 'Portrait 4:5', w: 1080, h: 1350 },
    { id: 'square', name: 'Square 1:1', w: 1080, h: 1080 },
  ];

  PBH.getFormat = function (id) {
    for (var i = 0; i < PBH.FORMATS.length; i++) {
      if (PBH.FORMATS[i].id === id) return PBH.FORMATS[i];
    }
    return PBH.FORMATS[0];
  };

  // ---------------------------------------------------------------- scenes

  // Small deterministic PRNG (mulberry32) so scenes are stable per variant.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var SCENE_SKIES = [
    ['#2b1055', '#7597de', '#ff6e7f', '#feb47b'],
    ['#0f2027', '#2c5364', '#f7971e', '#ffd200'],
    ['#3a1c71', '#d76d77', '#ffaf7b', '#ffe3a3'],
    ['#141e30', '#243b55', '#c94b4b', '#f09819'],
    ['#42275a', '#734b6d', '#ff9966', '#ff5e62'],
    ['#000428', '#004e92', '#ff512f', '#dd2476'],
  ];

  function drawPalm(ctx, x, y, s, lean, rand) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    ctx.strokeStyle = 'rgba(12, 6, 20, 0.92)';
    ctx.fillStyle = 'rgba(12, 6, 20, 0.92)';
    ctx.lineCap = 'round';
    // Trunk: a tapering curve built from stacked segments.
    var bend = (rand() - 0.5) * 0.5 * s;
    ctx.lineWidth = 0.09 * s;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(bend * 0.4, -0.55 * s, bend, -1.05 * s);
    ctx.stroke();
    // Fronds: seven arcs drooping from the crown.
    var cx = bend, cy = -1.05 * s;
    for (var i = 0; i < 7; i++) {
      var ang = Math.PI * (0.08 + (i / 6) * 0.84);
      var len = s * (0.52 + rand() * 0.22);
      var dx = Math.cos(ang) * len;
      var dy = -Math.sin(ang) * len * 0.55 + len * 0.34;
      ctx.lineWidth = 0.035 * s;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + dx * 0.5, cy - len * 0.28, cx + dx, cy + dy);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx - 0.06 * s, cy + 0.05 * s, 0.055 * s, 0, Math.PI * 2);
    ctx.arc(cx + 0.07 * s, cy + 0.07 * s, 0.045 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // A complete little sunset scene on its own canvas. `variant` picks the
  // palette and the skyline so neighbouring panels never look identical.
  PBH.makeSceneCanvas = function (variant, w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(w));
    c.height = Math.max(2, Math.round(h));
    var ctx = c.getContext('2d');
    var rand = rng(1234 + variant * 777);
    var sky = SCENE_SKIES[variant % SCENE_SKIES.length];

    var horizon = h * (0.58 + rand() * 0.08);
    var grad = ctx.createLinearGradient(0, 0, 0, horizon);
    grad.addColorStop(0, sky[0]);
    grad.addColorStop(0.45, sky[1]);
    grad.addColorStop(0.8, sky[2]);
    grad.addColorStop(1, sky[3]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, horizon + 1);

    // Sun: a big disc with two retro cut stripes near its base.
    var sunR = Math.min(w, h) * (0.20 + rand() * 0.08);
    var sunX = w * (0.3 + rand() * 0.4);
    var sunY = horizon - sunR * 0.35;
    var sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
    sunGrad.addColorStop(0, '#fff3b0');
    sunGrad.addColorStop(1, '#ff7518');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sky[2];
    ctx.fillRect(sunX - sunR, sunY + sunR * 0.28, sunR * 2, sunR * 0.07);
    ctx.fillRect(sunX - sunR, sunY + sunR * 0.52, sunR * 2, sunR * 0.1);

    // Sea: darker band with a broken reflection of the sun.
    var sea = ctx.createLinearGradient(0, horizon, 0, h);
    sea.addColorStop(0, sky[2]);
    sea.addColorStop(0.25, sky[1]);
    sea.addColorStop(1, sky[0]);
    ctx.fillStyle = sea;
    ctx.fillRect(0, horizon, w, h - horizon);
    ctx.fillStyle = 'rgba(255, 220, 150, 0.5)';
    for (var i = 0; i < 26; i++) {
      var ry = horizon + rand() * (h - horizon) * 0.7;
      var rw = sunR * (0.25 + rand() * 0.9) * (1 - (ry - horizon) / (h - horizon));
      ctx.fillRect(sunX - rw / 2 + (rand() - 0.5) * 14, ry, rw, 2.5);
    }

    // Skyline silhouette along the horizon.
    ctx.fillStyle = 'rgba(10, 5, 24, 0.9)';
    var bx = -10;
    while (bx < w + 10) {
      var bw = w * (0.05 + rand() * 0.09);
      var bh = h * (0.08 + rand() * 0.22);
      ctx.fillRect(bx, horizon - bh, bw, bh);
      if (rand() > 0.6) ctx.fillRect(bx + bw * 0.35, horizon - bh - h * 0.03, bw * 0.3, h * 0.03);
      bx += bw + w * 0.012;
    }

    // Palms in the foreground corners.
    drawPalm(ctx, w * 0.10, h * 1.0, h * 0.42, 0.06, rand);
    drawPalm(ctx, w * 0.93, h * 1.0, h * 0.34, -0.09, rand);
    if (w > h * 0.9) drawPalm(ctx, w * 0.78, h * 1.02, h * 0.26, -0.04, rand);

    // Two birds, because every sunset deserves them.
    ctx.strokeStyle = 'rgba(10, 5, 24, 0.75)';
    ctx.lineWidth = Math.max(2, h * 0.004);
    for (var b = 0; b < 3; b++) {
      var px = w * (0.15 + rand() * 0.6), py = h * (0.1 + rand() * 0.2), s = w * 0.02;
      ctx.beginPath();
      ctx.moveTo(px - s, py);
      ctx.quadraticCurveTo(px - s * 0.4, py - s * 0.7, px, py);
      ctx.quadraticCurveTo(px + s * 0.4, py - s * 0.7, px + s, py);
      ctx.stroke();
    }
    return c;
  };

  // ---------------------------------------------------------------- panels

  function panelPath(ctx, panel, W, H) {
    ctx.beginPath();
    if (panel.kind === 'rect') {
      ctx.rect(panel.x * W, panel.y * H, panel.w * W, panel.h * H);
    } else {
      panel.points.forEach(function (p, i) {
        if (i === 0) ctx.moveTo(p[0] * W, p[1] * H);
        else ctx.lineTo(p[0] * W, p[1] * H);
      });
      ctx.closePath();
    }
  }

  // Draw an image so it covers the box completely (CSS "cover" semantics),
  // centred on a focal point, with a user zoom multiplier on top.
  function drawCoverFit(ctx, img, bx, by, bw, bh, zoom, focusX, focusY) {
    var iw = img.width || img.naturalWidth;
    var ih = img.height || img.naturalHeight;
    if (!iw || !ih) return;
    var scale = Math.max(bw / iw, bh / ih) * (zoom || 1);
    var dw = iw * scale, dh = ih * scale;
    var dx = bx + (bw - dw) * (focusX == null ? 0.5 : focusX);
    var dy = by + (bh - dh) * (focusY == null ? 0.5 : focusY);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  var FOCAL_POINTS = [
    [0.5, 0.42], [0.38, 0.5], [0.62, 0.45], [0.5, 0.6], [0.45, 0.38], [0.55, 0.55],
  ];

  // ---------------------------------------------------------------- letters

  function fitFont(ctx, text, weight, maxWidth, startSize, family) {
    var size = startSize;
    ctx.font = weight + ' ' + size + 'px ' + family;
    while (size > 12 && ctx.measureText(text).width > maxWidth) {
      size -= 4;
      ctx.font = weight + ' ' + size + 'px ' + family;
    }
    return size;
  }

  var TITLE_FONT = '"Arial Narrow", "Liberation Sans Narrow", Impact, "Helvetica Neue", sans-serif';
  var BODY_FONT = '"Helvetica Neue", Arial, sans-serif';

  function drawTitle(ctx, state, grade, W, H) {
    var title = (state.title || '').trim();
    var subtitle = (state.subtitle || '').trim();
    if (!title && !subtitle) return;

    // Scrim so the letters stay readable over bright panels.
    var scrimH = H * 0.30;
    var scrim = ctx.createLinearGradient(0, 0, 0, scrimH);
    scrim.addColorStop(0, 'rgba(5, 2, 12, 0.62)');
    scrim.addColorStop(1, 'rgba(5, 2, 12, 0)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, W, scrimH);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    var y = H * 0.075;
    if (subtitle) {
      ctx.font = '700 ' + Math.round(H * 0.026) + 'px ' + BODY_FONT;
      try { ctx.letterSpacing = Math.round(W * 0.012) + 'px'; } catch (e) { /* older canvas */ }
      ctx.fillStyle = grade.accent;
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = H * 0.008;
      ctx.shadowOffsetY = H * 0.004;
      ctx.fillText(subtitle.toUpperCase(), W / 2, y);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
      y += H * 0.028;
    }

    if (title) {
      var lines = title.toUpperCase().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      var base = H * 0.115 * (state.titleScale || 1);
      lines.forEach(function (line, idx) {
        var size = fitFont(ctx, line, '900', W * 0.92, base, TITLE_FONT);
        y += size * 0.98;
        var fill = ctx.createLinearGradient(0, y - size, 0, y);
        fill.addColorStop(0, grade.titleFill[0]);
        fill.addColorStop(1, grade.titleFill[1]);
        ctx.font = '900 ' + size + 'px ' + TITLE_FONT;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = grade.titleStroke;
        ctx.lineWidth = size * 0.14;
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = H * 0.012;
        ctx.shadowOffsetY = H * 0.008;
        ctx.strokeText(line, W / 2, y);
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = fill;
        ctx.fillText(line, W / 2, y);
        if (idx < lines.length - 1) y += size * 0.12;
      });
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  function drawCaption(ctx, state, grade, W, H) {
    var caption = (state.caption || '').trim();
    if (!caption) return;
    var barH = H * 0.052;
    ctx.fillStyle = 'rgba(6, 3, 14, 0.88)';
    ctx.fillRect(0, H - barH, W, barH);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, H - barH, W, Math.max(3, H * 0.004));
    ctx.font = '700 ' + Math.round(barH * 0.42) + 'px ' + BODY_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption.toUpperCase(), W / 2, H - barH / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }

  // --------------------------------------------------------------- stickers

  function drawPriceSticker(ctx, state, grade, W, H) {
    if (!state.priceOn) return;
    var cx = W * 0.865, cy = H * 0.335, r = W * 0.105;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.22);
    // Starburst disc.
    ctx.beginPath();
    var spikes = 18;
    for (var i = 0; i < spikes * 2; i++) {
      var ang = (i / (spikes * 2)) * Math.PI * 2;
      var rad = i % 2 === 0 ? r : r * 0.86;
      var px = Math.cos(ang) * rad, py = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = grade.accent;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = H * 0.01;
    ctx.shadowOffsetY = H * 0.006;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeStyle = 'rgba(6,3,14,0.85)';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8ec';
    ctx.fill();
    // Price lines: a small "ONLY" over the price itself.
    ctx.fillStyle = '#160a20';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 ' + Math.round(r * 0.30) + 'px ' + BODY_FONT;
    ctx.fillText('ONLY', 0, -r * 0.30);
    var price = (state.priceText || '').trim() || '$69.99';
    var size = fitFont(ctx, price, '900', r * 1.3, r * 0.52, TITLE_FONT);
    ctx.font = '900 ' + size + 'px ' + TITLE_FONT;
    ctx.fillText(price, 0, r * 0.14);
    ctx.font = '700 ' + Math.round(r * 0.20) + 'px ' + BODY_FONT;
    ctx.fillText('PALM BAY EDITION', 0, r * 0.44);
    ctx.restore();
  }

  function drawRatingBadge(ctx, state, W, H) {
    if (!state.badgeOn) return;
    var bw = W * 0.115, bh = bw * 1.28;
    var x = W * 0.035, y = H - bh - H * 0.085;
    ctx.save();
    ctx.fillStyle = '#f4f1ea';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = H * 0.008;
    ctx.fillRect(x, y, bw, bh);
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeStyle = '#14100c';
    ctx.strokeRect(x, y, bw, bh);
    ctx.fillStyle = '#14100c';
    ctx.textAlign = 'center';
    ctx.font = '900 ' + Math.round(bh * 0.40) + 'px ' + TITLE_FONT;
    ctx.textBaseline = 'middle';
    ctx.fillText((state.badgeText || '18+').trim() || '18+', x + bw / 2, y + bh * 0.36);
    ctx.font = '700 ' + Math.round(bh * 0.115) + 'px ' + BODY_FONT;
    ctx.fillText('PALM BAY', x + bw / 2, y + bh * 0.68);
    ctx.fillText('RATING BOARD', x + bw / 2, y + bh * 0.82);
    ctx.restore();
  }

  // ---------------------------------------------------------------- finish

  var grainTile = null;
  function getGrainTile() {
    if (grainTile) return grainTile;
    grainTile = document.createElement('canvas');
    grainTile.width = 160;
    grainTile.height = 160;
    var g = grainTile.getContext('2d');
    var img = g.createImageData(160, 160);
    var rand = rng(987654);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = Math.floor(rand() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return grainTile;
  }

  // A warm light leak bleeding in from the top-right corner, like sun
  // flare caught on film — kept subtle so it never fights the title.
  function drawLightLeak(ctx, grade, W, H) {
    var leak = ctx.createRadialGradient(
      W * 1.02, H * 0.02, 0,
      W * 1.02, H * 0.02, Math.max(W, H) * 0.62
    );
    leak.addColorStop(0, 'rgba(255, 176, 92, 0.30)');
    leak.addColorStop(0.45, 'rgba(255, 110, 94, 0.12)');
    leak.addColorStop(1, 'rgba(255, 110, 94, 0)');
    ctx.save();
    try { ctx.globalCompositeOperation = 'screen'; } catch (e) { /* ignore */ }
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // A thin accent hairline under the title zone ties the leak's colour
    // back to the grade's accent ink.
    ctx.fillStyle = grade.accent;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(0, H * 0.012, W, Math.max(2, H * 0.0022));
    ctx.globalAlpha = 1;
  }

  function drawFinish(ctx, grade, W, H) {
    // Colour wash: warm at the top, cool at the bottom.
    var wash = ctx.createLinearGradient(0, 0, 0, H);
    wash.addColorStop(0, grade.washTop);
    wash.addColorStop(1, grade.washBottom);
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    drawLightLeak(ctx, grade, W, H);

    // Grain.
    if (grade.grain > 0) {
      ctx.save();
      ctx.globalAlpha = grade.grain * 0.14;
      try { ctx.globalCompositeOperation = 'overlay'; } catch (e) { /* ignore */ }
      var pattern = ctx.createPattern(getGrainTile(), 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }

    // Vignette.
    if (grade.vignette > 0) {
      var vg = ctx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.42,
        W / 2, H / 2, Math.max(W, H) * 0.78
      );
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,' + (grade.vignette * 0.55).toFixed(3) + ')');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    // Outer frame line, like a printed poster's trim.
    ctx.lineWidth = Math.max(3, W * 0.006);
    ctx.strokeStyle = '#0b0614';
    ctx.strokeRect(0, 0, W, H);
  }

  // ----------------------------------------------------------------- main

  // Draw the complete cover described by `state` onto `canvas`.
  // state: { layoutId, gradeId, formatId, images, shift, title, subtitle,
  //          caption, priceOn, priceText, badgeOn, badgeText, zoom, gutter,
  //          titleScale }
  PBH.drawCover = function (canvas, state) {
    var format = PBH.getFormat(state.formatId);
    var layout = PBH.getLayout(state.layoutId);
    var grade = PBH.getGrade(state.gradeId);
    var W = format.w, H = format.h;
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b0614';
    ctx.fillRect(0, 0, W, H);

    var images = state.images || [];
    var shift = state.shift || 0;

    layout.panels.forEach(function (panel, i) {
      var b = PBH.panelBounds(panel);
      var bx = b.x * W, by = b.y * H, bw = b.w * W, bh = b.h * H;
      var source = images.length
        ? images[(i + shift) % images.length]
        : PBH.makeSceneCanvas(i + shift, Math.min(900, bw), Math.min(900, bh));
      ctx.save();
      panelPath(ctx, panel, W, H);
      ctx.clip();
      try { ctx.filter = grade.filter; } catch (e) { /* canvas filter unsupported */ }
      var focal = FOCAL_POINTS[i % FOCAL_POINTS.length];
      drawCoverFit(ctx, source, bx, by, bw, bh, state.zoom || 1, focal[0], focal[1]);
      try { ctx.filter = 'none'; } catch (e) { /* ignore */ }
      ctx.restore();
    });

    // White gutters: stroke every panel edge over the collage.
    var gutter = (state.gutter == null ? 10 : state.gutter) * (W / 1080);
    if (gutter > 0) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = gutter;
      ctx.lineJoin = 'miter';
      layout.panels.forEach(function (panel) {
        panelPath(ctx, panel, W, H);
        ctx.stroke();
      });
      ctx.restore();
    }

    drawFinish(ctx, grade, W, H);
    drawTitle(ctx, state, grade, W, H);
    drawCaption(ctx, state, grade, W, H);
    drawPriceSticker(ctx, state, grade, W, H);
    drawRatingBadge(ctx, state, W, H);
    return canvas;
  };

  // Render at full export size on a fresh canvas and download it as a PNG.
  PBH.exportPNG = function (state, filename) {
    var c = document.createElement('canvas');
    PBH.drawCover(c, state);
    var name = filename || 'palm-bay-heat-cover.png';
    if (c.toBlob) {
      c.toBlob(function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      }, 'image/png');
    } else {
      var a = document.createElement('a');
      a.href = c.toDataURL('image/png');
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };
})();
