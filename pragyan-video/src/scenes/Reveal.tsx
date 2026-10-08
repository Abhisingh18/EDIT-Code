import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp } from "../lib";
import { at } from "../captions";
import { BgField, Sfx, SyncWords, display } from "../components/ui";
import { PointOfLight, TorusRing } from "../components/Particles";

const C = theme.colors;
const OFF = 15; // Shreya's audio starts 15 frames into the reveal
const S = (w: string, n = 0) => at("shreya", w, n) + OFF;

// hand-off target: the core logo of Shreya's first beat
export const CORE = { x: 1315, y: 545, w: 230 };
const LOGO_W = 460;
const LOGO_AR = 470 / 530;

export const Reveal: React.FC = () => {
  const r = useCurrentFrame();
  const hitAt = S("progan", 0);
  const form = ei(r, [12, hitAt - 4], [0, 1], theme.ease.inOut);
  const pitch = ei(r, [15, hitAt], [1.25, 0.12], theme.ease.inOut);
  const yaw = ei(r, [15, hitAt], [0.5, 0], theme.ease.inOut) + Math.sin(r / 40) * 0.05;
  const burst = ei(r, [hitAt, hitAt + 26], [0, 1], theme.ease.out);
  const flash = r < hitAt ? 0 : ei(r, [hitAt, hitAt + 14], [0.42, 0], theme.ease.out);
  const logoP = sp(r, hitAt, theme.spring.snappy);

