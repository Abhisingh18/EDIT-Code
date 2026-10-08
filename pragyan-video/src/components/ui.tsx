import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, exitP } from "../lib";
import { Page } from "../captions";
import { Icon } from "./Icon";
import { PLAY_SFX } from "../stem";

const C = theme.colors;

/* ---------- layer 1: background field (never flat) ---------- */
export const BgField: React.FC<{ intensity?: number; grid?: boolean }> = ({ intensity = 1, grid = true }) => {
  const f = useCurrentFrame();
  const d1 = Math.sin(f / 95) * 70;
  const d2 = Math.cos(f / 120) * 60;
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(120% 95% at 50% 38%, #0C1222 0%, #05070D 58%, #020308 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", width: 1500, height: 1500, borderRadius: "50%",
          left: -560 + d1, top: -820,
          background: `radial-gradient(circle, rgba(76,141,255,${0.11 * intensity}), transparent 60%)`,
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute", width: 1300, height: 1300, borderRadius: "50%",
          right: -520 - d2, bottom: -760,
          background: `radial-gradient(circle, rgba(255,122,26,${0.075 * intensity}), transparent 62%)`,
          filter: "blur(40px)",
        }}
      />
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1.3px)",
            backgroundSize: "34px 34px",
            backgroundPosition: `${(f * 0.15) % 34}px 0px`,
            WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 72%)",
            maskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 72%)",
            opacity: 0.55,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/* ---------- layers 4-5: grade, grain, vignette ---------- */
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: "#2B3A66", mixBlendMode: "soft-light", opacity: 0.16 }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.16), transparent 22%, transparent 78%, rgba(0,0,0,0.26))",
      }}
    />
  </AbsoluteFill>
);

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: NOISE,
        backgroundSize: "220px",
        backgroundPosition: `${(f * 37) % 220}px ${(f * 53) % 220}px`,
        opacity: 0.075,
        mixBlendMode: "overlay",
      }}
    />
  );
};
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.42) 100%)",
    }}
  />
);

/* ---------- glass surface ---------- */
export const glass = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.022))",
  border: "1px solid rgba(255,255,255,0.11)",
  borderRadius: 22,
  boxShadow: "0 34px 80px -26px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.09)",
  backdropFilter: "blur(16px)",
  ...extra,
