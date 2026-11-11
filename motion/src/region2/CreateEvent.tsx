/**
 * Region 2, "that's all it takes": creating the Seed Swap at phone width.
 * Storyboard: pavillion-social-clips--2026-11-10.md, region 2.
 *
 * Beats as built (30 fps, 930 frames = 31.0 s; slower than the storyboard's
 * 12–15 s so each step can be followed). A camera opens on the whole phone,
 * pushes in before the form is touched, follows the part being worked on, and
 * pulls back to the whole phone for the end. Times below are after the
 * 1.8 s opening (add 1.8 s for clip time).
 *   0–3.7 s    title typed, description typed
 *   3.7–15.5 s place + room (the slow beat, paced for someone new to the app):
 *              Add Location → picker → highlight + lens on the add-a-room icon →
 *              the sheet grows into the new-space form → "Community Room" → Save →
 *              sheet away, filled location held. Shortened for presentation: the
 *              app's empty space list, the staged list and re-picking the room in
 *              the picker are skipped.
 *   15.5–19.5 s photo flies in from outside the phone, lands in the upload
 *              zone, focal point dragged
 *   19.6–21.9 s two of the garden's categories
 *   21.9–25.0 s date and times (one-off; the recurrence button is never touched)
 *   25.8–27.0 s Save Changes, then dissolve to the garden's own calendar; hold
 * Each landing on a new part of the form is held a moment before acting (DWELLS).
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { loadAppFonts } from '../theme/fonts';
import { FONT_FAMILY, pub } from '../theme/tokens';
import { PhoneFrame, SCREEN_W, SCREEN_H, screenToParent } from '../ui/PhoneFrame';
import { EditorHeader, EditorBody, HEADER_H, sectionTops, IN_CARD, SAVE_BUTTON, type EditorState } from '../ui/Editor';
import { MorphSheet, PickerContent, PickerFooter, AddSpaceContent, AddSpaceFooter, Backdrop, PICKER, ADD_SPACE, ADD_SPACE_MID } from '../ui/Sheets';
import { TapMark, DragMark, HighlightLens } from '../overlays/Overlays';
import { DoorPlus } from '../icons/DoorPlus';
import { clamp, keyframes, typed } from '../ui/helpers';
import { SeedSwapArt, SEED_SWAP_FOCAL } from '../ui/SeedSwapArt';
import { GardenCalendarPhone } from './GardenCalendar';
import { SEED_SWAP_DESCRIPTION, SEED_SWAP_TITLE } from '../data/larkspur';

loadAppFonts();

export const R2 = { width: 1536, height: 1008, fps: 30, durationInFrames: 930 };

// Device placement in the 1536x1008 composition.
const DEVICE = { x: 768 - (414 * 1.1) / 2, y: 22, scale: 1.1 };
const STATUS_H = 40; // blank device status area above the page
const CONTENT_H = SCREEN_H - STATUS_H;

// ---- timeline (frames) ----
/** Opening: whole phone held, then the push-in; the form starts after it. */
const INTRO = 54;
const INTRO_HOLD = 20;
const shift = <V,>(v: V): V => (Array.isArray(v) ? v.map((n) => n + INTRO) : (v as number) + INTRO) as V;
/** Frames added to everything after the location beat when it was slowed (2026-11-11; 258,
 *  then 100 once the intermediate sheets were skipped). */
const LOC_EXTRA = 100;
const after = <V,>(v: V): V => (Array.isArray(v) ? v.map((n) => n + LOC_EXTRA) : (v as number) + LOC_EXTRA) as V;
/**
 * Dwells (2026-11-11): each time the view lands on something new, hold before acting on it so
 * the viewer can see what they're looking at. [frame, extra frames]: everything at or after
 * `frame` (timeline and camera, pre-INTRO frames) moves later by `extra`.
 */
const DWELLS: Array<[number, number]> = [
  [148, 24], // the Location section, before Add Location is tapped
  [after(359), 20], // the empty Event Image section (after the scroll lands), before the photo flies in
  [after(463), 14], // Categories, before the first tap
  [after(519), 14], // Date & Time, before the first field
  [after(593), 10], // the header, before Save Changes
];
const dwell = (f: number) => f + DWELLS.reduce((sum, [at, extra]) => sum + (f >= at ? extra : 0), 0);
const dwellAll = <V,>(v: V): V => (Array.isArray(v) ? v.map(dwell) : dwell(v as number)) as V;
/** How long the sheet takes to grow, shrink or change content. */
const MORPH = 18;
const T_BASE = {
  titleTap: 8, titleType: [12, 36] as const,
  descTap: 46, descType: [50, 104] as const,
  scrollToLoc: [112, 130] as const,
  // Location, paced for someone new to the app: about a second to read each new sheet before
  // the next tap, and the sheet grows or shrinks (MORPH) into each new state instead of cutting.
  addLocTap: 148, pickerIn: [150, 166] as const,
  lens: [196, 262] as const, doorTap: 252,
  // The add-a-room icon opens the new-space form directly, and its Save puts the room on the
  // event (presentation shortcut: see the header).
  addSpaceIn: 262, nameTap: 304, nameType: [310, 352] as const, saveSpaceTap: 368, pickerOut: [380, 396] as const,
  scrollToImage: after([340, 358] as const),
  photoFly: after([360, 390] as const), dropAt: after(390), workspaceAt: after(398),
  focalDrag: after([408, 436] as const),
  scrollToCats: after([446, 462] as const), cat1: after(472), cat2: after(488),
  scrollToDate: after([500, 518] as const),
  dateTap: after(528), timeTap: after(542), endDateTap: after(556), endTimeTap: after(570),
  saveTap: after(594), dissolve: after([600, 628] as const),
};
const T = Object.fromEntries(Object.entries(T_BASE).map(([k, v]) => [k, shift(dwellAll(v))])) as typeof T_BASE;

/** Phone content-area point -> composition ("world") point. */
const cw = (x: number, y: number) => screenToParent(x, STATUS_H + y, DEVICE);
const MID = SCREEN_W / 2;
/** Camera keys: [frame, world focus, zoom]. Held between keys, eased across them. */
const WHOLE = { x: 768, y: 504 };
const CAMERA_BASE: Array<[number, { x: number; y: number }, number]> = [
  [0, cw(MID, 380), 1.8],
  [112, cw(MID, 380), 1.8],
  [130, cw(MID, 360), 1.7],
  [148, cw(MID, 360), 1.7],
  [166, cw(MID, 520), 1.55],
  [196, cw(MID, 520), 1.55],
  [212, cw(300, 540), 1.4], // room for the lens beside the phone
  [262, cw(300, 540), 1.4],
  [280, cw(MID, 525), 1.55], // held while the sheet changes, so only the sheet moves
  [396, cw(MID, 525), 1.55],
  [414, cw(MID, 350), 1.8], // the filled-in location, held before the scroll to the photo
  ...([
    // Camera moves never lead a scroll: each starts with the scroll it accompanies, or after it.
    [359, cw(MID, 350), 1.8],
    [370, cw(MID, 340), 1.25], // wide enough to see the photo arrive from outside
    [394, cw(MID, 340), 1.25],
    [404, cw(MID, 320), 1.8],
    [446, cw(MID, 320), 1.8], // with the scroll to Categories
    [462, cw(MID, 360), 1.85],
    [500, cw(MID, 360), 1.85], // with the scroll to Date & Time
    [518, cw(MID, 420), 1.55],
    [582, cw(MID, 420), 1.55], // once the last field's tap mark has faded
    [592, cw(MID, 300), 1.4],
    [600, cw(MID, 300), 1.4],
    [634, WHOLE, 1],
  ] as Array<[number, { x: number; y: number }, number]>).map(([f, p, z]) => [f + LOC_EXTRA, p, z] as [number, { x: number; y: number }, number]),
];
const CAMERA: Array<[number, { x: number; y: number }, number]> = [
  [0, WHOLE, 1],
  [INTRO_HOLD, WHOLE, 1],
  ...CAMERA_BASE.map(([f, p, z]) => [dwell(f) + INTRO, p, z] as [number, { x: number; y: number }, number]),
];

const LIB = { name: 'Larkspur Bend Public Library', address: '212 Main Street' };

/** Default stage behind the device(s), as reviewed: a faint orange glow on stone-100.
 *  The site mockups pass their own `background` (the page colour) so the clip blends into the page. */
export const STAGE_BG = 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 100%), #F5F5F4';

export const CreateEvent: React.FC<{ background?: string }> = ({ background = STAGE_BG }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- editor state at this frame ----
  const imageAttached = frame >= T.workspaceAt;
  const topsEmpty = sectionTops(false);
  const tops = sectionTops(true);
  const viewport = (cardTop: number, screenY: number) => HEADER_H + cardTop - screenY; // scroll that puts cardTop at screenY
  const scroll = keyframes(frame, [
    [T.scrollToLoc[0], 0],
    [T.scrollToLoc[1], viewport(topsEmpty.location, 300)],
    [T.scrollToImage[0], viewport(topsEmpty.location, 300)],
    [T.scrollToImage[1], viewport(topsEmpty.image, 210)],
    [T.scrollToCats[0], viewport(tops.image, 210)],
    [T.scrollToCats[1], viewport(tops.categories, 280)],
    [T.scrollToDate[0], viewport(tops.categories, 280)],
    [T.scrollToDate[1], viewport(tops.date, 150)],
  ]);
  // Body-content y -> content-area y.
  const toScreen = (y: number) => HEADER_H + y - scroll;

  const location = frame >= T.saveSpaceTap + 8 ? { name: `${LIB.name} — Community Room`, address: LIB.address } : null;
  const cats: string[] = [];
  if (frame >= T.cat1 + 1) cats.push('Swaps');
  if (frame >= T.cat2 + 1) cats.push('Workshops');

  const focalProgress = interpolate(frame, [T.focalDrag[0], T.focalDrag[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  // Drag from the centre to the photo's focal point (the seedling hand-off).
  const focal = { x: 0.5 + (SEED_SWAP_FOCAL.x - 0.5) * focalProgress, y: 0.5 + (SEED_SWAP_FOCAL.y - 0.5) * focalProgress };

  const s: EditorState = {
    frame,
    title: typed(SEED_SWAP_TITLE, frame, ...T.titleType),
    titleActive: frame >= T.titleTap && frame < T.descTap,
    description: typed(SEED_SWAP_DESCRIPTION, frame, ...T.descType),
    descActive: frame >= T.descTap && frame < T.scrollToLoc[0] + 2,
    location,
    imageAttached,
    dragOver: frame >= T.dropAt - 8 && frame < T.workspaceAt ? 1 : 0,
    focal,
    focalDragging: frame >= T.focalDrag[0] - 2 && frame <= T.focalDrag[1] + 2,
    categories: cats,
    date: frame >= T.dateTap + 2 ? '11/21/2026' : '',
    time: frame >= T.timeTap + 2 ? '01:00 PM' : '',
    endDate: frame >= T.endDateTap + 2 ? '11/21/2026' : '',
    endTime: frame >= T.endTimeTap + 2 ? '03:00 PM' : '',
    activeDateField: frame >= T.endTimeTap ? 'endTime' : frame >= T.endDateTap ? 'endDate' : frame >= T.timeTap ? 'time' : frame >= T.dateTap ? 'date' : null,
  };

  // ---- sheets ----
  // One sheet: it slides up as the picker, grows into the new-space form (height eased over
  // MORPH while the content cross-fades; the buttons stay put and cross-fade in place), and
  // slides away once the room is saved.
  type SheetState = 'picker' | 'editing';
  const SHEET_H: Record<SheetState, number> = {
    picker: PICKER.height(3) + 40,
    editing: ADD_SPACE.height('editing') + 40,
  };
  const toForm = frame >= T.addSpaceIn;
  const morph = interpolate(frame, [T.addSpaceIn, T.addSpaceIn + MORPH], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fadeOut = interpolate(morph, [0, 0.35], [1, 0], clamp);
  const fadeIn = interpolate(morph, [0.3, 0.85], [0, 1], clamp);
  const sheetOn = frame >= T.pickerIn[0] && frame < T.pickerOut[1];
  const sheetIn = spring({ frame: frame - T.pickerIn[0], fps, config: { damping: 20, stiffness: 160 } });
  const sheetOut = interpolate(frame, [T.pickerOut[0], T.pickerOut[1]], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const backdrop = !sheetOn ? 0 : frame >= T.pickerOut[0] ? 1 - sheetOut : Math.min(1, sheetIn);
  const sheetH = toForm ? interpolate(morph, [0, 1], [SHEET_H.picker, SHEET_H.editing]) : SHEET_H.picker;
  const sheetOffset = frame < T.pickerOut[0] ? (1 - sheetIn) * sheetH : sheetOut * sheetH;

  const pickerH = SHEET_H.picker;
  const formNode = (
    <AddSpaceContent mid={ADD_SPACE_MID.editing} stages={[{ stage: 'editing', opacity: 1 }]}
      name={typed('Community Room', frame, ...T.nameType)} typing={frame >= T.nameTap && frame < T.saveSpaceTap} frame={frame} />
  );
  const formFooter = <AddSpaceFooter primary={[{ label: 'Save', opacity: 1 }]} />;
  const sheetLayers = !toForm
    ? [{ key: 'picker', opacity: 1, node: <PickerContent rows={PICKER.initialRows} search="" /> }]
    : morph < 1
      ? [
          { key: 'picker', opacity: fadeOut, node: <PickerContent rows={PICKER.initialRows} search="" /> },
          { key: 'form', opacity: fadeIn, node: formNode },
        ]
      : [{ key: 'form', opacity: 1, node: formNode }];
  const sheetFooters = !toForm
    ? [{ key: 'picker', opacity: 1, node: <PickerFooter /> }]
    : morph < 1
      ? [
          { key: 'picker', opacity: fadeOut, node: <PickerFooter /> },
          { key: 'form', opacity: fadeIn, node: formFooter },
        ]
      : [{ key: 'form', opacity: 1, node: formFooter }];

  // ---- tap points (content-area coordinates) ----
  const taps: Array<{ x: number; y: number; at: number }> = [
    { x: 170, y: toScreen(topsEmpty.details + IN_CARD.titleInput + 22), at: T.titleTap },
    { x: 200, y: toScreen(topsEmpty.details + IN_CARD.descInput + 50), at: T.descTap },
    { x: 195, y: toScreen(topsEmpty.location + IN_CARD.addLocationButton), at: T.addLocTap },
    { x: PICKER.doorPlusX, y: CONTENT_H - pickerH + PICKER.rowY(1), at: T.doorTap },
    { x: 180, y: CONTENT_H - SHEET_H.editing + ADD_SPACE.nameInputY, at: T.nameTap },
    { x: 324, y: CONTENT_H - SHEET_H.editing + ADD_SPACE.saveY('editing'), at: T.saveSpaceTap },
    { x: 198, y: toScreen(tops.categories + IN_CARD.chips.row1), at: T.cat1 },
    { x: 94, y: toScreen(tops.categories + IN_CARD.chips.row1), at: T.cat2 },
    ...(['dateTap', 'timeTap', 'endDateTap', 'endTimeTap'] as const).map((k, i) => ({
      x: 120, y: toScreen(tops.date + IN_CARD.dateFields + 22 + i * IN_CARD.dateFieldStep), at: T[k],
    })),
    { x: SAVE_BUTTON.x, y: SAVE_BUTTON.y, at: T.saveTap },
  ];

  // ---- the dissolve to the garden's calendar ----
  const dissolve = interpolate(frame, [T.dissolve[0], T.dissolve[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // ---- photo flying in from outside the device ----
  const uploadCenter = { x: SCREEN_W / 2, y: STATUS_H + toScreen(topsEmpty.image + IN_CARD.uploadZoneCenter) };
  const landing = screenToParent(uploadCenter.x, uploadCenter.y, DEVICE);
  const fly = interpolate(frame, [T.photoFly[0], T.photoFly[1]], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flyVisible = frame >= T.photoFly[0] && frame < T.workspaceAt + 4;
  const photo = {
    x: interpolate(fly, [0, 1], [1700, landing.x]),
    y: interpolate(fly, [0, 1], [560, landing.y]) - Math.sin(fly * Math.PI) * 90,
    r: interpolate(fly, [0, 1], [14, 0]),
    w: interpolate(fly, [0, 1], [380, 280]),
    o: interpolate(frame, [T.dropAt, T.workspaceAt + 4], [1, 0], clamp),
  };

  // ---- focal drag finger ----
  const imgTop = toScreen(tops.image + IN_CARD.workspaceImage.top);
  const fingerX = 24 + 16 + (SCREEN_W - 2 * 16 - 2 * 24 - 2) * focal.x;
  const fingerY = imgTop + IN_CARD.workspaceImage.height * focal.y;
  const fingerVis = interpolate(frame, [T.focalDrag[0] - 4, T.focalDrag[0], T.focalDrag[1], T.focalDrag[1] + 6], [0, 1, 1, 0], clamp);

  // ---- lens on the add-a-room icon (composition space, outside the device) ----
  const doorPt = screenToParent(PICKER.doorPlusX, STATUS_H + CONTENT_H - pickerH + PICKER.rowY(1), DEVICE);

  // ---- camera ----
  const camX = keyframes(frame, CAMERA.map(([f, p]) => [f, p.x] as [number, number]));
  const camY = keyframes(frame, CAMERA.map(([f, p]) => [f, p.y] as [number, number]));
  const camZ = keyframes(frame, CAMERA.map(([f, , z]) => [f, z] as [number, number]));

  return (
    <AbsoluteFill style={{
      background,
      fontFamily: FONT_FAMILY, overflow: 'hidden',
    }}>
     <div style={{ position: 'absolute', left: 0, top: 0, width: R2.width, height: R2.height, transformOrigin: '0 0', transform: `translate(${R2.width / 2 - camX * camZ}px, ${R2.height / 2 - camY * camZ}px) scale(${camZ})` }}>
      <PhoneFrame {...DEVICE}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: STATUS_H, background: '#fff' }} />
        <div style={{ position: 'absolute', left: 0, top: STATUS_H, width: SCREEN_W, height: CONTENT_H, overflow: 'hidden', background: '#FAFAF9' }}>
          {/* editor */}
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - dissolve, filter: `blur(${dissolve * 6}px)` }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: HEADER_H - scroll }}>
              <EditorBody s={s} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><EditorHeader /></div>
            <Backdrop opacity={backdrop} />
            {sheetOn ? <MorphSheet bottom={CONTENT_H} height={sheetH} offset={sheetOffset} layers={sheetLayers} footers={sheetFooters} /> : null}
            {taps.map((t, i) => <TapMark key={i} x={t.x} y={t.y} at={t.at} />)}
            <DragMark x={fingerX} y={fingerY} visible={fingerVis} />
          </div>
          {/* the garden's own public calendar */}
          {dissolve > 0 ? (
            <div style={{ position: 'absolute', inset: 0, opacity: dissolve, transform: `scale(${1.04 - 0.04 * dissolve})`, transformOrigin: '50% 40%' }}>
              <GardenCalendarPhone />
            </div>
          ) : null}
        </div>
      </PhoneFrame>

      {/* overlays in composition space */}
      <HighlightLens x={doorPt.x} y={doorPt.y} from={T.lens[0]} to={T.lens[1]} ringSize={58} lensDx={220} lensDy={-150} lensSize={140}>
        <span style={{ color: '#57534E', display: 'flex' }}><DoorPlus size={92} /></span>
      </HighlightLens>
      {flyVisible ? (
        <div style={{
          position: 'absolute', left: photo.x - photo.w / 2, top: photo.y - (photo.w * 2) / 3 / 2, width: photo.w, height: (photo.w * 2) / 3,
          transform: `rotate(${photo.r}deg)`, opacity: photo.o, borderRadius: 6, overflow: 'hidden',
          boxShadow: '0 18px 40px rgba(0,0,0,0.28)', border: '6px solid #fff', boxSizing: 'border-box', zIndex: 70,
        }}>
          <SeedSwapArt />
        </div>
      ) : null}
     </div>
    </AbsoluteFill>
  );
};

export { pub };
