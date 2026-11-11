/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * https://mozilla.org/MPL/2.0/.
 *
 * Light-theme values copied from the Pavillion app (pavillion/code):
 *   - public site tokens: src/common/ui/assets/mixins.scss (public-theme-tokens, $public-*)
 *   - client (editor) tokens: src/client/assets/style/tokens/_colors.scss,
 *     themes/_light.scss, components/_translatable-form.scss and the scoped
 *     styles of edit_event.vue, toggle-chip.vue and sheet.vue.
 * Only the light theme is reproduced: the clips are rendered once, in light.
 */

export const FONT_FAMILY = "'Creato Display', 'Helvetica Neue', -apple-system, sans-serif";

/** Public site (calendar pages). */
export const pub = {
  accent: '#ff9131',
  surfacePrimary: '#ffffff',
  surfaceSecondary: 'rgba(0, 0, 0, 0.02)',
  surfaceTertiary: 'rgba(0, 0, 0, 0.04)',
  textPrimary: 'rgba(0, 0, 0, 0.9)',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  textMuted: 'rgba(0, 0, 0, 0.4)',
  borderSubtle: 'rgba(0, 0, 0, 0.08)',
  borderMedium: 'rgba(0, 0, 0, 0.15)',
  badgeSkyBg: '#e0f2fe',
  badgeSkyText: '#0369a1',
  recurrenceBadgeBg: 'rgba(255, 255, 255, 0.9)',
  shadowXs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  shadowXl: '0 8px 12px rgba(0, 0, 0, 0.08), 0 20px 40px rgba(0, 0, 0, 0.15)',
  borderPicker: 'rgba(0, 0, 0, 0.12)',
  textPicker: 'rgba(0, 0, 0, 0.85)',
  shadowPicker: '0 1px 3px rgba(0, 0, 0, 0.04)',
  fs: { xs: 11, sm: 13, base: 14, md: 16, lg: 20, xl: 24, x2l: 32, x3l: 36 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, x2l: 32, x3l: 48 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, x2l: 24, full: 9999 },
} as const;

/** Client app (event editor). */
export const cli = {
  orange50: '#FFF7ED',
  orange500: '#F97316',
  orange600: '#EA580C',
  stone50: '#FAFAF9',
  stone100: '#F5F5F4',
  stone200: '#E7E5E4',
  stone300: '#D6D3D1',
  stone400: '#A8A29E',
  stone500: '#78716C',
  stone600: '#57534E',
  stone700: '#44403C',
  stone900: '#1C1917',
  sky500: '#0EA5E9',
  red500: '#EF4444',
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#FAFAFA',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#78716C',
  borderPrimary: '#D6D3D1',
  borderSecondary: '#E7E5E4',
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  // --pav-font-size-* (client scale)
  fs: { xs: 14.22, sm: 16, base: 18, md: 20.25, lg: 22.78 },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
} as const;
