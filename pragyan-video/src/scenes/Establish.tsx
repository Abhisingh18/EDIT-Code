import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { theme } from "../theme";
import { ei, sp, rnd } from "../lib";
import { at } from "../captions";
import { MaskLine, Sfx, display, mono } from "../components/ui";
import { Icon } from "../components/Icon";

const C = theme.colors;
const W = (w: string, n = 0) => at("bhawna", w, n);
const BAR = 110; // cinematic letterbox

// markers are pinned in plate space (plate drawn at 1920x1080) so they ride the camera move
const Marker: React.FC<{
  f: number; appear: number; x: number; y: number; lx: number; ly: number; title: string; sub: string; dot?: string;
}> = ({ f, appear, x, y, lx, ly, title, sub, dot }) => {
  if (f < appear) return null;
  const p = sp(f, appear, theme.spring.snappy);
  const line = ei(f, [appear + 2, appear + 12], [0, 1], theme.ease.inOut);
  const box = 34 + (1 - p) * 26;
  const dx = lx - x, dy = ly - y;
  return (
    <>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: x + (sx * box) / 2 - (sx > 0 ? 12 : 0), top: y + (sy * box) / 2 - (sy > 0 ? 12 : 0),
            width: 12, height: 12, opacity: p,
            borderLeft: sx < 0 ? "2px solid rgba(255,255,255,0.9)" : undefined,
            borderRight: sx > 0 ? "2px solid rgba(255,255,255,0.9)" : undefined,
            borderTop: sy < 0 ? "2px solid rgba(255,255,255,0.9)" : undefined,
            borderBottom: sy > 0 ? "2px solid rgba(255,255,255,0.9)" : undefined,
