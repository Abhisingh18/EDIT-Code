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
