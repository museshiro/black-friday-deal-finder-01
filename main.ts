// DealBeacon — Black Friday deal finder entry bot.
//
// Copies the static app (app/) and its screenshots (screenshots/) from
// beside this file into the output directory, then builds the entry
// dossier with the kit library and writes it to <output>/dossier.json.
// Node 22 standard library only. No network, no timers, no child
// processes, no async work. Every write goes to the output directory.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const here = fileURLToPath(new URL('.', import.meta.url));

// Recursively copy src into dest, replacing dest first so a stale output
// directory can never leak old files into the dossier. Entries are
// visited in code-unit order so the copy is deterministic.
function copyDir(src: string, dest: string): void {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src).sort()) {
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) copyDir(from, to);
    else cpSync(from, to);
  }
}

function countScreenshots(dir: string): number {
  return readdirSync(dir)
    .filter((name) => /\.(jpe?g|png)$/i.test(name))
    .filter((name) => statSync(join(dir, name)).isFile()).length;
}

const appSrc = join(here, 'app');
const shotsSrc = join(here, 'screenshots');
if (!existsSync(appSrc) || !statSync(appSrc).isDirectory()) {
  throw new Error(`main: no app/ directory beside main.ts (${appSrc})`);
}
if (!existsSync(shotsSrc) || !statSync(shotsSrc).isDirectory()) {
  throw new Error(`main: no screenshots/ directory beside main.ts (${shotsSrc})`);
}

mkdirSync(outDir, { recursive: true });
copyDir(appSrc, join(outDir, 'app'));
copyDir(shotsSrc, join(outDir, 'screenshots'));

const shots = countScreenshots(join(outDir, 'screenshots'));
if (shots < 3 || shots > 4) {
  throw new Error(`main: expected 3-4 screenshots in output, found ${shots}`);
}

const dossier = buildDossier(outDir, CAPS);
writeFileSync(join(outDir, 'dossier.json'), dossier);
// Success: app/, screenshots/ and dossier.json are all in the output dir.
