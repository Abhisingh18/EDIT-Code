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
