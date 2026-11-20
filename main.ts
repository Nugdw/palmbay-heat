// Palm Bay Heat — Leonida Cover Studio: the hand-in program for
// make.fun's gta6-cover-art-01.
//
// The studio itself is the static site under app/ (open app/index.html in a
// browser; it runs fully offline). This program hands it in: it copies app/
// and screenshots/ into the output directory and writes dossier.json there
// with make.fun's vendored library, exactly as the bounty's scorer rebuilds
// it. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(repoDir, 'screenshots');
const shotNames = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => !name.startsWith('.')).sort()
  : [];
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error(`screenshots/: expected 3 or 4 renders of the studio, found ${shotNames.length}`);
}
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

// The caps are the scorer's own: passing them makes this program refuse an
// entry the scorer would refuse, instead of handing in a broken one.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log(`Palm Bay Heat handed in: app/ copied, ${shotNames.length} screenshots, dossier of ${dossier.length} bytes.`);
