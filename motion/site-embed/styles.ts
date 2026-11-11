/**
 * Styles for site-embed/steps-embed.tsx, adapted from scroll-proto/index.html
 * to the site's tokens (with fallbacks). Everything is scoped under .pvs.
 */
export const CSS = String.raw`
.pvs { --pvs-bg: #F5F5F4; --pvs-ink: var(--color-stone-800, #292524); --pvs-muted: var(--color-stone-500, #78716C);
  --pvs-accent: var(--color-orange-500, #F97316); background: var(--pvs-bg); color: var(--pvs-ink); }
.pvs *, .pvs *::before, .pvs *::after { box-sizing: border-box; }

/* pinned: 4 viewport heights of pinned scroll, the stage sticks under the site nav.
   Desktop: step text on the left, clip on the right; the clip's height is capped at --pvs-clip-max. */
.pvs .pvs-pin { --pvs-top: 0px; --pvs-clip-max: 640px; position: relative; height: 500vh; height: 500svh; }
.pvs .pvs-stage { position: sticky; top: var(--pvs-top); height: calc(100vh - var(--pvs-top)); height: calc(100svh - var(--pvs-top));
  display: grid; grid-template-columns: minmax(0, 440px) auto; /* 440: room for the longest line (~417 px) on one line; narrower windows shrink this column, not the clip */
  grid-template-rows: 1fr auto 1fr; grid-template-areas: ". phone" "copy phone" ". phone";
  justify-content: center; column-gap: 56px; padding: 24px; }
/* the section heading is for screen readers only; each step's line is the visible text */
.pvs .pvs-vh { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.pvs .pvs-phone { grid-area: phone; align-self: center; height: min(calc(100svh - var(--pvs-top) - 48px), var(--pvs-clip-max)); aspect-ratio: 960 / 1008;
  max-width: calc(100vw - 380px - 56px - 48px); pointer-events: none; }
/* soften the crop's edges so the clip's background glow doesn't read as a box (sides as in scroll-proto; a short top/bottom fade added) */
.pvs .pvs-phone, .pvs .pvs-still {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent), linear-gradient(to bottom, transparent, #000 2%, #000 98%, transparent);
  -webkit-mask-composite: source-in;
  mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent), linear-gradient(to bottom, transparent, #000 2%, #000 98%, transparent);
  mask-composite: intersect; }
/* the clip renders against browser defaults, as in Remotion: nothing inherited from the page,
   and the site's global reset (margins, img/svg display, link colour) rolled back inside it */
.pvs .pvs-iso { all: initial; display: block; width: 100%; height: 100%; }
.pvs .pvs-iso * { margin: revert; padding: revert; }
.pvs .pvs-iso :is(img, svg) { display: revert; max-width: revert; }
.pvs .pvs-iso a { color: revert; text-decoration: revert; }
.pvs .pvs-copy { grid-area: copy; position: relative; }
.pvs .pvs-lines { display: grid; }
.pvs .pvs-lines .pvs-line { grid-area: 1 / 1; align-self: end; margin: 0; font-size: 2rem; line-height: 1.15; font-weight: 700; letter-spacing: -0.01em; color: var(--pvs-ink);
  opacity: 0; transform: translateY(8px); transition: opacity .25s ease, transform .25s ease; }
.pvs .pvs-lines .pvs-line[data-on="true"] { opacity: 1; transform: none; }
.pvs .pvs-below { display: grid; margin-top: 1rem; min-height: 1.5rem; }
.pvs .pvs-below > * { grid-area: 1 / 1; }
.pvs .pvs-cue { display: flex; align-items: center; gap: 6px; color: var(--pvs-muted); font-size: 0.875rem; font-weight: 500;
  letter-spacing: .04em; opacity: 0; transition: opacity .2s ease; }
.pvs .pvs-cue[data-on="true"] { opacity: 1; transition-duration: .5s; }
.pvs .pvs-cue[data-on="true"] svg { animation: pvs-cue-bob 1.4s ease-in-out infinite; }
@keyframes pvs-cue-bob { 0%, 100% { transform: translateY(-2px); } 50% { transform: translateY(3px); } }
.pvs .pvs-after { margin: 0; font-size: 1.0625rem; line-height: 1.5; color: var(--color-stone-600, #57534E);
  opacity: 0; transform: translateY(6px); transition: opacity .4s ease .15s, transform .4s ease .15s; }
.pvs .pvs-after[data-on="true"] { opacity: 1; transform: none; }
.pvs .pvs-meta { display: flex; align-items: baseline; gap: 14px; margin-top: 1rem; color: var(--pvs-muted); font-size: 0.875rem;
  opacity: 0; visibility: hidden; transition: opacity .4s ease, visibility 0s linear .4s; }
/* shown once the clip starts playing; hidden before that, and out of the tab order */
.pvs .pvs-meta[data-on="true"] { opacity: 1; visibility: visible; transition: opacity .4s ease; }
.pvs .pvs-count { font-variant-numeric: tabular-nums; letter-spacing: .04em; }
.pvs .pvs-skip { color: var(--pvs-muted); text-decoration: underline; text-underline-offset: 3px; }
.pvs .pvs-skip:hover { color: var(--pvs-accent); }
.pvs .pvs-skip:focus-visible { outline: 2px solid var(--pvs-accent); outline-offset: 3px; }

/* between the phone layout and ~1180 px (where the full-height clip leaves under 417 px) the clip keeps its width and the text column can be as narrow as
   380 px, so the lines step down a size to stay on one line (the longest is ~365 px at 28 px) */
@media (min-width: 761px) and (max-width: 1180px) {
  .pvs .pvs-lines .pvs-line { font-size: 1.75rem; }
}

@media (max-width: 760px) {
  .pvs .pvs-stage { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto auto; align-content: center;
    grid-template-areas: "phone" "copy"; row-gap: 12px; padding: 20px 16px 16px; text-align: center; }
  /* the clip's own shape; on short screens the height caps and the Player letterboxes inside */
  .pvs .pvs-phone { width: 100%; height: auto; max-width: none; aspect-ratio: 960 / 1008;
    max-height: calc(100vh - var(--pvs-top) - 210px); max-height: calc(100svh - var(--pvs-top) - 210px); }
  .pvs .pvs-copy { min-height: 112px; }
  .pvs .pvs-lines .pvs-line { font-size: 1.375rem; }
  .pvs .pvs-below { margin-top: 8px; }
  .pvs .pvs-cue { justify-content: center; }
  .pvs .pvs-after { font-size: 0.9375rem; }
  .pvs .pvs-meta { justify-content: center; margin-top: 6px; font-size: 0.8125rem; }
}

/* reduced motion: a plain stack of stills */
.pvs .pvs-stack { max-width: 40rem; margin: 0 auto; padding: 4rem 1.5rem; text-align: center; }
.pvs .pvs-stack ol { list-style: none; padding: 0; margin: 0; }
.pvs .pvs-stack li { margin: 0 0 2.5rem; }
.pvs .pvs-stack .pvs-still { aspect-ratio: 960 / 1008; width: 100%; max-width: 480px; margin: 0 auto; }
.pvs .pvs-stack .pvs-line { font-size: 1.5rem; line-height: 1.2; font-weight: 700; margin: 0.75rem 0 0; }
.pvs .pvs-stack .pvs-after { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .pvs .pvs-line, .pvs .pvs-after { transition: none; } }
`;
