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
