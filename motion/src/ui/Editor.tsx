/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * https://mozilla.org/MPL/2.0/.
 *
 * Simplified React re-creation of the Pavillion event editor at phone width,
 * following src/client/components/logged_in/calendar/edit_event.vue and the
 * components it mounts (language-tab-selector, location-display-card,
 * image-upload, image-workspace, ImageAltEditor, category-selector,
 * toggle-chip, series-selector, event_recurrence), with English strings from
 * src/client/locales/en/*.json. Block heights are fixed so the timeline can
 * aim taps at them; they approximate the app's rendered sizes.
 */
import React from 'react';
import { ArrowLeft, BookOpenText, Plus, CalendarSync, Upload, Crosshair, ZoomIn, ZoomOut, RefreshCw, Trash2 } from 'lucide-react';
import { cli, FONT_FAMILY } from '../theme/tokens';
import { MapPinOutline } from '../icons/AppSvgs';
import { SeedSwapArt } from './SeedSwapArt';
import { Caret } from './helpers';

// ---------- layout constants (phone-screen content coordinates) ----------
export const HEADER_H = 121;
const PAD = 16;
const GAP = 24;
const SEC_HEAD = 30;
export const CARD = {
  details: 518,
  location: 100,
  external: 150,
  imageEmpty: 252,
  imageAttached: 478,
  categories: 216,
  series: 145,
  date: 707,
};

export type EditorState = {
  frame: number;
  title: string; titleActive: boolean;
  description: string; descActive: boolean;
  location: null | { name: string; address: string };
  imageAttached: boolean; dragOver: number; focal: { x: number; y: number }; focalDragging: boolean;
  categories: string[];
  date: string; time: string; endDate: string; endTime: string; activeDateField: string | null;
};

/** Top of each section's card, in body-content coordinates. */
export function sectionTops(imageAttached: boolean) {
  const tops: Record<string, number> = {};
  let y = PAD;
  const order: Array<[string, number]> = [
    ['details', CARD.details], ['location', CARD.location], ['external', CARD.external],
    ['image', imageAttached ? CARD.imageAttached : CARD.imageEmpty], ['categories', CARD.categories],
    ['series', CARD.series], ['date', CARD.date],
  ];
  for (const [k, h] of order) {
    tops[k] = y + SEC_HEAD; // card top
    y += SEC_HEAD + h + GAP;
  }
  tops.end = y;
  return tops;
}

// Positions inside cards (relative to card top) used by the timeline.
export const IN_CARD = {
  titleInput: 24 + 44 + 16 + 32, // tabs, gap, label row
  descInput: 24 + 44 + 16 + 32 + 45 + 24 + 32,
  addLocationButton: 50,
  uploadZoneCenter: 126,
  workspaceImage: { top: 24, height: 196 },
  chips: { row1: 24 + 24 + 12 + 18, row2: 24 + 24 + 12 + 18 + 44 },
  dateFields: 24 + 16 + 24 + 12 + 27, // first input top inside the date card
  dateFieldStep: 87,
};

// ---------- small building blocks ----------
const sectionHeader: React.CSSProperties = {
  margin: 0, height: 18, marginBottom: 12, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
  textTransform: 'uppercase', color: cli.stone500, lineHeight: '18px',
};
const card = (h: number): React.CSSProperties => ({
  height: h, boxSizing: 'border-box', background: '#fff', border: `1px solid ${cli.stone200}`, borderRadius: 8,
  padding: 24, overflow: 'hidden', position: 'relative',
});
const label: React.CSSProperties = { fontSize: cli.fs.sm, fontWeight: 500, color: cli.textPrimary, height: 24, lineHeight: '24px', marginBottom: 8 };
const input = (h: number, focused = false): React.CSSProperties => ({
  height: h, boxSizing: 'border-box', padding: '8px 16px', border: `1px solid ${focused ? cli.orange500 : cli.borderSecondary}`,
  outline: focused ? `2px solid ${cli.orange500}` : 'none', outlineOffset: 1,
  borderRadius: cli.radiusSm, fontSize: cli.fs.base, background: focused ? '#fff' : cli.surfaceSecondary, color: cli.textPrimary,
  lineHeight: 1.5, overflow: 'hidden',
});

const Section: React.FC<{ title: string; h: number; children: React.ReactNode }> = ({ title, h, children }) => (
  <section style={{ marginBottom: GAP }}>
    <h2 style={sectionHeader}>{title}</h2>
    <div style={card(h)}>{children}</div>
  </section>
);

const LanguageTabs: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', height: 44, borderBottom: `1px solid ${cli.stone200}`, marginBottom: 16, gap: 8 }}>
    <span style={{ padding: '8px 4px 10px', fontSize: cli.fs.sm, fontWeight: 500, color: cli.orange600, borderBottom: `2px solid ${cli.orange500}`, marginBottom: -1 }}>English</span>
    <span style={{ marginLeft: 6, marginBottom: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cli.stone500, borderRadius: 6 }}><Plus size={16} /></span>
  </div>
);

const PillBtn: React.FC<{ kind: 'primary' | 'ghost' | 'secondary'; children: React.ReactNode; style?: React.CSSProperties; size?: 'sm' | 'md' }> = ({ kind, children, style, size = 'md' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: size === 'sm' ? 36 : 40, padding: size === 'sm' ? '0 16px' : '0 20px',
    borderRadius: 9999, fontSize: size === 'sm' ? 14 : 15, fontWeight: 500, whiteSpace: 'nowrap', boxSizing: 'border-box',
    ...(kind === 'primary' ? { background: cli.orange500, color: '#fff' }
      : kind === 'secondary' ? { background: cli.stone100, color: cli.stone700, border: `1px solid ${cli.stone200}` }
        : { background: 'transparent', color: cli.stone700, border: `1px solid ${cli.stone300}` }),
    ...style,
  }}>{children}</span>
);
export { PillBtn };

// ---------- header ----------
export const EditorHeader: React.FC = () => (
  <header style={{
    height: HEADER_H, boxSizing: 'border-box', padding: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
    background: '#fff', borderBottom: `1px solid ${cli.stone200}`, position: 'relative', zIndex: 10,
  }}>
    <span style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cli.stone700 }}><ArrowLeft size={20} /></span>
    <h1 style={{ flex: 1, margin: 0, fontSize: 20, fontWeight: 500, color: cli.stone900 }}>Create Event</h1>
    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
      <span style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cli.stone600 }}><BookOpenText size={20} strokeWidth={1.5} /></span>
      <PillBtn kind="ghost">Cancel</PillBtn>
      <PillBtn kind="primary" style={{ padding: '0 24px' }}>Save Changes</PillBtn>
    </div>
  </header>
);
/** Centre of the header's Save Changes button. */
export const SAVE_BUTTON = { x: 390 - 16 - 68, y: 16 + 40 + 8 + 20 };

// ---------- body ----------
export const EditorBody: React.FC<{ s: EditorState }> = ({ s }) => {
  const f = s.frame;
  return (
    <div style={{ padding: `${PAD}px ${PAD}px 0`, fontFamily: FONT_FAMILY }}>
      <Section title="Event Details" h={CARD.details}>
        <LanguageTabs />
        <div style={label}>Event Title<span style={{ color: cli.red500, marginLeft: 4 }}>*</span></div>
        <div style={input(45, s.titleActive)}>{s.title}<Caret frame={f} active={s.titleActive} /></div>
        <div style={{ height: 24 }} />
        <div style={label}>Description</div>
        <div style={{ ...input(124, s.descActive), whiteSpace: 'pre-wrap' }}>{s.description}<Caret frame={f} active={s.descActive} /></div>
        <div style={{ height: 24 }} />
        <div style={label}>Accessibility Information <span style={{ color: cli.textMuted, marginLeft: 4 }}>ⓘ</span></div>
        <div style={input(97)} />
      </Section>

      <Section title="Location" h={CARD.location}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {s.location ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, height: '100%', boxSizing: 'border-box' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: cli.stone900, lineHeight: 1.35, marginBottom: 4 }}>{s.location.name}</div>
                <div style={{ fontSize: 14, color: cli.stone600 }}>{s.location.address}</div>
              </div>
              <PillBtn kind="ghost" size="sm">Change</PillBtn>
            </div>
          ) : (
            <div style={{ padding: 12, height: '100%', boxSizing: 'border-box' }}>
              <div style={{
                height: '100%', border: `2px dashed ${cli.stone300}`, borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, color: cli.stone600, fontSize: 16, fontWeight: 500,
              }}>
                <MapPinOutline /> Add Location
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="External Link" h={CARD.external}>
        <div style={{ ...input(45), width: 'fit-content', minWidth: 176, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          More Information:
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path stroke="#6b7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 8l4 4 4-4" /></svg>
        </div>
        <div style={{ height: 12 }} />
        <div style={{ ...input(45), color: cli.textMuted }}>https://</div>
      </Section>

      <Section title="Event Image" h={s.imageAttached ? CARD.imageAttached : CARD.imageEmpty}>
        {s.imageAttached ? <Workspace focal={s.focal} dragging={s.focalDragging} /> : <UploadZone dragOver={s.dragOver} />}
      </Section>

      <Section title="Categories" h={CARD.categories}>
        <div style={{ fontSize: 16, fontWeight: 500, color: cli.textPrimary, height: 24, marginBottom: 12 }}>Categories</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 300 }}>
          {['Workshops', 'Swaps', 'Volunteer Days', 'Kids & Families'].map((c) => {
            const on = s.categories.includes(c);
            return (
              <span key={c} style={{
                display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 20px', borderRadius: 9999, fontSize: 14, fontWeight: 500,
                background: on ? cli.orange500 : cli.stone100, color: on ? '#fff' : cli.stone600, whiteSpace: 'nowrap',
              }}>{c}</span>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}><PillBtn kind="ghost" style={{ border: 'none', padding: '0 4px', color: cli.stone600 }}>+ New category</PillBtn></div>
      </Section>

      <Section title="Series" h={CARD.series}>
        <div style={{ ...input(45), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          No series
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path stroke="#6b7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 8l4 4 4-4" /></svg>
        </div>
        <div style={{ marginTop: 12 }}><PillBtn kind="ghost" style={{ border: 'none', padding: '0 4px', color: cli.stone600 }}>+ New series</PillBtn></div>
      </Section>

      <Section title="Date & Time" h={CARD.date}>
        <div style={{ padding: 16, background: cli.stone50, border: `1px solid ${cli.stone200}`, borderRadius: 8 }}>
          <div style={{ height: 24, marginBottom: 12, fontSize: 14, fontWeight: 600, color: cli.stone700 }}>Schedule 1</div>
          {([['Date', s.date, 'date'], ['Time', s.time, 'time'], ['End Date', s.endDate, 'endDate'], ['End Time', s.endTime, 'endTime']] as const).map(([l, v, key]) => (
            <div key={l} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: cli.textPrimary, height: 21, marginBottom: 6 }}>{l}</div>
              <div style={{
                height: 44, boxSizing: 'border-box', padding: '10px 14px', border: `1px solid ${s.activeDateField === key ? cli.orange500 : cli.borderSecondary}`,
                borderRadius: 6, background: '#fff', fontSize: 16, color: v ? cli.textPrimary : cli.textMuted, display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{v || (key.toLowerCase().includes('date') ? 'mm/dd/yyyy' : '--:-- --')}</span>
              </div>
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: cli.textPrimary, height: 21, marginBottom: 6 }}>Timezone</div>
            <div style={{ height: 44, boxSizing: 'border-box', padding: '10px 14px', border: `1px solid ${cli.borderSecondary}`, borderRadius: 6, background: '#fff', fontSize: 16, color: cli.textPrimary }}>America/Chicago</div>
          </div>
          <PillBtn kind="secondary"><CalendarSync size={16} /> Add recurrence</PillBtn>
        </div>
        <div style={{
          marginTop: 16, height: 48, border: `2px dashed ${cli.stone300}`, borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, color: cli.stone600, fontSize: 14, fontWeight: 500,
        }}><Plus size={16} /> Add another schedule</div>
        <p style={{ margin: '12px 0 0', fontSize: 13, color: cli.stone500, lineHeight: 1.5 }}>
          Add multiple schedules to create events that occur at different times or with different patterns.
        </p>
      </Section>
      <div style={{ height: 200 }} />
    </div>
  );
};

const UploadZone: React.FC<{ dragOver: number }> = ({ dragOver }) => (
  <div style={{
    height: CARD.imageEmpty - 48, boxSizing: 'border-box', borderRadius: 12,
    border: `2px dashed ${dragOver > 0.5 ? cli.orange500 : 'rgba(0,0,0,0.15)'}`,
    background: dragOver > 0.5 ? cli.orange50 : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 24px', textAlign: 'center',
  }}>
    <Upload size={36} color={dragOver > 0.5 ? cli.orange500 : '#999'} strokeWidth={1.5} />
    <div>
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 500, color: '#333' }}>Drag and drop an image here</p>
      <p style={{ margin: 0, fontSize: 14, color: '#777' }}>or <span style={{ color: cli.orange500, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 2 }}>click to select a file</span></p>
    </div>
    <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>.jpg · .jpeg · .png · .heic • Maximum file size: 10 MB</div>
  </div>
);

const Workspace: React.FC<{ focal: { x: number; y: number }; dragging: boolean }> = ({ focal, dragging }) => (
  <div>
    <div style={{ position: 'relative', height: IN_CARD.workspaceImage.height, borderRadius: 8, overflow: 'hidden', background: '#000' }}>
      <SeedSwapArt />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
      <div style={{
        position: 'absolute', left: `${focal.x * 100}%`, top: `${focal.y * 100}%`, transform: `translate(-50%, -50%) scale(${dragging ? 1.15 : 1})`,
        width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.25)', border: '2px solid #fff', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      }}><Crosshair size={32} /></div>
      <div style={{
        position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 9999, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, whiteSpace: 'nowrap',
      }}><Crosshair size={14} /> Drag anywhere to set the focal point</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 28, margin: '12px 0', color: cli.stone500 }}>
      <ZoomOut size={18} />
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: cli.stone200, position: 'relative' }}>
        <div style={{ position: 'absolute', left: -8, top: -6, width: 16, height: 16, borderRadius: '50%', background: cli.orange500 }} />
      </div>
      <ZoomIn size={18} />
    </div>
    <p style={{ margin: '0 0 12px', fontSize: 14, color: cli.stone600, lineHeight: 1.45 }}>
      The focal point determines how your image is cropped across card and banner displays.
    </p>
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <PillBtn kind="secondary" size="sm"><RefreshCw size={16} /> Replace image</PillBtn>
      <PillBtn kind="ghost" size="sm" style={{ border: 'none' }}><Trash2 size={16} /> Remove</PillBtn>
    </div>
    <div style={{ borderTop: `1px solid ${cli.stone200}`, paddingTop: 14, fontSize: 14, color: cli.textPrimary }}>
      <div style={{ fontWeight: 500, marginBottom: 10 }}>Image description for screen readers</div>
      {[['Skip description', true], ['Add a description', false]].map(([l, on]) => (
        <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${on ? cli.orange500 : cli.stone400}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {on ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: cli.orange500 }} /> : null}
          </span>
          {l as string}
        </div>
      ))}
    </div>
  </div>
);
