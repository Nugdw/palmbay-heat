# Palm Bay Heat — Leonida Cover Studio

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounties/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Nugdw/palmbay-heat/rank.svg)](https://make.fun/bounties/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Nugdw/palmbay-heat/reward.svg)](https://make.fun/bounties/gta6-cover-art-01)

Entry for the [gta6-cover-art-01 bounty on make.fun](https://make.fun/bounties/gta6-cover-art-01).

## What it is

Palm Bay Heat is a browser cover studio set in fictional Leonida. It stacks
your photos — or the built-in sunset boulevard, neon pier, and ocean drive
scenes — into a multi-panel game cover in the classic collage style, then
finishes it with a big two-line title treatment, a starburst price sticker,
an age-rating badge, film grain, and a colour grade.

Everything runs client-side in vanilla JavaScript on a canvas. There is no
build step and no dependency to install: open `app/index.html` in a browser
and start stacking panels.

## Features

- Four panel layouts: Classic Collage (six panels), Vertical Triptych,
  Hero + Film Strip, and a Four-Up Grid.
- Five colour grades: Leonida Sunset, Neon Nights, Golden Hour,
  Midnight Noir, and Clean Print — each with its own filter recipe, tint,
  and grain level.
- Editable cover title and subtitle, a toggleable price sticker, and an
  18-rating badge drawn on every poster.
- Per-scene photo upload: swap any built-in scene for your own picture,
  or reset it back to stock.
- Three poster sizes (portrait 2:3, landscape 3:2, square 1:1) and a
  one-click PNG export at full resolution.

## Run it

Open `app/index.html` in any modern browser. Pick a layout, choose a grade,
type your title, and hit **Export PNG**.

## Hand-in check

```sh
node main.ts
```

This copies `app/` into `out/` and writes `out/dossier.json`, a
deterministic inventory of every shipped file and screenshot with byte
sizes and sha256 hashes. Running it twice produces an identical dossier.

## Layout of the repo

- `main.ts` — dependency-free Node hand-in program (copies the app, builds the dossier).
- `app/index.html`, `app/style.css` — the studio page and its sunset-neon theme.
- `app/src/panels.js` — panel layout and sample-scene definitions.
- `app/src/grade.js` — colour-grade presets.
- `app/src/render.js` — the canvas poster renderer (collage, title, sticker, grain).
- `app/src/main.js` — UI controller wiring controls to the renderer.
- `app/samples/` — built-in procedurally drawn Leonida scenes.
- `screenshots/` — cover renders in portrait, landscape-editor, and square forms.
- `tools/make_images.py` — the Pillow script that draws the sample scenes and screenshots.

## License

MIT — see `LICENSE`.
