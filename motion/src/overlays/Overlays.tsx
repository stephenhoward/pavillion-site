/**
 * Explanatory overlays. None of these exist in the app; they are drawn in a
 * deliberately different visual language (dark ink, dashed rings, a lens with
 * a drop shadow, sans-serif tags off the card edge) so they read as
 * annotation on top of the UI, not as part of it.
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { FONT_FAMILY } from '../theme/tokens';

const INK = '#1f2937';

/** A finger tap: a soft dot that presses in, plus one expanding ring. */
export const TapMark: React.FC<{ x: number; y: number; at: number; size?: number }> = ({ x, y, at, size = 44 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -4 || t > 13) return null;
  const dotOpacity = interpolate(t, [-4, 0, 5, 10], [0, 0.32, 0.32, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dotScale = interpolate(t, [-4, 0, 3], [1.15, 0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ring = interpolate(t, [0, 12], [0.6, 1.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const ringOpacity = interpolate(t, [0, 3, 12], [0, 0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, pointerEvents: 'none', zIndex: 50 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: INK, opacity: dotOpacity, transform: `scale(${dotScale})` }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${INK}`, opacity: ringOpacity, transform: `scale(${ring})` }} />
    </div>
  );
};

/** A finger held down and moved (for the focal-point drag). */
export const DragMark: React.FC<{ x: number; y: number; visible: number; size?: number }> = ({ x, y, visible, size = 44 }) => (
  <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: INK, opacity: 0.3 * visible, pointerEvents: 'none', zIndex: 50 }} />
);

/**
 * Highlight ring plus a magnifying lens beside the target. The lens shows a
 * scaled copy of `children` (the icon exactly as the app draws it).
 */
export const HighlightLens: React.FC<{
  x: number; y: number; from: number; to: number; ringSize?: number;
  lensDx?: number; lensDy?: number; lensSize?: number; children: React.ReactNode;
}> = ({ x, y, from, to, ringSize = 48, lensDx = -150, lensDy = -150, lensSize = 132, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from - 2 || frame > to + 10) return null;
  const inS = spring({ frame: frame - from, fps, config: { damping: 14, stiffness: 140 } });
  const out = interpolate(frame, [to, to + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulse = 1 + 0.06 * Math.sin((frame - from) / 4);
  const lensS = spring({ frame: frame - from - 6, fps, config: { damping: 13, stiffness: 120 } });
  const lx = x + lensDx;
  const ly = y + lensDy;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 60, opacity: out }}>
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
        <line x1={x} y1={y} x2={lx} y2={ly} stroke={INK} strokeWidth={2} strokeDasharray="4 5" opacity={lensS * 0.7} />
      </svg>
      <div style={{
        position: 'absolute', left: x - ringSize / 2, top: y - ringSize / 2, width: ringSize, height: ringSize,
        borderRadius: '50%', border: `3px dashed ${INK}`, transform: `scale(${inS * pulse})`,
      }} />
      <div style={{
        position: 'absolute', left: lx - lensSize / 2, top: ly - lensSize / 2, width: lensSize, height: lensSize,
        borderRadius: '50%', background: '#fff', border: `3px solid ${INK}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)', transform: `scale(${lensS})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
};

/** Region 1's source tag: a small dark label that hangs off a card's edge. */
export const SourceTag: React.FC<{ label: string; color: string; opacity: number; scale?: number }> = ({ label, color, opacity, scale = 1 }) => (
  <div style={{
    position: 'absolute', top: -14 * scale, right: 18 * scale, zIndex: 20,
    display: 'flex', alignItems: 'center', gap: 7 * scale,
    padding: `${5 * scale}px ${11 * scale}px ${5 * scale}px ${9 * scale}px`,
    background: INK, color: '#fff', borderRadius: 6 * scale,
    fontFamily: FONT_FAMILY, fontSize: 13 * scale, fontWeight: 500, letterSpacing: '0.01em',
    boxShadow: '0 4px 10px rgba(0,0,0,0.18)', opacity, whiteSpace: 'nowrap',
  }}>
    <span style={{ width: 9 * scale, height: 9 * scale, borderRadius: 2 * scale, background: color }} />
    {label}
  </div>
);

/** Region 1's source colour: a band drawn over the card's left edge. */
export const SourceBand: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <div style={{
    position: 'absolute', left: -14, top: 0, bottom: 0, width: 6, borderRadius: 3,
    background: color, opacity, zIndex: 20,
  }} />
);
