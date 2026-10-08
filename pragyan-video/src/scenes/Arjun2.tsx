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
        <div>
          <Flow f={f} steps={[
            { t: "Request · reason + duration", at: 76.4, icon: "mail" },
            { t: "Admin review", at: 81.7, icon: "user" },
            { t: "Time-limited access", at: 85.1, icon: "key" },
            { t: "Expires on its own", at: 88.2, icon: "clock" },
          ]} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            <div style={stag(f, S(92.1))}><Pill icon="shield" text="Clearance never changes" tone={C.ok} /></div>
            <div style={stag(f, S(94.5))}><Pill icon="lock" text="Hidden collections stay hidden" tone={C.ok} /></div>
          </div>
        </div>
      );
    case "tools": {
      const eff = ei(f, [S(117.2), S(119.2)], [0.15, 0.55], theme.ease.inOut);
      return (
        <div>
          <Flow f={f} tone={C.accent} steps={[
            { t: "Question", at: 100.9, icon: "user" },
            { t: "Access check", at: 101.8, icon: "lock" },
            { t: "Knowledge tools", at: 103.9, icon: "route" },
            { t: "Sources", at: 111.9, icon: "file" },
            { t: "Answer", at: 114.6, icon: "check" },
          ]} />
          <div style={{ ...stag(f, S(107.4)), marginTop: 12 }}><Pill icon="user" text="Acts as the employee" tone={C.ok} /></div>
          <div style={{ ...stag(f, S(116.6)), marginTop: 12 }}>
            <div style={{ ...mono(11, C.dim), marginBottom: 8 }}>Reasoning effort</div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)" }}>
              <div style={{ width: `${eff * 100}%`, height: 6, borderRadius: 3, background: C.hero }} />
            </div>
          </div>
        </div>
      );
    }
    case "inspect": {
      const n = Math.round(ei(f, [S(129.2), S(130.8)], [0, 5], theme.ease.out));
      return (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, ...stag(f, S(129.0)) }}>
            <span style={{ ...display(80, 700), color: C.bad, fontVariantNumeric: "tabular-nums" }}>{n}</span>
            <span style={mono(13, C.text)}>failed checks</span>
          </div>
          <div style={{ ...stag(f, S(133.0)), marginBottom: 12 }}><Pill icon="file" text="Explained with page references" tone={C.ok} /></div>
          {["Problem", "Evidence", "Required action", "Approval request"].map((t, k) => {
            const on = f >= S([138.6, 140.7, 141.8, 142.6][k]);
            return (
              <div key={t} style={{ ...stag(f, S(136.3) + k * 4), display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginTop: 6, borderRadius: 10, background: on ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${on ? C.ok + "66" : "rgba(255,255,255,0.1)"}` }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: on ? C.ok : "rgba(255,255,255,0.08)" }}>{on && <Icon name="check" size={12} color="#05210F" stroke={3} />}</div>
                <span style={{ ...display(18, 600), color: on ? C.text : C.dim }}>{t}</span>
              </div>
            );
          })}
        </div>
      );
    }
    case "dev": {
      const tests = Math.round(ei(f, [S(168.8), S(171.0)], [0, 15], theme.ease.out));
      return (
        <div>
          <div style={{ ...stag(f, S(150.8)), borderRadius: 12, background: "#070A12", border: "1px solid rgba(255,255,255,0.12)", padding: "12px 14px" }}>
            <div style={{ ...mono(11, C.hero), textTransform: "none" }}>$ pragyan</div>
            <div style={{ ...mono(11, C.dim), textTransform: "none", marginTop: 6, opacity: f > S(156) ? 1 : 0 }}>› catalogue.lookup("SOP-CDU-014")</div>
            <div style={{ ...mono(11, C.ok), textTransform: "none", marginTop: 6, opacity: f > S(161) ? 1 : 0 }}>✓ Rev 4 · ±2% pop pressure</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Flow f={f} steps={[
              { t: "Read the current rule", at: 161.0, icon: "book" },
              { t: "Write the check", at: 163.9, icon: "code" },
              { t: `Run tests · ${tests} passed`, at: 168.8, icon: "check" },
            ]} />
          </div>
          <div style={{ ...stag(f, S(170.9)), marginTop: 10 }}><Pill icon="lock" text="Within the developer's permissions" tone={C.ok} /></div>
        </div>
      );
    }
    case "memory": {
      const on = 1 - ei(f, [S(199.0), S(199.4)], [0, 1]) + ei(f, [S(200.6), S(201.0)], [0, 1]);
      return (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={stag(f, S(179.2))}><Pill icon="db" text="Company knowledge" on={false} /></div>
            <div style={stag(f, S(179.6))}><Pill icon="memory" text="Personal memory — yours" tone={C.hero} /></div>
            <div style={stag(f, S(180.0))}><Pill icon="list" text="Chat history" on={false} /></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {["Role: CDU-3 engineer", "Report format", "Past context"].map((t, k) => <div key={t} style={{ ...stag(f, S(182.0) + k * 10), ...mono(11, C.text), textTransform: "none", padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.07)" }}>{t}</div>)}
          </div>
          <div style={{ ...stag(f, S(197.0)), marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 26, borderRadius: 13, background: on > 0.5 ? C.ok : "rgba(255,255,255,0.15)", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: 3 + 20 * Math.min(1, on), width: 20, height: 20, borderRadius: 10, background: "#fff" }} />
            </div>
            <span style={mono(11, C.text)}>Inspect · edit · delete · off</span>
          </div>
        </div>
      );
    }
    case "phone": {
      const ph = sp(f, b + 6, theme.spring.smooth);
      const line = (w: number, c = "rgba(255,255,255,0.35)") => <div style={{ height: 5, width: w, borderRadius: 3, background: c, marginTop: 7 }} />;
      return (
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ width: 120, height: 236, borderRadius: 22, border: "2px solid rgba(255,255,255,0.5)", background: "#0B0F1A", padding: "22px 10px", boxSizing: "border-box", flexShrink: 0, opacity: ph, transform: `translateY(${(1 - ph) * 40}px) rotate(${(1 - ph) * -8}deg)` }}>
            <div style={{ width: 36, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.3)", margin: "-12px auto 12px" }} />
            <div style={mono(9, C.hero)}>Pragyan</div>
            <div style={{ marginTop: 10, padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}>{line(70)}{line(50)}</div>
            <div style={{ marginTop: 8, marginLeft: 20, padding: 6, borderRadius: 8, background: "rgba(76,141,255,0.25)" }}>{line(60)}{line(40)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
            {[["user", "Same account", 209.4], ["file", "Files & images", 212.6], ["key", "Same permissions", 216.6], ["book", "Offline reading", 218.6]].map(([ic, t, a]) => (
              <div key={t as string} style={stag(f, S(a as number))}><Pill icon={ic as string} text={t as string} tone={C.ok} /></div>
            ))}
          </div>
        </div>
      );
    }
    case "workspace":
      return (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[["list", "Projects", 229.0], ["file", "Files", 230.6], ["sheet", "Tables", 232.4], ["code", "Code", 233.8], ["graph", "Diagrams", 234.2]].map(([ic, t, a]) => (
              <div key={t as string} style={stag(f, S(a as number))}><Pill icon={ic as string} text={t as string} /></div>
            ))}
          </div>
          <div style={{ ...stag(f, S(236.4)), marginTop: 14 }}><Pill icon="spark" text="Agents & reusable skills" tone={C.hero} /></div>
          <div style={{ ...stag(f, S(242.4)), marginTop: 8 }}><Pill icon="lock" text="No extra document access" tone={C.ok} /></div>
        </div>
      );
    case "status":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { k: "Today", v: "Configured model services", at: 262.4, tone: C.warn, icon: "cloud" },
            { k: "Deployment", v: "100% local · open-weight models", at: 269.3, tone: C.ok, icon: "server" },
            { k: "Planned monitor", v: "Zero third-party API calls", at: 276.1, tone: C.ok, icon: "shield" },
          ].map((r) => (
            <div key={r.k} style={{ ...stag(f, S(r.at)), ...glass({ borderRadius: 14 }), padding: "12px 14px", border: `1px solid ${r.tone}66` }}>
              <div style={{ ...mono(11, r.tone) }}>{r.k}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <Icon name={r.icon} size={18} color={r.tone} /><span style={display(19, 600)}>{r.v}</span>
              </div>
            </div>
          ))}
        </div>
      );
  }
  return null;
};

/* ---------- chapter stinger over Arjun's own "Next:" cards ---------- */
const Stinger: React.FC<{ f: number; a: number; b: number; ch: Ch; prev: Ch }> = ({ f, a, b, ch, prev }) => {
  const A0 = S(a), B0 = S(b);
  if (f < A0 - 2 || f > B0) return null;
  const inP = ei(f, [A0, A0 + 9], [0, 1], theme.ease.out);
  const out = ei(f, [B0 - 9, B0], [0, 1], theme.ease.in);
  const split = 10 * (1 - ei(f, [A0, A0 + 8], [0, 1]));
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out * 0.15) }}>
      <AbsoluteFill style={{ transform: `translateX(${-out * 420}px)`, filter: `blur(${out * 12 + (1 - inP) * 8}px)` }}>
        <BgField intensity={0.9} grid={false} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 48, transform: `scale(${1.08 - 0.08 * inP})` }}>
            <div style={{
              ...display(230, 800), color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.55)",
              filter: `drop-shadow(${-split}px 0 rgba(255,70,70,0.55)) drop-shadow(${split}px 0 rgba(70,170,255,0.55))`,
            }}>{ch.n}</div>
            <div>
              <MaskLine f={f} at={A0 + 2}>
                <div style={{ ...mono(15, C.dim) }}>✓ {prev.title}</div>
              </MaskLine>
              <MaskLine f={f} at={A0 + 6}>
                <div style={{ ...display(84, 750), marginTop: 10 }}>{ch.title}</div>
              </MaskLine>
              <div style={{ height: 3, width: 240 * ei(f, [A0 + 8, A0 + 26], [0, 1], theme.ease.inOut), background: C.hero, marginTop: 16 }} />
              <MaskLine f={f} at={A0 + 12}>
                <div style={{ ...mono(14, C.dim), marginTop: 16 }}>Chapter {ch.n} / 12 · Live demo</div>
              </MaskLine>
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Arjun2: React.FC = () => {
  const f = useCurrentFrame();
  const sec = f / 30;
  const enter = sp(f, 0, theme.spring.soft);
  const endA = S(END[0]);
  const sceneOut = ei(f, [S(286.8) - 4, S(286.8) + 4], [0, 1], theme.ease.in);

  const ci = CH.reduce((acc, c, i) => (sec >= c.t ? i : acc), 0);
  const ch = CH[ci];
  const cStart = S(ch.t);
  const cEnd = ci < CH.length - 1 ? S(CH[ci + 1].card![0]) : endA;
  // slow, centred commercial push per chapter; resets are hidden behind the stingers
  const z = 1 + 0.07 * ei(f, [cStart, cEnd], [0, 1], theme.ease.std);
  const sweep = ei(f, [cStart, cStart + 22], [0, 1], theme.ease.inOut);
  const ry = 2.0 * Math.sin(f / 150);
  const rx = 1.0 * Math.cos(f / 170);
  const winH = WIN.bar + VH;
  const colOut = ei(f, [cEnd - 8, cEnd], [0, 1], theme.ease.in);

  return (
    <AbsoluteFill style={{ opacity: 1 - sceneOut }}>
      <BgField intensity={1} />
      <ChapterTag f={f} at={4} num="03" title="Live demo" style={{ left: 72, top: 62 }} />

      {/* chapter progress */}
      <div style={{ position: "absolute", left: RX, top: 46, width: RW, opacity: enter }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={mono(12, C.dim)}>Chapter</span>
          <span style={{ ...mono(12, C.text), fontVariantNumeric: "tabular-nums" }}>{ch.n} / 12</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {CH.map((c, i) => {
            const fill = i < ci ? 1 : i > ci ? 0 : ei(f, [cStart, cEnd], [0, 1], theme.ease.std);
            return (
              <div key={c.n} style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
                <div style={{ width: `${fill * 100}%`, height: 4, background: i === ci ? C.hero : "rgba(255,255,255,0.85)" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* the product screen */}
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <div style={{
          position: "absolute", left: WIN.x, top: WIN.y, width: VW, height: winH, borderRadius: 16, overflow: "hidden",
          background: "#0E1220", boxShadow: "0 80px 140px -40px rgba(0,0,0,0.95)",
          transform: `translateY(${(1 - enter) * 80}px) rotateX(${(1 - enter) * 16 + rx}deg) rotateY(${ry}deg) scale(${0.94 + 0.06 * enter})`,
          opacity: enter,
        }}>
          <div style={{ height: WIN.bar, display: "flex", alignItems: "center", padding: "0 18px", gap: 9, background: "linear-gradient(180deg,#1A2033,#121726)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.9 }} />)}
            <div style={{ marginLeft: 18, flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ ...mono(13, C.dim), letterSpacing: "0.06em", textTransform: "none", padding: "5px 18px", borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="lock" size={13} color={C.dim} /> pragyan.local · on-premise
              </div>
            </div>
          </div>
          <div style={{ position: "relative", width: VW, height: VH, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, transformOrigin: "60% 45%", transform: `scale(${z})` }}>
              <OffthreadVideo src={staticFile("arjun2.mp4")} muted={!PLAY_VOICE} style={{ width: VW, height: VH, display: "block" }} />
            </div>
            {sweep > 0 && sweep < 1 && (
              <div style={{ position: "absolute", top: 0, bottom: 0, width: 360, left: lerp(-400, VW + 40, sweep), background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.12), transparent)", transform: "skewX(-14deg)" }} />
            )}
          </div>
        </div>
      </div>
      <SpeakerDecor f={f} x={WIN.x} y={WIN.y} w={VW} h={winH} r={16} appear={14} who="arjun2" envFrame={f}
        name="Arjun" role="Live demo" index="03 / 03" plate="none" />

      {/* explainer column */}
      <div key={ch.n} style={{ position: "absolute", left: RX, top: 120, width: RW, opacity: enter * (1 - colOut), transform: `translateY(${-14 * colOut}px)` }}>
        <MaskLine f={f} at={cStart + 2}>
          <span style={{ ...display(92, 800), color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.6)" }}>{ch.n}</span>
        </MaskLine>
        <MaskLine f={f} at={cStart + 6}>
          <div style={{ ...display(38, 700), marginTop: 4 }}>{ch.title}</div>
        </MaskLine>
        <div style={{ fontFamily: theme.fonts.body, fontSize: 18, lineHeight: 1.4, color: C.dim, marginTop: 10, ...stag(f, cStart + 10) }}>{ch.sub}</div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "20px 0 18px", width: RW * ei(f, [cStart + 8, cStart + 24], [0, 1]) }} />
        <Graphic g={ch.g} f={f} t0={ch.t} />
      </div>

      {/* presenter plate */}
      <div style={{
        position: "absolute", left: WIN.x, top: 996, height: 58, padding: "0 18px", borderRadius: 14, display: "flex", alignItems: "center", gap: 16,
        background: "rgba(6,9,16,0.62)", border: "1px solid rgba(255,255,255,0.14)", opacity: enter,
      }}>
        <span style={display(24, 650)}>Arjun</span>
        <span style={mono(11, C.dim)}>Live demo · Team Data_Jarvis GGV</span>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.14)" }} />
        <VoiceMeter who="arjun2" i={f} h={22} bars={18} />
      </div>

      {/* cinematic chapter stingers replace the plain "Next:" cards */}
      {CH.map((c, i) => (c.card && i > 0 ? <Stinger key={c.n} f={f} a={c.card[0]} b={c.card[1]} ch={c} prev={CH[i - 1]} /> : null))}

      {/* payoff over the closing card */}
      {f >= endA - 2 && (() => {
        const p = ei(f, [endA, endA + 10], [0, 1], theme.ease.out);
        return (
          <AbsoluteFill style={{ opacity: p }}>
            <BgField intensity={1.1} grid={false} />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div>
                <MaskLine f={f} at={endA + 2}><div style={{ ...display(40, 600), color: C.dim }}>100% local. Open-weight models.</div></MaskLine>
                <MaskLine f={f} at={endA + 10}>
                  <div style={{ ...display(104, 750), marginTop: 10 }}>Zero <span style={{ color: C.hero }}>third-party</span> API calls.</div>
                </MaskLine>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 28, ...stag(f, endA + 22) }}>
                  <Img src={staticFile("logo_dark.png")} style={{ width: 64 }} />
                  <span style={mono(14, C.dim)}>Pragyan · sovereign by design</span>
                </div>
              </div>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })()}

      {SFX.map((s, k) => <Sfx key={k} at={S(s.t)} name={s.name} vol={s.vol} />)}
    </AbsoluteFill>
  );
};
