"use client";

import type { FC, CSSProperties } from "react";

// ─────────────────────────────────────────────────────────────
//  GlosChip
//  PCB chip hero animation — drop into any dark-background section
//  Usage: <GlosChip size={560} />
// ─────────────────────────────────────────────────────────────

interface TraceConfig {
  id: string;
  d: string;
  /** [turnPoint] → [endPoint] — defines fade-out gradient direction */
  fade: [[number, number], [number, number]];
  dur: number;
  delay: number;
}

interface GlosChipProps {
  className?: string;
  size?: number;
}

/** Approximate Manhattan path length for precise dashoffset animation */
function pathLength(d: string): number {
  const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
  let len = 0, px = 0, py = 0;
  for (let i = 0; i < nums.length - 1; i += 2) {
    const nx = nums[i], ny = nums[i + 1];
    if (i > 0) len += Math.abs(nx - px) + Math.abs(ny - py);
    px = nx; py = ny;
  }
  return len + 40;
}

const GlosChip: FC<GlosChipProps> = ({ className, size = 560 }) => {
  const CX = 300, CY = 230;
  const CW = 190, CH = 146;
  const CL = CX - CW / 2;
  const CR = CX + CW / 2;
  const CT = CY - CH / 2;
  const CB = CY + CH / 2;

  const TB = [238, 261, 339, 362] as const;
  const LR = [197, 230, 263] as const;
  const PIN_W = 9, PIN_L = 19;

  // Deliberately randomised: neighbours turn opposite directions,
  // some wires cross the chip centre axis, side pins mix up/down
  const traces: TraceConfig[] = [
    { id:"T1", d:`M238,${CT} L238,55  L58,55`,   fade:[[238,55],  [58,55]],   dur:3.8, delay:0.0 },
    { id:"T2", d:`M261,${CT} L261,112 L420,112`, fade:[[261,112], [420,112]], dur:2.3, delay:2.2 },
    { id:"T3", d:`M339,${CT} L339,78  L144,78`,  fade:[[339,78],  [144,78]],  dur:3.1, delay:0.8 },
    { id:"T4", d:`M362,${CT} L362,48  L530,48`,  fade:[[362,48],  [530,48]],  dur:2.5, delay:1.5 },
    { id:"B1", d:`M238,${CB} L238,410 L510,410`, fade:[[238,410], [510,410]], dur:3.2, delay:1.0 },
    { id:"B2", d:`M261,${CB} L261,358 L96,358`,  fade:[[261,358], [96,358]],  dur:2.6, delay:2.5 },
    { id:"B3", d:`M339,${CB} L339,376 L508,376`, fade:[[339,376], [508,376]], dur:2.8, delay:0.4 },
    { id:"B4", d:`M362,${CB} L362,414 L112,414`, fade:[[362,414], [112,414]], dur:3.4, delay:1.8 },
    { id:"L1", d:`M${CL},197 L64,197  L64,88`,   fade:[[64,197],  [64,88]],   dur:2.7, delay:1.3 },
    { id:"L2", d:`M${CL},230 L40,230  L40,360`,  fade:[[40,230],  [40,360]],  dur:2.1, delay:0.3 },
    { id:"L3", d:`M${CL},263 L86,263  L86,112`,  fade:[[86,263],  [86,112]],  dur:2.9, delay:2.0 },
    { id:"R1", d:`M${CR},197 L510,197 L510,364`, fade:[[510,197], [510,364]], dur:2.4, delay:1.7 },
    { id:"R2", d:`M${CR},230 L558,230 L558,96`,  fade:[[558,230], [558,96]],  dur:2.2, delay:3.1 },
    { id:"R3", d:`M${CR},263 L476,263 L476,390`, fade:[[476,263], [476,390]], dur:3.0, delay:0.6 },
  ];

  const keyframes = [
    ...traces.map(({ id, d }) => {
      const L = pathLength(d);
      return `
        @keyframes lead_${id} {
          0%   { stroke-dashoffset: ${L};      opacity: 0;    }
          5%   { opacity: 1;                                   }
          88%  { opacity: 1;                                   }
          100% { stroke-dashoffset: -12;       opacity: 0;    }
        }
        @keyframes glow_${id} {
          0%   { stroke-dashoffset: ${L + 10}; opacity: 0;    }
          5%   { opacity: 0.55;                                }
          85%  { opacity: 0.45;                                }
          100% { stroke-dashoffset: -22;       opacity: 0;    }
        }`;
    }),
    `@keyframes logoGlow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(44,200,44,.88)) brightness(1.06); }
      50%       { filter: drop-shadow(0 0 16px rgba(50,230,50,1)) drop-shadow(0 0 30px rgba(28,170,28,.56)) brightness(1.24); }
    }`,
    `@keyframes haloPulse { 0%,100%{opacity:.08} 50%{opacity:.22} }`,
    `@keyframes chipBreath { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.06)} }`,
  ].join("\n");

  const wrapStyle: CSSProperties = {
    display: "inline-block",
    lineHeight: 0,
    transform: "perspective(1400px) rotateX(8deg) rotateY(-6deg)",
  };

  return (
    <div className={className} style={wrapStyle}>
      <style>{keyframes}</style>

      <svg
        viewBox="0 0 580 462"
        width={size}
        style={{ display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gc_chip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#303030" />
            <stop offset="45%"  stopColor="#232323" />
            <stop offset="100%" stopColor="#141414" />
          </linearGradient>
          <linearGradient id="gc_edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#484848" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#111"    stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="gc_pv" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#2a2e22" />
            <stop offset="100%" stopColor="#151715" />
          </linearGradient>
          <linearGradient id="gc_ph" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#2a2e22" />
            <stop offset="100%" stopColor="#151715" />
          </linearGradient>
          <radialGradient id="gc_halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#00ff44" stopOpacity="0.24" />
            <stop offset="60%"  stopColor="#00ff44" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00ff44" stopOpacity="0"    />
          </radialGradient>

          <filter id="gc_fglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
          </filter>
          <filter id="gc_fsharp" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {traces.map(({ id, d, fade: [[x1, y1], [x2, y2]] }) => (
            <g key={`defs_${id}`}>
              <linearGradient
                id={`gc_g${id}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%"   stopColor="white" stopOpacity="1"   />
                <stop offset="80%"  stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0"   />
              </linearGradient>
              <mask id={`gc_m${id}`}>
                <path
                  d={d}
                  fill="none"
                  stroke={`url(#gc_g${id})`}
                  strokeWidth="7"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </mask>
            </g>
          ))}
        </defs>

        {/* Base dashed traces */}
        {traces.map(({ id, d }) => (
          <path
            key={`base_${id}`}
            d={d}
            fill="none"
            stroke="#1e2e1e"
            strokeWidth="1.7"
            strokeDasharray="8 7"
            strokeLinecap="square"
            strokeLinejoin="miter"
            mask={`url(#gc_m${id})`}
          />
        ))}

        {/* Outer glow pulse */}
        {traces.map(({ id, d, dur, delay }) => {
          const L = pathLength(d);
          return (
            <path
              key={`glow_${id}`}
              d={d}
              fill="none"
              stroke="#00ff44"
              strokeWidth="9"
              strokeDasharray={`10 ${L + 50}`}
              strokeLinecap="round"
              filter="url(#gc_fglow)"
              mask={`url(#gc_m${id})`}
              style={{ animation: `glow_${id} ${dur}s ${delay}s linear infinite` }}
            />
          );
        })}

        {/* Sharp core pulse */}
        {traces.map(({ id, d, dur, delay }) => {
          const L = pathLength(d);
          return (
            <path
              key={`lead_${id}`}
              d={d}
              fill="none"
              stroke="#c8ffd8"
              strokeWidth="2.2"
              strokeDasharray={`7 ${L + 50}`}
              strokeLinecap="round"
              filter="url(#gc_fsharp)"
              mask={`url(#gc_m${id})`}
              style={{ animation: `lead_${id} ${dur}s ${delay}s linear infinite` }}
            />
          );
        })}

        {/* Top pins */}
        {TB.map((x, i) => (
          <rect key={`tp_${i}`}
            x={x - PIN_W / 2} y={CT - PIN_L}
            width={PIN_W} height={PIN_L} rx={3}
            fill="url(#gc_pv)" stroke="#1d201a" strokeWidth={0.4}
          />
        ))}

        {/* Bottom pins */}
        {TB.map((x, i) => (
          <rect key={`bp_${i}`}
            x={x - PIN_W / 2} y={CB}
            width={PIN_W} height={PIN_L} rx={3}
            fill="url(#gc_pv)" stroke="#1d201a" strokeWidth={0.4}
          />
        ))}

        {/* Left pins */}
        {LR.map((y, i) => (
          <rect key={`lp_${i}`}
            x={CL - PIN_L} y={y - PIN_W / 2}
            width={PIN_L} height={PIN_W} rx={3}
            fill="url(#gc_ph)" stroke="#1d201a" strokeWidth={0.4}
          />
        ))}

        {/* Right pins */}
        {LR.map((y, i) => (
          <rect key={`rp_${i}`}
            x={CR} y={y - PIN_W / 2}
            width={PIN_L} height={PIN_W} rx={3}
            fill="url(#gc_ph)" stroke="#1d201a" strokeWidth={0.4}
          />
        ))}

        {/* Drop shadow */}
        <rect
          x={CL + 10} y={CT + 13}
          width={CW} height={CH} rx={20}
          fill="black" opacity={0.68}
        />

        {/* Chip body */}
        <rect
          x={CL} y={CT} width={CW} height={CH} rx={20}
          fill="url(#gc_chip)" stroke="#1c1c1c" strokeWidth={0.8}
          style={{ animation: "chipBreath 6s ease-in-out infinite" }}
        />

        {/* Top-lit edge sheen */}
        <rect
          x={CL} y={CT} width={CW} height={CH} rx={20}
          fill="url(#gc_edge)" opacity={0.45}
        />

        {/* Outer stroke highlight */}
        <rect
          x={CL} y={CT} width={CW} height={CH} rx={20}
          fill="none" stroke="#333" strokeWidth={0.8} opacity={0.55}
        />

        {/* Inner chamfer ring */}
        <rect
          x={CL + 10} y={CT + 10}
          width={CW - 20} height={CH - 20} rx={14}
          fill="none" stroke="#1d1d1d" strokeWidth={1} opacity={0.32}
        />

        {/* Logo halo */}
        <circle
          cx={CX} cy={CY} r={50}
          fill="url(#gc_halo)"
          style={{ animation: "haloPulse 3s ease-in-out infinite" }}
        />

        {/* Lingo.dev logo */}
        <image
          href="/155387533.png"
          x={CX - 33} y={CY - 33}
          width={66} height={66}
          style={{ animation: "logoGlow 3s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
};

export default GlosChip;
