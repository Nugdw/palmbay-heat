// Palm Bay Heat — Leonida Cover Studio: hand-in entry point.
// Dependency-free Node program. Copies app/ into out/, inventories every
// shipped file (name, byte size, sha256) plus any screenshots, and writes a
// deterministic out/dossier.json. Run with: node main.ts
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const APP_TITLE = "Palm Bay Heat — Leonida Cover Studio";
const root = dirname(fileURLToPath(import.meta.url));
const appDir = join(root, "app");
const outDir = join(root, "out");
const shotsDir = join(root, "screenshots");

function walk(dir) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}

function sha256Of(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function toPosix(p) {
  return p.split(sep).join("/");
}

// Copy the whole app tree into out/ so the hand-in is self-contained.
for (const file of walk(appDir)) {
  const dest = join(outDir, relative(appDir, file));
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(file, dest);
}
mkdirSync(outDir, { recursive: true });

// Inventory: app files (as shipped in out/) + screenshots at repo root.
// The dossier itself is excluded so repeated runs stay identical.
const inventory = [];
for (const file of [...walk(outDir), ...walk(shotsDir)]) {
  if (file === join(outDir, "dossier.json")) continue;
  inventory.push({
    path: toPosix(relative(root, file)),
    bytes: statSync(file).size,
    sha256: sha256Of(file),
  });
}
inventory.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

const dossier = {
  app: APP_TITLE,
  competition: "gta6-cover-art-01",
  fileCount: inventory.length,
  totalBytes: inventory.reduce((sum, f) => sum + f.bytes, 0),
  files: inventory,
};
writeFileSync(join(outDir, "dossier.json"), JSON.stringify(dossier, null, 2) + "\n");
console.log(
  `${APP_TITLE}: copied app/ to out/, inventoried ${dossier.fileCount} files (${dossier.totalBytes} bytes) -> out/dossier.json`,
);
