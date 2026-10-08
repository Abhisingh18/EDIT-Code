import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, exitP } from "../lib";
import { Page } from "../captions";
import { Icon } from "./Icon";
import { PLAY_SFX } from "../stem";

const C = theme.colors;

/* ---------- layer 1: background field (never flat) ---------- */
export const BgField: React.FC<{ intensity?: number; grid?: boolean }> = ({ intensity = 1, grid = true }) => {
  const f = useCurrentFrame();
  const d1 = Math.sin(f / 95) * 70;
  const d2 = Math.cos(f / 120) * 60;
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(120% 95% at 50% 38%, #0C1222 0%, #05070D 58%, #020308 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", width: 1500, height: 1500, borderRadius: "50%",
          left: -560 + d1, top: -820,
          background: `radial-gradient(circle, rgba(76,141,255,${0.11 * intensity}), transparent 60%)`,
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute", width: 1300, height: 1300, borderRadius: "50%",
          right: -520 - d2, bottom: -760,
          background: `radial-gradient(circle, rgba(255,122,26,${0.075 * intensity}), transparent 62%)`,
          filter: "blur(40px)",
        }}
      />
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1.3px)",
            backgroundSize: "34px 34px",
            backgroundPosition: `${(f * 0.15) % 34}px 0px`,
            WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 72%)",
            maskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 72%)",
            opacity: 0.55,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/* ---------- layers 4-5: grade, grain, vignette ---------- */
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: "#2B3A66", mixBlendMode: "soft-light", opacity: 0.16 }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.16), transparent 22%, transparent 78%, rgba(0,0,0,0.26))",
      }}
    />
  </AbsoluteFill>
);

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: NOISE,
        backgroundSize: "220px",
        backgroundPosition: `${(f * 37) % 220}px ${(f * 53) % 220}px`,
        opacity: 0.075,
        mixBlendMode: "overlay",
      }}
    />
  );
};
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.42) 100%)",
    }}
  />
);

/* ---------- glass surface ---------- */
export const glass = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.022))",
  border: "1px solid rgba(255,255,255,0.11)",
  borderRadius: 22,
  boxShadow: "0 34px 80px -26px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.09)",
  backdropFilter: "blur(16px)",
  ...extra,
});

/* ---------- typography ---------- */
export const mono = (size = 16, color: string = C.dim): React.CSSProperties => ({
  fontFamily: theme.fonts.mono,
  fontSize: size,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color,
  fontWeight: 500,
});
export const display = (size: number, weight = 700, color: string = C.text): React.CSSProperties => ({
  fontFamily: theme.fonts.display,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: "-0.025em",
  lineHeight: 1.04,
  color,
});

// masked line reveal: controlled opacity + vertical displacement (no generic fades)
export const MaskLine: React.FC<{
  f: number;
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dist?: number;
}> = ({ f, at, children, style, dist = 105 }) => {
  const p = sp(f, at, theme.spring.soft);
  return (
    <div style={{ overflow: "hidden", padding: "0.06em 0 0.22em", margin: "-0.06em 0 -0.22em", ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - p) * dist}%)`,
          opacity: ei(f, [at, at + 10], [0, 1]),
        }}
      >
        {children}
      </div>
    </div>
  );
};

// per-word masked reveal synced to explicit frames
export const SyncWords: React.FC<{
  f: number;
  items: { t: string; at: number; color?: string }[];
  style?: React.CSSProperties;
  gap?: number;
}> = ({ f, items, style, gap = 22 }) => (
  <div style={{ display: "flex", flexWrap: "wrap", columnGap: gap, ...style }}>
    {items.map((w, i) => (
      <MaskLine key={i} f={f} at={w.at} style={{ color: w.color }}>
        {w.t}
      </MaskLine>
    ))}
  </div>
);

/* ---------- chapter tag ---------- */
export const ChapterTag: React.FC<{ f: number; at: number; num: string; title: string; style?: React.CSSProperties }> = ({
  f, at, num, title, style,
}) => {
  const line = ei(f, [at + 4, at + 26], [0, 1]);
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 16, ...style }}>
      <MaskLine f={f} at={at}>
        <span style={mono(17, C.text)}>{num}</span>
      </MaskLine>
      <div style={{ width: 56 * line, height: 1.5, background: "rgba(255,255,255,0.45)" }} />
      <MaskLine f={f} at={at + 6}>
        <span style={mono(17, C.dim)}>{title}</span>
      </MaskLine>
    </div>
  );
};

/* ---------- chip ---------- */
export const Chip: React.FC<{
  f: number;
  at: number;
  icon?: string;
  label: string;
  tone?: "neutral" | "ok" | "bad" | "hero" | "accent";
  style?: React.CSSProperties;
  size?: number;
}> = ({ f, at, icon, label, tone = "neutral", style, size = 17 }) => {
  const p = sp(f, at, theme.spring.snappy);
  const col =
    tone === "ok" ? C.ok : tone === "bad" ? C.bad : tone === "hero" ? C.hero : tone === "accent" ? C.accent : C.text;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 18px",
        borderRadius: 999,
        background: tone === "neutral" ? "rgba(255,255,255,0.06)" : `${col}14`,
        border: `1px solid ${tone === "neutral" ? "rgba(255,255,255,0.12)" : `${col}55`}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px) scale(${0.92 + 0.08 * p})`,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size + 3} color={col} />}
      <span style={{ ...mono(size, tone === "neutral" ? C.text : col), letterSpacing: "0.12em" }}>{label}</span>
    </div>
  );
};

/* ---------- sfx ---------- */
export const Sfx: React.FC<{ at: number; name: string; vol?: number }> = ({ at, name, vol = 0.5 }) => !PLAY_SFX ? null : (
  <Sequence from={Math.max(0, at)} durationInFrames={170} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
  </Sequence>
);

/* ---------- beat wrapper: exit faster than entrance ---------- */
export const Beat: React.FC<{ f: number; from: number; to: number; children: React.ReactNode; exit?: number }> = ({
  f, from, to, children, exit = 12,
}) => {
  if (f < from - 2 || f > to) return null;
  const x = exitP(f, to, exit);
  return (
    <AbsoluteFill style={{ opacity: 1 - x, transform: `translateY(${-28 * x}px)`, filter: `blur(${x * 6}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------- word-synced captions (premium, monochrome) ---------- */
export const Captions: React.FC<{
  f: number;
  pages: Page[];
  x: number;
  y: number;
  maxWidth: number;
  size?: number;
  until?: number;
}> = ({ f, pages, x, y, maxWidth, size = 36, until = Infinity }) => {
  if (f >= until) return null;
  const page = pages.find((p) => f >= p.start && f < p.end);
  if (!page) return null;
  const p = sp(f, page.start, theme.spring.snappy);
  const out = ei(f, [page.end - 4, page.end], [1, 0], theme.ease.in);
  return (
    <div
      style={{
        position: "absolute",
        left: x - maxWidth / 2,
        top: y,
        width: maxWidth,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 11,
        rowGap: 4,
        opacity: p * out,
        transform: `translateY(${(1 - p) * 12}px)`,
      }}
    >
      {page.items.map((w, i) => {
        const on = f >= w.s - 1;
        return (
