// Renders a low-res preview MP4 and the poster (final frame) for one or all compositions.
// Usage: node scripts/render-preview.mjs [compositionId ...]
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const COMPS = {
  'region1-community-calendar': 360,
  'region2-create-event': 744,
};
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(COMPS);
mkdirSync('out', { recursive: true });
for (const id of ids) {
  const last = COMPS[id] - 1;
  const run = (args) => execFileSync('npx', ['remotion', ...args], { stdio: 'inherit' });
  run(['render', 'src/index.ts', id, `out/${id}--preview.mp4`, '--scale=0.5', '--crf=30', '--codec=h264', '--muted']);
  run(['still', 'src/index.ts', id, `out/${id}--poster.png`, `--frame=${last}`]);
}
