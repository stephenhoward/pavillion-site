/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * https://mozilla.org/MPL/2.0/.
 *
 * Simplified React re-creation of the Pavillion public calendar's list view,
 * following the markup and scoped styles of src/site/components/calendar.vue,
 * event-card.vue and search-filter-public.vue, and the public-* mixins in
 * src/common/ui/assets/mixins.scss. Light theme only.
 */
import React from 'react';
import { MapPin, Repeat, Search, CalendarDays } from 'lucide-react';
import { pub, FONT_FAMILY } from '../theme/tokens';
import { CalendarFallback, Chevron, ViewIcon } from '../icons/AppSvgs';
import { SeedSwapArt, SEED_SWAP_FOCAL } from './SeedSwapArt';
import { EventPhoto } from './EventPhotos';
import type { EventCardData } from '../data/larkspur';

export type Layout = 'phone' | 'desktop';

/** Card image width/height by layout (public-event-card-stacked). */
const imageBox = (layout: Layout) => (layout === 'phone' ? { height: 144 } : { width: 256 });
const DESKTOP_IMAGE_W = 256;

/**
 * Optional build-up of a desktop card around its photo, each part 0..1 (1 = as in the app):
 * surface  the card's white body extends right from the photo's edge
 * title    share of the title's characters typed
 * time     the time drops in from above
 * pin      the location icon is revealed from its tip up
 * pinTilt  the icon's rotation about its tip, degrees (the wobble after the reveal)
 * location share of the location's characters typed
 * rest     description and categories fade in
 * crop     Seed Swap photo only: 0 shows the whole (portrait, 2:3) photo, 1 the card's crop;
 *          `boxH` is the card's height in px (the image box's height)
 */
export type CardBuild = { surface: number; title: number; time: number; pin: number; pinTilt: number; location: number; rest: number; crop: number; boxH: number };

const typed = (text: string, p: number) => text.slice(0, Math.round(Math.max(0, Math.min(1, p)) * text.length));
/** Text caret, shown only while a field is being typed. */
const Caret: React.FC<{ p: number; color: string }> = ({ p, color }) => (p > 0 && p < 1 ? (
  <span style={{ display: 'inline-block', width: 2, height: '1.05em', marginLeft: 1, verticalAlign: '-0.15em', background: color }} />
) : null);

export const PublicEventCard: React.FC<{
  ev: EventCardData; layout: Layout; style?: React.CSSProperties; children?: React.ReactNode; build?: CardBuild;
}> = ({ ev, layout, style, children, build }) => {
  const phone = layout === 'phone';
  const b = phone ? undefined : build;
  const r = pub.radius.md;
  // While the photo stands alone its right corners are rounded too; they square off as the body extends.
  const rightR = b ? r * Math.max(0, 1 - b.surface * 6) : 0;
  // Seed Swap opening: the whole portrait photo, closing to the card's crop (the image box).
  const full = b && ev.image === 'seedswap' && b.crop < 1 ? (() => {
    const h = DESKTOP_IMAGE_W * 1.5;
    const top = (b.boxH - h) * SEED_SWAP_FOCAL.y; // where object-position puts the photo in the box (negative)
    return { h, top, insetT: -top * b.crop, insetB: (h + top - b.boxH) * b.crop };
  })() : null;
  return (
    <article style={{
      position: 'relative', display: 'flex', flexDirection: phone ? 'column' : 'row',
      background: b ? 'transparent' : pub.surfacePrimary, borderRadius: r, boxShadow: b ? 'none' : pub.shadowSm,
      fontFamily: FONT_FAMILY, ...style,
    }}>
      {b ? (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: r, background: pub.surfacePrimary, boxShadow: pub.shadowSm,
          width: `calc(${DESKTOP_IMAGE_W}px + (100% - ${DESKTOP_IMAGE_W}px) * ${b.surface})`,
          opacity: b.crop, // no shadow under the box while the whole photo shows
        }} />
      ) : null}
      {children}
      <div style={{
        position: 'relative', flexShrink: 0, overflow: full ? 'visible' : 'hidden', background: full ? 'transparent' : pub.surfaceTertiary,
        borderRadius: phone ? `${r}px ${r}px 0 0` : `${r}px ${rightR}px ${rightR}px ${r}px`,
        ...(phone ? { width: '100%' } : { alignSelf: 'stretch', minHeight: 176 }), ...imageBox(layout),
      }}>
        {full ? (
          <div style={{
            position: 'absolute', left: 0, top: full.top, width: DESKTOP_IMAGE_W, height: full.h,
            clipPath: `inset(${full.insetT}px 0 ${full.insetB}px 0 round ${r}px)`,
          }}>
            <SeedSwapArt />
          </div>
        ) : ev.image === 'seedswap' ? (
          <SeedSwapArt fx={SEED_SWAP_FOCAL.x} fy={SEED_SWAP_FOCAL.y} />
        ) : ev.image ? (
          <EventPhoto photo={ev.image} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${pub.surfaceSecondary} 0%, ${pub.surfaceTertiary} 100%)`,
          }}>
            <CalendarFallback size={40} color={pub.textMuted} />
          </div>
        )}
        {ev.recurring ? (
          <span style={{
            position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: pub.radius.full, fontSize: pub.fs.xs, fontWeight: 500,
            background: pub.recurrenceBadgeBg, color: pub.textPrimary, whiteSpace: 'nowrap',
          }}>
            <Repeat size={14} aria-hidden /> Recurring Event
          </span>
        ) : null}
      </div>
      <div style={{
        position: 'relative', flex: 1, padding: phone ? pub.space.md : pub.space.lg, display: 'flex', flexDirection: 'column',
        gap: pub.space.sm, minWidth: 0,
      }}>
        <p style={{
          margin: 0, fontSize: pub.fs.sm, fontWeight: 500, color: pub.accent,
          ...(b ? { opacity: b.time, transform: `translateY(${(1 - b.time) * -18}px)` } : null),
        }}>{ev.time}</p>
        <h3 style={{ margin: 0, fontSize: phone ? pub.fs.base : pub.fs.md, fontWeight: 600, lineHeight: 1.25, color: pub.textPrimary }}>
          {b ? <>{typed(ev.title, b.title)}<Caret p={b.title} color={pub.textPrimary} />{'\u200b'}</> : ev.title}
        </h3>
        <p style={{
          margin: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: pub.fs.sm, color: pub.textSecondary,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <MapPin size={16} aria-hidden style={{
            flexShrink: 0,
            // lucide's MapPin tip is at (12, 22) of its 24-unit box: reveal upward from there and rock on it
            ...(b ? { clipPath: `inset(${(1 - b.pin) * 100}% 0 0 0)`, transform: `rotate(${b.pinTilt}deg)`, transformOrigin: '50% 91.7%' } : null),
          }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {b ? <>{typed(ev.location, b.location)}<Caret p={b.location} color={pub.textSecondary} /></> : ev.location}
          </span>
        </p>
        <p style={{
          margin: 0, fontSize: pub.fs.base, color: pub.textSecondary, lineHeight: 1.5,
          display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
          opacity: b ? b.rest : 1,
        }}>{ev.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: pub.space.sm, opacity: b ? b.rest : 1 }}>
          {ev.categories.map((c) => (
            <span key={c} style={{
              display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: pub.radius.lg,
              fontSize: pub.fs.xs, fontWeight: 500, background: pub.badgeSkyBg, color: pub.badgeSkyText,
            }}>{c}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

/** Day heading (public-sticky-date-heading). */
export const DayHeading: React.FC<{ label: string; style?: React.CSSProperties }> = ({ label, style }) => (
  <h2 style={{
    display: 'flex', alignItems: 'center', gap: pub.space.sm, margin: `0 0 ${pub.space.lg}px 0`, padding: `${pub.space.sm}px 0`,
    textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontSize: 14, color: pub.textSecondary,
    fontFamily: FONT_FAMILY, background: pub.surfacePrimary, ...style,
  }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: pub.accent, flexShrink: 0 }} />
    {label}
  </h2>
);

/** Calendar header: title, search row (search + date filter). */
/** Height the category filter adds under the search row: 16 gap + 12px label (line-height 1.5) + 8 + pill row (32 + 2×4 padding). */
export const CATEGORY_FILTER_H = 16 + 18 + 8 + 40;

/**
 * Calendar header: title, search + date row and, when the calendar has categories, the
 * category filter under them (site/components/search-filter-public.vue,
 * category-pill-selector.vue; pills per the public-filter-pill mixin, none selected).
 */
export const CalendarHeader: React.FC<{ title: string; layout: Layout; dateLabel: string; categories?: string[] }> = ({ title, layout, dateLabel, categories }) => {
  const phone = layout === 'phone';
  const pad = phone ? 16 : 32;
  return (
    <header style={{ fontFamily: FONT_FAMILY, marginBottom: pub.space.xl }}>
      <div style={{ padding: `${phone ? pub.space.x2l : pub.space.x3l}px ${pad}px ${phone ? pub.space.xl : pub.space.x2l}px` }}>
        <h1 style={{
          margin: `0 0 ${pub.space.sm}px 0`, fontSize: phone ? pub.fs.x2l : pub.fs.x3l, fontWeight: 700,
          letterSpacing: '-0.01em', lineHeight: 1.25, color: pub.textPrimary,
        }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: phone ? 'column' : 'row', gap: pub.space.md, padding: `0 ${pad}px` }}>
        <div style={{
          flex: phone ? 'none' : 1, position: 'relative', display: 'flex', alignItems: 'center', height: 44,
          border: `1px solid ${pub.borderPicker}`, borderRadius: pub.radius.full, background: pub.surfacePrimary,
          boxShadow: pub.shadowPicker, paddingLeft: 12,
        }}>
          <Search size={16} color={pub.textMuted} />
          <span style={{ marginLeft: 8, fontSize: pub.fs.base, color: pub.textMuted }}>Search events...</span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px',
          border: `1px solid ${pub.borderPicker}`, borderRadius: pub.radius.full, background: pub.surfacePrimary,
          boxShadow: pub.shadowPicker, color: pub.textPicker, fontSize: pub.fs.base, alignSelf: phone ? 'flex-start' : 'auto',
        }}>
          <CalendarDays size={18} />
          <span>{dateLabel}</span>
          <Chevron />
        </div>
      </div>
      {categories && categories.length > 0 ? (
        <div style={{ marginTop: pub.space.lg, padding: `0 ${pad}px` }}>
          <div style={{
            fontSize: 12, lineHeight: 1.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em',
            color: pub.textSecondary, marginBottom: pub.space.sm,
          }}>Filter by Categories</div>
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: pub.space.sm, padding: `${pub.space.xs}px ${pub.space.sm}px`, overflow: 'hidden' }}>
            {categories.map((c) => (
              <span key={c} style={{
                display: 'inline-flex', alignItems: 'center', flexShrink: 0, padding: phone ? '5px 10px' : '6px 14px',
                minHeight: phone ? 44 : 32, boxSizing: 'border-box', borderRadius: pub.radius.lg,
                fontSize: phone ? pub.fs.xs : pub.fs.sm, lineHeight: 1.25, letterSpacing: '0.02em', whiteSpace: 'nowrap',
                background: pub.surfaceTertiary, color: pub.textSecondary, boxShadow: pub.shadowXs,
              }}>{c}</span>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};

/** List/week/month switcher; only rendered when more than one view is available (not at phone width). */
export const ViewToolbar: React.FC = () => (
  <div style={{ display: 'flex', marginBottom: pub.space.xl }}>
    <div style={{
      display: 'inline-flex', marginInlineStart: 'auto', padding: 2, gap: 2, borderRadius: 999,
      background: pub.surfaceTertiary, boxShadow: pub.shadowXs,
    }}>
      {(['list', 'week', 'month'] as const).map((v) => (
        <span key={v} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, height: 28, borderRadius: 999,
          background: v === 'list' ? pub.surfacePrimary : 'transparent', color: v === 'list' ? pub.textPrimary : pub.textSecondary,
          boxShadow: v === 'list' ? pub.shadowXs : 'none',
        }}><ViewIcon view={v} /></span>
      ))}
    </div>
  </div>
);
