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
);

const bez = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

/* ---------- beat 2 data ---------- */
const MODELS = [
  { icon: "eye", name: "Vision", model: "Qwen3-VL-32B", cy: 335 },
  { icon: "code", name: "Code", model: "Qwen2.5-Coder-32B", cy: 545 },
  { icon: "bulb", name: "Reasoning", model: "DeepSeek-R1-32B", cy: 755 },
];
const ROUTER = { x: 1210, y: 545 };

export const Shreya: React.FC = () => {
  const f = useCurrentFrame();
  const cardP = sp(f, 176, theme.spring.smooth);
  const out = ei(f, [1468, 1482], [0, 1], theme.ease.in);

  // routing events (vision, code, reasoning)
  const EV = [W("vision", 0), W("code"), W("reasoning", 0)];
  const arrive = (i: number) => EV[i] + 30;
  const active = EV.reduce((acc, _, i) => (f >= arrive(i) ? i : acc), -1);

  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.03})` }}>
      <BgField intensity={1} />

      {/* her card */}
      <div
        style={{
          position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 28, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 60px 120px -30px rgba(0,0,0,0.9)",
          opacity: cardP, transform: `translateX(${(1 - cardP) * -90}px) scale(${0.95 + 0.05 * cardP})`,
        }}
      >
        <OffthreadVideo src={staticFile("shreya.mp4")} muted={!PLAY_VOICE} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 22%, transparent 62%, rgba(2,4,9,0.85))" }} />
      </div>
      <SpeakerDecor
        f={f} x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={28} appear={204} who="shreya" envFrame={f}
        name="Shreya" role="The solution" index="02 / 03" plate="top"
      />
      <div style={{ position: "absolute", left: 0, top: 0, opacity: cardP }}>
        <Captions f={f} pages={CAPS} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h - 142} maxWidth={560} size={34} />
      </div>

      <ChapterTag f={f} at={196} num="02" title="The solution" style={{ left: 792, top: 66 }} />

      {/* B1 — sovereign: everything inside your boundary */}
      <Beat f={f} from={198} to={306}>
        <Header f={f} at={204} text="Sovereign by design" />
        {(() => {
          const reveal = ei(f, [W("inside", 0) - 12, W("inside", 0) + 30], [0, 1], theme.ease.inOut);
          return (
            <div
              style={{
                position: "absolute", left: 830, top: 220, width: 970, height: 650, borderRadius: 36,
                border: "2px dashed rgba(255,255,255,0.3)", clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
              }}
            />
          );
        })()}
        <Logo x={CORE.x} y={CORE.y} w={CORE.w * (1 + Math.sin(f / 24) * 0.008)} />
        {["Your data", "Your models", "Your tools"].map((t, i) => {
          const a = (i / 3) * Math.PI * 2 + f * 0.007 - 0.6;
          const p = sp(f, W("productivity") + i * 5, theme.spring.snappy);
          return (
            <div
              key={t}
              style={{
                position: "absolute", left: CORE.x + Math.cos(a) * 340 - 90, top: CORE.y + Math.sin(a) * 210 - 22,
                width: 180, textAlign: "center", opacity: p, transform: `scale(${0.85 + 0.15 * p})`,
              }}
            >
              <span style={{ ...mono(15, C.text), padding: "10px 16px", borderRadius: 999, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)" }}>
                {t}
              </span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 830, width: 970, top: 798, display: "flex", justifyContent: "center" }}>
          <Chip f={f} at={W("security", 0)} icon="lock" label="Your security boundary" />
        </div>
        <Chip f={f} at={W("boundary") + 4} icon="shield" label="Zero external API calls" tone="ok" style={{ position: "absolute", left: 1450, top: 140 }} />
      </Beat>

      {/* B2 — one server, open-weight models, smart router */}
      <Beat f={f} from={306} to={718}>
        <Header f={f} at={310} text="Smart model routing" />
        {(() => {
          const srvP = sp(f, W("one") - 4);
          const rtP = sp(f, W("router") - 4, theme.spring.bouncy);
          const wire = ei(f, [W("router"), W("router") + 16], [0, 1], theme.ease.inOut);
          const fan = ei(f, [W("router") + 6, W("router") + 28], [0, 1], theme.ease.inOut);
          return (
            <>
              {/* wires */}
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <line x1={1040} y1={545} x2={lerp(1040, ROUTER.x - 74, wire)} y2={545} stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
                {MODELS.map((m, i) => (
                  <path
                    key={i}
                    d={`M${ROUTER.x + 74},545 C1352,545 1352,${m.cy} 1420,${m.cy}`}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - fan}
                    fill="none"
                    stroke={active === i ? C.hero : "rgba(255,255,255,0.3)"}
                    strokeWidth={active === i ? 3 : 2}
                  />
                ))}
              </svg>
              {/* server */}
              <div
                style={{
                  position: "absolute", left: 830, top: 470, width: 210, height: 150, ...glass(), display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 10, opacity: srvP, transform: `translateY(${(1 - srvP) * 40}px)`,
                }}
              >
                <Icon name="server" size={46} color={C.text} stroke={1.5} />
                <div style={mono(15, C.text)}>One server</div>
                <div style={{ ...mono(11, C.faint), letterSpacing: "0.1em" }}>on-prem GPU</div>
              </div>
              {/* router */}
              <div
                style={{
                  position: "absolute", left: ROUTER.x - 74, top: ROUTER.y - 74, width: 148, height: 148, borderRadius: 74,
                  ...glass({ borderRadius: 74 }), border: `1.5px solid ${C.hero}`,
                  boxShadow: `0 0 50px ${C.glow}, 0 0 110px rgba(255,122,26,0.18), inset 0 1px 0 rgba(255,255,255,0.1)`,
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: rtP, transform: `scale(${rtP})`,
                }}
              >
                <Icon name="route" size={58} color={C.hero} stroke={1.6} />
              </div>
              <div style={{ position: "absolute", left: ROUTER.x - 100, width: 200, top: 640, textAlign: "center", opacity: rtP }}>
                <span style={mono(15, C.text)}>Smart router</span>
              </div>
              {/* models */}
              <div style={{ position: "absolute", left: 1420, top: 222 }}>
                <MaskLine f={f} at={W("open", 0)}>
                  <span style={mono(14, C.dim)}>Open-weight models</span>
                </MaskLine>
              </div>
              {MODELS.map((m, i) => {
                const p = sp(f, W("multiple") + i * 6);
                const on = active === i;
                const dimmed = active >= 0 && !on;
                return (
                  <div
                    key={m.name}
                    style={{
                      position: "absolute", left: 1420, top: m.cy - 65, width: 400, height: 130, ...glass(),
                      border: `1px solid ${on ? C.hero : "rgba(255,255,255,0.11)"}`,
                      boxShadow: on ? `0 0 46px rgba(255,122,26,0.28), 0 34px 80px -26px rgba(0,0,0,0.8)` : glass().boxShadow,
                      display: "flex", alignItems: "center", gap: 22, padding: "0 28px", boxSizing: "border-box",
                      opacity: p * (dimmed ? 0.5 : 1), transform: `translateX(${(1 - p) * 60}px) scale(${on ? 1.03 : 1})`,
                    }}
                  >
                    <div style={{ width: 66, height: 66, borderRadius: 33, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={m.icon} size={34} color={on ? C.hero : C.text} stroke={1.6} />
                    </div>
                    <div>
                      <div style={display(32, 650)}>{m.name}</div>
                      <div style={{ ...mono(13, C.dim), letterSpacing: "0.06em", textTransform: "none", marginTop: 6 }}>{m.model}</div>
                    </div>
                  </div>
                );
              })}
              {/* task tokens travelling server -> router -> model */}
              {[
                { label: "Scanned drawing", icon: "eye" },
                { label: "Python check", icon: "code" },
                { label: "Root-cause analysis", icon: "bulb" },
              ].map((tk, i) => {
                const t0 = EV[i];
                if (f < t0 - 2 || f > arrive(i) + 4) return null;
                const appear = sp(f, t0, theme.spring.snappy);
                const toRouter = ei(f, [t0 + 4, t0 + 18], [0, 1], theme.ease.inOut);
                const alongP = ei(f, [t0 + 16, arrive(i)], [0, 1], theme.ease.inOut);
                const m = MODELS[i];
                const tx = lerp(935, ROUTER.x, toRouter), ty = lerp(400, ROUTER.y, toRouter);
                const px = bez(ROUTER.x + 74, 1352, 1352, 1420, alongP);
                const py = bez(545, 545, m.cy, m.cy, alongP);
                return (
                  <React.Fragment key={i}>
                    {toRouter < 1 && (
                      <div
                        style={{
                          position: "absolute", left: tx, top: ty, transform: `translate(-50%,-50%) scale(${appear * (1 - toRouter * 0.85)})`,
                          opacity: appear * (1 - toRouter * 0.6), display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                          borderRadius: 999, background: "rgba(10,14,26,0.9)", border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap",
                        }}
                      >
                        <Icon name={tk.icon} size={20} color={C.text} />
                        <span style={mono(14, C.text)}>{tk.label}</span>
                      </div>
                    )}
                    {alongP > 0 && alongP < 1 && (
                      <div style={{ position: "absolute", left: px - 8, top: py - 8, width: 16, height: 16, borderRadius: 8, background: C.hero, boxShadow: `0 0 22px ${C.hero}` }} />
                    )}
                  </React.Fragment>
                );
              })}
              <div style={{ position: "absolute", left: 830, width: 760, top: 790, display: "flex", justifyContent: "center" }}>
                <Chip f={f} at={W("no")} icon="check" label="Auto-routed · no manual steps" tone="ok" />
              </div>
            </>
          );
        })()}
      </Beat>

