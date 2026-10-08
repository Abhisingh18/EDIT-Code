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
  const rotZ = 0.35 - 0.6 * push;
  const blur = 14 * (1 - inP) + 10 * fly;
  const bars = ei(f, [0, 12], [0, 1], theme.ease.out) * (1 - ei(f, [86, 100], [0, 1], theme.ease.in));
  const split = 14 * (1 - ei(f, [0, 10], [0, 1], theme.ease.out));
  const plateO = 1 - ei(f, [94, 110], [0, 1], theme.ease.in);

  const scanY = ei(f, [8, 44], [BAR, 1080 - BAR], theme.ease.inOut);
  const tc = (() => {
    const fr = (f + 15) % 30, s = 17 + Math.floor((f + 15) / 30);
    return `09:42:${String(s).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
  })();

  const pingAt = W("engineer") - 2;
  const zoneAt = W("refinery") - 2;

  return (
    <AbsoluteFill style={{ opacity: plateO }}>
      {/* plate + pinned HUD share one camera */}
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotZ}deg)`,
          filter: `blur(${blur}px) brightness(${1 + 0.8 * (1 - ei(f, [0, 8], [0, 1]))})`,
        }}
      >
        <Img src={staticFile("plate_refinery.jpg")} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
        {split > 0.5 && (
          <>
            <Img src={staticFile("plate_refinery.jpg")} style={{ position: "absolute", left: -split, top: 0, width: 1920, height: 1080, mixBlendMode: "screen", opacity: 0.45, filter: "sepia(1) saturate(6) hue-rotate(-50deg)" }} />
            <Img src={staticFile("plate_refinery.jpg")} style={{ position: "absolute", left: split, top: 0, width: 1920, height: 1080, mixBlendMode: "screen", opacity: 0.45, filter: "sepia(1) saturate(6) hue-rotate(150deg)" }} />
          </>
        )}
        {/* drifting cloud shadow */}
        <div
          style={{
            position: "absolute", left: 200 + f * 4, top: 520, width: 1100, height: 520, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(10,20,40,0.32), transparent 65%)", mixBlendMode: "multiply",
          }}
        />
        {/* pinned markers */}
        <Marker f={f} appear={24} x={755} y={622} lx={560} ly={540} title="V-201" sub="Overhead receiver" />
        <Marker f={f} appear={34} x={1210} y={800} lx={1330} ly={742} title="PSV-2034" sub="Inspection due" dot={C.warn} />
        {f >= zoneAt && (
          <div
            style={{
              position: "absolute", left: 225, top: 488, width: 1090, height: 470, borderRadius: 10,
              border: "1.5px dashed rgba(255,255,255,0.7)", opacity: sp(f, zoneAt, theme.spring.snappy),
              transform: `scale(${1.06 - 0.06 * sp(f, zoneAt, theme.spring.snappy)})`,
            }}
          >
            <div style={{ position: "absolute", left: 0, top: -34, display: "flex", gap: 10, alignItems: "center", whiteSpace: "nowrap" }}>
              <span style={{ ...mono(13, C.text), background: "rgba(6,9,16,0.6)", padding: "5px 10px", borderRadius: 6 }}>Tank farm · zone B</span>
              <span style={{ ...mono(13, C.bad), background: "rgba(6,9,16,0.6)", padding: "5px 10px", borderRadius: 6 }}>Restricted</span>
            </div>
          </div>
        )}
        {/* the engineer — hero element */}
        {f >= pingAt && (() => {
          const p = sp(f, pingAt, theme.spring.bouncy);
          const x = 1120, y = 880;
          return (
            <>
              {[0, 1].map((k) => {
                const t = (((f - pingAt) + k * 15) % 30) / 30;
                return (
                  <div key={k} style={{
                    position: "absolute", left: x - 10 - t * 34, top: y - 10 - t * 34, width: 20 + t * 68, height: 20 + t * 68,
                    borderRadius: "50%", border: `2px solid ${C.hero}`, opacity: (1 - t) * 0.9 * p,
                  }} />
                );
              })}
              <div style={{
                position: "absolute", left: x - 9, top: y - 9, width: 18, height: 18, borderRadius: 9, background: C.hero,
                boxShadow: `0 0 24px ${C.hero}`, transform: `scale(${p})`,
              }} />
              <div style={{
                position: "absolute", left: x + 26, top: y - 54, display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                borderRadius: 999, background: "rgba(6,9,16,0.7)", border: `1px solid ${C.hero}`, opacity: p,
                transform: `translateY(${(1 - p) * 10}px)`, whiteSpace: "nowrap",
              }}>
                <Icon name="user" size={18} color={C.hero} />
                <span style={{ ...mono(14, C.text), letterSpacing: "0.12em" }}>Engineer · on site</span>
              </div>
            </>
          );
        })()}
      </AbsoluteFill>

      {/* atmosphere: foreground dust for depth */}
      {Array.from({ length: 18 }).map((_, i) => {
        const x = (rnd(i) * 2200 + f * (0.6 + rnd(i + 7) * 1.2)) % 2100 - 90;
        const y = 160 + rnd(i + 3) * 760 + Math.sin((f + i * 20) / 30) * 8;
        const s = 3 + rnd(i + 11) * 9;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: "rgba(255,240,220,0.5)", filter: `blur(${s / 3}px)`, opacity: 0.35 * inP }} />;
      })}

      {/* legibility for the title in the sky */}
      <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 12% 18%, rgba(4,8,18,0.55), transparent 70%)" }} />

      {/* HUD fixed to the lens */}
      {[[90, 140, 1, 1], [1830, 140, -1, 1], [90, 940, 1, -1], [1830, 940, -1, -1]].map(([x, y, sx, sy], i) => {
        const L = 46 * ei(f, [4 + i * 2, 18 + i * 2], [0, 1], theme.ease.out);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: sx > 0 ? x : x - L, top: y - 1, width: L, height: 2, background: "rgba(255,255,255,0.85)" }} />
            <div style={{ position: "absolute", left: x - 1, top: sy > 0 ? y : y - L, width: 2, height: L, background: "rgba(255,255,255,0.85)" }} />
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 960 - 22, top: 540 - 22, width: 44, height: 44, borderRadius: 22, border: "1px solid rgba(255,255,255,0.45)", opacity: ei(f, [10, 20], [0, 1]) }} />
      <div style={{ position: "absolute", left: 960 - 40, top: 540, width: 80, height: 1, background: "rgba(255,255,255,0.35)", opacity: ei(f, [10, 20], [0, 1]) }} />
      <div style={{ position: "absolute", left: 960, top: 540 - 40, width: 1, height: 80, background: "rgba(255,255,255,0.35)", opacity: ei(f, [10, 20], [0, 1]) }} />
      {f >= 8 && f <= 46 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: scanY - 60, height: 60, background: "linear-gradient(180deg, transparent, rgba(160,200,255,0.16))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 2, background: "rgba(200,225,255,0.85)", boxShadow: "0 0 18px rgba(160,200,255,0.9)" }} />
        </>
      )}

      {/* title in the sky, synced to her words */}
      <div style={{ position: "absolute", left: 128, top: 160, opacity: 1 - ei(f, [86, 98], [0, 1], theme.ease.in), transform: `translateY(${-24 * ei(f, [86, 98], [0, 1], theme.ease.in)}px)` }}>
        <MaskLine f={f} at={2}>
          <div style={{ ...mono(15, C.text), marginBottom: 18, opacity: 0.85 }}>01 — The problem</div>
        </MaskLine>
        <div style={{ display: "flex", columnGap: 26, ...display(98, 700), textShadow: "0 10px 50px rgba(0,0,0,0.45)" }}>
          <MaskLine f={f} at={W("imagine") - 2}>Imagine</MaskLine>
          <MaskLine f={f} at={W("an", 0) - 2}>an</MaskLine>
          <MaskLine f={f} at={W("engineer") - 2}>engineer</MaskLine>
        </div>
        <div style={{ display: "flex", columnGap: 26, ...display(98, 700), textShadow: "0 10px 50px rgba(0,0,0,0.45)", marginTop: 6 }}>
          <MaskLine f={f} at={W("inside", 0) - 2}>inside</MaskLine>
          <MaskLine f={f} at={W("a", 0) - 2}>a</MaskLine>
          <MaskLine f={f} at={W("refinery") - 2}>refinery.</MaskLine>
        </div>
      </div>

      {/* letterbox with camera telemetry */}
      <div style={{ position: "absolute", left: 0, right: 0, top: -BAR + BAR * bars, height: BAR, background: "#000", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 92px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: ei(f, [8, 14], [0, 1]) }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: C.bad, opacity: Math.floor(f / 12) % 2 ? 0.35 : 1 }} />
          <span style={mono(14, C.text)}>Live · cam-04 · CDU-3 site</span>
        </div>
        <span style={{ ...mono(14, C.dim), fontVariantNumeric: "tabular-nums", opacity: ei(f, [8, 14], [0, 1]) }}>{tc} · 4K 30p</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080 - BAR * bars, height: BAR, background: "#000", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 92px", boxSizing: "border-box" }}>
        <span style={{ ...mono(13, C.dim), opacity: ei(f, [10, 16], [0, 1]) }}>Alt 120 m · hdg 284° · spd 4 m/s</span>
        <span style={{ ...mono(13, C.dim), opacity: ei(f, [10, 16], [0, 1]) }}>Feed encrypted · on-prem</span>
      </div>

      {/* flash */}
      <AbsoluteFill style={{ background: "#fff", opacity: ei(f, [0, 7], [0.55, 0], theme.ease.out), mixBlendMode: "screen" }} />

      {/* sound */}
      <Sfx at={0} name="thud" vol={0.55} />
      <Sfx at={7} name="whoosh" vol={0.1} />
      <Sfx at={24} name="tick" vol={0.14} />
      <Sfx at={34} name="tick" vol={0.14} />
      <Sfx at={pingAt - 1} name="pop" vol={0.2} />
      <Sfx at={zoneAt - 1} name="tick" vol={0.18} />
      <Sfx at={88} name="whoosh" vol={0.24} />
    </AbsoluteFill>
  );
};
