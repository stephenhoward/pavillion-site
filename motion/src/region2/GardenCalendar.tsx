/**
 * Region 2's last screen: the Community Garden's own public calendar at
 * phone width, list view, with the new Seed Swap on Saturday.
 */
import React from 'react';
import { pub, FONT_FAMILY } from '../theme/tokens';
import { CalendarHeader, DayHeading, PublicEventCard } from '../ui/PublicCalendar';
import { DAY_LABELS, GARDEN_CALENDAR, SEED_SWAP, WEEK_OTHERS } from '../data/larkspur';

const WORK_PARTY = WEEK_OTHERS.find((e) => e.id === 'work-party')!;

export const GardenCalendarPhone: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: pub.surfacePrimary, fontFamily: FONT_FAMILY, padding: '0 12px' }}>
    <CalendarHeader title={GARDEN_CALENDAR} layout="phone" dateLabel="Nov 20 – Dec 3" />
    <main style={{ padding: `${pub.space.x2l}px 16px` }}>
      <DayHeading label={DAY_LABELS[SEED_SWAP.day]} />
      <PublicEventCard ev={SEED_SWAP} layout="phone" />
      <div style={{ height: pub.space.x2l }} />
      <DayHeading label={DAY_LABELS[WORK_PARTY.day]} />
      <PublicEventCard ev={WORK_PARTY} layout="phone" />
    </main>
  </div>
);
