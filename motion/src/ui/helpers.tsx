import React from 'react';
import { interpolate, Easing } from 'remotion';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Characters of `text` visible at `frame`, typed between `from` and `to`. */
export function typed(text: string, frame: number, from: number, to: number): string {
  const n = Math.round(interpolate(frame, [from, to], [0, text.length], clamp));
  return text.slice(0, n);
}

/** A blinking text caret, shown only while `active`. */
export const Caret: React.FC<{ frame: number; active: boolean; color?: string; height?: number }> = ({ frame, active, color = '#F97316', height = 20 }) => {
  if (!active) return null;
  const on = Math.floor(frame / 8) % 2 === 0;
  return <span style={{ display: 'inline-block', width: 2, height, background: color, marginLeft: 1, verticalAlign: 'text-bottom', opacity: on ? 1 : 0 }} />;
};

/**
 * Piecewise scroll position from [frame, value] keyframes, eased between each
 * pair, held after the last.
 */
export function keyframes(frame: number, points: Array<[number, number]>, easing = Easing.inOut(Easing.cubic)): number {
  if (frame <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [f1, v1] = points[i];
    const [f0, v0] = points[i - 1];
    if (frame <= f1) return interpolate(frame, [f0, f1], [v0, v1], { ...clamp, easing });
  }
  return points[points.length - 1][1];
}
