// DealBeacon entry program (Node 22, standard library only).
//
// It hands the static site in: copies this repository's app/ and
// screenshots/ into the output directory and writes dossier.json there,
// the summary the entry system reads, using the vendored library.
//
// The grader runs this program twice in a read-only working directory, so
// every write goes to the output directory (or MAKEFUN_OUTPUT_DIR outside
// the grader); nothing is written next to this file.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The output directory is the only writable place the grader guarantees.
mkdirSync(outDir, { recursive: true });

// Copy the whole static site, then the screenshots, exactly as shipped.
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });

const shotsDir = join(repoRoot, "screenshots");
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });
}

// Refuse to hand in a site with no screenshots: the gate needs 3 or 4.
const shots = readdirSync(join(outDir, "screenshots")).filter((n) => !n.startsWith("."));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}

// buildDossier re-reads app/ and screenshots/ from the output directory and
// writes the dossier the entry system compares byte for byte with its own copy.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
