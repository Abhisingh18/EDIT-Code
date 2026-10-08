import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp } from "../lib";
import { BgField, MaskLine, Sfx, display, mono } from "../components/ui";
import { Lattice, PointOfLight } from "../components/Particles";

const C = theme.colors;

type Frag = { img: string; x: number; y: number; w: number; ry: number; rz: number; dx: number };
const PHRASES: { text: string; at: number; frags: Frag[] }[] = [
  {
    text: "CONFIDENTIAL DATA.",
    at: 144,
    frags: [
      { img: "frag/scan.jpg", x: 70, y: 150, w: 720, ry: 24, rz: -2, dx: -40 },
      { img: "frag/admin.jpg", x: 1150, y: 520, w: 700, ry: -22, rz: 2, dx: 40 },
    ],
  },
  {
    text: "SCATTERED KNOWLEDGE.",
    at: 162,
    frags: [
      { img: "frag/challenges.jpg", x: 90, y: 90, w: 560, ry: 18, rz: -4, dx: -30 },
      { img: "frag/server.jpg", x: 1160, y: 110, w: 640, ry: -20, rz: 3, dx: 30 },
      { img: "frag/sources.jpg", x: 560, y: 690, w: 620, ry: 8, rz: -1, dx: -20 },
    ],
  },
  {
    text: "HOURS OF MANUAL WORK.",
    at: 180,
    frags: [
      { img: "frag/refinery.jpg", x: 80, y: 260, w: 520, ry: 26, rz: 1, dx: -35 },
      { img: "frag/scan.jpg", x: 1240, y: 180, w: 600, ry: -26, rz: -2, dx: 35 },
    ],
  },
  {
    text: "PUBLIC AI? NOT ALLOWED.",
    at: 198,
    frags: [
      { img: "frag/graph.jpg", x: 120, y: 600, w: 600, ry: 20, rz: 2, dx: -30 },
      { img: "frag/admin.jpg", x: 1180, y: 80, w: 620, ry: -18, rz: -3, dx: 30 },
    ],
  },
];

const Fragment: React.FC<{ fr: Frag; l: number; tint?: string }> = ({ fr, l, tint }) => {
  const enter = ei(l, [0, 5], [1, 0]);
  const x = fr.x + fr.dx * enter * 2.2 + fr.dx * (l / 18) * 0.6;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: fr.y,
        width: fr.w,
        transform: `perspective(1600px) rotateY(${fr.ry}deg) rotateZ(${fr.rz}deg)`,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 40px 90px -30px rgba(0,0,0,0.9)",
        opacity: 0.5 * (1 - enter * 0.6),
        filter: `grayscale(0.92) brightness(0.62) contrast(1.15) blur(${enter * 6}px)`,
      }}
    >
      <Img src={staticFile(fr.img)} style={{ width: "100%", display: "block" }} />
      {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: "color" }} />}
    </div>
  );
};

export const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();

  // camera: push from far away through the structure
  const camZ = ei(f, [36, 262], [4.4, 0.42], theme.ease.inOut);
  const yaw = 0.25 + f * 0.0052;
  const pitch = 0.32 + Math.sin(f / 80) * 0.08;
  const latticeO =
    ei(f, [36, 60], [0, 1]) * (f >= 144 && f < 216 ? 0.32 : 1) * ei(f, [250, 268], [1, 0], theme.ease.in);

  const pointSize = sp(f, 12, theme.spring.snappy) * 7 * ei(f, [38, 70], [1, 0]);
  const hookOut = ei(f, [128, 140], [0, 1], theme.ease.in);

  const phrase = PHRASES.findIndex((p, i) => f >= p.at && f < (PHRASES[i + 1]?.at ?? 216));

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: ei(f, [30, 90], [0, 1]) }}>
        <BgField intensity={0.8} grid={false} />
      </AbsoluteFill>

      <Lattice f={f} spawnAt={36} camZ={camZ} yaw={yaw} pitch={pitch} opacity={latticeO} />
      {f < 72 && <PointOfLight size={pointSize} o={ei(f, [12, 16], [0, 1])} />}
