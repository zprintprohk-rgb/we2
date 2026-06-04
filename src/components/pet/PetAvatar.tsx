/**
 * PetAvatar v2 — Renders each pet's visual for its current stage (egg/baby/adult).
 *
 * Uses a component-based approach: each pet has a dedicated renderer that composes
 * SVG primitives (circles, paths, gradients) layered to create a unique character.
 *
 * V1 legacy pets (cat/dog/fox/dragon/panda) are preserved as "classic" variants.
 */
'use client';

import React, { useMemo } from 'react';
import type { PetId, Stage } from '@/data/pets';
import { getPetById } from '@/data/pets';

/* ── Props ── */

interface PetAvatarProps {
  petId: PetId;
  stage?: Stage;          // default 'adult'
  size?: number;          // default 120
  mood?: 'happy' | 'neutral' | 'hungry' | 'tired' | 'sad' | 'excited';
  className?: string;
}

/* ── Animations per style ── */

const cuteHover = 'hover:scale-110 transition-transform duration-300';
const pixelHover = 'hover:scale-105 transition-transform duration-100';   // snappy
const minimalHover = 'hover:scale-110 hover:opacity-90 transition-all duration-500';
const abstractHover = 'hover:scale-110 hover:rotate-2 transition-all duration-500';

function moodEffects(mood: PetAvatarProps['mood']): string {
  switch (mood) {
    case 'happy': return 'animate-bounce';
    case 'hungry': return 'animate-pulse';
    case 'tired': return 'opacity-70';
    case 'sad': return 'opacity-60 grayscale';
    case 'excited': return 'animate-bounce';
    default: return '';
  }
}

/* ── Helper: Egg (used by all pets) ── */

function EggShell({ color, accent, size }: { color: string; accent: string; size: number }) {
  const s = size * 0.65;
  const cx = size / 2;
  const cy = size / 2 + s * 0.05;
  return (
    <g transform={`translate(${cx - s / 2}, ${cy - s / 2})`}>
      <ellipse cx={s / 2} cy={s / 2} rx={s * 0.42} ry={s * 0.55} fill={color} stroke={accent} strokeWidth={2} />
      <path
        d={`M ${s * 0.22} ${s * 0.28} Q ${s * 0.35} ${s * 0.15} ${s * 0.5} ${s * 0.22} Q ${s * 0.65} ${s * 0.15} ${s * 0.78} ${s * 0.28}`}
        fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round"
      />
      <circle cx={s * 0.38} cy={s * 0.42} r={s * 0.04} fill={accent} />
      <circle cx={s * 0.62} cy={s * 0.42} r={s * 0.04} fill={accent} />
      <path d={`M ${s * 0.42} ${s * 0.55} Q ${s * 0.5} ${s * 0.62} ${s * 0.58} ${s * 0.55}`} fill="none" stroke={accent} strokeWidth={1} strokeLinecap="round" />
    </g>
  );
}

/* ── Pet Renderers ── */

function BeanRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  const happy = mood === 'happy' || mood === 'excited';
  const sad = mood === 'sad';
  if (stage === 'egg') return <EggShell color="#bbf7d0" accent="#166534" size={size} />;

  // Baby: small sprout with two leaves
  const scale = stage === 'baby' ? 0.7 : 1;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* stem */}
      <rect x={-4} y={-s * 0.25} width={8} height={s * 0.25} rx={4} fill="#22c55e" />
      {/* head / seed body */}
      <ellipse cx={0} cy={s * 0.05} rx={s * 0.22} ry={s * 0.28} fill="#4ade80" stroke="#166534" strokeWidth={2} />
      {/* eyes */}
      <circle cx={-s * 0.07} cy={s * 0.02} r={s * 0.03} fill="#166534" />
      <circle cx={s * 0.07} cy={s * 0.02} r={s * 0.03} fill="#166534" />
      {happy && <path d={`M ${-s * 0.05} ${s * 0.1} Q 0 ${s * 0.16} ${s * 0.05} ${s * 0.1}`} fill="none" stroke="#166534" strokeWidth={1.5} strokeLinecap="round" />}
      {sad && <path d={`M ${-s * 0.05} ${s * 0.1} Q 0 ${s * 0.07} ${s * 0.05} ${s * 0.1}`} fill="none" stroke="#166534" strokeWidth={1.5} strokeLinecap="round" />}
      {!happy && !sad && <line x1={-s * 0.04} y1={s * 0.1} x2={s * 0.04} y2={s * 0.1} stroke="#166534" strokeWidth={1.5} strokeLinecap="round" />}
      {/* blush */}
      <circle cx={-s * 0.13} cy={s * 0.06} r={s * 0.04} fill="#fda4af" opacity={0.5} />
      <circle cx={s * 0.13} cy={s * 0.06} r={s * 0.04} fill="#fda4af" opacity={0.5} />
      {/* leaves */}
      {stage === 'adult' && (
        <>
          <ellipse cx={-s * 0.08} cy={-s * 0.18} rx={s * 0.1} ry={s * 0.04} fill="#22c55e" transform={`rotate(-30 ${-s * 0.08} ${-s * 0.18})`} />
          <ellipse cx={s * 0.08} cy={-s * 0.18} rx={s * 0.1} ry={s * 0.04} fill="#22c55e" transform={`rotate(30 ${s * 0.08} ${-s * 0.18})`} />
        </>
      )}
    </g>
  );
}

function LumiRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  const excited = mood === 'excited';
  if (stage === 'egg') return <EggShell color="#fef9c3" accent="#b45309" size={size} />;

  const scale = stage === 'baby' ? 0.65 : 1;
  const glowRad = excited ? s * 0.38 : s * 0.3;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* outer glow */}
      <radialGradient id="lumi-glow">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
      </radialGradient>
      <circle cx={0} cy={0} r={glowRad} fill="url(#lumi-glow)" />
      {/* body */}
      <circle cx={0} cy={0} r={s * 0.2} fill="#fbbf24" stroke="#b45309" strokeWidth={1.5} opacity={0.9} />
      {/* inner glow */}
      <circle cx={0} cy={0} r={s * 0.1} fill="#fef3c7" opacity={0.7} />
      {/* eyes - star shaped */}
      <text x={-s * 0.08} y={s * 0.02} fontSize={s * 0.12} textAnchor="middle" dominantBaseline="central" fill="#b45309">✦</text>
      <text x={s * 0.08} y={s * 0.02} fontSize={s * 0.12} textAnchor="middle" dominantBaseline="central" fill="#b45309">✦</text>
      {/* mouth */}
      <path d={`M ${-s * 0.04} ${s * 0.1} Q 0 ${s * 0.14} ${s * 0.04} ${s * 0.1}`} fill="none" stroke="#b45309" strokeWidth={1} strokeLinecap="round" />
      {/* rays (adult only) */}
      {stage === 'adult' && [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line key={angle} x1={0} y1={-s * 0.19} x2={0} y2={-s * 0.26}
          stroke="#fbbf24" strokeWidth={2} strokeLinecap="round" opacity={0.6}
          transform={`rotate(${angle})`} />
      ))}
    </g>
  );
}

function MochiRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#fce7f3" accent="#be185d" size={size} />;

  const scale = stage === 'baby' ? 0.65 : 1;
  const squish = mood === 'excited' || mood === 'happy';
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* body - soft blob */}
      <ellipse cx={0} cy={s * 0.05} rx={s * 0.24} ry={squish ? s * 0.2 : s * 0.26} fill="#f472b6" stroke="#be185d" strokeWidth={2} />
      {/* highlight */}
      <ellipse cx={-s * 0.06} cy={-s * 0.08} rx={s * 0.08} ry={s * 0.05} fill="#fbcfe8" opacity={0.6} />
      {/* eyes */}
      <circle cx={-s * 0.08} cy={s * 0.02} r={s * 0.035} fill="#be185d" />
      <circle cx={s * 0.08} cy={s * 0.02} r={s * 0.035} fill="#be185d" />
      {/* eye highlights */}
      <circle cx={-s * 0.07} cy={s * 0.015} r={s * 0.015} fill="white" />
      <circle cx={s * 0.09} cy={s * 0.015} r={s * 0.015} fill="white" />
      {/* blush */}
      <circle cx={-s * 0.15} cy={s * 0.06} r={s * 0.04} fill="#fda4af" opacity={0.6} />
      <circle cx={s * 0.15} cy={s * 0.06} r={s * 0.04} fill="#fda4af" opacity={0.6} />
      {/* mouth */}
      <path d={`M ${-s * 0.03} ${s * 0.12} Q 0 ${s * 0.17} ${s * 0.03} ${s * 0.12}`} fill="none" stroke="#be185d" strokeWidth={1.5} strokeLinecap="round" />
      {/* tummy smiley (adult) */}
      {stage === 'adult' && (
        <>
          <circle cx={0} cy={s * 0.16} r={s * 0.06} fill="#fce7f3" opacity={0.8} />
          <path d={`M ${-s * 0.03} ${s * 0.18} Q 0 ${s * 0.2} ${s * 0.03} ${s * 0.18}`} fill="none" stroke="#be185d" strokeWidth={1} strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function PipRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  const unit = size / 16; // pixel grid unit
  if (stage === 'egg') return <EggShell color="#cffafe" accent="#0e7490" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  // Pixel art: build a small dino-like sprite using rectangles
  const pixels = stage === 'adult'
    ? [
      // body (8x10 grid centered)
      [3, 3, 1, 1], [4, 3, 1, 1], [5, 3, 1, 1],               // head top
      [3, 4, 1, 1], [4, 4, 1, 1], [5, 4, 1, 1], [6, 4, 1, 1], // head mid
      [2, 5, 1, 1], [3, 5, 1, 1], [4, 5, 1, 1], [5, 5, 1, 1], [6, 5, 1, 1], [7, 5, 1, 1], // head bottom
      [2, 6, 1, 1], [3, 6, 1, 1], [4, 6, 1, 1], [5, 6, 1, 1], [6, 6, 1, 1], [7, 6, 1, 1], // body mid
      [1, 7, 1, 1], [2, 7, 1, 1], [3, 7, 1, 1], [4, 7, 1, 1], [5, 7, 1, 1], [6, 7, 1, 1], [7, 7, 1, 1], [8, 7, 1, 1], // body lower
      // feet
      [1, 8, 1, 1], [8, 8, 1, 1],
      // tail
      [0, 6, 1, 1], [0, 7, 1, 1],
      // eye
      [4, 4, 1, 1],
    ]
    : [
      // baby - simpler shape
      [4, 4, 1, 1], [5, 4, 1, 1],
      [3, 5, 1, 1], [4, 5, 1, 1], [5, 5, 1, 1], [6, 5, 1, 1],
      [3, 6, 1, 1], [4, 6, 1, 1], [5, 6, 1, 1], [6, 6, 1, 1],
      [2, 7, 1, 1], [3, 7, 1, 1], [4, 7, 1, 1], [5, 7, 1, 1], [6, 7, 1, 1],
      [4, 5, 1, 1],
    ];

  const bodyColor = '#22d3ee';
  const outlineColor = '#0e7490';
  const eyeColor = mood === 'excited' ? '#facc15' : '#0e7490';

  return (
    <g transform={`translate(${cx - unit * 5}, ${s * 0.35}) scale(${scale})`}>
      {pixels.map(([x, y], i) => {
        const isEye = stage === 'adult' ? (x === 4 && y === 4) : (x === 4 && y === 5);
        return (
          <rect key={i}
            x={x * unit} y={y * unit} width={unit} height={unit}
            fill={isEye ? eyeColor : bodyColor}
            stroke={outlineColor} strokeWidth={0.5}
          />
        );
      })}
      {/* CI/CD status badge */}
      {stage === 'adult' && (
        <text x={unit * 5} y={unit * 10.5} fontSize={unit * 1.5} textAnchor="middle" fill="#0e7490" fontFamily="monospace" fontWeight="bold">
          {mood === 'excited' ? '✓' : mood === 'sad' ? '✗' : '...'}
        </text>
      )}
    </g>
  );
}

function OwlbertRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#ede9fe" accent="#5b21b6" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* body */}
      <ellipse cx={0} cy={s * 0.08} rx={s * 0.22} ry={s * 0.26} fill="#a78bfa" stroke="#5b21b6" strokeWidth={2} />
      {/* tummy */}
      <ellipse cx={0} cy={s * 0.12} rx={s * 0.13} ry={s * 0.16} fill="#ddd6fe" />
      {/* eyes - big round owl eyes */}
      <circle cx={-s * 0.08} cy={0} r={s * 0.08} fill="white" stroke="#5b21b6" strokeWidth={1.5} />
      <circle cx={s * 0.08} cy={0} r={s * 0.08} fill="white" stroke="#5b21b6" strokeWidth={1.5} />
      {/* pupils */}
      <circle cx={-s * 0.07} cy={0} r={s * 0.04} fill="#5b21b6" />
      <circle cx={s * 0.09} cy={0} r={s * 0.04} fill="#5b21b6" />
      {/* pupil highlights */}
      <circle cx={-s * 0.06} cy={-s * 0.01} r={s * 0.015} fill="white" />
      <circle cx={s * 0.1} cy={-s * 0.01} r={s * 0.015} fill="white" />
      {/* beak */}
      <polygon points={`${-s * 0.03},${s * 0.06} ${s * 0.03},${s * 0.06} 0,${s * 0.12}`} fill="#f97316" />
      {/* grad cap (adult) */}
      {stage === 'adult' && (
        <>
          <rect x={-s * 0.2} y={-s * 0.24} width={s * 0.4} height={s * 0.06} rx={2} fill="#5b21b6" />
          <polygon points={`${-s * 0.04},${-s * 0.24} ${s * 0.04},${-s * 0.24} 0,${-s * 0.32}`} fill="#5b21b6" />
          <circle cx={0} cy={-s * 0.32} r={s * 0.02} fill="#facc15" />
        </>
      )}
      {/* feet */}
      <ellipse cx={-s * 0.08} cy={s * 0.33} rx={s * 0.07} ry={s * 0.04} fill="#f97316" />
      <ellipse cx={s * 0.08} cy={s * 0.33} rx={s * 0.07} ry={s * 0.04} fill="#f97316" />
    </g>
  );
}

function CoralRenderer({ stage, size }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#ffedd5" accent="#9a3412" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  return (
    <g transform={`translate(${cx}, ${s * 0.5}) scale(${scale})`}>
      {/* base rock */}
      <ellipse cx={0} cy={s * 0.15} rx={s * 0.18} ry={s * 0.08} fill="#d6d3d1" />
      {/* coral branches */}
      {[0, -60, 60].map((angle, i) => (
        <g key={i} transform={`rotate(${angle})`}>
          <path d={`M 0 ${s * 0.08} Q ${(i - 1) * s * 0.04} ${-s * 0.1} ${(i - 1) * s * 0.03} ${-s * 0.2}`}
            fill="none" stroke="#fb923c" strokeWidth={4} strokeLinecap="round" />
          <circle cx={(i - 1) * s * 0.03} cy={-s * 0.2} r={s * 0.03} fill="#f97316" />
        </g>
      ))}
      {/* central branch */}
      <path d={`M 0 ${s * 0.08} Q 0 ${-s * 0.1} 0 ${-s * 0.25}`} fill="none" stroke="#fb923c" strokeWidth={5} strokeLinecap="round" />
      <circle cx={0} cy={-s * 0.25} r={s * 0.04} fill="#f97316" />
      {/* face on the base */}
      <circle cx={-s * 0.05} cy={s * 0.08} r={s * 0.02} fill="#9a3412" />
      <circle cx={s * 0.05} cy={s * 0.08} r={s * 0.02} fill="#9a3412" />
      <path d={`M ${-s * 0.03} ${s * 0.13} Q 0 ${s * 0.16} ${s * 0.03} ${s * 0.13}`} fill="none" stroke="#9a3412" strokeWidth={1} strokeLinecap="round" />
    </g>
  );
}

function StarRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#fefce8" accent="#a16207" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  const twinkle = mood === 'excited' || mood === 'happy';
  // 5-pointed star shape
  const starPoints = (r: number, innerR: number, pts = 10) => {
    const p: [number, number][] = [];
    for (let i = 0; i < pts; i++) {
      const angle = (Math.PI / 2 * -1) + (i * Math.PI * 2) / pts;
      const radius = i % 2 === 0 ? r : innerR;
      p.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    return p.map(([x, y]) => `${x},${y}`).join(' ');
  };

  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* glow */}
      {twinkle && <circle cx={0} cy={0} r={s * 0.32} fill="#facc15" opacity={0.15} />}
      {/* main star */}
      <polygon points={starPoints(s * 0.22, s * 0.1)} fill="#facc15" stroke="#a16207" strokeWidth={1.5} />
      {/* face */}
      <circle cx={-s * 0.06} cy={-s * 0.02} r={s * 0.03} fill="#a16207" />
      <circle cx={s * 0.06} cy={-s * 0.02} r={s * 0.03} fill="#a16207" />
      <circle cx={-s * 0.05} cy={-s * 0.03} r={s * 0.01} fill="white" />
      <circle cx={s * 0.07} cy={-s * 0.03} r={s * 0.01} fill="white" />
      <path d={`M ${-s * 0.03} ${s * 0.05} Q 0 ${s * 0.08} ${s * 0.03} ${s * 0.05}`} fill="none" stroke="#a16207" strokeWidth={1} strokeLinecap="round" />
      {/* tiny orbiting stars (adult) */}
      {stage === 'adult' && [0, 120, 240].map((angle, i) => (
        <circle key={i} cx={Math.cos(angle * Math.PI / 180) * s * 0.18} cy={Math.sin(angle * Math.PI / 180) * s * 0.18}
          r={s * 0.018} fill="#fef08a" opacity={twinkle ? 0.8 : 0.4} />
      ))}
    </g>
  );
}

function EmberRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#fff7ed" accent="#9a3412" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  const flameHeight = mood === 'excited' ? s * 0.35 : s * 0.24;
  return (
    <g transform={`translate(${cx}, ${s * 0.5}) scale(${scale})`}>
      {/* flame */}
      <path d={`M 0 ${-flameHeight} Q ${s * 0.12} ${-flameHeight * 0.5} ${s * 0.1} 0 Q ${s * 0.05} ${-flameHeight * 0.3} 0 0 Q ${-s * 0.05} ${-flameHeight * 0.3} ${-s * 0.1} 0 Q ${-s * 0.12} ${-flameHeight * 0.5} 0 ${-flameHeight} Z`}
        fill="#f97316" />
      {/* inner flame */}
      <path d={`M 0 ${-flameHeight * 0.7} Q ${s * 0.07} ${-flameHeight * 0.35} ${s * 0.05} 0 Q ${s * 0.02} ${-flameHeight * 0.2} 0 0 Q ${-s * 0.02} ${-flameHeight * 0.2} ${-s * 0.05} 0 Q ${-s * 0.07} ${-flameHeight * 0.35} 0 ${-flameHeight * 0.7} Z`}
        fill="#fbbf24" />
      {/* goggles */}
      <rect x={-s * 0.12} y={-s * 0.02} width={s * 0.24} height={s * 0.08} rx={s * 0.04} fill="#1e293b" />
      <rect x={-s * 0.08} y={-s * 0.01} width={s * 0.07} height={s * 0.06} rx={2} fill="#14b8a6" opacity={0.8} />
      <rect x={s * 0.01} y={-s * 0.01} width={s * 0.07} height={s * 0.06} rx={2} fill="#14b8a6" opacity={0.8} />
      <rect x={-s * 0.02} y={s * 0.01} width={s * 0.04} height={s * 0.02} rx={1} fill="#1e293b" />
      {/* mouth */}
      {mood === 'excited' ? (
        <circle cx={0} cy={s * 0.08} r={s * 0.03} fill="#1e293b" />
      ) : (
        <path d={`M ${-s * 0.03} ${s * 0.08} Q 0 ${s * 0.1} ${s * 0.03} ${s * 0.08}`} fill="none" stroke="#1e293b" strokeWidth={1} strokeLinecap="round" />
      )}
      {/* embers (adult) */}
      {stage === 'adult' && [[-20, -s * 0.32], [15, -s * 0.3], [-30, -s * 0.25]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={s * 0.015} fill="#f97316" opacity={0.7} className="animate-pulse" />
      ))}
    </g>
  );
}

function TaroRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#faf5ff" accent="#581c87" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  return (
    <g transform={`translate(${cx}, ${s * 0.5}) scale(${scale})`}>
      {/* dirt mound */}
      <ellipse cx={0} cy={s * 0.2} rx={s * 0.2} ry={s * 0.07} fill="#92400e" />
      {/* body - taro root */}
      <ellipse cx={0} cy={s * 0.05} rx={s * 0.14} ry={s * 0.2} fill="#a855f7" stroke="#581c87" strokeWidth={1.5} />
      {/* root lines */}
      <path d={`M ${-s * 0.06} ${s * 0.22} L ${-s * 0.1} ${s * 0.28}`} stroke="#d8b4fe" strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M ${s * 0.06} ${s * 0.22} L ${s * 0.1} ${s * 0.28}`} stroke="#d8b4fe" strokeWidth={1.5} strokeLinecap="round" />
      {/* face */}
      <circle cx={-s * 0.04} cy={-s * 0.02} r={s * 0.025} fill="#581c87" />
      <circle cx={s * 0.04} cy={-s * 0.02} r={s * 0.025} fill="#581c87" />
      <path d={`M ${-s * 0.03} ${s * 0.04} Q 0 ${s * 0.07} ${s * 0.03} ${s * 0.04}`} fill="none" stroke="#581c87" strokeWidth={1.5} strokeLinecap="round" />
      {/* blush */}
      <circle cx={-s * 0.1} cy={s * 0.01} r={s * 0.03} fill="#fda4af" opacity={0.5} />
      <circle cx={s * 0.1} cy={s * 0.01} r={s * 0.03} fill="#fda4af" opacity={0.5} />
      {/* leaves (adult) */}
      {stage === 'adult' && (
        <g>
          <path d={`M 0 ${-s * 0.18} Q ${-s * 0.15} ${-s * 0.3} ${-s * 0.2} ${-s * 0.35}`} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" />
          <ellipse cx={-s * 0.2} cy={-s * 0.35} rx={s * 0.08} ry={s * 0.035} fill="#4ade80" transform={`rotate(-40 ${-s * 0.2} ${-s * 0.35})`} />
          <path d={`M 0 ${-s * 0.18} Q ${s * 0.1} ${-s * 0.28} ${s * 0.18} ${-s * 0.33}`} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" />
          <ellipse cx={s * 0.18} cy={-s * 0.33} rx={s * 0.08} ry={s * 0.035} fill="#4ade80" transform={`rotate(30 ${s * 0.18} ${-s * 0.33})`} />
        </g>
      )}
    </g>
  );
}

function BobaRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#fdf4e8" accent="#6b3a1f" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* cup */}
      <path d={`M ${-s * 0.18} ${-s * 0.2} L ${-s * 0.14} ${s * 0.25} Q 0 ${s * 0.28} ${s * 0.14} ${s * 0.25} L ${s * 0.18} ${-s * 0.2} Z`}
        fill="#d4a574" stroke="#6b3a1f" strokeWidth={2} />
      {/* lid */}
      <ellipse cx={0} cy={-s * 0.2} rx={s * 0.18} ry={s * 0.04} fill="#b8956a" stroke="#6b3a1f" strokeWidth={1.5} />
      {/* straw */}
      <rect x={s * 0.06} y={-s * 0.35} width={s * 0.03} height={s * 0.16} rx={1.5} fill="#f97316" />
      {/* face */}
      <circle cx={-s * 0.06} cy={0} r={s * 0.03} fill="#6b3a1f" />
      <circle cx={s * 0.06} cy={0} r={s * 0.03} fill="#6b3a1f" />
      <circle cx={-s * 0.05} cy={-s * 0.01} r={s * 0.01} fill="white" />
      <circle cx={s * 0.07} cy={-s * 0.01} r={s * 0.01} fill="white" />
      <path d={`M ${-s * 0.03} ${s * 0.06} Q 0 ${s * 0.09} ${s * 0.03} ${s * 0.06}`} fill="none" stroke="#6b3a1f" strokeWidth={1.5} strokeLinecap="round" />
      {/* blush */}
      <circle cx={-s * 0.11} cy={s * 0.03} r={s * 0.03} fill="#fda4af" opacity={0.5} />
      <circle cx={s * 0.11} cy={s * 0.03} r={s * 0.03} fill="#fda4af" opacity={0.5} />
      {/* pearls (boba) */}
      {[[-s * 0.08, s * 0.18], [s * 0.04, s * 0.16], [s * 0.09, s * 0.2], [-s * 0.05, s * 0.14]].map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={s * 0.025} fill="#1e293b" opacity={0.8} />
      ))}
    </g>
  );
}

function AstroRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#f8fafc" accent="#1e293b" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* helmet */}
      <circle cx={0} cy={-s * 0.03} r={s * 0.2} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
      {/* visor */}
      <ellipse cx={0} cy={-s * 0.03} rx={s * 0.14} ry={s * 0.12} fill="#14b8a6" opacity={0.3} />
      {/* face inside visor */}
      <circle cx={-s * 0.05} cy={-s * 0.05} r={s * 0.025} fill="#1e293b" />
      <circle cx={s * 0.05} cy={-s * 0.05} r={s * 0.025} fill="#1e293b" />
      {mood === 'excited' ? (
        <ellipse cx={0} cy={s * 0.03} rx={s * 0.03} ry={s * 0.04} fill="#1e293b" />
      ) : (
        <path d={`M ${-s * 0.03} ${s * 0.03} Q 0 ${s * 0.05} ${s * 0.03} ${s * 0.03}`} fill="none" stroke="#1e293b" strokeWidth={1} strokeLinecap="round" />
      )}
      {/* body - spacesuit */}
      <rect x={-s * 0.15} y={s * 0.17} width={s * 0.3} height={s * 0.15} rx={s * 0.04} fill="#cbd5e1" stroke="#64748b" strokeWidth={1.5} />
      {/* backpack */}
      <rect x={-s * 0.18} y={s * 0.18} width={s * 0.06} height={s * 0.12} rx={3} fill="#94a3b8" />
      {/* antenna */}
      <line x1={0} y1={s * 0.2} x2={0} y2={s * 0.35} stroke="#64748b" strokeWidth={2} />
      <circle cx={0} cy={s * 0.35} r={s * 0.04} fill="#facc15" className="animate-pulse" />
    </g>
  );
}

function NoirRenderer({ stage, size }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#f3f4f6" accent="#1f2937" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* body */}
      <ellipse cx={0} cy={s * 0.08} rx={s * 0.2} ry={s * 0.2} fill="#374151" stroke="#1f2937" strokeWidth={2} />
      {/* ears */}
      <polygon points={`${-s * 0.15},${-s * 0.08} ${-s * 0.08},${-s * 0.22} ${-s * 0.02},${-s * 0.08}`} fill="#374151" stroke="#1f2937" strokeWidth={1.5} />
      <polygon points={`${s * 0.02},${-s * 0.08} ${s * 0.08},${-s * 0.22} ${s * 0.15},${-s * 0.08}`} fill="#374151" stroke="#1f2937" strokeWidth={1.5} />
      {/* eyes - glowing green */}
      <ellipse cx={-s * 0.07} cy={0} rx={s * 0.04} ry={s * 0.06} fill="#4ade80" stroke="#166534" strokeWidth={1} />
      <ellipse cx={s * 0.07} cy={0} rx={s * 0.04} ry={s * 0.06} fill="#4ade80" stroke="#166534" strokeWidth={1} />
      <ellipse cx={-s * 0.07} cy={0} rx={s * 0.015} ry={s * 0.04} fill="#166534" />
      <ellipse cx={s * 0.07} cy={0} rx={s * 0.015} ry={s * 0.04} fill="#166534" />
      {/* nose */}
      <ellipse cx={0} cy={s * 0.06} rx={s * 0.02} ry={s * 0.015} fill="#f87171" />
      {/* whiskers */}
      <line x1={-s * 0.04} y1={s * 0.06} x2={-s * 0.14} y2={s * 0.03} stroke="#6b7280" strokeWidth={0.8} />
      <line x1={-s * 0.04} y1={s * 0.06} x2={-s * 0.14} y2={s * 0.08} stroke="#6b7280" strokeWidth={0.8} />
      <line x1={s * 0.04} y1={s * 0.06} x2={s * 0.14} y2={s * 0.03} stroke="#6b7280" strokeWidth={0.8} />
      <line x1={s * 0.04} y1={s * 0.06} x2={s * 0.14} y2={s * 0.08} stroke="#6b7280" strokeWidth={0.8} />
      {/* detective hat (adult) */}
      {stage === 'adult' && (
        <>
          <ellipse cx={0} cy={-s * 0.18} rx={s * 0.22} ry={s * 0.04} fill="#1f2937" />
          <rect x={-s * 0.1} y={-s * 0.35} width={s * 0.2} height={s * 0.18} rx={2} fill="#1f2937" />
          <rect x={-s * 0.08} y={-s * 0.28} width={s * 0.16} height={s * 0.04} fill="#d4a574" />
        </>
      )}
      {/* tail */}
      <path d={`M ${s * 0.15} ${s * 0.18} Q ${s * 0.25} ${s * 0.05} ${s * 0.2} ${-s * 0.1}`} fill="none" stroke="#374151" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function GlitchRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#f0fdfa" accent="#134e4a" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  // Glitch: geometric diamond body with offset layers
  const offsetX = mood === 'excited' ? s * 0.03 : 0;
  const offsetY = mood === 'sad' ? s * 0.03 : 0;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* glitch offset layer */}
      <polygon points={`${s * 0.02 + offsetX},${-s * 0.2 + offsetY} ${s * 0.16 + offsetX},${offsetY} ${s * 0.02 + offsetX},${s * 0.2 + offsetY} ${-s * 0.16 + offsetX},${offsetY}`}
        fill="#f472b6" opacity={0.2} />
      {/* main body - diamond */}
      <polygon points={`0,${-s * 0.22} ${s * 0.16},0 0,${s * 0.22} ${-s * 0.16},0`}
        fill="#14b8a6" stroke="#134e4a" strokeWidth={1.5} />
      {/* face */}
      <circle cx={-s * 0.05} cy={-s * 0.03} r={s * 0.03} fill="#134e4a" />
      <circle cx={s * 0.05} cy={-s * 0.03} r={s * 0.03} fill="#134e4a" />
      {/* digital mouth */}
      <text x={0} y={s * 0.08} fontSize={s * 0.08} textAnchor="middle" fill="#134e4a" fontFamily="monospace">
        {mood === 'excited' ? '□' : mood === 'sad' ? '_' : '▬'}
      </text>
      {/* scanlines */}
      {[0.15, 0.05, -0.05, -0.15].map((y, i) => (
        <line key={i} x1={-s * 0.14} y1={y * s} x2={s * 0.14} y2={y * s} stroke="#134e4a" strokeWidth={0.5} opacity={0.15} />
      ))}
      {/* glitch artifacts (adult) */}
      {stage === 'adult' && (
        <>
          <rect x={-s * 0.05} y={-s * 0.1} width={s * 0.08} height={s * 0.02} fill="#f472b6" opacity={0.4} />
          <rect x={s * 0.02} y={s * 0.04} width={s * 0.06} height={s * 0.02} fill="#f472b6" opacity={0.4} />
        </>
      )}
    </g>
  );
}

function PhantomRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#eef2ff" accent="#3730a3" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  const alpha = mood === 'sad' ? 0.2 : mood === 'excited' ? 0.9 : 0.55;
  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* ghost body */}
      <path d={`M ${-s * 0.18} ${-s * 0.2} Q ${-s * 0.18} ${-s * 0.3} 0 ${-s * 0.3} Q ${s * 0.18} ${-s * 0.3} ${s * 0.18} ${-s * 0.2}
        L ${s * 0.18} ${s * 0.15} Q ${s * 0.14} ${s * 0.22} ${s * 0.08} ${s * 0.15}
        Q ${s * 0.04} ${s * 0.22} 0 ${s * 0.15}
        Q ${-s * 0.04} ${s * 0.22} ${-s * 0.08} ${s * 0.15}
        Q ${-s * 0.14} ${s * 0.22} ${-s * 0.18} ${s * 0.15}
        Z`}
        fill="#818cf8" stroke="#3730a3" strokeWidth={1.5} opacity={alpha} />
      {/* eyes */}
      <ellipse cx={-s * 0.07} cy={-s * 0.08} rx={s * 0.04} ry={s * 0.06} fill="#3730a3" opacity={alpha} />
      <ellipse cx={s * 0.07} cy={-s * 0.08} rx={s * 0.04} ry={s * 0.06} fill="#3730a3" opacity={alpha} />
      {/* eye shine */}
      <circle cx={-s * 0.06} cy={-s * 0.1} r={s * 0.015} fill="white" opacity={alpha + 0.2} />
      <circle cx={s * 0.08} cy={-s * 0.1} r={s * 0.015} fill="white" opacity={alpha + 0.2} />
      {/* blush */}
      <circle cx={-s * 0.13} cy={-s * 0.02} r={s * 0.04} fill="#fda4af" opacity={alpha - 0.1} />
      <circle cx={s * 0.13} cy={-s * 0.02} r={s * 0.04} fill="#fda4af" opacity={alpha - 0.1} />
      {/* mouth */}
      <ellipse cx={0} cy={s * 0.02} rx={s * 0.03} ry={s * 0.02} fill="#3730a3" opacity={alpha} />
      {/* sparkles (adult) */}
      {stage === 'adult' && [[-s * 0.16, -s * 0.24], [s * 0.14, -s * 0.22], [0, -s * 0.28]].map(([sx, sy], i) => (
        <text key={i} x={sx} y={sy} fontSize={s * 0.06} textAnchor="middle" fill="#a5b4fc" opacity={0.7}>✦</text>
      ))}
    </g>
  );
}

function SakuraRenderer({ stage, size, mood }: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  if (stage === 'egg') return <EggShell color="#fff1f2" accent="#9f1239" size={size} />;

  const scale = stage === 'baby' ? 0.6 : 1;
  const petalCount = 5;
  const petals = Array.from({ length: petalCount }, (_, i) => {
    const angle = (i * 360) / petalCount - 90;
    const rad = (angle * Math.PI) / 180;
    return { x: Math.cos(rad) * s * 0.1, y: Math.sin(rad) * s * 0.1, angle };
  });

  return (
    <g transform={`translate(${cx}, ${s * 0.45}) scale(${scale})`}>
      {/* petals */}
      {petals.map((p, i) => (
        <ellipse key={i}
          cx={p.x} cy={p.y}
          rx={s * 0.07} ry={s * 0.12}
          fill="#fda4af" stroke="#e11d48" strokeWidth={1}
          transform={`rotate(${p.angle + 90} ${p.x} ${p.y})`}
          opacity={mood === 'sad' ? 0.4 : 0.9}
        />
      ))}
      {/* inner petals */}
      {petals.map((p, i) => (
        <ellipse key={`i${i}`}
          cx={p.x * 0.5} cy={p.y * 0.5}
          rx={s * 0.04} ry={s * 0.07}
          fill="#fecdd3" stroke="#e11d48" strokeWidth={0.8}
          transform={`rotate(${p.angle + 90} ${p.x * 0.5} ${p.y * 0.5})`}
          opacity={mood === 'sad' ? 0.3 : 0.8}
        />
      ))}
      {/* center / face area */}
      <circle cx={0} cy={0} r={s * 0.08} fill="#fecdd3" stroke="#e11d48" strokeWidth={1} />
      {/* face */}
      <circle cx={-s * 0.03} cy={-s * 0.01} r={s * 0.02} fill="#9f1239" />
      <circle cx={s * 0.03} cy={-s * 0.01} r={s * 0.02} fill="#9f1239" />
      <path d={`M ${-s * 0.02} ${s * 0.03} Q 0 ${s * 0.05} ${s * 0.02} ${s * 0.03}`} fill="none" stroke="#9f1239" strokeWidth={1} strokeLinecap="round" />
      {/* blush */}
      <circle cx={-s * 0.06} cy={s * 0.02} r={s * 0.025} fill="#fda4af" opacity={0.7} />
      <circle cx={s * 0.06} cy={s * 0.02} r={s * 0.025} fill="#fda4af" opacity={0.7} />
      {/* floating petals (adult) */}
      {stage === 'adult' && [
        { x: s * 0.2, y: -s * 0.15, rot: 30 },
        { x: -s * 0.18, y: -s * 0.18, rot: -20 },
        { x: s * 0.15, y: s * 0.05, rot: 60 },
      ].map((fp, i) => (
        <ellipse key={`fp${i}`}
          cx={fp.x} cy={fp.y}
          rx={s * 0.04} ry={s * 0.07}
          fill="#fecdd3" stroke="#e11d48" strokeWidth={0.5}
          transform={`rotate(${fp.rot} ${fp.x} ${fp.y})`}
          opacity={0.6}
        />
      ))}
    </g>
  );
}

/* ── V1 Legacy Pets ── */

function CatRenderer({ size, mood }: { size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  return (
    <g transform={`translate(${cx}, ${s * 0.45})`}>
      <ellipse cx={0} cy={s * 0.1} rx={s * 0.18} ry={s * 0.22} fill="#fcd34d" stroke="#b45309" strokeWidth={2} />
      <polygon points={`${-s * 0.14},${-s * 0.04} ${-s * 0.06},${-s * 0.22} ${-s * 0.02},${-s * 0.04}`} fill="#fcd34d" stroke="#b45309" strokeWidth={1.5} />
      <polygon points={`${s * 0.02},${-s * 0.04} ${s * 0.06},${-s * 0.22} ${s * 0.14},${-s * 0.04}`} fill="#fcd34d" stroke="#b45309" strokeWidth={1.5} />
      <circle cx={-s * 0.07} cy={s * 0.04} r={s * 0.03} fill="#b45309" />
      <circle cx={s * 0.07} cy={s * 0.04} r={s * 0.03} fill="#b45309" />
      <path d={`M ${-s * 0.03} ${s * 0.12} Q 0 ${s * 0.16} ${s * 0.03} ${s * 0.12}`} fill="none" stroke="#b45309" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
}

function DogRenderer({ size, mood }: { size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  return (
    <g transform={`translate(${cx}, ${s * 0.45})`}>
      <ellipse cx={0} cy={s * 0.1} rx={s * 0.18} ry={s * 0.2} fill="#d8b4fe" stroke="#6b21a8" strokeWidth={2} />
      <ellipse cx={-s * 0.12} cy={-s * 0.15} rx={s * 0.06} ry={s * 0.09} fill="#d8b4fe" stroke="#6b21a8" strokeWidth={1.5} />
      <ellipse cx={s * 0.12} cy={-s * 0.15} rx={s * 0.06} ry={s * 0.09} fill="#d8b4fe" stroke="#6b21a8" strokeWidth={1.5} />
      <circle cx={-s * 0.07} cy={s * 0.04} r={s * 0.03} fill="#6b21a8" />
      <circle cx={s * 0.07} cy={s * 0.04} r={s * 0.03} fill="#6b21a8" />
      <circle cx={-s * 0.06} cy={s * 0.03} r={s * 0.01} fill="white" />
      <circle cx={s * 0.08} cy={s * 0.03} r={s * 0.01} fill="white" />
      <path d={`M ${-s * 0.03} ${s * 0.1} Q 0 ${s * 0.15} ${s * 0.03} ${s * 0.1}`} fill="none" stroke="#6b21a8" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
}

function FoxRenderer({ size, mood }: { size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  return (
    <g transform={`translate(${cx}, ${s * 0.45})`}>
      <ellipse cx={0} cy={s * 0.1} rx={s * 0.16} ry={s * 0.2} fill="#f97316" stroke="#9a3412" strokeWidth={2} />
      <polygon points={`${-s * 0.12},${-s * 0.02} ${-s * 0.05},${-s * 0.26} ${-s * 0.01},${-s * 0.02}`} fill="#f97316" stroke="#9a3412" strokeWidth={1.5} />
      <polygon points={`${s * 0.01},${-s * 0.02} ${s * 0.05},${-s * 0.26} ${s * 0.12},${-s * 0.02}`} fill="#f97316" stroke="#9a3412" strokeWidth={1.5} />
      <ellipse cx={0} cy={s * 0.18} rx={s * 0.1} ry={s * 0.08} fill="#fef3c7" />
      <circle cx={-s * 0.06} cy={s * 0.04} r={s * 0.025} fill="#9a3412" />
      <circle cx={s * 0.06} cy={s * 0.04} r={s * 0.025} fill="#9a3412" />
      <path d={`M ${-s * 0.03} ${s * 0.1} Q 0 ${s * 0.13} ${s * 0.03} ${s * 0.1}`} fill="none" stroke="#9a3412" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
}

function DragonRenderer({ size, mood }: { size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  return (
    <g transform={`translate(${cx}, ${s * 0.45})`}>
      <ellipse cx={0} cy={s * 0.1} rx={s * 0.18} ry={s * 0.2} fill="#34d399" stroke="#065f46" strokeWidth={2} />
      <polygon points={`${-s * 0.1},${-s * 0.12} 0,${-s * 0.28} 0,${-s * 0.12}`} fill="#34d399" stroke="#065f46" strokeWidth={1.5} />
      <polygon points={`${s * 0.1},${-s * 0.12} 0,${-s * 0.28} 0,${-s * 0.12}`} fill="#34d399" stroke="#065f46" strokeWidth={1.5} />
      <circle cx={-s * 0.07} cy={s * 0.04} r={s * 0.03} fill="#065f46" />
      <circle cx={s * 0.07} cy={s * 0.04} r={s * 0.03} fill="#065f46" />
      <path d={`M ${-s * 0.04} ${s * 0.12} Q 0 ${s * 0.17} ${s * 0.04} ${s * 0.12}`} fill="none" stroke="#065f46" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
}

function PandaRenderer({ size, mood }: { size: number; mood: PetAvatarProps['mood'] }) {
  const s = size;
  const cx = s / 2;
  return (
    <g transform={`translate(${cx}, ${s * 0.45})`}>
      <ellipse cx={0} cy={s * 0.1} rx={s * 0.2} ry={s * 0.22} fill="white" stroke="#1f2937" strokeWidth={2} />
      <ellipse cx={-s * 0.08} cy={-s * 0.06} rx={s * 0.06} ry={s * 0.08} fill="#1f2937" />
      <ellipse cx={s * 0.08} cy={-s * 0.06} rx={s * 0.06} ry={s * 0.08} fill="#1f2937" />
      <circle cx={-s * 0.06} cy={s * 0.02} r={s * 0.03} fill="#1f2937" />
      <circle cx={s * 0.06} cy={s * 0.02} r={s * 0.03} fill="#1f2937" />
      <circle cx={-s * 0.05} cy={s * 0.01} r={s * 0.01} fill="white" />
      <circle cx={s * 0.07} cy={s * 0.01} r={s * 0.01} fill="white" />
      <path d={`M ${-s * 0.03} ${s * 0.1} Q 0 ${s * 0.13} ${s * 0.03} ${s * 0.1}`} fill="none" stroke="#1f2937" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
}

/* ── Main Component ── */

export default function PetAvatar({
  petId,
  stage = 'adult',
  size = 120,
  mood,
  className = '',
}: PetAvatarProps) {
  const pet = useMemo(() => getPetById(petId), [petId]);
  const style = pet?.visualStyle ?? 'cute';

  const hoverClass = {
    cute: cuteHover,
    pixel: pixelHover,
    minimal: minimalHover,
    abstract: abstractHover,
  }[style] ?? cuteHover;

  // V2 pet renderers
  const renderers: Record<string, (props: { stage: Stage; size: number; mood: PetAvatarProps['mood'] }) => React.ReactElement> = {
    bean: BeanRenderer,
    lumi: LumiRenderer,
    mochi: MochiRenderer,
    pip: PipRenderer,
    owlbert: OwlbertRenderer,
    coral: CoralRenderer,
    star: StarRenderer,
    ember: EmberRenderer,
    taro: TaroRenderer,
    boba: BobaRenderer,
    astro: AstroRenderer,
    noir: NoirRenderer,
    glitch: GlitchRenderer,
    phantom: PhantomRenderer,
    sakura: SakuraRenderer,
  };

  const Renderer = renderers[petId];
  if (!Renderer) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`${hoverClass} ${moodEffects(mood)} ${className}`}
      role="img"
      aria-label={`${pet?.name ?? petId} pet`}
    >
      {Renderer({ stage, size, mood })}
    </svg>
  );
}