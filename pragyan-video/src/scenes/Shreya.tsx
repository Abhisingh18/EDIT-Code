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
