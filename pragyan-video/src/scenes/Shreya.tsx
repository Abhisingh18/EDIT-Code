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

      {/* B3 — intelligence alone isn't enough: grounded in your knowledge */}
      <Beat f={f} from={718} to={1036}>
        <Header f={f} at={722} text="Knowledge grounding" />
        {(() => {
          const hlOut = ei(f, [W("connects") - 10, W("connects") + 4], [0, 1], theme.ease.in);
          const coreP = sp(f, W("connects") - 2);
          const link = ei(f, [W("connects"), W("connects") + 20], [0, 1], theme.ease.inOut);
          const dbP = sp(f, W("knowledge", 0) - 6, theme.spring.bouncy);
          const docs = [
            { t: "Manuals", icon: "book", at: W("manuals"), cy: 320 },
            { t: "SOPs", icon: "list", at: W("sops"), cy: 452 },
            { t: "Internal documents", icon: "file", at: W("internal", 0), cy: 584 },
            { t: "Procedures", icon: "sheet", at: W("procedures"), cy: 716 },
          ];
          return (
            <>
              {hlOut < 1 && (
                <div style={{ position: "absolute", left: 790, top: 400, width: 1040, opacity: 1 - hlOut, transform: `translateY(${-40 * hlOut}px)` }}>
                  <MaskLine f={f} at={W("intelligence")}>
                    <div style={display(84, 650)}>Intelligence alone</div>
                  </MaskLine>
                  <MaskLine f={f} at={W("enough") - 8}>
                    <div style={{ ...display(84, 700), color: C.hero }}>isn't enough.</div>
                  </MaskLine>
                </div>
              )}
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <line x1={1010} y1={545} x2={lerp(1010, 1155, link)} y2={545} stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
                {docs.map((d, i) => {
                  const p = ei(f, [d.at, d.at + 14], [0, 1], theme.ease.inOut);
                  return (
                    <path key={i} d={`M1480,${d.cy} C1410,${d.cy} 1410,545 1345,545`} pathLength={1} strokeDasharray={1}
                      strokeDashoffset={1 - p} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                  );
                })}
              </svg>
              {f >= W("connects") - 4 && <Logo x={930} y={545} w={150} o={coreP} />}
              <div
                style={{
                  position: "absolute", left: 1250 - 95, top: 545 - 95, width: 190, height: 190, borderRadius: 95, ...glass({ borderRadius: 95 }),
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: dbP, transform: `scale(${0.6 + 0.4 * dbP})`,
                }}
              >
                <Icon name="db" size={78} color={C.text} stroke={1.4} />
              </div>
              <div style={{ position: "absolute", left: 1250 - 160, width: 320, top: 660, textAlign: "center", opacity: dbP }}>
                <div style={mono(15, C.text)}>Knowledge base</div>
                <div style={{ ...mono(12, C.faint), marginTop: 8, letterSpacing: "0.1em" }}>your organisation's own</div>
              </div>
              {docs.map((d, i) => {
                const p = sp(f, d.at - 3, theme.spring.snappy);
                const flowT = f - d.at - 14;
                return (
                  <React.Fragment key={d.t}>
                    <div
                      style={{
                        position: "absolute", left: 1480, top: d.cy - 50, width: 330, height: 100, ...glass({ borderRadius: 18 }),
                        display: "flex", alignItems: "center", gap: 18, padding: "0 24px", boxSizing: "border-box",
                        opacity: p, transform: `translateX(${(1 - p) * 80}px)`,
                      }}
                    >
                      <Icon name={d.icon} size={32} color={C.text} stroke={1.5} />
                      <span style={display(28, 600)}>{d.t}</span>
                    </div>
                    {flowT > 0 &&
                      [0, 1, 2].map((k) => {
                        const t = ((flowT + k * 9) % 27) / 27;
                        return (
                          <div key={k} style={{
                            position: "absolute", left: bez(1480, 1410, 1410, 1345, t) - 4, top: bez(d.cy, d.cy, 545, 545, t) - 4,
                            width: 8, height: 8, borderRadius: 4, background: C.text, opacity: 0.8 * Math.sin(Math.PI * t),
                          }} />
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </>
          );
        })()}
      </Beat>

      {/* B4 — not the open internet: the approved knowledge space */}
      <Beat f={f} from={1036} to={1252}>
        <Header f={f} at={1040} text="Approved knowledge only" />
        {(() => {
          const webP = sp(f, W("instead") - 4);
          const kill = ei(f, [W("internet"), W("internet") + 10], [0, 1], theme.ease.out);
          const coreP = sp(f, W("progan", 3) - 4);
          const beam = ei(f, [W("progan", 3) + 4, W("approved")], [0, 1], theme.ease.inOut);
          const okP = sp(f, W("approved") - 4);
          return (
            <>
              <div
                style={{
                  position: "absolute", left: 830, top: 290, width: 380, height: 440, ...glass(), display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 18, opacity: webP * (1 - kill * 0.55),
                  transform: `translateY(${(1 - webP) * 40}px)`, filter: `grayscale(${kill})`,
                }}
              >
                <Icon name="globe" size={96} color={C.text} stroke={1.2} />
                <div style={display(36, 650)}>Open internet</div>
                <div style={{ ...mono(12, C.faint), letterSpacing: "0.1em" }}>unverified · uncontrolled</div>
              </div>
              {kill > 0 && (
                <>
                  <div style={{ position: "absolute", left: 830, top: 506, width: 380 * kill, height: 4, background: C.bad, transform: "rotate(-28deg)", transformOrigin: "0 50%", boxShadow: `0 0 18px ${C.bad}` }} />
                  <div style={{ position: "absolute", left: 830, width: 380, top: 752, textAlign: "center", ...mono(15, C.bad), opacity: kill }}>
                    Not searched
                  </div>
                </>
              )}
              {f >= W("progan", 3) - 6 && <Logo x={1305} y={510} w={140} o={coreP} />}
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <line x1={1385} y1={510} x2={lerp(1385, 1430, beam)} y2={510} stroke={C.ok} strokeWidth={2.5} strokeOpacity={0.9} />
              </svg>
              <div
                style={{
                  position: "absolute", left: 1430, top: 290, width: 390, height: 440, ...glass(), border: `1.5px solid ${C.ok}88`,
                  boxShadow: `0 0 50px rgba(52,211,153,0.16), 0 34px 80px -26px rgba(0,0,0,0.8)`,
                  display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 54, boxSizing: "border-box", gap: 16,
                  opacity: okP, transform: `translateY(${(1 - okP) * 40}px)`,
                }}
              >
                <Icon name="shield" size={88} color={C.ok} stroke={1.3} />
                <div style={{ ...display(32, 650), textAlign: "center" }}>Approved knowledge</div>
                <div style={{ ...mono(12, C.faint), letterSpacing: "0.1em" }}>access-checked · cited</div>
              </div>
              <div style={{ position: "absolute", left: 1430, width: 390, top: 590, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Chip f={f} at={W("permissions")} icon="lock" label="Security permissions" size={14} />
                <Chip f={f} at={W("clearances")} icon="key" label="Clearance levels" size={14} />
              </div>
            </>
          );
        })()}
      </Beat>

      {/* B5 — role-based access */}
      <Beat f={f} from={1252} to={1470}>
        <Header f={f} at={1256} text="Role-based access" />
        {(() => {
          const panelP = sp(f, W("helps") - 4);
          const LV = [
            { t: "Public", c: C.dim },
            { t: "Internal", c: C.accent },
            { t: "Confidential", c: C.warn },
            { t: "Restricted", c: C.bad },
          ];
          const ROLES = [
            { t: "Engineer", ok: [1, 1, 0, 0] },
            { t: "Manager", ok: [1, 1, 1, 0] },
            { t: "Admin", ok: [1, 1, 1, 1] },
          ];
          const base = W("role");
          return (
            <>
              <div
                style={{
                  position: "absolute", left: 790, top: 230, width: 1030, height: 500, ...glass(), opacity: panelP,
                  transform: `translateY(${(1 - panelP) * 40}px)`, padding: "34px 40px", boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", marginLeft: 230 }}>
                  {LV.map((l) => (
                    <div key={l.t} style={{ width: 190, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 5, background: l.c }} />
                      <span style={mono(13, C.text)}>{l.t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "22px 0 8px" }} />
                {ROLES.map((r, ri) => (
                  <div key={r.t} style={{ display: "flex", alignItems: "center", height: 118, borderBottom: ri < 2 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
                    <div style={{ width: 230, display: "flex", alignItems: "center", gap: 16 }}>
                      <Icon name="user" size={28} color={C.dim} />
                      <span style={display(30, 600)}>{r.t}</span>
                    </div>
                    {r.ok.map((ok, ci) => {
                      const p = sp(f, base + ri * 7 + ci * 3, theme.spring.snappy);
                      return (
                        <div key={ci} style={{ width: 190 }}>
                          <div
                            style={{
                              width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                              background: ok ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${ok ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.1)"}`,
                              opacity: p, transform: `scale(${0.6 + 0.4 * p})`,
                            }}
                          >
                            <Icon name={ok ? "check" : "lock"} size={26} color={ok ? C.ok : C.faint} stroke={2} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 794, top: 760 }}>
                <MaskLine f={f} at={W("inside", 1)}>
                  <span style={mono(16, C.dim)}>Same question · different clearance · different answer</span>
                </MaskLine>
              </div>
              <Chip f={f} at={W("avoiding")} icon="check" label="No internal data fragmentation" tone="ok" style={{ position: "absolute", left: 790, top: 820 }} />
            </>
          );
        })()}
      </Beat>

      {/* sound */}
      <Sfx at={172} name="whoosh" vol={0.18} />
      <Sfx at={W("inside", 0) - 10} name="whoosh" vol={0.1} />
      <Sfx at={W("security", 0) - 1} name="tick" vol={0.2} />
      <Sfx at={W("boundary") + 3} name="pop" vol={0.14} />
      <Sfx at={304} name="whoosh" vol={0.14} />
      <Sfx at={W("one") - 5} name="pop" vol={0.15} />
      {[0, 1, 2].map((i) => (
        <Sfx key={`m${i}`} at={W("multiple") + i * 6 - 1} name="tick" vol={0.16} />
      ))}
      <Sfx at={W("router") - 5} name="pop" vol={0.2} />
      {EV.map((e, i) => (
        <React.Fragment key={`e${i}`}>
          <Sfx at={e} name="whoosh" vol={0.08} />
          <Sfx at={arrive(i) - 1} name="tick" vol={0.22} />
        </React.Fragment>
      ))}
      <Sfx at={W("no") - 1} name="tick" vol={0.2} />
      <Sfx at={716} name="whoosh" vol={0.14} />
      <Sfx at={W("connects") - 2} name="tick" vol={0.18} />
      <Sfx at={W("knowledge", 0) - 7} name="pop" vol={0.16} />
      {["manuals", "sops", "procedures"].map((w) => (
        <Sfx key={w} at={W(w) - 4} name="tick" vol={0.16} />
      ))}
      <Sfx at={W("internal", 0) - 4} name="tick" vol={0.16} />
      <Sfx at={1034} name="whoosh" vol={0.14} />
      <Sfx at={W("internet") - 1} name="thud" vol={0.32} />
      <Sfx at={W("approved") - 5} name="pop" vol={0.18} />
      <Sfx at={W("permissions") - 1} name="tick" vol={0.18} />
      <Sfx at={W("clearances") - 1} name="tick" vol={0.18} />
      <Sfx at={1250} name="whoosh" vol={0.14} />
      <Sfx at={W("role") - 1} name="tick" vol={0.18} />
      <Sfx at={W("role") + 14} name="tick" vol={0.14} />
      <Sfx at={W("avoiding") - 4} name="pop" vol={0.16} />
      <Sfx at={1464} name="whoosh" vol={0.26} />
    </AbsoluteFill>
  );
};
