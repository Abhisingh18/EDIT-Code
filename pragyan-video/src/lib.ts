import { interpolate, spring, EasingFunction } from "remotion";
import { theme } from "./theme";

export const FPS = 30;
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// eased + clamped interpolate (never linear)
export const ei = (
  f: number,
  input: [number, number],
  output: [number, number],
  easing: EasingFunction = theme.ease.out,
) => interpolate(f, input, output, { ...CLAMP, easing });

// spring progress starting at `delay`
export const sp = (
  f: number,
  delay = 0,
  config: { damping: number; stiffness: number; mass: number } = theme.spring.smooth,
) => spring({ frame: f - delay, fps: FPS, config });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// exit: faster than entrance, accelerating
export const exitP = (f: number, end: number, len = 12) =>
  ei(f, [end - len, end], [0, 1], theme.ease.in);

// 3D helpers for particle structures
export type V3 = [number, number, number];
export const rot = (p: V3, yaw: number, pitch: number, roll = 0): V3 => {
  const [x, y, z] = p;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch), spn = Math.sin(pitch);
  const y1 = y * cp - z1 * spn, z2 = y * spn + z1 * cp;
  const cr = Math.cos(roll), sr = Math.sin(roll);
  return [x1 * cr - y1 * sr, x1 * sr + y1 * cr, z2];
};
export const project = (p: V3, camZ: number, focal: number, cx: number, cy: number) => {
  const d = p[2] + camZ;
  if (d < 0.06) return null;
  const k = focal / d;
  return { x: cx + p[0] * k, y: cy + p[1] * k, d, k };
};

// deterministic PRNG
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
