# palmbay-heat

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Nugdw/palmbay-heat/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Nugdw/palmbay-heat/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Palm Bay Heat — Leonida Cover Studio** turns your own photos into bold, multi-panel cover art in the spirit of a sun-drenched crime poster for the fictional state of Leonida. Load one photo and stretch it across every panel, or load several and cycle them panel by panel. Angle-cut panels, a painted sunset fallback scene, per-pixel colour grades, halftone print texture, stacked display lettering you can rewrite, a starburst price sticker and a corner badge — then export a finished PNG in landscape (1920 × 1080), portrait (1080 × 1350) or square (1080 × 1080).

Everything is original: the lettering is drawn with system fonts, the palms and sunset are painted on canvas at render time, and no third-party artwork, logos or fonts are used. The app is plain HTML, CSS and vanilla JavaScript with no build step and no network calls — your photos never leave the page.

## What it does

- **Five panel layouts** — Collage Hero, Triptych Slant, Grid Six, Widescreen Duo and Magazine Five, each with its own angled cuts and per-panel tints.
- **Any photo, positioned your way** — upload multiple photos, then zoom and slide the focus point of the active photo until the crop sits right.
- **Six colour grades** — Leonida Sunset, Neon Nights, Golden Hour, Vice Teal, Print Poster and Clean, applied per pixel before compositing.
- **Editable cover furniture** — title, subtitle, price sticker, sticker note and corner badge are all live text fields.
- **One-click PNG export** at the three common post sizes, plus a “Surprise me” shuffle for layout and grade.

## Run it

```sh
node main.ts
```

That copies `app/` into `out/` and writes `out/dossier.json`, a deterministic inventory (file names, sizes and SHA-256 hashes) of everything shipped. To use the studio itself, serve the `app/` folder with any static file server — or simply open `app/index.html` in a desktop browser.

## Layout of this repository

- `main.ts` — dependency-free hand-in builder that produces `out/dossier.json`.
- `app/index.html` + `app/style.css` — the studio page and its sunset theme.
- `app/src/panels.js` — panel layout and cover-size definitions.
- `app/src/grade.js` — colour grade presets and the per-pixel grade applier.
- `app/src/render.js` — canvas rendering: panels, fallback scene, lettering, sticker and badge.
- `app/src/main.js` — the UI controller wiring controls, photos and export together.
- `app/samples/` — sample scenes bundled with the studio.
- `screenshots/` — covers and editor views captured from this build.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
