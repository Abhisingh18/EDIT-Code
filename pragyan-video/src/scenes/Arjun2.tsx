import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp } from "../lib";
import { BgField, ChapterTag, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Icon } from "../components/Icon";
import { SpeakerDecor, VoiceMeter } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";
import chData from "../data/arjun2_chapters.json";
import sfxData from "../data/arjun2_sfx.json";

const C = theme.colors;
const S = (sec: number) => Math.round(sec * 30);

type Ch = { n: string; t: number; card: [number, number] | null; title: string; sub: string; g: string };
const CH = (chData as unknown as { chapters: Ch[] }).chapters;
const END = (chData as unknown as { endCard: [number, number] }).endCard;
const SFX = sfxData as { t: number; name: string; vol: number }[];

// the product screen
const WIN = { x: 70, y: 150, bar: 40 };
const VW = 1380;
const VH = 781;
const RX = 1500;
const RW = 360;

/* ---------- small building blocks ---------- */
const stag = (f: number, a: number): React.CSSProperties => {
  const p = sp(f, a, theme.spring.snappy);
  return { opacity: p, transform: `translateY(${(1 - p) * 16}px)` };
};
const Pill: React.FC<{ icon?: string; text: string; tone?: string; on?: boolean; style?: React.CSSProperties }> = ({ icon, text, tone = C.text, on = true, style }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", borderRadius: 12,
    background: on ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${on && tone !== C.text ? tone + "77" : "rgba(255,255,255,0.12)"}`, opacity: on ? 1 : 0.45, ...style,
  }}>
    {icon && <Icon name={icon} size={17} color={tone} />}
    <span style={{ ...mono(12.5, tone), letterSpacing: "0.07em", textTransform: "none" }}>{text}</span>
  </div>
);
const Flow: React.FC<{ f: number; steps: { t: string; at: number; icon?: string }[]; tone?: string }> = ({ f, steps, tone = C.hero }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
    {steps.map((s, k) => {
      const on = f >= S(s.at);
      return (
        <div key={s.t} style={stag(f, S(s.at) - 4)}>
          {k > 0 && <div style={{ width: 2, height: 14, marginLeft: 22, background: on ? tone : "rgba(255,255,255,0.15)" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: on ? `${tone}18` : "rgba(255,255,255,0.04)", border: `1px solid ${on ? tone + "88" : "rgba(255,255,255,0.1)"}` }}>
            <Icon name={s.icon ?? "arrow"} size={18} color={on ? tone : C.dim} />
            <span style={{ ...display(20, 600), color: on ? C.text : C.dim }}>{s.t}</span>
          </div>
        </div>
      );
    })}
  </div>
);

/* ---------- one mini graphic per chapter (timed to Arjun's words, seconds) ---------- */
const Graphic: React.FC<{ g: string; f: number; t0: number }> = ({ g, f, t0 }) => {
  const b = S(t0);
  switch (g) {
    case "platform":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["monitor", "Web app", 2.4], ["phone", "Phone app", 3.4], ["code", "Terminal assistant", 4.6], ["code", "IDE agent", 5.6]].map(([ic, t, a]) => (
            <div key={t as string} style={stag(f, S(a as number))}><Pill icon={ic as string} text={t as string} /></div>
          ))}
          <div style={{ ...stag(f, S(7.6)), display: "flex", alignItems: "center", gap: 12, marginTop: 8, padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${C.hero}`, boxShadow: `0 0 30px ${C.glow}`, background: "rgba(255,122,26,0.08)" }}>
