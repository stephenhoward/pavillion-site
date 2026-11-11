/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * https://mozilla.org/MPL/2.0/.
 *
 * Inline SVGs copied from the Pavillion app (paths unchanged):
 *   - CalendarFallback: src/site/components/event-card.vue (.no-image-fallback)
 *   - ViewIcon paths: src/common/ui/calendar-views/CalendarViewToolbar.vue (VIEW_ICON_PATHS)
 *   - MapPinOutline: src/client/components/common/location-display-card.vue ("Add Location")
 *   - Chevron: src/site/components/search-filter-public.vue (.dropdown-icon)
 */
import React from 'react';

export const CalendarFallback: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} width={size} height={size}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const VIEW_ICON_PATHS = {
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  week: ['M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M9 4v16', 'M15 4v16'],
  month: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M3 10h18', 'M8 2v4', 'M16 2v4', 'M9 10v12', 'M15 10v12', 'M3 16h18'],
} as const;

export const ViewIcon: React.FC<{ view: keyof typeof VIEW_ICON_PATHS }> = ({ view }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {VIEW_ICON_PATHS[view].map((d) => <path key={d} d={d} />)}
  </svg>
);

export const MapPinOutline: React.FC = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Chevron: React.FC = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
