/**
 * The Seed Swap's image: photo by Jael Rodriguez on Unsplash
 * (jael-rodriguez-hp6vX7SvrCs-unsplash.jpg, resized to 800×1200 as
 * public/images/seed-swap.jpg). Unsplash License: free to use and modify, no
 * attribution required; not to be sold unaltered or used to build a competing
 * image service. The original illustration is in SeedSwapIllustration.tsx.
 *
 * Shown like object-fit: cover; `fx`/`fy` (0..1) are the focal point. The photo
 * is portrait; the hand-off of the seedling plug sits at about (0.55, 0.25). A
 * small brand mark on the glove sits at about (0.4, 0.57); crops centred lower
 * than ~0.35 can show it.
 */
import React from 'react';
import { Img, staticFile } from 'remotion';

export const SEED_SWAP_PHOTO = 'clips/images/seed-swap.jpg';
/** Focal point used for the public cards and where the region 2 drag ends. */
export const SEED_SWAP_FOCAL = { x: 0.55, y: 0.25 };

export const SeedSwapArt: React.FC<{ fx?: number; fy?: number; style?: React.CSSProperties }> = ({ fx = 0.5, fy = 0.5, style }) => (
  <Img
    src={staticFile(SEED_SWAP_PHOTO)}
    alt=""
    style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx * 100}% ${fy * 100}%`, ...style }}
  />
);
