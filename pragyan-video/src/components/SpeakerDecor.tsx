import React from "react";
import { theme } from "../theme";
import { ei, sp } from "../lib";
import { display, mono } from "./ui";
import envData from "../data/voice_env.json";

const C = theme.colors;
const ENV = envData as Record<"bhawna" | "shreya" | "arjun" | "arjun2", number[]>;
export type Speaker = keyof typeof ENV;

// level history driven by the speaker's real (processed) voice
export const VoiceMeter: React.FC<{ who: Speaker; i: number; bars?: number; h?: number; o?: number }> = ({
  who, i, bars = 14, h = 26, o = 1,
}) => {
  const env = ENV[who];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: h, opacity: o }}>
      {Array.from({ length: bars }).map((_, k) => {
        const idx = i - (bars - 1 - k);
        const v = idx >= 0 && idx < env.length ? env[idx] : 0;
        const hh = Math.max(3, v * h);
        return (
          <div
            key={k}
            style={{
              width: 3, height: hh, borderRadius: 2,
              background: k === bars - 1 && v > 0.55 ? C.hero : `rgba(255,255,255,${0.35 + 0.6 * v})`,
            }}
