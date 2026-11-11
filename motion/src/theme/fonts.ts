/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * https://mozilla.org/MPL/2.0/.
 *
 * Adapted from the Pavillion app's src/common/ui/assets/fonts.scss, keeping its
 * file-to-weight mapping (Bold.otf is 600, ExtraBold.otf is 700). The font files
 * are Creato Display, under the SIL Open Font License
 * (public/fonts/creato_display/SIL OPEN FONT LICENSE.txt).
 */
import { continueRender, delayRender, staticFile } from 'remotion';

const FACES: Array<[string, string]> = [
  ['CreatoDisplay-Regular.otf', '400'],
  ['CreatoDisplay-Medium.otf', '500'],
  ['CreatoDisplay-Bold.otf', '600'],
  ['CreatoDisplay-ExtraBold.otf', '700'],
];

let loaded = false;

export function loadAppFonts(): void {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading Creato Display');
  Promise.all(
    FACES.map(([file, weight]) => {
      const face = new FontFace('Creato Display', `url(${staticFile(`fonts/creato_display/${file}`)}) format('opentype')`, { weight });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
