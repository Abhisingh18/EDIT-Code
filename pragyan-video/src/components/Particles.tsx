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
};

/* ---------------- torus ring (the product object) ---------------- */
const N_T = 520;
const TORUS = Array.from({ length: N_T }, (_, i) => {
  const u = (i / N_T) * Math.PI * 2 + rnd(i * 3.1) * 0.04;
  const v = rnd(i * 7.7) * Math.PI * 2;
  const rr = 0.13 * (0.4 + rnd(i * 1.9) * 0.6);
  return { u, v, rr, s: rnd(i * 5.3) };
});
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
  const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
  return `rgb(${pa.map((x, k) => Math.round(lerp(x, pb[k], t))).join(",")})`;
};
const ringColor = (u: number) => {
  const t = (Math.cos(u - 0.5) + 1) / 2; // 1 = right/top-right (orange), 0 = left (blue)
  return t < 0.5 ? mix("#2F7BFF", "#8B5CF6", t / 0.5) : mix("#8B5CF6", "#FF7A1A", (t - 0.5) / 0.5);
};

export const TorusRing: React.FC<{
  f: number;
  form: number; // 0..1 formation from the point of light
  yaw: number;
  pitch: number;
  radius: number; // px at camZ = 4
  opacity?: number;
  burst?: number; // 0..1 release outward
  cx?: number;
  cy?: number;
}> = ({ f, form, yaw, pitch, radius, opacity = 1, burst = 0, cx = 960, cy = 540 }) => {
  const focal = radius * 4;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      {TORUS.map((p, i) => {
        const g = clamp01(form * 1.25 - p.s * 0.25);
        const R = 1 + burst * (0.25 + p.s * 0.6);
        const flow = p.u + f * 0.012 * (0.6 + p.s);
        const x = (R + p.rr * Math.cos(p.v + f * 0.05)) * Math.cos(flow) * g;
        const y = (R + p.rr * Math.cos(p.v + f * 0.05)) * Math.sin(flow) * g;
        const z = p.rr * Math.sin(p.v + f * 0.05) * g;
        const q = rot([x, y, z], yaw, pitch);
        const pr = project(q, 4, focal, cx, cy);
        if (!pr) return null;
        const o = g * (1 - burst) * clamp01(1.4 - (pr.d - 4) * 0.6);
        const r = Math.max(1.2, (4.6 * pr.k) / focal) * (0.6 + p.s * 0.9);
        const col = ringColor(flow);
        return (
          <g key={i}>
            {i % 4 === 0 && <circle cx={pr.x} cy={pr.y} r={r * 3.2} fill={col} fillOpacity={o * 0.12} />}
            <circle cx={pr.x} cy={pr.y} r={r} fill={col} fillOpacity={o} />
          </g>
        );
      })}
    </svg>
  );
};

/* ---------------- particles converging into the logo ---------------- */
const LP = (logoPts as unknown as { w: number; h: number; pts: [number, number, string][] }).pts;
export const Converge: React.FC<{
  f: number;
  start: number;
  dur: number;
  cx: number;
  cy: number;
  w: number; // logo display width
  h: number;
  opacity?: number;
}> = ({ f, start, dur, cx, cy, w, h, opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    {LP.map(([tx, ty, col], i) => {
      const d = rnd(i * 2.3) * 22;
      const p = ei(f, [start + d, start + d + dur], [0, 1], theme.ease.inOut);
      const ang = rnd(i * 4.1) * Math.PI * 2;
      const dist = 520 + rnd(i * 6.7) * 820;
      const sx = cx + Math.cos(ang) * dist;
      const sy = cy + Math.sin(ang) * dist * 0.62;
      const X = cx + (tx - 0.5) * w;
      const Y = cy + (ty - 0.5) * h;
      // swirl on approach
      const sw = (1 - p) * 1.1;
      const px = lerp(sx, X, p) - cx, py = lerp(sy, Y, p) - cy;
      const rx = cx + px * Math.cos(sw) - py * Math.sin(sw);
      const ry = cy + px * Math.sin(sw) + py * Math.cos(sw);
      const o = ei(f, [start + d - 6, start + d + 8], [0, 1]);
      return <circle key={i} cx={rx} cy={ry} r={1.3 + (1 - p) * 1.4} fill={col} fillOpacity={o * (0.55 + 0.45 * p)} />;
    })}
  </svg>
);
