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
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o * p, pointerEvents: "none" }}>
      {/* grounding shadow */}
      <div style={{
        position: "absolute", left: x + w * 0.06, top: y + h + 6, width: w * 0.88, height: 46, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%)", filter: "blur(6px)",
      }} />
      {/* inner depth: vignette + top light */}
      <div style={{
        position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r,
        boxShadow: "inset 0 0 140px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), transparent 30%)",
      }} />
      {/* light-catching gradient edge, slowly rotating */}
      <div style={{
        position: "absolute", left: x - 1.5, top: y - 1.5, width: w + 3, height: h + 3, borderRadius: r + 1.5, padding: 1.5,
        boxSizing: "border-box",
        background: `conic-gradient(from ${ang}deg, rgba(255,255,255,0.08), rgba(255,255,255,0.65), rgba(255,122,26,0.55), rgba(76,141,255,0.55), rgba(255,255,255,0.08) 70%, rgba(255,255,255,0.08))`,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }} />
      {/* viewfinder brackets */}
      {[[x - off, y - off, 1, 1], [x + w + off, y - off, -1, 1], [x - off, y + h + off, 1, -1], [x + w + off, y + h + off, -1, -1]].map(
        ([bx, by, sx, sy], k) => (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: sx > 0 ? bx : bx - bracket, top: by - 1, width: bracket, height: 2, background: "rgba(255,255,255,0.7)" }} />
            <div style={{ position: "absolute", left: bx - 1, top: sy > 0 ? by : by - bracket, width: 2, height: bracket, background: "rgba(255,255,255,0.7)" }} />
          </React.Fragment>
        ),
      )}
      {/* REC + index */}
      <div style={{ position: "absolute", left: x + w - 190, top: y + 18, width: 170, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: C.bad, opacity: live ? 1 : 0.35 }} />
        <span style={{ ...mono(12, C.text), fontVariantNumeric: "tabular-nums", textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}>REC {tc}</span>
        <span style={{ ...mono(12, C.dim), textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}>{index}</span>
      </div>
      {/* name plate with live voice meter */}
      {plate !== "none" && (
        <div style={{
          position: "absolute", left: x + 18, top: plate === "bottom" ? y + h - 18 - 70 : y + 18,
          height: 70, padding: "0 18px", borderRadius: 16, display: "flex", alignItems: "center", gap: 18,
          background: "rgba(6,9,16,0.62)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(10px)",
          transform: `translateY(${(1 - p) * 14}px)`,
        }}>
          <div>
            <div style={{ ...display(26, 650), letterSpacing: "-0.01em" }}>{name}</div>
            <div style={{ ...mono(11, C.dim), marginTop: 5 }}>{role}</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.14)" }} />
          <VoiceMeter who={who} i={envFrame} />
        </div>
      )}
    </div>
  );
};
