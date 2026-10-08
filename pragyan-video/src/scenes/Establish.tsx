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
          }}
        />
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={x} y1={y} x2={x + dx * line} y2={y + dy * line} stroke="rgba(255,255,255,0.75)" strokeWidth={1.5} />
      </svg>
      <div
        style={{
          position: "absolute", left: lx, top: ly - 26, padding: "8px 14px", borderRadius: 8,
          background: "rgba(6,9,16,0.62)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(6px)",
          opacity: ei(f, [appear + 8, appear + 14], [0, 1]), transform: `translateX(${(1 - line) * -8}px)`, whiteSpace: "nowrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {dot && <div style={{ width: 7, height: 7, borderRadius: 4, background: dot }} />}
          <span style={{ ...mono(14, C.text), letterSpacing: "0.12em" }}>{title}</span>
        </div>
        <div style={{ ...mono(11, C.dim), letterSpacing: "0.12em", marginTop: 4 }}>{sub}</div>
      </div>
    </>
  );
};

export const Establish: React.FC<{ f: number }> = ({ f }) => {
  if (f > 116) return null;
  // camera: flash + zoom-blur in, slow drone push, fly-through out
  const inP = ei(f, [0, 14], [0, 1], theme.ease.out);
  const push = ei(f, [0, 92], [0, 1], theme.ease.std);
  const fly = ei(f, [90, 112], [0, 1], theme.ease.in);
  const scale = (1.28 - 0.28 * inP) * (1 + 0.085 * push) * (1 + 0.32 * fly);
  const tx = -34 * push + Math.sin(f / 40) * 3;
  const ty = -14 * push + Math.cos(f / 47) * 2;
