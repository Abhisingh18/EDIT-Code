import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp, rnd } from "../lib";
import { at, pages } from "../captions";
import { BgField, Beat, Captions, ChapterTag, Chip, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Icon } from "../components/Icon";
import { CORE } from "./Reveal";
import { SpeakerDecor } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";

const C = theme.colors;
const W = (w: string, n = 0) => at("shreya", w, n);
const CAPS = pages("shreya", 6.05, 99, 3);
const LOGO_AR = 470 / 530;

const CARD = { x: 90, y: 98, w: 620, h: 884 };

const Header: React.FC<{ f: number; at: number; text: string }> = ({ f, at: a, text }) => (
  <div style={{ position: "absolute", left: 790, top: 120 }}>
    <MaskLine f={f} at={a}>
      <span style={display(46, 650)}>{text}</span>
    </MaskLine>
  </div>
);

const Logo: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 1 }) => (
  <>
    <div
      style={{
        position: "absolute", left: x - w * 0.85, top: y - w * 0.85, width: w * 1.7, height: w * 1.7, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.2), rgba(255,122,26,0.05) 42%, transparent 68%)", opacity: o,
      }}
    />
    <Img src={staticFile("logo_dark.png")} style={{ position: "absolute", left: x - w / 2, top: y - (w * LOGO_AR) / 2, width: w, opacity: o }} />
  </>
