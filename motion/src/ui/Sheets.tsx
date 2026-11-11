/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * https://mozilla.org/MPL/2.0/.
 *
 * Simplified React re-creation of the editor's bottom sheets at phone width:
 * src/client/components/common/sheet.vue, location-picker-modal.vue,
 * add-space-sheet.vue, and logged_in/calendar/SpacesEditor.vue + edit-space.vue.
 * Strings from src/client/locales/en/event_editor.json and calendars.json.
 * Block heights are fixed so the timeline can aim taps at them.
 */
import React from 'react';
import { Search, MapPin, DoorOpen, Check, Plus, Pencil } from 'lucide-react';
import { cli, FONT_FAMILY } from '../theme/tokens';
import { DoorPlus } from '../icons/DoorPlus';
import { PillBtn } from './Editor';
import { Caret } from './helpers';

const SHEET_PAD = 32;
const ROW_H = 68;
/** Space below the sheet's padding (device home-indicator area); callers add it to each height. */
const SHEET_SAFE = 40;
/** Height of a sheet's button row (small pill buttons). */
const FOOTER_H = 36;

/** The sheet's white panel, bottom-anchored by its caller. `y` is its top edge and `height` its
 *  current height, so a caller can animate either; content is top-anchored and clipped. */
const SheetShell: React.FC<{ height: number; y: number; children: React.ReactNode }> = ({ height, y, children }) => (
  <div style={{
    position: 'absolute', left: 0, right: 0, top: y, height, boxSizing: 'border-box', overflow: 'hidden',
    background: '#fff', borderTop: `1px solid ${cli.stone300}`, borderRadius: '16px 16px 0 0',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.18)', fontFamily: FONT_FAMILY, color: cli.textPrimary, zIndex: 30,
  }}>
    {children}
  </div>
);

/** One layer of sheet content, padded as the app's sheet body. */
const Layer: React.FC<{ opacity?: number; children: React.ReactNode }> = ({ opacity = 1, children }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: SHEET_PAD, opacity }}>{children}</div>
);

const SheetHeader: React.FC<{ title: string; titleH: number }> = ({ title, titleH }) => (
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: titleH, marginBottom: 24, gap: 12 }}>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.35 }}>{title}</h2>
    <span style={{ fontSize: 24, lineHeight: '24px', color: cli.stone600, padding: '0 6px' }}>&times;</span>
  </header>
);

export const Backdrop: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 20, opacity, backdropFilter: `blur(${4 * opacity}px)` }} />
);

type Row = { kind: 'place' | 'space'; name: string; sub: string; wholeVenue?: boolean; selected?: boolean };

export const PICKER = {
  initialRows: [
    { kind: 'place', name: 'Larkspur Bend Community Garden', sub: '418 Orchard Lane' },
    { kind: 'place', name: 'Larkspur Bend Public Library', sub: '212 Main Street' },
    { kind: 'place', name: 'Larkspur Bend Town Square', sub: 'Main Street & 2nd Avenue' },
  ] as Row[],
  height: (rows: number) => SHEET_PAD * 2 + 30 + 24 + 48 + 16 + rows * ROW_H + 16 + 36,
  /** Row centre y relative to sheet top. */
  rowY: (i: number) => SHEET_PAD + 30 + 24 + 48 + 16 + i * ROW_H + ROW_H / 2,
  doorPlusX: 390 - SHEET_PAD - 20,
};

export const PickerContent: React.FC<{ rows: Row[]; search: string }> = ({ rows, search }) => (
  <>
    <SheetHeader title="Select Location" titleH={30} />
    <div style={{
      height: 48, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', marginBottom: 16,
      border: `1px solid ${cli.stone300}`, borderRadius: 9999, color: search ? cli.textPrimary : cli.textMuted, fontSize: 16,
    }}>
      <Search size={20} color={cli.stone400} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{search || 'Search locations...'}</span>
    </div>
    <div>
      {rows.map((r) => (
        <div key={r.name + r.kind} style={{ display: 'flex', alignItems: 'center', height: ROW_H, gap: 6 }}>
          <div style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, height: ROW_H - 8, padding: '0 10px', boxSizing: 'border-box',
            borderRadius: 10, background: r.selected ? cli.orange50 : 'transparent', border: `1px solid ${r.selected ? '#FED7AA' : 'transparent'}`,
            paddingLeft: r.kind === 'space' ? 26 : 10,
          }}>
            {r.kind === 'space' ? <DoorOpen size={20} color={cli.stone500} /> : <MapPin size={20} color={cli.stone500} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.name}{r.wholeVenue ? <span style={{ color: cli.stone500, fontWeight: 400 }}> (whole venue)</span> : null}
              </div>
              <div style={{ fontSize: 13, color: cli.stone500 }}>{r.sub}</div>
            </div>
            {r.selected ? <Check size={20} color={cli.orange500} /> : null}
          </div>
          {r.kind === 'place' ? (
            <span style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cli.stone600, borderRadius: 8 }}>
              <DoorPlus size={20} />
            </span>
          ) : <span style={{ width: 40 }} />}
        </div>
      ))}
    </div>
  </>
);

/** The picker's buttons; MorphSheet pins them to the bottom of the sheet. */
export const PickerFooter: React.FC = () => (
  <footer style={{ display: 'flex', justifyContent: 'space-between' }}>
    <PillBtn kind="ghost" size="sm">Remove location</PillBtn>
    <PillBtn kind="primary" size="sm">Create New</PillBtn>
  </footer>
);

/** Add-space sheet stages: empty list, new-space editor open, staged space. */
export type AddSpaceStage = 'empty' | 'editing' | 'staged';
/** Height of the add-space sheet's middle block (between header and footer) at each stage. */
export const ADD_SPACE_MID: Record<AddSpaceStage, number> = { empty: 24 + 12 + 44, editing: 285, staged: 56 + 12 + 44 };

export const ADD_SPACE = {
  titleH: 54,
  height: (stage: AddSpaceStage) => SHEET_PAD * 2 + 54 + 24 + ADD_SPACE_MID[stage] + 24 + 36,
  /** y (relative to sheet top) of: the add button, name input, and the footer's primary button
   *  (Save, or Done while a new space is being edited). */
  addButtonY: SHEET_PAD + 54 + 24 + 24 + 12 + 22,
  nameInputY: SHEET_PAD + 54 + 24 + 28 + 12 + 44 + 16 + 32 + 22,
  saveY: (stage: AddSpaceStage) => ADD_SPACE.height(stage) - SHEET_PAD - 18,
};

/**
 * The add-space sheet's content. `mid` is the middle block's current height, and `stages` the
 * stage blocks shown in it with their opacities, so the sheet can grow from one stage to the next
 * while the old block fades out and the new one fades in. The header stays put; the buttons are
 * AddSpaceFooter, pinned to the sheet's bottom by MorphSheet.
 */
export const AddSpaceContent: React.FC<{ mid: number; stages: Array<{ stage: AddSpaceStage; opacity: number }>; name: string; typing: boolean; frame: number }> = ({ mid, stages, name, typing, frame }) => (
  <>
    <SheetHeader title="Add a space to Larkspur Bend Public Library" titleH={ADD_SPACE.titleH} />
    <div style={{ position: 'relative', height: mid, overflow: 'hidden' }}>
      {stages.map(({ stage, opacity }) => (
        <div key={stage} style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity }}>
          <AddSpaceStageBlock stage={stage} name={name} typing={typing} frame={frame} />
        </div>
      ))}
    </div>
  </>
);

/**
 * The add-space sheet's one row of buttons, used for every stage: Cancel, and a primary button
 * that reads Save, or Done while a new space is being edited (the app has a separate
 * Cancel/Done row inside the editor; one row reads more clearly at this size). `primary`
 * lists the label(s) shown, cross-faded in place within the same button.
 */
export const AddSpaceFooter: React.FC<{ primary: Array<{ label: string; opacity: number }> }> = ({ primary }) => (
  <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
    <PillBtn kind="ghost" size="sm">Cancel</PillBtn>
    <PillBtn kind="primary" size="sm">
      <span style={{ display: 'grid' }}>
        {primary.map((p) => <span key={p.label} style={{ gridArea: '1 / 1', textAlign: 'center', opacity: p.opacity }}>{p.label}</span>)}
      </span>
    </PillBtn>
  </footer>
);

const AddSpaceStageBlock: React.FC<{ stage: AddSpaceStage; name: string; typing: boolean; frame: number }> = ({ stage, name, typing, frame }) => (
  <>
    {stage === 'empty' ? (
      <>
        <p style={{ margin: '0 0 12px', height: 24, fontSize: 15, color: cli.stone500 }}>No rooms or spaces yet</p>
        <AddSpaceButton />
      </>
    ) : null}
    {stage === 'editing' ? (
      <div style={{ height: ADD_SPACE_MID.editing }}>
        <h3 style={{ margin: '0 0 12px', height: 28, fontSize: 18, fontWeight: 600 }}>New Room or Space</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 44, borderBottom: `1px solid ${cli.stone200}`, marginBottom: 16, gap: 8 }}>
          <span style={{ padding: '8px 4px 10px', fontSize: 16, fontWeight: 500, color: cli.orange600, borderBottom: `2px solid ${cli.orange500}`, marginBottom: -1 }}>English</span>
          <span style={{ marginLeft: 6, marginBottom: 8, color: cli.stone500 }}><Plus size={16} /></span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, height: 24, marginBottom: 8 }}>Name</div>
        <div style={{
          height: 45, boxSizing: 'border-box', padding: '8px 16px', border: `1px solid ${typing ? cli.orange500 : cli.borderSecondary}`,
          outline: typing ? `2px solid ${cli.orange500}` : 'none', outlineOffset: 1, borderRadius: 6, fontSize: 18, background: typing ? '#fff' : cli.surfaceSecondary,
        }}>{name}<Caret frame={frame} active={typing} /></div>
        <div style={{ fontSize: 16, fontWeight: 500, height: 24, margin: '16px 0 8px' }}>Accessibility Information</div>
        <div style={{ height: 60, border: `1px solid ${cli.borderSecondary}`, borderRadius: 6, background: cli.surfaceSecondary }} />
      </div>
    ) : null}
    {stage === 'staged' ? (
      <>
        <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 12px', border: `1px solid ${cli.stone200}`, borderRadius: 8, marginBottom: 12, boxSizing: 'border-box' }}>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>Community Room <span style={{ color: cli.stone500, fontWeight: 400 }}>(new)</span></div>
          <Pencil size={20} color={cli.stone600} />
        </div>
        <AddSpaceButton />
      </>
    ) : null}
  </>
);

type SheetLayer = { key: string; opacity: number; node: React.ReactNode };
/**
 * One bottom sheet whose height and content can change: `height` is animated by the caller,
 * the sheet stays anchored to the bottom of the content area (`bottom`), and `layers` are
 * cross-faded contents (picker, add-space), top-anchored. `footers` are the button rows,
 * pinned to the sheet's bottom so they never move while the sheet grows or shrinks.
 * `offset` pushes the whole sheet down (slide in/out).
 */
export const MorphSheet: React.FC<{ bottom: number; height: number; offset?: number; layers: SheetLayer[]; footers: SheetLayer[] }> = ({ bottom, height, offset = 0, layers, footers }) => (
  <SheetShell height={height} y={bottom - height + offset}>
    {/* content stops 16 px above the buttons, so a list fading out of a shrinking sheet is clipped there rather than running under them */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: SHEET_SAFE + SHEET_PAD + FOOTER_H + 16, overflow: 'hidden' }}>
      {layers.map((l) => <Layer key={l.key} opacity={l.opacity}>{l.node}</Layer>)}
    </div>
    {footers.map((f) => (
      <div key={f.key} style={{ position: 'absolute', left: SHEET_PAD, right: SHEET_PAD, bottom: SHEET_PAD + SHEET_SAFE, opacity: f.opacity }}>{f.node}</div>
    ))}
  </SheetShell>
);

const AddSpaceButton: React.FC = () => (
  <div style={{
    height: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', boxSizing: 'border-box', width: 'fit-content',
    border: `1px dashed ${cli.stone300}`, borderRadius: 8, color: cli.stone700, fontSize: 15, fontWeight: 500,
  }}><Plus size={18} /> Add room or space</div>
);
