// Palm Bay Heat — Leonida Cover Studio: hand-in program for gta6-cover-art-01.
//
// Written from scratch for this entry. Node standard library only, no
// dependencies, no network access. Running `node main.ts` from the repository
// root does three things:
//
//   1. Copies the static web app in app/ into out/app/ (byte for byte).
//   2. Copies every screenshot in screenshots/ into out/screenshots/.
//   3. Writes out/dossier.json: a deterministic inventory of the handed-in
//      files — for each file its path, its size in bytes and its SHA-256 —
//      together with the application's title.
//
// The inventory is deterministic: file lists are sorted by path, the JSON is
// written with a fixed key order and a fixed indent, and no timestamp or
// machine-specific value is included, so two runs over the same tree produce
// a byte-identical dossier.json.
//
// MAKEFUN_OUTPUT_DIR, when set, replaces the default out/ directory.

import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_TITLE = 'Palm Bay Heat — Leonida Cover Studio';
const COMPETITION = 'gta6-cover-art-01';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR
  ? join(process.env.MAKEFUN_OUTPUT_DIR)
  : join(here, 'out');
const appSource = join(here, 'app');
const shotsSource = join(here, 'screenshots');

function sha256OfFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

// Recursively list every regular file under dir, as POSIX-style paths
// relative to the repository root, sorted so the order never depends on
// the filesystem's own directory order.
function listFiles(dir, root) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFiles(full, root));
    } else if (entry.isFile()) {
      found.push(relative(root, full).split(sep).join('/'));
    }
  }
  return found.sort();
}

function inventory(paths) {
  return paths.map((rel) => {
    const full = join(here, rel);
    return { path: rel, bytes: statSync(full).size, sha256: sha256OfFile(full) };
  });
}

function totalBytes(entries) {
  return entries.reduce((sum, entry) => sum + entry.bytes, 0);
}

function main() {
  if (!existsSync(join(appSource, 'index.html'))) {
    console.error('palm-bay-heat: app/index.html is missing; nothing to hand in');
    process.exitCode = 1;
    return;
  }

  // Start from a clean output directory so stale files from an earlier run
  // can never leak into the hand-in or its inventory.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  cpSync(appSource, join(outDir, 'app'), { recursive: true });
  const shotPaths = listFiles(shotsSource, here);
  if (shotPaths.length > 0) {
    cpSync(shotsSource, join(outDir, 'screenshots'), { recursive: true });
  }

  const appFiles = inventory(listFiles(appSource, here));
  const screenshots = inventory(shotPaths);

  const dossier = {
    title: APP_TITLE,
    competition: COMPETITION,
    format: 'palm-bay-heat/dossier v1',
    app: {
      entry: 'app/index.html',
      files: appFiles,
      fileCount: appFiles.length,
      totalBytes: totalBytes(appFiles),
    },
    screenshots: {
      files: screenshots,
      fileCount: screenshots.length,
      totalBytes: totalBytes(screenshots),
    },
  };

  writeFileSync(join(outDir, 'dossier.json'), JSON.stringify(dossier, null, 2) + '\n');

  console.log(
    `palm-bay-heat: handed in "${APP_TITLE}" — ${appFiles.length} app files ` +
      `(${totalBytes(appFiles)} bytes), ${screenshots.length} screenshots ` +
      `(${totalBytes(screenshots)} bytes) -> ${relative(here, outDir).split(sep).join('/')}/dossier.json`,
  );
}

main();
