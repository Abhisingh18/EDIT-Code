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
