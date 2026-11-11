/**
 * SUPERSEDED by the photo in SeedSwapArt.tsx (kept for reference). Placeholder "photo" for the Seed Swap: an original illustration drawn here
 * (seed packets, jars and a seedling tray on a table), so it carries no third-
 * party licence. Replace with a real photo we own or that is openly licensed
 * before the cut goes for review (storyboard check 4).
 *
 * Drawn on a 1200x800 canvas and rendered with preserveAspectRatio "slice" so
 * it crops like object-fit: cover. `fx`/`fy` (0..1) act as the focal point.
 */
import React from 'react';

const Packet: React.FC<{ x: number; y: number; r: number; color: string; label: string; motif: string }> = ({ x, y, r, color, label, motif }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-70} y={-100} width={140} height={200} rx={6} fill="#f6efe1" stroke="#d9cdb4" strokeWidth={2} />
    <rect x={-58} y={-86} width={116} height={110} rx={4} fill={color} />
    <circle cx={0} cy={-31} r={30} fill={motif} opacity={0.9} />
    <path d="M0 -1 L0 22 M0 10 q-14 -6 -20 -18 M0 14 q14 -6 20 -16" stroke="#3f6b2a" strokeWidth={4} fill="none" strokeLinecap="round" />
    <rect x={-50} y={40} width={100} height={10} rx={3} fill="#8b7d63" opacity={0.7} />
    <rect x={-40} y={58} width={80} height={7} rx={3} fill="#8b7d63" opacity={0.45} />
    <text x={0} y={86} textAnchor="middle" fontSize={14} fill="#6b5f48" fontFamily="Georgia, serif" fontStyle="italic">{label}</text>
  </g>
);

const Jar: React.FC<{ x: number; y: number; seed: string }> = ({ x, y, seed }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-46} y={-130} width={92} height={22} rx={5} fill="#b08d57" />
    <path d="M-52 -108 h104 v120 a18 18 0 0 1 -18 18 h-68 a18 18 0 0 1 -18 -18 z" fill="#e8f1ee" opacity={0.55} stroke="#c9d8d3" strokeWidth={3} />
    {Array.from({ length: 46 }).map((_, i) => (
      <ellipse key={i} cx={-38 + ((i * 17) % 76)} cy={22 - Math.floor(i / 5) * 9} rx={5} ry={3.4} fill={seed} transform={`rotate(${(i * 37) % 180} ${-38 + ((i * 17) % 76)} ${22 - Math.floor(i / 5) * 9})`} />
    ))}
    <rect x={-30} y={-70} width={60} height={30} rx={3} fill="#fbf7ee" stroke="#d9cdb4" />
  </g>
);

export const SeedSwapIllustration: React.FC<{ fx?: number; fy?: number; style?: React.CSSProperties }> = ({ fx = 0.5, fy = 0.5, style }) => {
  // Map focal point to SVG alignment by shifting the viewBox inside the slice.
  const vbW = 1200;
  const vbH = 800;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio={`x${fx < 0.34 ? 'Min' : fx > 0.66 ? 'Max' : 'Mid'}Y${fy < 0.34 ? 'Min' : fy > 0.66 ? 'Max' : 'Mid'} slice`} width="100%" height="100%" style={{ display: 'block', ...style }}>
      <defs>
        <linearGradient id="ssWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe8d6" />
          <stop offset="1" stopColor="#c7d6bb" />
        </linearGradient>
        <linearGradient id="ssTable" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c99a62" />
          <stop offset="1" stopColor="#a8783f" />
        </linearGradient>
        <radialGradient id="ssLight" cx="0.3" cy="0.1" r="0.9">
          <stop offset="0" stopColor="#fff8e6" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff8e6" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={vbW} height={vbH} fill="url(#ssWall)" />
      {/* window light */}
      <rect x={80} y={40} width={300} height={260} rx={8} fill="#f4f8ef" opacity={0.7} />
      <path d="M230 40 v260 M80 170 h300" stroke="#c7d6bb" strokeWidth={10} />
      {/* table */}
      <rect y={380} width={vbW} height={420} fill="url(#ssTable)" />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M0 ${420 + i * 58} C 300 ${410 + i * 58}, 800 ${440 + i * 58}, 1200 ${425 + i * 58}`} stroke="#9a6d38" strokeWidth={2} fill="none" opacity={0.35} />
      ))}
      {/* seedling tray */}
      <g transform="translate(860 360)">
        <rect x={-150} y={0} width={300} height={70} rx={8} fill="#3d3a35" />
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i} transform={`translate(${-120 + i * 60} 0)`}>
            <path d="M0 0 C -4 -40, -26 -52, -40 -44 C -30 -30, -12 -24, 0 -10 Z" fill="#6aa84f" />
            <path d="M0 0 C 4 -48, 30 -60, 44 -50 C 30 -36, 12 -28, 0 -12 Z" fill="#7cbd5c" />
            <path d="M0 4 V -30" stroke="#4d7f37" strokeWidth={4} />
          </g>
        ))}
      </g>
      <Jar x={170} y={560} seed="#7a4b2a" />
      <Jar x={300} y={600} seed="#e0c36a" />
      <Packet x={520} y={560} r={-8} color="#e9a23b" motif="#f6d36b" label="Calendula" />
      <Packet x={690} y={590} r={5} color="#c8553d" motif="#f28f6b" label="Tomato" />
      <Packet x={860} y={600} r={-3} color="#6f8fbf" motif="#a9c3ea" label="Borage" />
      <Packet x={1030} y={575} r={9} color="#7b9a4a" motif="#b9d27a" label="Runner bean" />
      {/* loose seeds */}
      {Array.from({ length: 28 }).map((_, i) => (
        <ellipse key={i} cx={420 + ((i * 53) % 520)} cy={720 + ((i * 29) % 60)} rx={6} ry={4} fill={i % 3 ? '#6b4426' : '#d8b65a'} transform={`rotate(${(i * 41) % 180} ${420 + ((i * 53) % 520)} ${720 + ((i * 29) % 60)})`} />
      ))}
      <rect width={vbW} height={vbH} fill="url(#ssLight)" />
    </svg>
  );
};
