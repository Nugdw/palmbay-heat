// Palm Bay Heat — UI controller.
//
// Wires the control panel to the renderer: photo loading (file picker, drag
// and drop, bundled samples), the layout / grade / format pickers built from
// panels.js and grade.js data, the lettering and sticker fields, the finish
// sliders, and PNG export. All state lives in one object; every change asks
// for a single redraw on the next animation frame, so dragging a slider
// never queues a pile of full-size renders.

(function () {
  'use strict';

  var PBH = window.PBH;

  var state = {
    layoutId: 'classic-six',
    gradeId: 'neon-sunset',
    formatId: 'poster',
    images: [],
    shift: 0,
    title: 'PALM BAY\nHEAT',
    subtitle: 'Welcome back to Leonida',
    caption: 'One city. Two lives. No brakes.',
    priceOn: true,
    priceText: '$69.99',
    badgeOn: true,
    badgeText: '18+',
    zoom: 1,
    gutter: 10,
    titleScale: 1,
  };

  function $(id) { return document.getElementById(id); }

  var canvas = $('coverCanvas');
  var statusLine = $('statusLine');

  function setStatus(text) {
    if (statusLine) statusLine.textContent = text;
  }

  // ------------------------------------------------------------- rendering

  var redrawQueued = false;
  function requestRedraw() {
    if (redrawQueued) return;
    redrawQueued = true;
    requestAnimationFrame(function () {
      redrawQueued = false;
      PBH.drawCover(canvas, state);
    });
  }

  // -------------------------------------------------------------- photos

  var objectUrls = [];

  function refreshPhotoStrip() {
    var strip = $('photoStrip');
    strip.innerHTML = '';
    state.images.forEach(function (img, i) {
      var thumb = document.createElement('img');
      thumb.src = img.src;
      thumb.alt = 'Loaded photo ' + (i + 1);
      thumb.title = 'Photo ' + (i + 1);
      strip.appendChild(thumb);
    });
    var count = $('photoCount');
    if (state.images.length === 0) {
      count.textContent = 'No photos loaded — panels use the built-in Leonida sunset scenes.';
    } else if (state.images.length === 1) {
      count.textContent = '1 photo loaded — it fills every panel. Add more for a true collage.';
    } else {
      count.textContent = state.images.length + ' photos loaded — they cycle across the panels. Use Shuffle to rotate them.';
    }
  }

  function addImage(img) {
    state.images.push(img);
    refreshPhotoStrip();
    requestRedraw();
    setStatus(state.images.length + ' photo(s) on the cover. Looking good.');
  }

  function loadFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []).filter(function (f) {
      return f.type && f.type.indexOf('image/') === 0;
    });
    if (!files.length) {
      setStatus('No image files in that drop — try PNG or JPEG photos.');
      return;
    }
    files.forEach(function (file) {
      var url = URL.createObjectURL(file);
      objectUrls.push(url);
      var img = new Image();
      img.onload = function () { addImage(img); };
      img.onerror = function () { setStatus('Could not read ' + file.name + ' as an image.'); };
      img.src = url;
    });
  }

  function loadSample(name) {
    var img = new Image();
    img.onload = function () { addImage(img); };
    img.onerror = function () {
      setStatus('Sample "' + name + '" could not be loaded — serve the app over http or load your own photo.');
    };
    img.src = 'samples/' + name + '.jpg';
  }

  function clearPhotos() {
    state.images = [];
    objectUrls.forEach(function (u) { URL.revokeObjectURL(u); });
    objectUrls = [];
    refreshPhotoStrip();
    requestRedraw();
    setStatus('Back to the built-in sunset scenes. Drop photos any time.');
  }

  // -------------------------------------------------------------- pickers

  function buildPicker(containerId, items, currentId, onPick) {
    var box = $(containerId);
    box.innerHTML = '';
    items.forEach(function (item) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (item.id === currentId ? ' active' : '');
      btn.textContent = item.name;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', item.id === currentId ? 'true' : 'false');
      btn.addEventListener('click', function () { onPick(item); });
      box.appendChild(btn);
    });
  }

  function refreshPickers() {
    buildPicker('layoutList', PBH.LAYOUTS, state.layoutId, function (item) {
      state.layoutId = item.id;
      $('layoutBlurb').textContent = item.blurb;
      refreshPickers();
      requestRedraw();
    });
    buildPicker('gradeList', PBH.GRADES, state.gradeId, function (item) {
      state.gradeId = item.id;
      $('gradeBlurb').textContent = item.blurb;
      refreshPickers();
      requestRedraw();
    });
    buildPicker('formatList', PBH.FORMATS, state.formatId, function (item) {
      state.formatId = item.id;
      refreshPickers();
      requestRedraw();
      setStatus('Poster size: ' + item.name + ' (' + item.w + ' × ' + item.h + ' px export).');
    });
    $('layoutBlurb').textContent = PBH.getLayout(state.layoutId).blurb;
    $('gradeBlurb').textContent = PBH.getGrade(state.gradeId).blurb;
  }

  // -------------------------------------------------------------- events

  function bindText(id, key) {
    $(id).addEventListener('input', function (ev) {
      state[key] = ev.target.value;
      requestRedraw();
    });
  }

  function init() {
    var fileInput = $('fileInput');
    fileInput.addEventListener('change', function () {
      loadFiles(fileInput.files);
      fileInput.value = '';
    });

    var dropzone = $('dropzone');
    ['dragenter', 'dragover'].forEach(function (name) {
      dropzone.addEventListener(name, function (ev) {
        ev.preventDefault();
        dropzone.classList.add('dragging');
      });
    });
    ['dragleave', 'drop'].forEach(function (name) {
      dropzone.addEventListener(name, function (ev) {
        ev.preventDefault();
        dropzone.classList.remove('dragging');
      });
    });
    dropzone.addEventListener('drop', function (ev) {
      if (ev.dataTransfer) loadFiles(ev.dataTransfer.files);
    });

    $('sampleHero').addEventListener('click', function () { loadSample('hero'); });
    $('samplePier').addEventListener('click', function () { loadSample('pier'); });
    $('sampleBoulevard').addEventListener('click', function () { loadSample('boulevard'); });
    $('clearPhotos').addEventListener('click', clearPhotos);

    bindText('titleInput', 'title');
    bindText('subtitleInput', 'subtitle');
    bindText('captionInput', 'caption');
    bindText('priceText', 'priceText');
    bindText('badgeText', 'badgeText');

    $('priceOn').addEventListener('change', function (ev) {
      state.priceOn = ev.target.checked;
      requestRedraw();
    });
    $('badgeOn').addEventListener('change', function (ev) {
      state.badgeOn = ev.target.checked;
      requestRedraw();
    });

    $('zoomRange').addEventListener('input', function (ev) {
      state.zoom = parseFloat(ev.target.value) || 1;
      requestRedraw();
    });
    $('gutterRange').addEventListener('input', function (ev) {
      state.gutter = parseInt(ev.target.value, 10) || 0;
      requestRedraw();
    });
    $('titleRange').addEventListener('input', function (ev) {
      state.titleScale = parseFloat(ev.target.value) || 1;
      requestRedraw();
    });

    $('shuffleBtn').addEventListener('click', function () {
      state.shift += 1;
      requestRedraw();
      setStatus('Photos rotated across the panels.');
    });

    $('surpriseBtn').addEventListener('click', function () {
      var layout = PBH.LAYOUTS[Math.floor(Math.random() * PBH.LAYOUTS.length)];
      var grade = PBH.GRADES[Math.floor(Math.random() * PBH.GRADES.length)];
      state.layoutId = layout.id;
      state.gradeId = grade.id;
      state.shift = Math.floor(Math.random() * 6);
      refreshPickers();
      requestRedraw();
      setStatus('Surprise combo: ' + layout.name + ' layout with the ' + grade.name + ' grade.');
    });

    function doExport() {
      var slug = (state.title || 'palm-bay-heat')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'palm-bay-heat';
      PBH.exportPNG(state, slug + '-cover.png');
      setStatus('Exported a full-resolution PNG. Share it anywhere.');
    }
    $('exportBtn').addEventListener('click', doExport);
    $('exportTop').addEventListener('click', doExport);

    refreshPickers();
    refreshPhotoStrip();
    requestRedraw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
