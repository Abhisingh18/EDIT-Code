import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp, rnd } from "../lib";
import { at, pages } from "../captions";
import {
  BgField, Beat, Captions, ChapterTag, Chip, MaskLine, Sfx, SyncWords, display, glass, mono,
} from "../components/ui";
import { Icon } from "../components/Icon";
import { DocCard, Stamp } from "../components/Docs";
import { Establish } from "./Establish";
import { SpeakerDecor, VoiceMeter } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";

const C = theme.colors;
const W = (word: string, n = 0) => at("bhawna", word, n);
const CAPS = pages("bhawna", 3.0, 26.7, 4);

/* camera states for the footage layer (clip + transform, origin 0 0) */
type Cam = { t: number; r: number; b: number; l: number; rad: number; tx: number; ty: number; s: number };
// her picture-in-picture region in the source (x 48..795, y 272..1022) -> card at (70,170)
const SK = 747 / 700;
const SPLIT: Cam = { t: 272, r: 1125, b: 108, l: 95, rad: 28 / SK, tx: 70 - 95 * SK, ty: 170 - 272 * SK, s: SK };
// circle around her face (455,470) r150 -> centre (200,880) at 0.72
// card collapsed to its centre line — opens with a vertical wipe out of the establishing shot
const HID: Cam = { ...SPLIT, t: 272 + 350, b: 108 + 350 };
const PIP: Cam = { t: 320, r: 1315, b: 460, l: 305, rad: 150, tx: 200 - 455 * 0.72, ty: 880 - 470 * 0.72, s: 0.72 };
const KEYS: [number, Cam][] = [
  [0, HID],
  [94, HID],
  [114, SPLIT],
  [798, SPLIT],
  [818, PIP],
];
const camAt = (f: number): Cam => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [f0, a] = KEYS[i];
    const [f1, b] = KEYS[i + 1];
    if (f <= f1) {
      const p = ei(f, [f0, f1], [0, 1], theme.ease.inOut);
      const o = {} as Cam;
      (Object.keys(a) as (keyof Cam)[]).forEach((k) => (o[k] = lerp(a[k], b[k], p)));
      return o;
    }
  }
  return KEYS[KEYS.length - 1][1];
};

const PX = 880; // right panel left edge
const PCX = 1365; // right panel centre

export const Bhawna: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const sceneOut = ei(f, [1040, 1053], [0, 1], theme.ease.in);

  return (
    <AbsoluteFill style={{ opacity: 1 - sceneOut }}>
      <BgField intensity={0.9} />

      {/* footage layer: full frame -> split card -> face circle */}
      <AbsoluteFill
        style={{
          clipPath: `inset(${cam.t}px ${cam.r}px ${cam.b}px ${cam.l}px round ${cam.rad}px)`,
          transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`,
          transformOrigin: "0 0",
          filter: "saturate(1.04) contrast(1.04)",
        }}
