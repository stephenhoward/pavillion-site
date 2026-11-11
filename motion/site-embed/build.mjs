// Builds site-embed/steps-embed.tsx into the site's public/clips/steps.js.
// Usage (from motion/): node site-embed/build.mjs [--watch]
//
// At load time (motion/src is not edited) the clip's font setup is rewritten so it
// can't collide with the site's own 'Creato Display' faces (the site maps Bold.otf to
// 700; the app maps it to 600 and ExtraBold.otf to 700):
//   - family 'Creato Display' -> 'Pavillion App Creato' (tokens.ts, fonts.ts)
// Font and photo URLs need no rewrite: staticFile() resolves against the site root, and
// Remotion's public dir is the site's public/ (remotion.config.ts), so /fonts/ and
// /clips/images/ are the same files in the clip and on the page.
import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, '..', 'public', 'clips', 'steps.js');
const FAMILY = 'Pavillion App Creato';

/** Replace `from` in `src` exactly once, or fail the build. */
function swap(src, from, to, file) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`site-embed: expected one "${from}" in ${file}, found ${n}`);
  return src.replace(from, to);
}

const isolateFonts = {
  name: 'isolate-fonts',
  setup(build) {
    build.onLoad({ filter: /[\\/]src[\\/]theme[\\/](fonts|tokens)\.ts$/ }, async (args) => {
      let src = await readFile(args.path, 'utf8');
      if (args.path.endsWith('tokens.ts')) {
        src = swap(src, `"'Creato Display',`, `"'${FAMILY}',`, args.path);
      } else {
        src = swap(src, `new FontFace('Creato Display'`, `new FontFace('${FAMILY}'`, args.path);
      }
      return { contents: src, loader: 'ts' };
    });
  },
};

const options = {
  entryPoints: [join(HERE, 'steps-embed.tsx')],
  outfile: OUT,
  tsconfig: join(ROOT, 'tsconfig.json'),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  jsx: 'automatic',
  minify: true,
  legalComments: 'eof',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [isolateFonts],
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
