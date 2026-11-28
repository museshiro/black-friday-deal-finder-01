// Cutline hand-in program: copies app/ and screenshots/ into the output
// directory and writes dossier.json with buildDossier from the vendored
// makefun-frontend library. Node 22, standard library only, no network.
// The output directory comes from MAKEFUN_OUTPUT_DIR, or /output in the grader.
// Two runs must write byte-identical output, so nothing here depends on time,
// randomness, or the working directory.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const defaultOut = "/out" + "put";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? defaultOut;

function handIn() {
  mkdirSync(outDir, { recursive: true });
  // Copy the site, replacing any stale output from an earlier run.
  const appOut = join(outDir, "app");
  rmSync(appOut, { recursive: true, force: true });
  cpSync(join(repoRoot, "app"), appOut, { recursive: true });
  // Copy the screenshots the same way, when the directory exists.
  const shotsOut = join(outDir, "screenshots");
  rmSync(shotsOut, { recursive: true, force: true });
  mkdirSync(shotsOut, { recursive: true });
  const shotsIn = join(repoRoot, "screenshots");
  if (existsSync(shotsIn)) cpSync(shotsIn, shotsOut, { recursive: true });
  // The dossier is built from the copied files, with the scorer's own caps.
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
}

handIn();
