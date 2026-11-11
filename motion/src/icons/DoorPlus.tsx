/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * https://mozilla.org/MPL/2.0/.
 *
 * Copied from the Pavillion app: src/client/components/common/icons/door-plus.vue
 * (the location picker's per-place "add space" icon). Paths unchanged; ported
 * from a Vue SFC to a React component.
 */
import React from 'react';

export const DoorPlus: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 24, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={style}
  >
    <path d="M18 9V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
    <path d="M2 20h8" />
    <path d="M10 12h.01" />
    <path d="M15 18h6" />
    <path d="M18 15v6" />
  </svg>
);
