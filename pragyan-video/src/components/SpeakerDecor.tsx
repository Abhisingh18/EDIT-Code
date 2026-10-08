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
          />
        );
      })}
    </div>
  );
};

// broadcast "talent box" dressing for a speaker's frame
export const SpeakerDecor: React.FC<{
  f: number;
  x: number; y: number; w: number; h: number; r: number;
  appear: number;
  who: Speaker;
  envFrame: number;
  name: string;
  role: string;
  index: string;
  plate?: "top" | "bottom" | "none";
  o?: number;
}> = ({ f, x, y, w, h, r, appear, who, envFrame, name, role, index, plate = "bottom", o = 1 }) => {
  if (f < appear) return null;
  const p = sp(f, appear, theme.spring.smooth);
  const ang = (f * 0.7) % 360;
  const bracket = 26 * ei(f, [appear + 4, appear + 18], [0, 1]);
  const off = 14;
  const live = Math.floor(f / 15) % 2 === 0;
  const secs = Math.max(0, Math.floor(envFrame / 30));
  const tc = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
