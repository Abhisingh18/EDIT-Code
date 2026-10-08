import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp, rnd } from "../lib";
import { at } from "../captions";
import { BgField, ChapterTag, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Icon } from "../components/Icon";
import { SpeakerDecor, VoiceMeter } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";

const C = theme.colors;
const A = (w: string, n = 0) => at("arjun", w, n);
const S = (sec: number) => Math.round(sec * 30);

// the product screen
const WIN = { x: 70, y: 150, bar: 40 };
const VW = 1380;
const VH = 781;
const K = VW / 1696; // arjun.mp4 is 1696x960
const RX = 1500; // right column
const RW = 360;

/* ---------- virtual camera: cinematic punch-ins on the UI that matters (video px, seconds) ---------- */
type Shot = { a: number; b: number; cx: number; cy: number; z: number; tin?: number };
const SHOTS: Shot[] = [
  { a: 0.5, b: 3.2, cx: 1085, cy: 250, z: 1.28 }, // the prompt
  { a: 6.5, b: 8.7, cx: 1290, cy: 190, z: 1.22 }, // failed checks
  { a: 9.2, b: 11.3, cx: 560, cy: 460, z: 1.3 }, // sources
  { a: 12.1, b: 13.8, cx: 1110, cy: 300, z: 1.18 }, // superseded revision
  { a: 17.6, b: 19.9, cx: 1085, cy: 430, z: 1.16 }, // the draft
  { a: 20.3, b: 24.9, cx: 850, cy: 330, z: 1.2, tin: 3.0 }, // graph, slow push
  { a: 25.4, b: 28.8, cx: 490, cy: 330, z: 1.32 }, // router decisions
  { a: 30.2, b: 31.9, cx: 330, cy: 360, z: 1.2 }, // saved preferences
  { a: 32.4, b: 34.8, cx: 850, cy: 440, z: 1.2 }, // memory editor
  { a: 35.6, b: 40.1, cx: 840, cy: 230, z: 1.14 }, // coding prompt
  { a: 40.5, b: 43.1, cx: 620, cy: 487, z: 1.28 }, // restricted answer
  { a: 45.7, b: 47.4, cx: 1034, cy: 380, z: 1.18 }, // access level column
  { a: 47.5, b: 48.95, cx: 850, cy: 360, z: 1.2 }, // time-limited access grant
  { a: 49.2, b: 50.9, cx: 1300, cy: 520, z: 1.22 }, // audit log
];
const camAt = (sec: number) => {
  let z = 1, cx = 848, cy = 480;
  for (const s of SHOTS) {
    const p = ei(sec, [s.a, s.a + (s.tin ?? 0.55)], [0, 1], theme.ease.inOut) * (1 - ei(sec, [s.b - 0.45, s.b], [0, 1], theme.ease.inOut));
    if (p > 0) { z = 1 + (s.z - 1) * p; cx = lerp(848, s.cx, p); cy = lerp(480, s.cy, p); }
  }
  const Cx = Math.min(Math.max(cx * K, VW / (2 * z)), VW - VW / (2 * z));
  const Cy = Math.min(Math.max(cy * K, VH / (2 * z)), VH - VH / (2 * z));
  return { z, Cx, Cy };
};
type Cam = ReturnType<typeof camAt>;
const toScreen = (vx: number, vy: number, c: Cam) => ({
  x: VW / 2 + (vx * K - c.Cx) * c.z, // relative to the video viewport
  y: VH / 2 + (vy * K - c.Cy) * c.z,
});

/* ---------- annotations pinned to UI (video px) ---------- */
type HL = { a: number; b: number; r: [number, number, number, number]; label: string; tone: string };
const HLS: HL[] = [
  { a: 9.45, b: 11.2, r: [48, 392, 1012, 502], label: "Cited to the page", tone: C.ok },
  { a: 12.35, b: 13.7, r: [568, 238, 1656, 294], label: "Newer revision detected", tone: C.warn },
  { a: 17.85, b: 19.8, r: [512, 298, 1658, 602], label: "Your four-part format", tone: C.accent },
  { a: 25.5, b: 26.5, r: [134, 280, 846, 350], label: "Report → document model", tone: C.accent },
  { a: 26.6, b: 28.7, r: [148, 298, 822, 366], label: "Code → coding model", tone: C.accent },
  { a: 30.35, b: 31.9, r: [112, 52, 532, 658], label: "Saved preferences", tone: "#FFFFFF" },
  { a: 32.45, b: 34.6, r: [456, 283, 1242, 612], label: "You decide what it keeps", tone: C.ok },
  { a: 40.65, b: 43.0, r: [56, 443, 1187, 532], label: "Outside this user's clearance", tone: C.bad },
  { a: 43.75, b: 45.4, r: [558, 183, 1592, 242], label: "Operations engineer · answered", tone: C.ok },
  { a: 43.95, b: 45.4, r: [668, 528, 1497, 600], label: "Restricted employee · hidden", tone: C.bad },
  { a: 45.85, b: 47.4, r: [938, 98, 1130, 667], label: "Access level per document", tone: C.accent },
];

const Highlight: React.FC<{ h: HL; sec: number; f: number; c: Cam }> = ({ h, sec, f, c }) => {
  if (sec < h.a || sec > h.b) return null;
  const a = S(h.a);
  const draw = ei(f, [a, a + 12], [0, 1], theme.ease.out);
  const o = 1 - ei(sec, [h.b - 0.25, h.b], [0, 1]);
  const p0 = toScreen(h.r[0], h.r[1], c), p1 = toScreen(h.r[2], h.r[3], c);
  const w = p1.x - p0.x, hh = p1.y - p0.y;
  const labelAbove = p0.y > 46;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={VW} height={VH} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={p0.x} y={p0.y} width={w} height={hh} rx={10} fill={`${h.tone}10`} stroke={h.tone} strokeWidth={2.5}
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
      <div style={{
        position: "absolute", left: Math.max(8, Math.min(p0.x, VW - 360)), top: labelAbove ? p0.y - 40 : p1.y + 8,
        padding: "7px 12px", borderRadius: 8, background: h.tone === "#FFFFFF" ? "#0B0F1A" : h.tone,
        border: "1px solid rgba(255,255,255,0.2)", opacity: ei(f, [a + 6, a + 12], [0, 1]),
        transform: `translateY(${(1 - ei(f, [a + 6, a + 14], [0, 1])) * 6}px)`, whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}>
        <span style={{ ...mono(13, "#fff"), letterSpacing: "0.1em", fontWeight: 700 }}>{h.label}</span>
      </div>
    </div>
  );
};

/* ---------- right-column story beats ---------- */
type Beat = { t: number; n: string; title: string; sub: string; g: string };
const BEATS: Beat[] = [
  { t: 0.0, n: "01", title: "The task", sub: "Review PSV-2034 against the current SOP revision.", g: "task" },
  { t: 4.9, n: "02", title: "Reads the scan", sub: "Finds every failed check — and cites the page.", g: "scan" },
  { t: 13.9, n: "03", title: "Drafts the note", sub: "Problem, evidence, action, approval — in your format.", g: "draft" },
  { t: 20.0, n: "04", title: "Connects the dots", sub: "Equipment, documents and SOPs in one graph.", g: "graph" },
  { t: 24.9, n: "05", title: "Picks the right model", sub: "Reports to a document model. Code to a coding model.", g: "route" },
  { t: 29.0, n: "06", title: "Remembers you", sub: "Your preferences — saved, editable, under your control.", g: "memory" },
  { t: 35.4, n: "07", title: "Everywhere you work", sub: "Web, phone and your coding workspace.", g: "devices" },
  { t: 40.2, n: "08", title: "Clearance-aware", sub: "Same question. Different clearance. Different answer.", g: "roles" },
  { t: 45.4, n: "09", title: "Admins in control", sub: "Every request reviewed. Every action logged.", g: "audit" },
];

const Pill: React.FC<{ icon?: string; text: string; tone?: string; o?: number; style?: React.CSSProperties }> = ({ icon, text, tone = C.text, o = 1, style }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, opacity: o,
    background: "rgba(255,255,255,0.05)", border: `1px solid ${tone === C.text ? "rgba(255,255,255,0.12)" : tone + "66"}`, ...style,
  }}>
    {icon && <Icon name={icon} size={18} color={tone} />}
    <span style={{ ...mono(13, tone), letterSpacing: "0.08em", textTransform: "none" }}>{text}</span>
  </div>
);
const stag = (f: number, a: number): React.CSSProperties => {
  const p = sp(f, a, theme.spring.snappy);
  return { opacity: p, transform: `translateY(${(1 - p) * 18}px)` };
};

const Graphic: React.FC<{ g: string; f: number; t0: number }> = ({ g, f, t0 }) => {
  const b = S(t0);
  switch (g) {
    case "task":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={stag(f, b + 18)}><Pill icon="scan" text="INS-2026-118 · scanned report" /></div>
          <div style={{ ...stag(f, b + 26), display: "flex", alignItems: "center", gap: 10, paddingLeft: 14 }}>
            <div style={{ width: 2, height: 26, background: "rgba(255,255,255,0.3)" }} />
            <span style={mono(12, C.dim)}>compare against</span>
          </div>
          <div style={stag(f, b + 34)}><Pill icon="file" text="SOP-CDU-014 · Rev 4" /></div>
        </div>
      );
    case "scan": {
      const n = Math.round(ei(f, [A("reads") - 4, A("reads") + 26], [0, 5], theme.ease.out));
      const src = A("shows");
      return (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, ...stag(f, A("reads") - 6) }}>
            <span style={{ ...display(84, 700), color: C.bad, fontVariantNumeric: "tabular-nums" }}>{n}</span>
            <span style={mono(14, C.text)}>failed checks found</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} style={{ ...stag(f, A("reads") + 4 + k * 4), ...mono(11, C.bad), fontWeight: 700, padding: "4px 7px", borderRadius: 6, border: `1.5px solid ${C.bad}` }}>FAIL</div>
            ))}
          </div>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={stag(f, src)}><span style={mono(12, C.dim)}>Sources cited</span></div>
            <div style={stag(f, src + 6)}><Pill icon="check" tone={C.ok} text="INS-2026-118 · p.1–2" /></div>
            <div style={stag(f, src + 12)}><Pill icon="check" tone={C.ok} text="SOP-CDU-014 Rev 4 · p.3" /></div>
            <div style={stag(f, S(12.3))}><Pill icon="alert" tone={C.warn} text="Rev 3 superseded → Rev 4 used" /></div>
          </div>
        </div>
      );
    }
    case "draft":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["Problem", "Evidence", "Required action", "Approval request"].map((t, k) => {
            const on = f >= S(17.7) + k * 8;
            return (
              <div key={t} style={{ ...stag(f, b + 16 + k * 5), display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                background: on ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.04)", border: `1px solid ${on ? C.ok + "66" : "rgba(255,255,255,0.1)"}` }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: on ? C.ok : "rgba(255,255,255,0.08)" }}>
                  {on && <Icon name="check" size={14} color="#05210F" stroke={3} />}
                </div>
                <span style={{ ...display(22, 600), color: on ? C.text : C.dim }}>{t}</span>
              </div>
            );
          })}
          <div style={stag(f, S(18.6))}><Pill icon="file" text="Draft for review · PSV-2034" /></div>
        </div>
      );
    case "graph": {
      const N = [
        { x: 60, y: 60, t: "PSV-2034", k: "eq" }, { x: 250, y: 40, t: "SOP-CDU-014", k: "doc" },
        { x: 160, y: 170, t: "INS-2026-118", k: "doc" }, { x: 40, y: 250, t: "PSV-2035", k: "eq" },
        { x: 270, y: 230, t: "V-201", k: "eq" },
      ];
      const E = [[0, 1], [0, 2], [2, 1], [0, 3], [0, 4], [4, 1], [3, 2]];
      return (
        <div style={{ position: "relative", width: RW, height: 320 }}>
          <svg width={RW} height={300} style={{ position: "absolute", inset: 0 }}>
            {E.map(([a2, b2], k) => {
              const p = ei(f, [b + 14 + k * 5, b + 30 + k * 5], [0, 1], theme.ease.inOut);
              return <line key={k} x1={N[a2].x} y1={N[a2].y} x2={lerp(N[a2].x, N[b2].x, p)} y2={lerp(N[a2].y, N[b2].y, p)} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />;
            })}
          </svg>
          {N.map((nd, k) => {
            const p = sp(f, b + 10 + k * 5, theme.spring.snappy);
            const col = nd.k === "eq" ? C.accent : C.warn;
            const pulse = k === 0 ? 1 + 0.25 * Math.abs(Math.sin(f / 9)) : 1;
            return (
              <div key={k} style={{ position: "absolute", left: nd.x - 9, top: nd.y - 9, opacity: p, transform: `scale(${p})` }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: col, boxShadow: `0 0 ${14 * pulse}px ${col}`, transform: `scale(${pulse})` }} />
                <div style={{ ...mono(11, C.text), letterSpacing: "0.06em", textTransform: "none", position: "absolute", left: 24, top: 1, whiteSpace: "nowrap" }}>{nd.t}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, top: 296, display: "flex", gap: 16 }}>
            <span style={mono(11, C.accent)}>● equipment</span>
            <span style={mono(11, C.warn)}>● documents</span>
          </div>
        </div>
      );
    }
    case "route": {
      const r1 = S(25.6), r2 = S(26.7); // synced to the router chips on screen
      const L = [{ t: "Kimi K2.6 · documents", at: r1, y: 60 }, { t: "Kimi K2.7 Code · code", at: r2, y: 200 }];
      return (
        <div style={{ position: "relative", width: RW, height: 270 }}>
          <svg width={RW} height={270} style={{ position: "absolute", inset: 0 }}>
            {L.map((l, k) => {
              const p = ei(f, [l.at - 6, l.at + 10], [0, 1], theme.ease.inOut);
              return <path key={k} d={`M74,130 C120,130 120,${l.y + 20} 166,${l.y + 20}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" stroke={f >= l.at ? C.hero : "rgba(255,255,255,0.3)"} strokeWidth={2.5} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 6, top: 96, width: 68, height: 68, borderRadius: 34, ...glass({ borderRadius: 34 }), border: `1.5px solid ${C.hero}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${C.glow}`, ...stag(f, b + 10) }}>
            <Icon name="route" size={32} color={C.hero} />
          </div>
          {L.map((l, k) => (
            <div key={k} style={{ position: "absolute", left: 166, top: l.y, ...stag(f, l.at - 4) }}>
              <Pill icon={k === 0 ? "file" : "code"} text={l.t} tone={f >= l.at + 4 ? C.text : C.dim} style={{ border: `1px solid ${f >= l.at + 4 ? C.hero : "rgba(255,255,255,0.12)"}` }} />
            </div>
          ))}
          <div style={{ position: "absolute", left: 0, top: 182, ...mono(11, C.dim) }}>auto-routed</div>
        </div>
      );
    }
    case "memory": {
      const chips = ["CDU-3 · operations engineer", "Four-section notes", "180 words or fewer", "Mark “Draft for review”"];
      const ctl = A("control");
      const on = ei(f, [ctl, ctl + 8], [0, 1], theme.ease.inOut);
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, ...stag(f, b + 8) }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, ...glass({ borderRadius: 32 }), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="memory" size={34} color={C.text} stroke={1.4} />
            </div>
            <span style={mono(13, C.text)}>Personal memory</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {chips.map((c, k) => <div key={c} style={stag(f, A("preferences") - 6 + k * 6)}><Pill text={c} /></div>)}
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12, ...stag(f, ctl - 6) }}>
            <div style={{ width: 46, height: 26, borderRadius: 13, background: on > 0.5 ? C.ok : "rgba(255,255,255,0.15)", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: 3 + 20 * on, width: 20, height: 20, borderRadius: 10, background: "#fff" }} />
            </div>
            <span style={mono(12, C.text)}>You control what it keeps</span>
          </div>
        </div>
      );
    }
    case "devices": {
      const ph = sp(f, A("phone") - 6, theme.spring.smooth);
      const ide = sp(f, A("coding") - 6, theme.spring.smooth);
      const line = (w: number, c = "rgba(255,255,255,0.35)") => <div style={{ height: 5, width: w, borderRadius: 3, background: c, marginTop: 7 }} />;
      return (
        <div style={{ position: "relative", height: 300 }}>
          <div style={{ position: "absolute", left: 0, top: 10, width: 120, height: 236, borderRadius: 22, border: "2px solid rgba(255,255,255,0.5)", background: "#0B0F1A", padding: "22px 10px", boxSizing: "border-box", opacity: ph, transform: `translateY(${(1 - ph) * 40}px) rotate(${(1 - ph) * -8}deg)` }}>
            <div style={{ width: 36, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.3)", margin: "-12px auto 12px" }} />
            <div style={mono(9, C.hero)}>Pragyan</div>
            <div style={{ marginTop: 10, padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}>{line(70)}{line(50)}</div>
            <div style={{ marginTop: 8, marginLeft: 20, padding: 6, borderRadius: 8, background: "rgba(76,141,255,0.25)" }}>{line(60)}{line(40)}</div>
            <div style={{ ...mono(9, C.dim), position: "absolute", bottom: 12, left: 10 }}>Phone</div>
          </div>
          <div style={{ position: "absolute", left: 140, top: 50, width: 220, height: 150, borderRadius: 10, border: "2px solid rgba(255,255,255,0.5)", background: "#0B0F1A", overflow: "hidden", opacity: ide, transform: `translateX(${(1 - ide) * 40}px)` }}>
            <div style={{ height: 16, background: "#1A2033", display: "flex", alignItems: "center", gap: 4, padding: "0 6px" }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c2) => <div key={c2} style={{ width: 5, height: 5, borderRadius: 3, background: c2 }} />)}
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ width: 130, padding: "4px 8px" }}>{line(90, C.accent + "aa")}{line(70)}{line(100, C.warn + "aa")}{line(60)}{line(80)}</div>
              <div style={{ width: 90, borderLeft: "1px solid rgba(255,255,255,0.1)", padding: "4px 6px" }}>
                <div style={mono(8, C.hero)}>Pragyan</div>{line(60)}{line(40)}
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 140, top: 214, ...stag(f, A("coding")), ...mono(11, C.dim) }}>IDE · coding workspace</div>
        </div>
      );
    }
    case "roles":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...stag(f, A("employees")), ...glass({ borderRadius: 14 }), padding: "14px 16px", border: `1px solid ${C.ok}66` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="user" size={20} color={C.ok} /><span style={display(22, 600)}>Operations engineer</span></div>
            <div style={{ ...mono(12, C.ok), marginTop: 8 }}>Full answer · cited</div>
          </div>
          <div style={{ ...stag(f, A("allowed") - 4), ...glass({ borderRadius: 14 }), padding: "14px 16px", border: `1px solid ${C.bad}66` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="lock" size={20} color={C.bad} /><span style={display(22, 600)}>Restricted employee</span></div>
            <div style={{ ...mono(12, C.bad), marginTop: 8 }}>Document stays hidden</div>
          </div>
        </div>
      );
    case "audit": {
      const rows = Array.from({ length: 14 }).map((_, k) => ({
        who: ["Ops engineer", "IT support", "Admin", "Ops engineer"][k % 4],
        act: ["document_get", "tag_lookup", "graph.view", "catalog_browse"][(k * 3) % 4],
        ok: !(k === 4 || k === 9 || k === 12),
      }));
      const scroll = Math.max(0, f - b - 10) * 0.9;
      return (
        <div>
          <div style={{ height: 210, overflow: "hidden", position: "relative", ...glass({ borderRadius: 12 }), ...stag(f, b + 8) }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 10 - (scroll % (14 * 34)) }}>
              {[...rows, ...rows].map((r, k) => (
                <div key={k} style={{ height: 34, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ ...mono(10, C.dim), width: 90, textTransform: "none", letterSpacing: "0.04em" }}>{r.who}</span>
                  <span style={{ ...mono(10, C.text), width: 110, textTransform: "none", letterSpacing: "0.04em" }}>{r.act}</span>
                  <span style={{ ...mono(10, r.ok ? C.ok : C.bad), fontWeight: 700 }}>{r.ok ? "Allowed" : "Denied"}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            <div style={stag(f, A("request") - 4)}><Pill icon="key" tone={C.ok} text="Access request · approved · 24 h" /></div>
            <div style={stag(f, A("activity") - 2)}><Pill icon="activity" tone={C.bad} text="Denied lookup · logged" /></div>
          </div>
        </div>
      );
    }
  }
  return null;
};

const MAGIC = A("from", 1) - 4; // "From scattered information to a useful draft"
const FRAGS = ["SCAN", "SOP", "EMAIL", "P&ID", "REPORT", "NOTES", "GRAPH", "SHEET", "PO", "LOG"];

export const Arjun: React.FC = () => {
  const f = useCurrentFrame();
  const sec = f / 30;
  const enter = sp(f, 0, theme.spring.soft);
  const recede = ei(f, [MAGIC, MAGIC + 26], [0, 1], theme.ease.inOut);
  const sceneOut = ei(f, [1722, 1734], [0, 1], theme.ease.in);
  const cam = camAt(sec);

  const bi = BEATS.reduce((acc, bt, i) => (sec >= bt.t ? i : acc), 0);
  const beat = BEATS[bi];
  const bStart = S(beat.t);
  const bEnd = bi < BEATS.length - 1 ? S(BEATS[bi + 1].t) : MAGIC;
  const beatOut = ei(f, [bEnd - 8, bEnd], [0, 1], theme.ease.in);
  const sweep = ei(f, [bStart, bStart + 22], [0, 1], theme.ease.inOut);
  const ry = 2.0 * Math.sin(f / 150);
  const rx = 1.0 * Math.cos(f / 170);
  const winH = WIN.bar + VH;
  const uiO = enter * (1 - recede);

  return (
    <AbsoluteFill style={{ opacity: 1 - sceneOut }}>
      <BgField intensity={1} />
      <div style={{ opacity: 1 - recede }}>
        <ChapterTag f={f} at={4} num="03" title="Live demo" style={{ left: 72, top: 62 }} />
      </div>

      {/* step progress */}
      <div style={{ position: "absolute", left: RX, top: 46, width: RW, opacity: uiO }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={mono(12, C.dim)}>Step</span>
          <span style={{ ...mono(12, C.text), fontVariantNumeric: "tabular-nums" }}>{beat.n} / 09</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {BEATS.map((bt, i) => {
            const fill = i < bi ? 1 : i > bi ? 0 : ei(f, [bStart, bEnd], [0, 1], theme.ease.std);
            return (
              <div key={bt.n} style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
                <div style={{ width: `${fill * 100}%`, height: 4, background: i === bi ? C.hero : "rgba(255,255,255,0.85)" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* the product screen with a virtual camera */}
      <div style={{ position: "absolute", inset: 0, perspective: 2400 }}>
        <div
          style={{
            position: "absolute", left: WIN.x, top: WIN.y, width: VW, height: winH, borderRadius: 16, overflow: "hidden",
            background: "#0E1220", boxShadow: "0 80px 140px -40px rgba(0,0,0,0.95)",
            transform: `translateY(${(1 - enter) * 80 - recede * 30}px) rotateX(${(1 - enter) * 16 + rx}deg) rotateY(${ry}deg) scale(${(0.94 + 0.06 * enter) * lerp(1, 0.62, recede)})`,
            opacity: enter * lerp(1, 0.28, recede), filter: `blur(${recede * 5}px)`,
          }}
        >
          <div style={{ height: WIN.bar, display: "flex", alignItems: "center", padding: "0 18px", gap: 9, background: "linear-gradient(180deg,#1A2033,#121726)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.9 }} />)}
            <div style={{ marginLeft: 18, flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ ...mono(13, C.dim), letterSpacing: "0.06em", textTransform: "none", padding: "5px 18px", borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="lock" size={13} color={C.dim} /> pragyan.local · on-premise
              </div>
            </div>
          </div>
          <div style={{ position: "relative", width: VW, height: VH, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: VW, height: VH, transformOrigin: "0 0", transform: `translate(${VW / 2 - cam.Cx * cam.z}px, ${VH / 2 - cam.Cy * cam.z}px) scale(${cam.z})` }}>
              <OffthreadVideo src={staticFile("arjun.mp4")} muted={!PLAY_VOICE} style={{ width: VW, height: VH, display: "block" }} />
            </div>
            {/* pinned annotations */}
            {f < MAGIC && HLS.map((h, k) => <Highlight key={k} h={h} sec={sec} f={f} c={cam} />)}
            {/* glass light sweep on each new step */}
            {sweep > 0 && sweep < 1 && (
              <div style={{ position: "absolute", top: 0, bottom: 0, width: 360, left: lerp(-400, VW + 40, sweep), background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.12), transparent)", transform: "skewX(-14deg)" }} />
            )}
          </div>
        </div>
      </div>
      {f < MAGIC && (
        <SpeakerDecor f={f} x={WIN.x} y={WIN.y} w={VW} h={winH} r={16} appear={14} who="arjun" envFrame={f}
          name="Arjun" role="Live demo" index="03 / 03" plate="none" o={1 - ei(f, [MAGIC - 10, MAGIC], [0, 1])} />
      )}

      {/* the explainer column */}
      <div key={beat.n} style={{ position: "absolute", left: RX, top: 130, width: RW, opacity: uiO * (1 - beatOut), transform: `translateY(${-14 * beatOut}px)` }}>
        <MaskLine f={f} at={bStart + 2}>
          <span style={{ ...display(96, 800), color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.6)" }}>{beat.n}</span>
        </MaskLine>
        <MaskLine f={f} at={bStart + 6}>
          <div style={{ ...display(40, 700), marginTop: 6 }}>{beat.title}</div>
        </MaskLine>
        <div style={{ fontFamily: theme.fonts.body, fontSize: 20, lineHeight: 1.4, color: C.dim, marginTop: 12, ...stag(f, bStart + 10) }}>{beat.sub}</div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "26px 0 22px", width: RW * ei(f, [bStart + 8, bStart + 24], [0, 1]) }} />
        <Graphic g={beat.g} f={f} t0={beat.t} />
      </div>

      {/* presenter plate with live voice meter */}
      <div style={{
        position: "absolute", left: WIN.x, top: 996, height: 58, padding: "0 18px", borderRadius: 14, display: "flex", alignItems: "center", gap: 16,
        background: "rgba(6,9,16,0.62)", border: "1px solid rgba(255,255,255,0.14)", opacity: uiO,
      }}>
        <span style={display(24, 650)}>Arjun</span>
        <span style={mono(11, C.dim)}>Live demo · Team Data_Jarvis GGV</span>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.14)" }} />
        <VoiceMeter who="arjun" i={f} h={22} bars={18} />
      </div>

      {/* the magic moment: scattered information -> a useful draft */}
      {f >= MAGIC && (() => {
        const g = f - MAGIC;
        const draftAt = A("useful") - MAGIC;
        const gather = ei(g, [draftAt - 10, draftAt + 8], [0, 1], theme.ease.inOut);
        const cardP = sp(g, draftAt + 4, theme.spring.smooth);
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 0, right: 0, top: 142, textAlign: "center" }}>
              <MaskLine f={g} at={2}>
                <span style={{ ...display(62, 600), color: C.dim }}>From scattered information</span>
              </MaskLine>
              <MaskLine f={g} at={draftAt - 6}>
                <span style={display(62, 700)}>
                  to a <span style={{ color: C.hero }}>useful draft.</span>
                </span>
              </MaskLine>
            </div>
            {FRAGS.map((t, i) => {
              const p = sp(g, 4 + i * 2, theme.spring.snappy);
              const ang = (i / FRAGS.length) * Math.PI * 2 + (rnd(i * 3.3) - 0.5) * 0.5;
              const sx = 960 - 70 + Math.cos(ang) * (560 + rnd(i * 5.1) * 160);
              const sy = 640 - 45 + Math.sin(ang) * (230 + rnd(i * 2.7) * 70);
              const drift = Math.sin((g + i * 11) / 14) * 10;
              const x = lerp(sx + drift, 960 - 70, gather);
              const y = lerp(sy - drift, 640 - 45, gather);
              const r = lerp((rnd(i * 7.7) - 0.5) * 50, 0, gather);
              return (
                <div key={t} style={{
                  position: "absolute", left: x, top: y, width: 140, height: 90, borderRadius: 12,
                  background: "linear-gradient(180deg,#F2F4F9,#D9DFEA)", boxShadow: "0 24px 50px -16px rgba(0,0,0,0.9)",
                  transform: `rotate(${r}deg) scale(${p * lerp(1, 0.5, gather)})`, opacity: p * (1 - ei(g, [draftAt + 2, draftAt + 10], [0, 1])),
                  padding: 12, boxSizing: "border-box",
                }}>
                  <div style={{ ...mono(11, "#334155"), fontWeight: 700 }}>{t}</div>
                  {[0, 1, 2].map((k) => <div key={k} style={{ height: 5, width: `${85 - k * 18}%`, background: "#A3ADC0", borderRadius: 3, marginTop: 9 }} />)}
                </div>
              );
            })}
            {g >= draftAt && (
              <div style={{
                position: "absolute", left: 960 - 400, top: 640 - 210, width: 800, height: 420, borderRadius: 22,
                background: "linear-gradient(180deg,#F7F9FD,#E6EBF3)", boxShadow: "0 60px 120px -30px rgba(0,0,0,0.95), 0 0 80px rgba(255,122,26,0.12)",
                padding: "30px 38px", boxSizing: "border-box", opacity: cardP, transform: `scale(${0.85 + 0.15 * cardP})`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ ...mono(14, "#1E3A8A"), fontWeight: 700 }}>Draft for review — PSV-2034 replacement note</div>
                  <div style={{ ...mono(11, "#047857"), fontWeight: 700, border: "1.5px solid #047857", borderRadius: 999, padding: "4px 10px" }}>Cited</div>
                </div>
                <div style={{ height: 2, background: "#1C2333", margin: "14px 0 18px", opacity: 0.8 }} />
                {[
                  ["Problem", "PSV-2034 failed its bench test (INS-2026-118 Rev 0)."],
                  ["Evidence", "Pop pressure 13.0 barg vs 12.25–12.75 required; seat leakage."],
                  ["Required action", "Replace with DS-PSV-2034. Keep standby PSV-2035 in service."],
                  ["Approval request", "PO approved against vendor quotation KVQ-2026-0457."],
                ].map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", gap: 18, marginBottom: 16, opacity: ei(g, [draftAt + 8 + i * 4, draftAt + 18 + i * 4], [0, 1]) }}>
                    <div style={{ ...mono(12, "#1E3A8A"), fontWeight: 700, width: 170, flexShrink: 0, paddingTop: 3 }}>{k}</div>
                    <div style={{ fontFamily: theme.fonts.body, fontSize: 19, color: "#1C2333", lineHeight: 1.35 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {g >= A("that's") - MAGIC && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: sp(g, A("that's") - MAGIC) }}>
                <Img src={staticFile("logo_dark.png")} style={{ width: 70 }} />
                <span style={mono(14, C.dim)}>Generated on-premise · every claim cited</span>
              </div>
            )}
          </AbsoluteFill>
        );
      })()}

      {/* sound */}
      {BEATS.slice(1).map((bt) => <Sfx key={bt.n} at={S(bt.t) - 1} name="whoosh" vol={0.08} />)}
      {HLS.map((h, k) => <Sfx key={`h${k}`} at={S(h.a)} name="tick" vol={0.12} />)}
      <Sfx at={MAGIC - 30} name="riser" vol={0.22} />
      <Sfx at={MAGIC} name="whoosh" vol={0.16} />
      <Sfx at={A("useful") - 2} name="hit" vol={0.38} />
      <Sfx at={A("that's") - 1} name="shimmer" vol={0.14} />
    </AbsoluteFill>
  );
};
