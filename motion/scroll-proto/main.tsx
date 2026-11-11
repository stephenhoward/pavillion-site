/**
 * Scroll-pinned prototype of region 2. Native scroll only: no wheel/touch
 * handlers, no preventDefault. A rAF loop reads the pinned section's position
 * and seeks the Player.
 *   ?v=scrub | ?v=steps   initial variant (the toggle updates the URL)
 *   ?motion=reduce        force the reduced-motion stack
 *   ?forgive=0.75         steps: scroll buffer, in viewport heights, before a playing step is cut short
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AbsoluteFill } from 'remotion';
import { Player, Thumbnail, type PlayerRef } from '@remotion/player';
import { CreateEvent, R2 } from '../src/region2/CreateEvent';
import { STEPS, LINES, TEXTS, lineIndex, CROP_W, COMP_H } from './steps';

type Variant = 'scrub' | 'steps';

/** The region 2 composition, cropped to the centre CROP_W columns. */
const Cropped: React.FC = () => (
  <AbsoluteFill style={{ overflow: 'hidden', background: '#F5F5F4' }}>
    <div style={{ position: 'absolute', left: -(R2.width - CROP_W) / 2, top: 0, width: R2.width, height: R2.height }}>
      <CreateEvent />
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
/**
 * Steps variant: how far past the end of the playing step's scroll (in viewport
 * heights) the reader must get before we stop finishing it and jump to where
 * they are. Below that, the playing step finishes and the next ones follow in
 * order at normal speed.
 */
const FORGIVE_VH = Number(params.get('forgive') ?? 0.75);

/**
 * Scroll shares, in frame-equivalents: each step gets its length plus HOLD,
 * where its last frame stays put, and the last step also gets TAIL, so the
 * final frame stays pinned for a while before the section scrolls away.
 */
const HOLD = 45;
const TAIL = 120;
const F0 = STEPS[0].start;
const WEIGHTS = STEPS.map((s, i) => s.end - s.start + HOLD + (i === N - 1 ? TAIL : 0));
const W = WEIGHTS.reduce((a, b) => a + b, 0);
const BOUNDS = WEIGHTS.map((_, i) => WEIGHTS.slice(0, i).reduce((a, b) => a + b, 0) / W); // progress where each step begins
/** Delay before the scroll cue appears once the animation has stopped. */
const CUE_DELAY_MS = 1500;

/** Scroll progress through the pinned distance: <0 before the pin, >1 after. */
function measure(section: HTMLElement, stage: HTMLElement): { p: number; dist: number } {
  const r = section.getBoundingClientRect();
  const dist = r.height - stage.offsetHeight;
  return { p: dist > 0 ? -r.top / dist : 0, dist };
}
function stepAt(p: number): number {
  let i = 0;
  while (i + 1 < N && p >= BOUNDS[i + 1]) i++;
  return i;
}

/** Scrub: frame follows scroll linearly within each step's animated part, then holds. */
function scrubFrame(p: number): number {
  if (p <= 0) return F0;
  const i = stepAt(p);
  const s = STEPS[i];
  const local = (Math.min(p, 1) - BOUNDS[i]) * W;
  return Math.round(s.start + Math.min(s.end - s.start, Math.max(0, local)));
}

const Pinned: React.FC<{ variant: Variant }> = ({ variant }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [line, setLine] = useState(0);

  useEffect(() => {
    let raf = 0;
    let shownFrame = -1;
    let frameChangedAt = performance.now();
    let cueOn = false;
    const cue = (on: boolean) => {
      if (on !== cueOn) { cueOn = on; cueRef.current?.setAttribute('data-on', String(on)); }
    };
    let shownStep = -1;
    let shownLine = -1;
    // The text follows the step and, within a step with more than one line, the frame on screen.
    const syncLine = () => {
      const l = lineIndex(Math.max(0, shownStep), Math.max(0, shownFrame), revisit);
      if (l !== shownLine) { shownLine = l; setLine(l); }
    };
    const label = (i: number) => { if (i !== shownStep) { shownStep = i; setStep(i); } syncLine(); };
    // steps variant state
    let cur = -2; // step on screen; -1 = before the pin (step 1's first frame); -2 = not started
    let playing: number | null = null; // start time if `cur` is playing
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

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const { p, dist } = measure(section, stage);
      // Scroll cue: while pinned, once the picture has been still for a moment, except on the last step.
      // Reads last tick's state; one frame of lag is invisible.
      cue(p >= 0 && p < 1 && shownStep < N - 1 && now - frameChangedAt >= CUE_DELAY_MS);

      if (variant === 'scrub') { label(stepAt(p)); show(scrubFrame(p)); return; }

      // steps: scroll sets a target; the animation follows it one step at a time at normal speed
      const target = p < 0 ? -1 : stepAt(p);
      if (cur === -2) {
        // first tick (load or variant switch): steps up to the current one count as seen
        for (let i = 0; i <= target; i++) completed.add(i);
        revisit = true;
        cur = target;
      } else if (target < cur) {
        cur = target; // scrolled back: hold the earlier step's last frame
        revisit = true;
        playing = null;
      } else if (target > cur) {
        const pastEnd = (p - (BOUNDS[cur + 1] ?? 1)) * dist; // px scrolled beyond the playing step's share
        if (playing !== null && pastEnd >= FORGIVE_VH * stage.offsetHeight) {
          enter(target, now); // scrolled a whole buffer past the playing step: let them go
        } else if (playing === null) {
          enter(cur + 1, now); // current step done: play the next one, in order
        }
        // otherwise the playing step finishes first
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
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  return (
    <section ref={sectionRef} className="pin" aria-labelledby="pin-title">
      <div ref={stageRef} className="stage">
        <div className="phone" aria-hidden="true">
          <Player
            ref={playerRef}
            {...playerProps}
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            moveToBeginningWhenEnded={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="copy">
          <h2 id="pin-title" className="visually-hidden">Creating an event, step by step</h2>
          <div className="lines">
            {TEXTS.map((t, i) => (
              <p key={i} className="line" data-on={i === line} aria-hidden={i !== line}>{t}</p>
            ))}
          </div>
          <div ref={cueRef} className="cue" data-on="false" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
            Scroll
          </div>
          <div className="meta">
            <span className="count">{step + 1} / {N}</span>
            <a className="skip" href="#after">Skip</a>
          </div>
        </div>
      </div>
    </section>
  );
};

const StillStack: React.FC = () => (
  <section className="stack" aria-labelledby="stack-title">
    <h2 id="stack-title">Creating an event, step by step</h2>
    <ol>
      {LINES.map((l, i) => (
        <li key={i}>
          <div className="still" aria-hidden="true">
            <Thumbnail {...playerProps} frameToDisplay={l.still} style={{ width: '100%', height: '100%' }} />
          </div>
          <p className="line">{l.line}</p>
        </li>
      ))}
    </ol>
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

const Toggle: React.FC<{ variant: Variant; onChange: (v: Variant) => void }> = ({ variant, onChange }) => {
  const pick = useCallback((v: Variant) => (e: React.MouseEvent<HTMLButtonElement>) => {
    onChange(v);
    // a mouse/touch click shouldn't leave focus on the button, or Space would press it instead of scrolling
    if (e.detail > 0) e.currentTarget.blur();
  }, [onChange]);
  return (
    <div className="toggle" role="group" aria-label="Variant">
      <button type="button" aria-pressed={variant === 'scrub'} onClick={pick('scrub')}>A · Scrub</button>
      <button type="button" aria-pressed={variant === 'steps'} onClick={pick('steps')}>B · Steps</button>
    </div>
  );
};

const Filler: React.FC<{ n: number; label: string }> = ({ n, label }) => (
  <div className="filler">
    {Array.from({ length: n }, (_, i) => (
      <p key={i}>
        <span className="tag">{label} {i + 1}</span> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
        posuere erat a ante venenatis dapibus, posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.
        Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Nullam quis risus eget
        urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.
      </p>
    ))}
  </div>
);

const App: React.FC = () => {
  const rm = useReducedMotion();
  const [variant, setVariant] = useState<Variant>(params.get('v') === 'steps' ? 'steps' : 'scrub');
  const change = useCallback((v: Variant) => {
    setVariant(v);
    const u = new URL(location.href);
    u.searchParams.set('v', v);
    history.replaceState(null, '', u);
  }, []);
  return (
    <>
      {rm ? <p className="toggle note">Reduced motion: stills</p> : <Toggle variant={variant} onChange={change} />}
      <header className="intro">
        <h1>Region 2, scroll-pinned (prototype)</h1>
        <p>Filler above and below. Scroll into the pinned section; switch variants with the toggle.</p>
      </header>
      <Filler n={4} label="Filler above" />
      {rm ? <StillStack /> : <Pinned key={variant} variant={variant} />}
      <h2 id="after" tabIndex={-1} className="after">After the section</h2>
      <Filler n={5} label="Filler below" />
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
