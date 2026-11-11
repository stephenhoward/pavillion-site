/**
 * Step cuts for the scroll-pinned prototype of region 2 (region2-create-event).
 * Frames are clip frames (30 fps), taken from the beat boundaries in
 * src/region2/CreateEvent.tsx: each step ends where the next beat's scroll or
 * camera move begins, nudged later where a tap mark or the drag finger would
 * otherwise be frozen mid-fade in the held frame. Order is the editor's order
 * (place before photo), so the placeholder lines are not in the order given.
 */
export type Step = {
  line: string; start: number; end: number;
  /** Further lines within the same step: each replaces the text from clip frame `at` as the
   *  step plays (or is scrubbed), with no scroll needed. The step counter doesn't change. */
  more?: Array<{ at: number; line: string }>;
  /** For a step with `more`: the line shown when the step is revisited (scrolled back to, or
   *  reached after it has played), which holds its last frame, so its last line alone would lack context. */
  held?: string;
};

export const STEPS: Step[] = [
  // Push-in (20–54) kept as the step's opening; title typed 62–90, description 100–158.
  { line: 'Posting an event is quick', start: 20, end: 166 },
  // Scroll to location 166–184, held to 202, then picker, lens 274–340, the sheet grows into the
  // new-space form 340–358, name typed 388–430, Save 446, sheet out by 474, camera on the
  // filled-in location by 492, held to 518. The text changes on its own at the lens (274).
  { line: 'Let people know where to be', start: 166, end: 518, more: [{ at: 274, line: 'Down to the room' }], held: 'Let people know where to be, down to the room' },
  // Scroll to image 518–536, held, camera widens 557–568, photo flies 558–588, focal drag 606–634, finger gone 640.
  { line: 'Add a picture', start: 518, end: 640 },
  // Scroll (and camera) to categories 644–660, held, taps at 684 and 700; last tap mark gone at 712.
  { line: 'Add categories', start: 640, end: 712 },
  // Scroll (and camera) to date 712–730, held, four field taps 754–796; last tap mark gone at 808.
  { line: 'Pick the date and time', start: 712, end: 808 },
  // Camera up to the header 808–818, Save tap 830, dissolve 836–864, whole phone at 870. End hold (870–929) dropped.
  { line: "Save. It's on your calendar", start: 808, end: 870 },
];

/** Every line in order, with its step and the frame its still shows (the end of its part). */
export const LINES = STEPS.flatMap((s, i) => {
  const parts = [{ at: s.start, line: s.line }, ...(s.more ?? [])];
  return parts.map((p, j) => ({ step: i, line: p.line, still: j + 1 < parts.length ? parts[j + 1].at - 1 : s.end }));
});

/** Every text the pinned view can show: LINES, then each step's `held` line. */
const HELD = STEPS.flatMap((s, i) => (s.held ? [{ step: i, line: s.held }] : []));
export const TEXTS = [...LINES.map((l) => l.line), ...HELD.map((h) => h.line)];

/** Index into TEXTS of the text to show for `step` at clip frame `frame`; `revisit`: the step is
 *  being shown again, held on its last frame (its `held` line, if it has one). */
export function lineIndex(step: number, frame: number, revisit = false): number {
  const h = revisit ? HELD.findIndex((x) => x.step === step) : -1;
  if (h >= 0) return LINES.length + h;
  const first = LINES.findIndex((l) => l.step === step);
  const passed = (STEPS[step].more ?? []).filter((m) => frame >= m.at).length;
  return first + passed;
}

/** Crop of the 1536×1008 composition: the phone column plus room for the lens. */
export const CROP_W = 960;
export const COMP_H = 1008;
