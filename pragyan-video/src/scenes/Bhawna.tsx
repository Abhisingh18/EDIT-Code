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
      >
        <OffthreadVideo src={staticFile("bhawna.mp4")} muted={!PLAY_VOICE} />
      </AbsoluteFill>

      {/* broadcast talent-box dressing while docked */}
      {f < 800 && (
        <SpeakerDecor
          f={f} x={70} y={170} w={747} h={747} r={28} appear={104} who="bhawna" envFrame={f}
          name="Bhavna" role="The problem" index="01 / 03"
          o={ei(f, [786, 798], [1, 0], theme.ease.in)}
        />
      )}
      {/* light sweep across the card as it opens */}
      {f >= 110 && f < 132 && (
        <div style={{ position: "absolute", left: 70, top: 170, width: 747, height: 747, borderRadius: 28, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, bottom: -100, width: 260, left: lerp(-320, 820, ei(f, [110, 130], [0, 1], theme.ease.inOut)), background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.16), transparent)", transform: "skewX(-14deg)" }} />
        </div>
      )}
      {f >= 818 && (
        <div
          style={{
            position: "absolute", left: 200 - 112, top: 880 - 112, width: 224, height: 224, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.35)", boxShadow: "0 0 0 8px rgba(255,255,255,0.04)",
            opacity: ei(f, [818, 832], [0, 1]),
          }}
        />
      )}


      {/* titles */}
      {f < 800 && (
        <AbsoluteFill style={{ opacity: ei(f, [786, 800], [1, 0], theme.ease.in) }}>
          <ChapterTag f={f} at={100} num="01" title="The problem" style={{ left: 72, top: 62 }} />
        </AbsoluteFill>
      )}

      {/* P1 — highly sensitive data */}
      <Beat f={f} from={95} to={182}>
        <div style={{ position: "absolute", left: PX, top: 196 }}>
          <MaskLine f={f} at={100}>
            <span style={mono(17, C.dim)}>Refinery data · classified</span>
          </MaskLine>
        </div>
        {[
          { t: "P&ID DRAWING", x: -190, r: -10, d: 0 },
          { t: "SOP-CDU-014", x: 190, r: 10, d: 5 },
          { t: "INSPECTION REPORT", x: 0, r: 0, d: 10 },
        ].map((d, i) => {
          const p = sp(f, 102 + d.d, theme.spring.smooth);
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: PCX - 150 + d.x, top: 330,
                transform: `translateY(${(1 - p) * 140}px) rotate(${d.r * p}deg)`, opacity: p,
              }}
            >
              <DocCard f={f} at={102} kind={i === 2 ? "report" : "plain"} title={d.t} />
            </div>
          );
        })}
        <Stamp f={f} at={W("sensitive") - 2} text="CONFIDENTIAL" style={{ left: PCX - 150, top: 470 }} />
      </Beat>

      {/* P2 — analyse report -> approval-ready note */}
      <Beat f={f} from={182} to={334}>
        <div style={{ position: "absolute", left: PX, top: 196 }}>
