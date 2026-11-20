// Palm Bay Heat — Leonida Cover Studio · hand-in builder
// Dependency-free Node program: copies app/ into out/, inventories every
// shipped file plus the screenshots, and writes a deterministic dossier.
// Run with: node main.ts
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const APP_TITLE = "Palm Bay Heat — Leonida Cover Studio";
const COMPETITION = "gta6-cover-art-01";
const rootDir = fileURLToPath(new URL(".", import.meta.url));
const appDir = join(rootDir, "app");
const shotsDir = join(rootDir, "screenshots");
const outDir = process.env.MAKEFUN_OUTPUT_DIR
  ? join(rootDir, process.env.MAKEFUN_OUTPUT_DIR)
  : join(rootDir, "out");

function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function listFilesRecursively(dir, baseDir) {
  const found = [];
  if (!existsSync(dir)) return found;
  const entries = readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFilesRecursively(full, baseDir));
    } else if (entry.isFile()) {
      found.push(relative(baseDir, full).split(sep).join("/"));
    }
  }
  return found;
}

function describeFile(baseDir, relPath) {
  const bytes = readFileSync(join(baseDir, relPath));
  return { path: relPath, size: bytes.length, sha256: sha256Hex(bytes) };
}

function buildDossier() {
  if (!existsSync(appDir)) throw new Error("app/ folder is missing");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(appDir, join(outDir, "app"), { recursive: true });

  const appFiles = listFilesRecursively(appDir, rootDir)
    .map((rel) => describeFile(rootDir, rel));
  const screenshots = listFilesRecursively(shotsDir, rootDir)
    .filter((rel) => /\.(jpe?g|png)$/i.test(rel))
    .map((rel) => describeFile(rootDir, rel));
  const shipped = listFilesRecursively(join(outDir, "app"), rootDir)
    .map((rel) => describeFile(rootDir, rel));

  const totalBytes = shipped.reduce((sum, f) => sum + f.size, 0);
  const dossier = {
    title: APP_TITLE,
    competition: COMPETITION,
    generatedBy: "main.ts (Palm Bay Heat hand-in builder)",
    deterministic: true,
    appFiles,
    screenshots,
    shippedFiles: shipped,
    totals: {
      appFileCount: appFiles.length,
      screenshotCount: screenshots.length,
      shippedFileCount: shipped.length,
      shippedBytes: totalBytes,
    },
  };
  const text = JSON.stringify(dossier, null, 2) + "\n";
  writeFileSync(join(outDir, "dossier.json"), text, "utf8");
  return dossier;
}

const dossier = buildDossier();
console.log(
  `${APP_TITLE}: shipped ${dossier.totals.shippedFileCount} files ` +
  `(${dossier.totals.shippedBytes} bytes), ${dossier.totals.screenshotCount} screenshots -> out/dossier.json`,
);
