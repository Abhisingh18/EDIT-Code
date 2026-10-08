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
