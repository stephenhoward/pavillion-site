/**
 * The region 2 scroll-pinned "steps" section from scroll-proto/main.tsx, ported for the
 * home page (src/components/StepsSection.astro).
 * Built by site-embed/build.mjs into public/clips/steps.js; the page loads it as a
 * plain module script, so nothing in src/ imports from motion/.
 *
 * Mount: <div data-pvs-steps data-heading="…" data-after="…" data-skip-to="id"></div>
 *   data-heading  section heading for screen readers and the page outline (not shown; the
 *                 step lines are the visible text)
 *   data-after    optional line shown once the last step has played (and after the still stack)
 *   data-skip-to  id of the element the Skip link jumps to
 * URL params as in scroll-proto: ?v=scrub (default steps), ?motion=reduce, ?forgive=0.75
 *
 * Isolation: all CSS is scoped under .pvs, the clip's fonts are registered under their own
 * family name (build.mjs), rendering is wrapped in an error boundary and try/catch, and the
 * mount has no height until React renders, so a failure leaves an empty div.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AbsoluteFill } from 'remotion';
import { Player, Thumbnail, type PlayerRef } from '@remotion/player';
import { CreateEvent, R2 } from '../src/region2/CreateEvent';
import { STEPS, LINES, TEXTS, lineIndex, CROP_W, COMP_H } from '../scroll-proto/steps';
import { CSS } from './styles';

// staticFile() (fonts, event photos) resolves against the site root: /fonts/…, /clips/images/….

type Variant = 'scrub' | 'steps';
type Config = { heading: string; after: string; skipTo: string };

/** The region 2 composition, cropped to the centre CROP_W columns, on a transparent stage
 *  so the section's own background shows through (no glow, no visible crop edge). */
const Cropped: React.FC = () => (
  <AbsoluteFill style={{ overflow: 'hidden', background: 'transparent' }}>
    <div style={{ position: 'absolute', left: -(R2.width - CROP_W) / 2, top: 0, width: R2.width, height: R2.height }}>
      <CreateEvent background="transparent" />
    </div>
  </AbsoluteFill>
);

const playerProps = {
  component: Cropped,
  durationInFrames: R2.durationInFrames,
  compositionWidth: CROP_W,
  compositionHeight: COMP_H,
  fps: R2.fps,
} as const;

const params = new URLSearchParams(location.search);
const N = STEPS.length;
const FORGIVE_VH = Number(params.get('forgive') ?? 0.75);

// Scroll shares, unchanged from scroll-proto/main.tsx.
const HOLD = 45;
const TAIL = 120;
const F0 = STEPS[0].start;
const WEIGHTS = STEPS.map((s, i) => s.end - s.start + HOLD + (i === N - 1 ? TAIL : 0));
const W = WEIGHTS.reduce((a, b) => a + b, 0);
const BOUNDS = WEIGHTS.map((_, i) => WEIGHTS.slice(0, i).reduce((a, b) => a + b, 0) / W);
const CUE_DELAY_MS = 1500;

/** Height of the site's sticky nav; the stage pins below it. */
const navHeight = (): number => (document.querySelector('.nav') as HTMLElement | null)?.offsetHeight ?? 0;

/** Scroll progress through the pinned distance: <0 before the pin, >1 after. `top` is where the stage sticks. */
function measure(section: HTMLElement, stage: HTMLElement, top: number): { p: number; dist: number } {
  const r = section.getBoundingClientRect();
  const dist = r.height - stage.offsetHeight;
  return { p: dist > 0 ? (top - r.top) / dist : 0, dist };
}
function stepAt(p: number): number {
  let i = 0;
  while (i + 1 < N && p >= BOUNDS[i + 1]) i++;
  return i;
}
function scrubFrame(p: number): number {
  if (p <= 0) return F0;
  const i = stepAt(p);
  const s = STEPS[i];
  const local = (Math.min(p, 1) - BOUNDS[i]) * W;
  return Math.round(s.start + Math.min(s.end - s.start, Math.max(0, local)));
}

function skipTo(id: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    // Jump, don't smooth-scroll: a smooth scroll would fast-forward through the pinned steps.
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navHeight(), behavior: 'instant' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };
}

const Pinned: React.FC<{ variant: Variant; cfg: Config }> = ({ variant, cfg }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [line, setLine] = useState(0);

  useEffect(() => {
    let raf = 0;
    let shownFrame = -1;
    let frameChangedAt = performance.now();
    let cueOn = false;
    let afterOn = false;
    // The step counter and Skip stay hidden until the clip starts playing, then stay.
    let metaOn = false;
    const meta = () => {
      if (!metaOn) { metaOn = true; metaRef.current?.setAttribute('data-on', 'true'); }
    };
    const cue = (on: boolean) => {
      if (on !== cueOn) { cueOn = on; cueRef.current?.setAttribute('data-on', String(on)); }
    };
    const after = (on: boolean) => {
      if (on !== afterOn) { afterOn = on; afterRef.current?.setAttribute('data-on', String(on)); }
    };
    let shownStep = -1;
    let shownLine = -1;
    // The text follows the step and, within a step with more than one line, the frame on screen.
    const syncLine = () => {
      const l = lineIndex(Math.max(0, shownStep), Math.max(0, shownFrame), revisit);
      if (l !== shownLine) { shownLine = l; setLine(l); }
    };
    const label = (i: number) => { if (i !== shownStep) { shownStep = i; setStep(i); } syncLine(); };
    let cur = -2;
    let playing: number | null = null;
    const completed = new Set<number>();
    // A step shown again (scrolled back to, or reached already played) holds its last frame.
    let revisit = false;
    const enter = (i: number, now: number) => {
      cur = i;
      playing = completed.has(i) ? null : now;
      revisit = playing === null;
    };
    const show = (f: number) => {
      if (f !== shownFrame && playerRef.current) {
        playerRef.current.seekTo(f);
        shownFrame = f;
        frameChangedAt = performance.now();
        stageRef.current?.setAttribute('data-frame', String(f)); // for testing
      }
      syncLine();
    };

    let top = navHeight();
    const onResize = () => {
      top = navHeight();
      sectionRef.current?.style.setProperty('--pvs-top', `${top}px`);
    };
    onResize();
    window.addEventListener('resize', onResize);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const { p, dist } = measure(section, stage, top);
      cue(p >= 0 && p < 1 && shownStep < N - 1 && now - frameChangedAt >= CUE_DELAY_MS);
      // The closing line: once the last step's final frame is on screen.
      after(shownStep === N - 1 && shownFrame === STEPS[N - 1].end);

      if (p >= 0) meta(); // the pin has been reached: step 1 plays (or scrubs) from here
      if (variant === 'scrub') { label(stepAt(p)); show(scrubFrame(p)); return; }

      const target = p < 0 ? -1 : stepAt(p);
      if (cur === -2) {
        for (let i = 0; i <= target; i++) completed.add(i);
        revisit = true;
        cur = target;
      } else if (target < cur) {
        cur = target;
        revisit = true;
        playing = null;
      } else if (target > cur) {
        const pastEnd = (p - (BOUNDS[cur + 1] ?? 1)) * dist;
        if (playing !== null && pastEnd >= FORGIVE_VH * stage.offsetHeight) {
          enter(target, now);
        } else if (playing === null) {
          enter(cur + 1, now);
        }
      }
      label(Math.max(0, cur));
      if (cur < 0) { show(STEPS[0].start); return; }
      const s = STEPS[cur];
      if (playing !== null) {
        const f = s.start + Math.floor(((now - playing) / 1000) * R2.fps);
        if (f < s.end) { show(f); return; }
        completed.add(cur);
        playing = null;
      }
      show(s.end);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [variant]);

  return (
    <section ref={sectionRef} className="pvs-pin" aria-labelledby="pvs-title">
      <div ref={stageRef} className="pvs-stage">
        <h2 id="pvs-title" className="pvs-vh">{cfg.heading}</h2>
        <div className="pvs-phone" aria-hidden="true">
          <div className="pvs-iso">
          <Player
            ref={playerRef}
            {...playerProps}
            acknowledgeRemotionLicense // Pavillion is within Remotion's free-licence terms (motion/README.md)
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            moveToBeginningWhenEnded={false}
            style={{ width: '100%', height: '100%' }}
          />
          </div>
        </div>
        <div className="pvs-copy">
          <div className="pvs-lines">
            {TEXTS.map((t, i) => (
              <p key={i} className="pvs-line" data-on={i === line} aria-hidden={i !== line}>{t}</p>
            ))}
          </div>
          <div className="pvs-below">
            <div ref={cueRef} className="pvs-cue" data-on="false" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
              Scroll
            </div>
            {cfg.after && <p ref={afterRef} className="pvs-after" data-on="false">{cfg.after}</p>}
          </div>
          <div ref={metaRef} className="pvs-meta" data-on="false">
            <span className="pvs-count">{step + 1} / {N}</span>
            {cfg.skipTo && <a className="pvs-skip" href={`#${cfg.skipTo}`} onClick={skipTo(cfg.skipTo)}>Skip</a>}
          </div>
        </div>
      </div>
    </section>
  );
};

const StillStack: React.FC<{ cfg: Config }> = ({ cfg }) => (
  <section className="pvs-stack" aria-labelledby="pvs-stack-title">
    <h2 id="pvs-stack-title" className="pvs-vh">{cfg.heading}</h2>
    <ol>
      {LINES.map((l, i) => (
        <li key={i}>
          <div className="pvs-still" aria-hidden="true">
            <div className="pvs-iso"><Thumbnail {...playerProps} frameToDisplay={l.still} style={{ width: '100%', height: '100%' }} /></div>
          </div>
          <p className="pvs-line">{l.line}</p>
        </li>
      ))}
    </ol>
    {cfg.after && <p className="pvs-after" data-on="true">{cfg.after}</p>}
  </section>
);

function useReducedMotion(): boolean {
  const forced = params.get('motion') === 'reduce';
  const [rm, setRm] = useState(() => forced || matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (forced) return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setRm(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [forced]);
  return rm;
}

const App: React.FC<{ cfg: Config }> = ({ cfg }) => {
  const rm = useReducedMotion();
  const variant: Variant = params.get('v') === 'scrub' ? 'scrub' : 'steps';
  return <div className="pvs">{rm ? <StillStack cfg={cfg} /> : <Pinned variant={variant} cfg={cfg} />}</div>;
};

/** Renders nothing if anything inside throws, so the rest of the page is untouched. */
class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) { console.error('[steps section]', err); }
  render() { return this.state.failed ? null : this.props.children; }
}

try {
  const mount = document.querySelector<HTMLElement>('[data-pvs-steps]');
  if (mount) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    const cfg: Config = {
      heading: mount.dataset.heading ?? '',
      after: mount.dataset.after ?? '',
      skipTo: mount.dataset.skipTo ?? '',
    };
    mount.querySelector('.pvs-fallback')?.remove();
    createRoot(mount).render(<Boundary><App cfg={cfg} /></Boundary>);
  }
} catch (err) {
  console.error('[steps section]', err);
}
