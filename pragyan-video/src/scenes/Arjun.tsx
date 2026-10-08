import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp, rnd } from "../lib";
import { at } from "../captions";
import { BgField, ChapterTag, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Icon } from "../components/Icon";
import { SpeakerDecor, VoiceMeter } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";

const C = theme.colors;
const A = (w: string, n = 0) => at("arjun", w, n);
const S = (sec: number) => Math.round(sec * 30);

// the product screen
const WIN = { x: 70, y: 150, bar: 40 };
const VW = 1380;
const VH = 781;
const K = VW / 1696; // arjun.mp4 is 1696x960
const RX = 1500; // right column
const RW = 360;

/* ---------- virtual camera: cinematic punch-ins on the UI that matters (video px, seconds) ---------- */
type Shot = { a: number; b: number; cx: number; cy: number; z: number; tin?: number };
const SHOTS: Shot[] = [
  { a: 0.5, b: 3.2, cx: 1085, cy: 250, z: 1.28 }, // the prompt
  { a: 6.5, b: 8.7, cx: 1290, cy: 190, z: 1.22 }, // failed checks
  { a: 9.2, b: 11.3, cx: 560, cy: 460, z: 1.3 }, // sources
  { a: 12.1, b: 13.8, cx: 1110, cy: 300, z: 1.18 }, // superseded revision
  { a: 17.6, b: 19.9, cx: 1085, cy: 430, z: 1.16 }, // the draft
  { a: 20.3, b: 24.9, cx: 850, cy: 330, z: 1.2, tin: 3.0 }, // graph, slow push
  { a: 25.4, b: 28.8, cx: 490, cy: 330, z: 1.32 }, // router decisions
  { a: 30.2, b: 31.9, cx: 330, cy: 360, z: 1.2 }, // saved preferences
  { a: 32.4, b: 34.8, cx: 850, cy: 440, z: 1.2 }, // memory editor
  { a: 35.6, b: 40.1, cx: 840, cy: 230, z: 1.14 }, // coding prompt
  { a: 40.5, b: 43.1, cx: 620, cy: 487, z: 1.28 }, // restricted answer
  { a: 45.7, b: 47.4, cx: 1034, cy: 380, z: 1.18 }, // access level column
  { a: 47.5, b: 48.95, cx: 850, cy: 360, z: 1.2 }, // time-limited access grant
  { a: 49.2, b: 50.9, cx: 1300, cy: 520, z: 1.22 }, // audit log
];
const camAt = (sec: number) => {
  let z = 1, cx = 848, cy = 480;
  for (const s of SHOTS) {
    const p = ei(sec, [s.a, s.a + (s.tin ?? 0.55)], [0, 1], theme.ease.inOut) * (1 - ei(sec, [s.b - 0.45, s.b], [0, 1], theme.ease.inOut));
    if (p > 0) { z = 1 + (s.z - 1) * p; cx = lerp(848, s.cx, p); cy = lerp(480, s.cy, p); }
  }
  const Cx = Math.min(Math.max(cx * K, VW / (2 * z)), VW - VW / (2 * z));
  const Cy = Math.min(Math.max(cy * K, VH / (2 * z)), VH - VH / (2 * z));
  return { z, Cx, Cy };
};
type Cam = ReturnType<typeof camAt>;
const toScreen = (vx: number, vy: number, c: Cam) => ({
  x: VW / 2 + (vx * K - c.Cx) * c.z, // relative to the video viewport
  y: VH / 2 + (vy * K - c.Cy) * c.z,
});

/* ---------- annotations pinned to UI (video px) ---------- */
type HL = { a: number; b: number; r: [number, number, number, number]; label: string; tone: string };
const HLS: HL[] = [
  { a: 9.45, b: 11.2, r: [48, 392, 1012, 502], label: "Cited to the page", tone: C.ok },
  { a: 12.35, b: 13.7, r: [568, 238, 1656, 294], label: "Newer revision detected", tone: C.warn },
  { a: 17.85, b: 19.8, r: [512, 298, 1658, 602], label: "Your four-part format", tone: C.accent },
  { a: 25.5, b: 26.5, r: [134, 280, 846, 350], label: "Report → document model", tone: C.accent },
  { a: 26.6, b: 28.7, r: [148, 298, 822, 366], label: "Code → coding model", tone: C.accent },
  { a: 30.35, b: 31.9, r: [112, 52, 532, 658], label: "Saved preferences", tone: "#FFFFFF" },
  { a: 32.45, b: 34.6, r: [456, 283, 1242, 612], label: "You decide what it keeps", tone: C.ok },
  { a: 40.65, b: 43.0, r: [56, 443, 1187, 532], label: "Outside this user's clearance", tone: C.bad },
  { a: 43.75, b: 45.4, r: [558, 183, 1592, 242], label: "Operations engineer · answered", tone: C.ok },
  { a: 43.95, b: 45.4, r: [668, 528, 1497, 600], label: "Restricted employee · hidden", tone: C.bad },
  { a: 45.85, b: 47.4, r: [938, 98, 1130, 667], label: "Access level per document", tone: C.accent },
