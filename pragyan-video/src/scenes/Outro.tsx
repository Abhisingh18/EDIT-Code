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
        <div
          style={{
            position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 20, overflow: "hidden",
            ...glass({ borderRadius: 20 }), background: "#EEE",
            transform: `translateX(${drift + enter * 260}px) rotateY(-9deg) rotateX(3deg) scale(${1 + (1 - enter) * 0.0})`,
            filter: `blur(${enter * 10}px)`,
            boxShadow: "0 80px 140px -40px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.14)",
          }}
        >
          <OffthreadVideo
            src={staticFile("arjun2.mp4")}
            trimBefore={Math.round(s.t * 30)}
            playbackRate={s.rate}
            muted
            style={{ position: "absolute", left: -cx * k, top: -cy * k, width: 1696 * k, height: 960 * k, maxWidth: "none" }}
          />
          <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(5,7,13,0.25), transparent 30%)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 430, width: 460 }}>
        <MaskLine f={l} at={1}>
          <div style={mono(18, C.hero)}>{String(i + 1).padStart(2, "0")}</div>
        </MaskLine>
        <MaskLine f={l} at={3}>
          <div style={{ ...display(68, 750), marginTop: 14 }}>{s.label}</div>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};
