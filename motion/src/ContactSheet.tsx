/** Dev-only: a grid of frozen frames for checking layout without scrubbing. */
import React from 'react';
import { AbsoluteFill, Freeze, getInputProps } from 'remotion';

export const ContactSheet: React.FC<{ Comp: React.FC; frames: number[]; crop: { x: number; y: number; w: number; h: number }; cols: number; scale: number }> = ({ Comp, frames, crop, cols, scale }) => {
  const override = (getInputProps() as { frames?: string }).frames;
  const list = override ? override.split(',').map(Number) : frames;
  return (
    <AbsoluteFill style={{ background: '#999', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
      {list.map((f) => (
        <div key={f} style={{ position: 'relative', width: crop.w * scale, height: crop.h * scale + 18, overflow: 'hidden', border: '1px solid #666', boxSizing: 'content-box' }}>
          <div style={{ position: 'absolute', left: -crop.x * scale, top: -crop.y * scale + 18, width: 1536, height: 1008, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
            <Freeze frame={f}><Comp /></Freeze>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 18, background: '#222', color: '#fff', fontSize: 13, paddingLeft: 4 }}>{f}</div>
        </div>
      ))}
      <div style={{ width: cols ? 0 : 0 }} />
    </AbsoluteFill>
  );
};
