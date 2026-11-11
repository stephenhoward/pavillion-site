/**
 * A plain, unbranded phone outline. Device chrome only: nothing here is app UI.
 */
import React from 'react';

export const SCREEN_W = 390;
export const SCREEN_H = 844;
export const BEZEL = 12;

export const PhoneFrame: React.FC<{ x: number; y: number; scale: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, scale, children, style }) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: SCREEN_W + BEZEL * 2, height: SCREEN_H + BEZEL * 2,
    transform: `scale(${scale})`, transformOrigin: '0 0', ...style,
  }}>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 56, background: '#1c1917',
      boxShadow: '0 30px 60px rgba(28,25,23,0.28), 0 8px 18px rgba(28,25,23,0.18), inset 0 0 0 2px #44403c',
    }} />
    <div style={{
      position: 'absolute', left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H, borderRadius: 44,
      overflow: 'hidden', background: '#fff',
    }}>
      {children}
    </div>
  </div>
);

/** Converts a point in phone-screen coordinates to the parent's coordinates. */
export const screenToParent = (px: number, py: number, frame: { x: number; y: number; scale: number }) => ({
  x: frame.x + frame.scale * (BEZEL + px),
  y: frame.y + frame.scale * (BEZEL + py),
});
