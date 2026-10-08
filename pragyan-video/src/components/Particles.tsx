import React from "react";
import { theme } from "../theme";
import { V3, rot, project, rnd, sp, ei, clamp01, lerp } from "../lib";
import logoPts from "../data/logo_points.json";

const C = theme.colors;

/* ---------------- point of light ---------------- */
export const PointOfLight: React.FC<{ x?: number; y?: number; size: number; o?: number; color?: string }> = ({
  x = 960, y = 540, size, o = 1, color = "#FFFFFF",
}) => (
  <>
    <div
      style={{
        position: "absolute", left: x - size * 6, top: y - size * 6, width: size * 12, height: size * 12,
        borderRadius: "50%", opacity: o * 0.55,
        background: `radial-gradient(circle, ${color}55 0%, ${color}11 35%, transparent 70%)`,
      }}
    />
    <div
      style={{
        position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size,
        borderRadius: "50%", background: color, opacity: o,
        boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 5}px ${color}88`,
      }}
    />
  </>
);

/* ---------------- 3D lattice (abstract data architecture) ---------------- */
const N_OUT = 240;
const N_IN = 80;
const LATTICE: V3[] = (() => {
  const a: V3[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N_OUT; i++) {
    const y = 1 - (i / (N_OUT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = g * i;
    const j = 1 + (rnd(i + 1) - 0.5) * 0.14;
    a.push([Math.cos(th) * r * j, y * j, Math.sin(th) * r * j]);
  }
  for (let i = 0; i < N_IN; i++) {
    const y = 1 - (i / (N_IN - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = g * i * 1.618;
    a.push([Math.cos(th) * r * 0.48, y * 0.48, Math.sin(th) * r * 0.48]);
  }
  return a;
})();
const EDGES: [number, number][] = (() => {
  const e = new Set<string>();
  const out: [number, number][] = [];
  LATTICE.forEach((p, i) => {
    const near = LATTICE.map((q, j) => [j, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2] as [number, number])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, i < N_OUT ? 3 : 2);
    near.forEach(([j]) => {
      const k = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!e.has(k)) {
        e.add(k);
        out.push([Math.min(i, j), Math.max(i, j)]);
      }
    });
  });
  return out;
})();

export const Lattice: React.FC<{
  f: number;
  spawnAt: number;
  camZ: number;
  yaw: number;
  pitch: number;
  focal?: number;
  opacity?: number;
  cx?: number;
  cy?: number;
}> = ({ f, spawnAt, camZ, yaw, pitch, focal = 900, opacity = 1, cx = 960, cy = 540 }) => {
  const P = LATTICE.map((p, i) => {
    const g = sp(f, spawnAt + (i % 48) * 0.45, { damping: 24, stiffness: 55, mass: 1 });
    const q = rot([p[0] * g, p[1] * g, p[2] * g], yaw, pitch);
    const pr = project(q, camZ, focal, cx, cy);
    return pr ? { ...pr, g } : null;
  });
  const fade = (d: number) => clamp01((d - 0.12) / 0.5) * clamp01(1.55 - d * 0.1);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <radialGradient id="lg-hero">
          <stop offset="0%" stopColor={C.hero} stopOpacity="0.9" />
          <stop offset="100%" stopColor={C.hero} stopOpacity="0" />
        </radialGradient>
      </defs>
      {EDGES.map(([a, b], i) => {
        const A = P[a], B = P[b];
        if (!A || !B) return null;
        const o = Math.min(A.g, B.g) * Math.min(fade(A.d), fade(B.d));
        if (o < 0.02) return null;
        return (
          <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#C9D4EA"
            strokeOpacity={o * 0.26} strokeWidth={Math.min(1.8, 0.6 + A.k / 1400)} />
        );
      })}
      {P.map((p, i) => {
        if (!p) return null;
        const o = p.g * fade(p.d);
        if (o < 0.02) return null;
        const r = Math.min(7, Math.max(1.15, (2.6 * p.k) / 900));
        const hero = i % 31 === 0;
        return (
          <g key={i}>
            {hero && <circle cx={p.x} cy={p.y} r={r * 6} fill="url(#lg-hero)" opacity={o * 0.6} />}
            <circle cx={p.x} cy={p.y} r={hero ? r * 1.4 : r} fill={hero ? C.hero : "#E8EEF9"} fillOpacity={o * (hero ? 1 : 0.85)} />
          </g>
        );
      })}
    </svg>
  );
