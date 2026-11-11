/**
 * Region 1, "a crowd gathering": the Seed Swap on the town calendar.
 * Storyboard: pavillion-social-clips--2026-11-10.md, region 1.
 *
 * Beats as built (30 fps, 492 frames = 16.4 s):
 *   0–0.2 s    empty stage (the site starts the clip on scroll, so the hero headline
 *              is read first and the video opens blank, not on its final frame)
 *   0.2–1.6 s  the Seed Swap's whole (portrait) photo slides in from the top, like a
 *              print pushed across a table: it decelerates and squares up as it stops
 *   1.6–2.4 s  it crops down to the card's image box as the camera pushes in
 *   2.4–6.3 s  the card builds around the photo:
 *              the body extends from the photo, the title types out, the time drops
 *              in, the location pin rises from its tip and wobbles, the place types out, then the description
 *              and categories fade in as the camera widens to the whole card
 *   6.3–7.7 s  pull back: the page's white fades in behind the card as it takes its
 *              place, alone on Saturday in "What's On in Larkspur Bend"
 *   8.6–11.6 s Saturday fills from different edges; the Seed Swap shifts down
 *   11.6–14.6 s pull back further; Friday, Sunday, Tuesday, Wednesday land, slower
 *   14.4–16.4 s source tags and colours fade; the page settles into a desktop window
 *              the width of the frame, and a phone slides up to overlap its lower right; hold
 *
 * The page is the public list view at desktop width (1280 CSS px), laid out
 * here with fixed card heights so positions can be animated. A "camera"
 * (centre + scale in page coordinates) frames it.
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { loadAppFonts } from '../theme/fonts';
import { FONT_FAMILY, pub } from '../theme/tokens';
import { CalendarHeader, CATEGORY_FILTER_H, DayHeading, PublicEventCard, ViewToolbar, type CardBuild } from '../ui/PublicCalendar';
import { PhoneFrame, SCREEN_W, SCREEN_H } from '../ui/PhoneFrame';
import { SourceBand, SourceTag } from '../overlays/Overlays';
import { SEED_SWAP_FOCAL } from '../ui/SeedSwapArt';
import { clamp } from '../ui/helpers';
import { DAY_LABELS, SATURDAY_OTHERS, SEED_SWAP, SOURCES, TOWN_CALENDAR, WEEK_OTHERS, type EventCardData } from '../data/larkspur';

loadAppFonts();

// The opening: the whole Seed Swap photo slides in (P frames, from an empty stage), crops
// down to the card's image box (24 frames), then the card builds around it. Everything
// after runs D frames later than it did when the clip opened on the finished card.
const P = 36;
const E = 24 + P;
const D = 72 + E;
export const R1 = { width: 1536, height: 1008, fps: 30, durationInFrames: 360 + D };
const W = R1.width;
const H = R1.height;

// ---- desktop page geometry (CSS px) ----
const PAGE_W = 1280;
const CONTENT_X = 96;
const CONTENT_W = 1088;
const LIST_TOP = 305 + CATEGORY_FILTER_H; // header (with category filter) + main padding + view toolbar
const HEADING_H = 53;
const CARD_H = 186;
const CARD_GAP = 16;
const DAY_GAP = 32;

type Arrival = { ev: EventCardData; at: number; from: 'left' | 'right' | 'top' | 'bottom'; slow?: boolean };

const BY_ID = Object.fromEntries([...SATURDAY_OTHERS, ...WEEK_OTHERS, SEED_SWAP].map((e) => [e.id, e]));
// The town calendar's categories: every category its events use, alphabetical (the app lists the calendar's own set).
const TOWN_CATEGORIES = [...new Set(Object.values(BY_ID).flatMap((e) => e.categories))].sort((a, b) => a.localeCompare(b));
const ARRIVALS: Arrival[] = [
  { ev: SEED_SWAP, at: -100, from: 'left' },
  { ev: BY_ID['bird-walk'], at: 126 + D, from: 'left' },
  { ev: BY_ID['market'], at: 142 + D, from: 'right' },
  { ev: BY_ID['matinee'], at: 160 + D, from: 'bottom' },
  { ev: BY_ID['basketball'], at: 222 + D, from: 'top', slow: true },
  { ev: BY_ID['live-music'], at: 232 + D, from: 'right', slow: true },
  { ev: BY_ID['work-party'], at: 244 + D, from: 'right', slow: true },
  { ev: BY_ID['story-hour'], at: 256 + D, from: 'left', slow: true },
  { ev: BY_ID['karaoke'], at: 268 + D, from: 'bottom', slow: true },
];
// Order on the page: by day, then by start time (the data is already time-ordered within a day).
const DAY_ORDER = ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-24', '2026-11-25'];
const PAGE_ORDER: Record<string, string[]> = {
  '2026-11-20': ['basketball', 'live-music'],
  '2026-11-21': ['bird-walk', 'market', 'seed-swap', 'matinee'],
  '2026-11-22': ['work-party'],
  '2026-11-24': ['story-hour'],
  '2026-11-25': ['karaoke'],
};

// Opening: the Seed Swap card builds around its photo (frames, before the first pull-back).
const BUILD = {
  slide: [6, 36], // the whole portrait photo slides in from above the frame
  crop: [12 + P, 36 + P], // the whole portrait photo closes to the card's crop
  surface: [14 + E, 36 + E], // body extends right from the photo
  title: [34 + E, 50 + E], // typed
  time: 50 + E, // drops in (spring)
  pin: [62 + E, 70 + E], // revealed from the tip up, then wobbles on its tip
  location: [66 + E, 88 + E], // typed
  rest: [92 + E, 110 + E], // description + categories fade in
  tags: [104 + E, 116 + E], // source band + tag fade in
} as const;
// The slide: starts above the frame (page px at camera C00's scale 2.3; the 384 px photo
// is 883 px tall on screen), a little right and turned, and travels down and left as it
// slows; the turn takes a few frames longer to come out, so it squares up as it stops.
const SLIDE_FROM = { dx: 60, dy: -560, rot: -9 };
const SLIDE_ROT_END = BUILD.slide[1] + 6;
const PULL = [56 + D, 100 + D] as const; // first pull-back, card close-up → page
const TAG_FADE = [300 + D, 318 + D] as const;
const COMPOSE = [316 + D, 346 + D] as const;

/** Layout of headings and cards given each card's presence (0..1, its share of a slot). */
function layout(presence: Record<string, number>) {
  let y = LIST_TOP;
  const cards: Record<string, number> = {};
  const headings: Array<{ day: string; y: number; o: number }> = [];
  let firstDay = true;
  for (const day of DAY_ORDER) {
    const ids = PAGE_ORDER[day];
    const dayP = Math.max(...ids.map((id) => presence[id] ?? 0));
    if (dayP <= 0) continue;
    if (!firstDay) y += DAY_GAP * dayP;
    firstDay = false;
    headings.push({ day, y, o: dayP });
    y += HEADING_H * dayP;
    let firstCard = true;
    for (const id of ids) {
      const p = presence[id] ?? 0;
      if (p <= 0) continue;
      if (!firstCard) y += CARD_GAP * p;
      firstCard = false;
      cards[id] = y;
      y += CARD_H * p;
    }
  }
  return { cards, headings, bottom: y };
}

const ALL = (ids: string[]) => Object.fromEntries(ids.map((i) => [i, 1]));
const L2 = layout(ALL(['seed-swap']));
const L3 = layout(ALL(['seed-swap', 'bird-walk', 'market', 'matinee']));
const L4 = layout(ALL(Object.values(PAGE_ORDER).flat()));

type Cam = { cx: number; cy: number; s: number };
// Opening: centred on the photo alone; then on the photo and the card's left part as the
// title, time and place arrive; then the whole card for the description and categories.
const CARD_CY = L2.cards['seed-swap'] + CARD_H / 2;
const C0: Cam = { cx: CONTENT_X + 128, cy: CARD_CY, s: 3.0 };
// Before C0: the whole portrait photo (256×384, its crop band at the focal point) fits the frame.
const PHOTO_FULL_H = 384;
const C00: Cam = { cx: CONTENT_X + 128, cy: L2.cards['seed-swap'] + (CARD_H - PHOTO_FULL_H) * SEED_SWAP_FOCAL.y + PHOTO_FULL_H / 2, s: 2.3 };
const CA: Cam = { cx: CONTENT_X + 360, cy: CARD_CY, s: 2.0 };
const C1: Cam = { cx: CONTENT_X + CONTENT_W / 2, cy: CARD_CY, s: 1.36 };
const C2: Cam = { cx: PAGE_W / 2, cy: 504, s: 1.0 };
const C3: Cam = { cx: PAGE_W / 2, cy: (L3.bottom + 40) / 2, s: Math.min(1, H / (L3.bottom + 60)) };
const C4: Cam = { cx: PAGE_W / 2, cy: (L4.bottom + 48) / 2, s: H / (L4.bottom + 110) };

function camAt(frame: number): Cam {
  const ease = Easing.inOut(Easing.cubic);
  const lerp = (a: Cam, b: Cam, t: number): Cam => ({ cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, s: a.s * Math.pow(b.s / a.s, t) });
  if (frame < BUILD.crop[0]) return C00;
  if (frame < BUILD.crop[1]) return lerp(C00, C0, interpolate(frame, [BUILD.crop[0], BUILD.crop[1]], [0, 1], { ...clamp, easing: ease }));
  if (frame < 12 + E) return C0;
  if (frame < 40 + E) return lerp(C0, CA, interpolate(frame, [12 + E, 40 + E], [0, 1], { ...clamp, easing: ease }));
  if (frame < 86 + E) return CA;
  if (frame < 112 + E) return lerp(CA, C1, interpolate(frame, [86 + E, 112 + E], [0, 1], { ...clamp, easing: ease }));
  if (frame < PULL[0]) return C1;
  if (frame < PULL[1]) return lerp(C1, C2, interpolate(frame, [PULL[0], PULL[1]], [0, 1], { ...clamp, easing: ease }));
  if (frame < 150 + D) return C2;
  if (frame < 200 + D) return lerp(C2, C3, interpolate(frame, [150 + D, 200 + D], [0, 1], { ...clamp, easing: ease }));
  if (frame < 212 + D) return C3;
  return lerp(C3, C4, interpolate(frame, [212 + D, 290 + D], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }));
}

/**
 * The location pin rocking on its tip (degrees; t in frames since the wobble began, 4 frames before the reveal ends).
 * The swing slows as it dies away: angular frequency eases from W0 to W1 rad/frame
 * (half-swings of about 4, 6, 9, 11, 13 frames), so it's quick at first and lazy at the end.
 */
function pinWobble(t: number): number {
  if (t <= 0) return 0;
  const W0 = 0.9, W1 = 0.25, TAU = 8;
  const phase = W1 * t + (W0 - W1) * TAU * (1 - Math.exp(-t / TAU));
  return -20 * Math.exp(-t / 14) * Math.sin(phase);
}

// ---- final composition: desktop window + phone ----
// The window spans the frame (72 px side margins); the phone overlaps its lower right
// and runs 60 px past its bottom edge. The phone's bottom stays ~78 px clear of the
// frame so its drop shadow isn't cut by the frame edge (the site shows the clip unframed).
const WIN_X = 72;
const WIN = { x: WIN_X, y: 44, s: (W - WIN_X * 2) / PAGE_W, chrome: 36 };
const WIN_W = PAGE_W * WIN.s;
const WIN_H = 826;
const PHONE_SCALE = 0.94;
const PHONE_W = 414 * PHONE_SCALE;
const PHONE_H = 868 * PHONE_SCALE;
const PHONE = { x: Math.round(WIN.x + WIN_W - 80 - PHONE_W), y: Math.round(WIN.y + WIN_H + 60 - PHONE_H), scale: PHONE_SCALE };

/** Default stage behind the device(s), as reviewed: a faint orange glow on stone-100.
 *  The site mockups pass their own `background` (the page colour) so the clip blends into the page. */
export const STAGE_BG = 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 100%), #F5F5F4';

/** `phoneOnly` (site mockup's narrow-screen close-up still): the final frame's phone, with no desktop window behind it. */
export const CommunityCalendar: React.FC<{ background?: string; phoneOnly?: boolean }> = ({ background = STAGE_BG, phoneOnly = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // presence + entry offset per card
  const presence: Record<string, number> = {};
  const entry: Record<string, { dx: number; dy: number; o: number }> = {};
  for (const a of ARRIVALS) {
    const t = frame - a.at;
    const travel = a.slow ? 30 : 20;
    // Travel in with an ease-out, then a small damped wobble along the same
    // axis: the card "finds its spot" rather than snapping.
    const k = interpolate(t, [0, travel], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const tt = Math.max(0, t - travel * 0.8);
    const give = t > travel * 0.8 ? (a.slow ? 5 : 9) * Math.exp(-tt / 5) * Math.sin(tt / 1.6) : 0;
    // The slot opens a little ahead of the card, so neighbours shift to make room.
    const lead = a.slow ? 10 : 8;
    presence[a.ev.id] = t + lead < 0 ? 0 : interpolate(t + lead, [0, a.slow ? 26 : 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const dist = 1000;
    const off = (1 - k) * dist - give;
    entry[a.ev.id] = {
      dx: a.from === 'left' ? -off : a.from === 'right' ? off : 0,
      dy: a.from === 'top' ? -off * 0.7 : a.from === 'bottom' ? off * 0.7 : 0,
      o: t < 0 ? 0 : interpolate(t, [0, 6], [0, 1], clamp),
    };
  }
  const L = layout(presence);

  // camera → page transform, then the move into the desktop window
  const cam = camAt(frame);
  const camOffset = { x: W / 2 - cam.cx * cam.s, y: H / 2 - cam.cy * cam.s };
  const ct = interpolate(frame, [COMPOSE[0], COMPOSE[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const s = cam.s * Math.pow(WIN.s / cam.s, ct);
  const ox = camOffset.x + (WIN.x - camOffset.x) * ct;
  const oy = camOffset.y + (WIN.y + WIN.chrome - camOffset.y) * ct;
  const clip = {
    l: WIN.x * ct, t: (WIN.y + WIN.chrome) * ct,
    r: (W - WIN.x - WIN_W) * ct, b: (H - WIN.y - WIN_H) * ct,
  };

  const tagO = interpolate(frame, [TAG_FADE[0], TAG_FADE[1]], [1, 0], clamp);
  const tagScale = Math.min(2.6, Math.max(1, 0.85 / cam.s));
  // On the first pull-back the page's white fades in behind the card, then its header/toolbar.
  const pageBg = interpolate(frame, [PULL[0] + 4, PULL[1] - 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const pageOpacity = interpolate(frame, [PULL[0] + 10, PULL[1] - 4], [0, 1], clamp);

  // The Seed Swap card's build-up (opening), and its source band/tag once it's built.
  const lin = (r: readonly [number, number], easing = Easing.inOut(Easing.cubic)) => interpolate(frame, [r[0], r[1]], [0, 1], { ...clamp, easing });
  const build: CardBuild = {
    surface: lin(BUILD.surface),
    title: lin(BUILD.title, Easing.linear),
    time: spring({ frame: frame - BUILD.time, fps, config: { damping: 14, stiffness: 170 } }),
    pin: lin(BUILD.pin, Easing.out(Easing.cubic)),
    // the lean starts 4 frames before the reveal ends, carrying the rise into the first swing
    pinTilt: pinWobble(frame - (BUILD.pin[1] - 4)),
    location: lin(BUILD.location, Easing.linear),
    rest: lin(BUILD.rest, Easing.out(Easing.quad)),
    crop: lin(BUILD.crop),
    boxH: CARD_H,
  };
  const seedTagO = lin(BUILD.tags, Easing.out(Easing.quad));
  const slideK = lin(BUILD.slide, Easing.out(Easing.cubic));
  const slideR = interpolate(frame, [BUILD.slide[0], SLIDE_ROT_END], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const seedSlide = frame < SLIDE_ROT_END
    ? {
      // about the whole photo's centre (card px): the image box is 256 wide; the photo's top is where the focal crop puts it
      transform: `translate(${SLIDE_FROM.dx * (1 - slideK)}px, ${SLIDE_FROM.dy * (1 - slideK)}px) rotate(${SLIDE_FROM.rot * slideR}deg)`,
      transformOrigin: `128px ${(CARD_H - PHOTO_FULL_H) * SEED_SWAP_FOCAL.y + PHOTO_FULL_H / 2}px`,
      visibility: frame < BUILD.slide[0] ? 'hidden' as const : 'visible' as const,
    }
    : null;

  const phoneIn = spring({ frame: frame - (COMPOSE[0] + 6), fps, config: { damping: 18, stiffness: 90 } });

  return (
    <AbsoluteFill style={{
      background,
      fontFamily: FONT_FAMILY, overflow: 'hidden',
    }}>
      {/* desktop window chrome (fades in for the final frame) */}
      {phoneOnly ? null : <>
      <div style={{
        position: 'absolute', left: WIN.x, top: WIN.y, width: WIN_W, height: WIN_H, borderRadius: 12, background: '#fff',
        boxShadow: '0 24px 60px rgba(28,25,23,0.18), 0 0 0 1px rgba(28,25,23,0.08)', opacity: ct, overflow: 'hidden',
      }}>
        <div style={{ height: WIN.chrome, background: '#F5F5F4', borderBottom: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px' }}>
          {['#D6D3D1', '#D6D3D1', '#D6D3D1'].map((c, i) => <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
          <span style={{ marginLeft: 16, flex: 1, height: 20, borderRadius: 6, background: '#fff', border: '1px solid #E7E5E4' }} />
        </div>
      </div>

      {/* the page */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${clip.t}px ${clip.r}px ${clip.b}px ${clip.l}px round ${12 * ct}px)` }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, width: PAGE_W, height: Math.max(L.bottom + 400, 3000),
          transform: `translate(${ox}px, ${oy}px) scale(${s})`, transformOrigin: '0 0',
        }}>
          <div style={{
            position: 'absolute', inset: 0, background: pub.surfacePrimary, opacity: pageBg,
            boxShadow: `0 0 0 ${1 / s}px rgba(0,0,0,${0.06 * (1 - ct)})`,
          }} />
          <div style={{ position: 'relative', opacity: pageOpacity, padding: '0 24px' }}>{/* positioned, or the page-white layer paints over it once opacity reaches 1 */}
            <div style={{ maxWidth: 1152, margin: '0 auto' }}>
              <CalendarHeader title={TOWN_CALENDAR} layout="desktop" dateLabel="Nov 20 – Dec 3" categories={TOWN_CATEGORIES} />
              <div style={{ padding: '48px 32px 0' }}><ViewToolbar /></div>
            </div>
          </div>
          {L.headings.map((h) => (
            <div key={h.day} style={{ position: 'absolute', left: CONTENT_X, top: h.y, width: CONTENT_W, opacity: h.o * (h.day === SEED_SWAP.day ? pageOpacity : 1) }}>
              {/* no fill of its own: the page's white is still fading in behind it on the first pull-back */}
              <DayHeading label={DAY_LABELS[h.day]} style={{ background: 'transparent' }} />
            </div>
          ))}
          {ARRIVALS.map((a) => {
            const y = L.cards[a.ev.id];
            if (y === undefined) return null;
            const e = entry[a.ev.id];
            const src = SOURCES[a.ev.source];
            const seed = a.ev.id === SEED_SWAP.id;
            const o = seed ? tagO * seedTagO : tagO;
            return (
              <div key={a.ev.id} style={{
                position: 'absolute', left: CONTENT_X + e.dx, top: y + e.dy, width: CONTENT_W, height: CARD_H, opacity: e.o,
                ...(seed ? seedSlide : null),
              }}>
                <PublicEventCard ev={a.ev} layout="desktop" style={{ height: CARD_H }} build={seed && frame < BUILD.tags[1] ? build : undefined}>
                  <SourceBand color={src.color} opacity={o} />
                  <div style={{ position: 'absolute', top: 0, right: 0, transform: `scale(${tagScale})`, transformOrigin: '100% 0' }}>
                    <SourceTag label={src.name} color={src.color} opacity={o} />
                  </div>
                </PublicEventCard>
              </div>
            );
          })}
        </div>
      </div>
      </>}

      {/* phone: slides up from below the frame */}
      {frame >= COMPOSE[0] ? (
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - phoneIn) * (H - PHONE.y + 40)}px)` }}>
          <PhoneFrame {...PHONE}>
            <TownPhonePage />
          </PhoneFrame>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * The same page at phone width, scrolled to Saturday so the Seed Swap is in
 * view; Saturday's heading is stuck to the top as the app's sticky day
 * headings are.
 */
const PHONE_CARD_H = 330;
const TownPhonePage: React.FC = () => {
  const STATUS_H = 40;
  const sat = PAGE_ORDER['2026-11-21'].map((id) => BY_ID[id]);
  const scrollIntoSaturday = 2 * (PHONE_CARD_H + 16) - 10; // past Bird Walk and the market
  return (
    <div style={{ position: 'absolute', inset: 0, background: pub.surfacePrimary, fontFamily: FONT_FAMILY }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: STATUS_H, bottom: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 28, right: 28, top: 53 - scrollIntoSaturday }}>
          {sat.map((ev) => (
            <div key={ev.id} style={{ marginBottom: 16 }}>
              <PublicEventCard ev={ev} layout="phone" style={{ height: PHONE_CARD_H, boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ height: 16 }} />
          <DayHeading label={DAY_LABELS['2026-11-22']} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: '0 28px', background: pub.surfacePrimary }}>
          <DayHeading label={DAY_LABELS['2026-11-21']} style={{ margin: 0, padding: '14px 0' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: STATUS_H, background: pub.surfacePrimary }} />
      <div style={{ display: 'none' }}>{SCREEN_H}</div>
    </div>
  );
};
