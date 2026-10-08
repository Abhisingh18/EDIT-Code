import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp } from "../lib";
import { BgField, ChapterTag, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Icon } from "../components/Icon";
import { SpeakerDecor, VoiceMeter } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";
import chData from "../data/arjun2_chapters.json";
import sfxData from "../data/arjun2_sfx.json";

const C = theme.colors;
const S = (sec: number) => Math.round(sec * 30);

type Ch = { n: string; t: number; card: [number, number] | null; title: string; sub: string; g: string };
const CH = (chData as unknown as { chapters: Ch[] }).chapters;
const END = (chData as unknown as { endCard: [number, number] }).endCard;
const SFX = sfxData as { t: number; name: string; vol: number }[];

// the product screen
const WIN = { x: 70, y: 150, bar: 40 };
const VW = 1380;
const VH = 781;
const RX = 1500;
const RW = 360;

/* ---------- small building blocks ---------- */
const stag = (f: number, a: number): React.CSSProperties => {
  const p = sp(f, a, theme.spring.snappy);
  return { opacity: p, transform: `translateY(${(1 - p) * 16}px)` };
};
const Pill: React.FC<{ icon?: string; text: string; tone?: string; on?: boolean; style?: React.CSSProperties }> = ({ icon, text, tone = C.text, on = true, style }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", borderRadius: 12,
    background: on ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${on && tone !== C.text ? tone + "77" : "rgba(255,255,255,0.12)"}`, opacity: on ? 1 : 0.45, ...style,
  }}>
    {icon && <Icon name={icon} size={17} color={tone} />}
    <span style={{ ...mono(12.5, tone), letterSpacing: "0.07em", textTransform: "none" }}>{text}</span>
  </div>
);
const Flow: React.FC<{ f: number; steps: { t: string; at: number; icon?: string }[]; tone?: string }> = ({ f, steps, tone = C.hero }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
    {steps.map((s, k) => {
      const on = f >= S(s.at);
      return (
        <div key={s.t} style={stag(f, S(s.at) - 4)}>
          {k > 0 && <div style={{ width: 2, height: 14, marginLeft: 22, background: on ? tone : "rgba(255,255,255,0.15)" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: on ? `${tone}18` : "rgba(255,255,255,0.04)", border: `1px solid ${on ? tone + "88" : "rgba(255,255,255,0.1)"}` }}>
            <Icon name={s.icon ?? "arrow"} size={18} color={on ? tone : C.dim} />
            <span style={{ ...display(20, 600), color: on ? C.text : C.dim }}>{s.t}</span>
          </div>
        </div>
      );
    })}
  </div>
);

/* ---------- one mini graphic per chapter (timed to Arjun's words, seconds) ---------- */
const Graphic: React.FC<{ g: string; f: number; t0: number }> = ({ g, f, t0 }) => {
  const b = S(t0);
  switch (g) {
    case "platform":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["monitor", "Web app", 2.4], ["phone", "Phone app", 3.4], ["code", "Terminal assistant", 4.6], ["code", "IDE agent", 5.6]].map(([ic, t, a]) => (
            <div key={t as string} style={stag(f, S(a as number))}><Pill icon={ic as string} text={t as string} /></div>
          ))}
          <div style={{ ...stag(f, S(7.6)), display: "flex", alignItems: "center", gap: 12, marginTop: 8, padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${C.hero}`, boxShadow: `0 0 30px ${C.glow}`, background: "rgba(255,122,26,0.08)" }}>
            <Icon name="server" size={22} color={C.hero} /><span style={display(22, 650)}>Pragyan server</span>
          </div>
          <div style={stag(f, S(8.6))}><Pill icon="shield" text="Admin panel · knowledge & access" tone={C.accent} /></div>
        </div>
      );
    case "catalogue": {
      const lv = [["Public", C.dim], ["Internal", C.accent], ["Confidential", C.warn], ["Restricted", C.bad]];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={stag(f, S(18.2))}><Pill icon="db" text="Collections" /></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {lv.map(([t, c], k) => (
              <div key={t} style={{ ...stag(f, S(19.6) + k * 4), ...mono(11, c), padding: "6px 9px", borderRadius: 8, border: `1.5px solid ${c}` }}>{t}</div>
            ))}
          </div>
          <div style={stag(f, S(21.6))}><Pill icon="scan" text="Scanned pages read" tone={C.ok} /></div>
          <div style={stag(f, S(24.4))}><Pill icon="file" text="Searchable · page references" tone={C.ok} /></div>
          <div style={stag(f, S(26.5))}><Pill icon="alert" text="Rev 3 superseded → Rev 4 linked" tone={C.warn} /></div>
        </div>
      );
    }
    case "graph": {
      const N = [
        { x: 60, y: 60, t: "PSV-2034", k: "eq", a: 34.4 }, { x: 250, y: 40, t: "SOP-CDU-014", k: "doc", a: 36.8 },
        { x: 160, y: 160, t: "INS-2026-118", k: "doc", a: 35.6 }, { x: 40, y: 240, t: "PSV-2035", k: "eq", a: 37.7 },
        { x: 270, y: 220, t: "V-201", k: "eq", a: 38.4 },
      ];
      const E = [[0, 1], [0, 2], [2, 1], [0, 3], [0, 4], [4, 1], [3, 2]];
      return (
        <div style={{ position: "relative", width: RW, height: 330 }}>
          <svg width={RW} height={290} style={{ position: "absolute", inset: 0 }}>
            {E.map(([a2, b2], k) => {
              const p = ei(f, [S(37.7) + k * 5, S(37.7) + 16 + k * 5], [0, 1], theme.ease.inOut);
              return <line key={k} x1={N[a2].x} y1={N[a2].y} x2={lerp(N[a2].x, N[b2].x, p)} y2={lerp(N[a2].y, N[b2].y, p)} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />;
            })}
          </svg>
          {N.map((nd, k) => {
            const p = sp(f, S(nd.a), theme.spring.snappy);
            const col = nd.k === "eq" ? C.accent : C.warn;
            const pulse = k === 0 && f > S(37.7) ? 1 + 0.25 * Math.abs(Math.sin(f / 9)) : 1;
            return (
              <div key={k} style={{ position: "absolute", left: nd.x - 9, top: nd.y - 9, opacity: p, transform: `scale(${p})` }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: col, boxShadow: `0 0 ${14 * pulse}px ${col}`, transform: `scale(${pulse})` }} />
                <div style={{ ...mono(11, C.text), letterSpacing: "0.06em", textTransform: "none", position: "absolute", left: 24, top: 1, whiteSpace: "nowrap" }}>{nd.t}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, top: 286, display: "flex", gap: 16 }}>
            <span style={mono(11, C.accent)}>● equipment</span><span style={mono(11, C.warn)}>● documents</span>
          </div>
          <div style={{ position: "absolute", left: 0, top: 310, ...stag(f, S(45.3)) }}><span style={mono(11, C.dim)}>company knowledge — not personal memory</span></div>
        </div>
      );
    }
    case "access":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={stag(f, S(52.6))}><Pill icon="db" text="Collection permission" tone={C.accent} /></div>
          <div style={{ ...stag(f, S(54.4)), ...mono(13, C.hero), paddingLeft: 14 }}>AND</div>
          <div style={stag(f, S(55.0))}><Pill icon="key" text="Document clearance" tone={C.accent} /></div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {["Viewer", "Editor", "Owner"].map((r, k) => <div key={r} style={{ ...stag(f, S(61.5) + k * 8), ...mono(11, C.text), padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.07)" }}>{r}</div>)}
          </div>
          <div style={{ ...stag(f, S(65.3)), marginTop: 6 }}><Pill icon="check" text="Engineer · gets the report" tone={C.ok} /></div>
          <div style={stag(f, S(67.7))}><Pill icon="lock" text="IT employee · same question, no access" tone={C.bad} /></div>
        </div>
      );
    case "requests":
      return (
