# palmbay-heat

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Nugdw/palmbay-heat/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Nugdw/palmbay-heat/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Palm Bay Heat — Leonida Cover Studio** is a free, offline web app that turns
your own photos into a multi-panel cover poster in the spirit of a big
open-world crime game's box art: a collage of framed moments — a hero shot,
street scenes, a portrait — separated by hard white gutters, washed in a
neon-sunset colour grade, and lettered with one huge title. When it looks
right, one click exports a full-resolution PNG ready to share.

Palm Bay and Leonida are fictional places invented for this app. Every part
of the cover — the panel collage, the grades, the lettering, the stickers —
is drawn by the app's own canvas code. No Rockstar Games artwork, logo or
font is used, and no photo ever leaves your machine.

## What it does

- **Any photos, every panel.** Load one photo or a whole afternoon's worth;
  they cycle across the panels with per-panel focal points and a zoom
  control. With no photos loaded, each panel falls back to a built-in
  procedural Leonida sunset scene (sky, sun, sea, skyline, palms), so the
  studio works the moment it opens.
- **Six panel layouts.** Classic Six (hero over a story grid), Diagonal Heat
  (slanted action blades), Portrait Star (tall centre portrait), Story Strip
  (film-strip stack), Quad Vice (2×2 postcards) and Single Icon (full bleed).
- **Six colour grades.** Neon Sunset, Vice Dusk, Tropical Noon, Midnight Run,
  Golden Hour and Mono Heat — each a full finish of filter, colour wash,
  grain and vignette, with its own title ink colours.
- **Real cover lettering.** A two-line title that auto-fits its width, a
  letter-spaced subtitle, a bottom caption bar, a starburst price sticker
  and a rating badge — all editable, all optional.
- **Three poster sizes.** Poster 2:3 (1080×1620), Portrait 4:5 (1080×1350)
  and Square 1:1 (1080×1080), exported as PNG at full resolution. The preview
  on screen is rendered by exactly the same code as the export.
- **Private by construction.** Plain static files, no build step, no
  accounts, no uploads, no network calls. Serve the `app/` folder with any
  static file server — or just open `app/index.html` — and start making
  covers.

## Run it

```sh
node main.ts
```

That hand-in command copies `app/` and `screenshots/` into `out/` and writes
`out/dossier.json`, a deterministic inventory of the entry (every file's
path, size and SHA-256, plus the app's title). To use the studio itself,
serve the app folder and open it in a desktop browser:

```sh
cd app && python3 -m http.server 8080   # then open http://localhost:8080
```

## Layout of this repository

- `main.ts` — the hand-in program (Node standard library only).
- `app/index.html`, `app/style.css` — the studio page and its styling.
- `app/src/panels.js` — the six panel-layout definitions.
- `app/src/grade.js` — the six colour-grade presets.
- `app/src/render.js` — the canvas renderer: collage, grades, lettering,
  stickers, grain, vignette, the built-in sunset scenes and PNG export.
- `app/src/main.js` — the UI controller: photo loading, pickers, sliders.
- `app/samples/` — bundled sample photos for trying the studio at once.
- `screenshots/` — screenshots of the studio and the covers it exports.
- `vendor/makefun-app.ts` — the vendored make.fun hand-in library from the
  competition kit.

## License

MIT — see `LICENSE`.

---

Entered on [make.fun](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
