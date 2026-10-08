import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp } from "../lib";
import { BgField, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Converge } from "../components/Particles";

const C = theme.colors;
const SHOT = 36; // two beats

// source windows are chosen to stay inside one shot of Arjun's own edit (no stray cuts)
const SHOTS = [
  { t: 130.0, rate: 1, crop: [300, 0, 1390, 782], label: "Cites every check." },
  { t: 38.0, rate: 1, crop: [300, 0, 1390, 782], label: "Maps knowledge." },
  { t: 66.0, rate: 1, crop: [300, 0, 1390, 782], label: "Checks clearance." },
  { t: 82.0, rate: 1, crop: [300, 0, 1390, 782], label: "Grants, then expires." },
  { t: 172.0, rate: 1, crop: [300, 0, 1390, 782], label: "Codes by the rules." },
  { t: 211.0, rate: 1, crop: [300, 0, 1390, 782], label: "Goes mobile." },
];
const CARD = { x: 600, y: 196, w: 1220, h: 686 };

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const l = useCurrentFrame();
  const s = SHOTS[i];
  const [cx, cy, cw] = s.crop;
  const k = CARD.w / cw;
  const enter = ei(l, [0, 6], [1, 0], theme.ease.out);
  const drift = ei(l, [0, SHOT], [60, -60], theme.ease.std);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, perspective: 2000 }}>
