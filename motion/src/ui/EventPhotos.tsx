/**
 * Photos for the other public event cards. All from Unsplash (Unsplash License:
 * free to use and modify, no attribution required; not to be sold unaltered or
 * used to build a competing image service), resized to 1200×800 into the site's public/clips/images/.
 *   basketball.jpg  Gene Gallin   (gene-gallin-1z3o_YnOv5k-unsplash.jpg)
 *                   a ball on a gym floor; the maker's wordmark is printed large on the ball.
 *   live-music.jpg  Israel Palacio (israel-palacio-Y20JJ_ddy9M-unsplash.jpg)
 *                   a vintage microphone against bokeh; a small maker's badge on the grille.
 *   bird-walk.jpg   Nicky Jones (nicky-jones-rDyptCanKa0-unsplash.jpg) a robin singing on a branch.
 *   market.jpg      Thomas Le (thomas-le-pRJhn4MbsMM-unsplash.jpg, portrait 800×1200) produce stalls;
 *                   a lit shop sign top left, kept out of frame by the focal point.
 *   matinee.jpg     Erik Mclean (erik-mclean-PFfA3xlHFbQ-unsplash.jpg) a full house facing a lit stage.
 *   work-party.jpg  Jonathan Kemper (jonathan-kemper-4z3lnwEvZQw-unsplash.jpg) hands in garden soil.
 *   story-hour.jpg  Kimberly Farmer (kimberly-farmer-lUaaKCUANVI-unsplash.jpg, 1200×798) a stack of
 *                   children's books.
 *   karaoke.jpg     Ilke Yazgan (ilke-yazgan-ttWUr_0KvMc-unsplash.jpg, 1200×774) a lit KARAOKE sign
 *                   in a window, with reflected lettering over it.
 * Shown like object-fit: cover; `focal` (0..1) is the object-position.
 */
import React from 'react';
import { Img, staticFile } from 'remotion';

export const EVENT_PHOTOS = {
  basketball: { src: 'clips/images/basketball.jpg', focal: { x: 0.3, y: 0.55 } },
  'live-music': { src: 'clips/images/live-music.jpg', focal: { x: 0.38, y: 0.4 } },
  'bird-walk': { src: 'clips/images/bird-walk.jpg', focal: { x: 0.5, y: 0.45 } },
  market: { src: 'clips/images/market.jpg', focal: { x: 0.6, y: 0.62 } },
  matinee: { src: 'clips/images/matinee.jpg', focal: { x: 0.55, y: 0.45 } },
  'work-party': { src: 'clips/images/work-party.jpg', focal: { x: 0.55, y: 0.55 } },
  'story-hour': { src: 'clips/images/story-hour.jpg', focal: { x: 0.2, y: 0.5 } },
  karaoke: { src: 'clips/images/karaoke.jpg', focal: { x: 0.52, y: 0.45 } },
} as const;
export type EventPhotoKey = keyof typeof EVENT_PHOTOS;

export const EventPhoto: React.FC<{ photo: EventPhotoKey }> = ({ photo }) => {
  const p = EVENT_PHOTOS[photo];
  return (
    <Img
      src={staticFile(p.src)}
      alt=""
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }}
    />
  );
};
