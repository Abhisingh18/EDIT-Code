import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp, rnd } from "../lib";
import { at, pages } from "../captions";
import { BgField, Beat, Captions, ChapterTag, Chip, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Icon } from "../components/Icon";
import { CORE } from "./Reveal";
import { SpeakerDecor } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";

const C = theme.colors;
const W = (w: string, n = 0) => at("shreya", w, n);
const CAPS = pages("shreya", 6.05, 99, 3);
const LOGO_AR = 470 / 530;

const CARD = { x: 90, y: 98, w: 620, h: 884 };

const Header: React.FC<{ f: number; at: number; text: string }> = ({ f, at: a, text }) => (
  <div style={{ position: "absolute", left: 790, top: 120 }}>
    <MaskLine f={f} at={a}>
      <span style={display(46, 650)}>{text}</span>
    </MaskLine>
  </div>
);

const Logo: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 1 }) => (
  <>
    <div
      style={{
        position: "absolute", left: x - w * 0.85, top: y - w * 0.85, width: w * 1.7, height: w * 1.7, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.2), rgba(255,122,26,0.05) 42%, transparent 68%)", opacity: o,
      }}
    />
    <Img src={staticFile("logo_dark.png")} style={{ position: "absolute", left: x - w / 2, top: y - (w * LOGO_AR) / 2, width: w, opacity: o }} />
  </>
);

const bez = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

/* ---------- beat 2 data ---------- */
const MODELS = [
  { icon: "eye", name: "Vision", model: "Qwen3-VL-32B", cy: 335 },
  { icon: "code", name: "Code", model: "Qwen2.5-Coder-32B", cy: 545 },
  { icon: "bulb", name: "Reasoning", model: "DeepSeek-R1-32B", cy: 755 },
];
const ROUTER = { x: 1210, y: 545 };

export const Shreya: React.FC = () => {
  const f = useCurrentFrame();
  const cardP = sp(f, 176, theme.spring.smooth);
  const out = ei(f, [1468, 1482], [0, 1], theme.ease.in);

  // routing events (vision, code, reasoning)
  const EV = [W("vision", 0), W("code"), W("reasoning", 0)];
  const arrive = (i: number) => EV[i] + 30;
  const active = EV.reduce((acc, _, i) => (f >= arrive(i) ? i : acc), -1);

  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.03})` }}>
      <BgField intensity={1} />

      {/* her card */}
      <div
        style={{
          position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 28, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 60px 120px -30px rgba(0,0,0,0.9)",
          opacity: cardP, transform: `translateX(${(1 - cardP) * -90}px) scale(${0.95 + 0.05 * cardP})`,
        }}
      >
        <OffthreadVideo src={staticFile("shreya.mp4")} muted={!PLAY_VOICE} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 22%, transparent 62%, rgba(2,4,9,0.85))" }} />
      </div>
      <SpeakerDecor
        f={f} x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={28} appear={204} who="shreya" envFrame={f}
        name="Shreya" role="The solution" index="02 / 03" plate="top"
      />
      <div style={{ position: "absolute", left: 0, top: 0, opacity: cardP }}>
        <Captions f={f} pages={CAPS} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h - 142} maxWidth={560} size={34} />
      </div>

      <ChapterTag f={f} at={196} num="02" title="The solution" style={{ left: 792, top: 66 }} />

      {/* B1 — sovereign: everything inside your boundary */}
      <Beat f={f} from={198} to={306}>
        <Header f={f} at={204} text="Sovereign by design" />
        {(() => {
          const reveal = ei(f, [W("inside", 0) - 12, W("inside", 0) + 30], [0, 1], theme.ease.inOut);
          return (
            <div
              style={{
                position: "absolute", left: 830, top: 220, width: 970, height: 650, borderRadius: 36,
                border: "2px dashed rgba(255,255,255,0.3)", clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
              }}
            />
          );
        })()}
        <Logo x={CORE.x} y={CORE.y} w={CORE.w * (1 + Math.sin(f / 24) * 0.008)} />
        {["Your data", "Your models", "Your tools"].map((t, i) => {
          const a = (i / 3) * Math.PI * 2 + f * 0.007 - 0.6;
          const p = sp(f, W("productivity") + i * 5, theme.spring.snappy);
          return (
            <div
              key={t}
              style={{
