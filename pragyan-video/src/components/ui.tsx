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
