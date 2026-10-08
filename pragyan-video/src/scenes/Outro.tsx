import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp } from "../lib";
import { BgField, MaskLine, Sfx, display, glass, mono } from "../components/ui";
import { Converge } from "../components/Particles";

const C = theme.colors;
const SHOT = 36; // two beats

// source windows are chosen to stay inside one shot of Arjun's own edit (no stray cuts)
const SHOTS = [
  { t: 130.0, rate: 1, crop: [300, 0, 1390, 782], label: "Cites every check." },
  { t: 38.0, rate: 1, crop: [300, 0, 1390, 782], label: "Maps knowledge." },
  { t: 66.0, rate: 1, crop: [300, 0, 1390, 782], label: "Checks clearance." },
  { t: 82.0, rate: 1, crop: [300, 0, 1390, 782], label: "Grants, then expires." },
  { t: 172.0, rate: 1, crop: [300, 0, 1390, 782], label: "Codes by the rules." },
  { t: 211.0, rate: 1, crop: [300, 0, 1390, 782], label: "Goes mobile." },
];
const CARD = { x: 600, y: 196, w: 1220, h: 686 };

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const l = useCurrentFrame();
  const s = SHOTS[i];
  const [cx, cy, cw] = s.crop;
  const k = CARD.w / cw;
  const enter = ei(l, [0, 6], [1, 0], theme.ease.out);
  const drift = ei(l, [0, SHOT], [60, -60], theme.ease.std);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, perspective: 2000 }}>
        <div
          style={{
            position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 20, overflow: "hidden",
            ...glass({ borderRadius: 20 }), background: "#EEE",
            transform: `translateX(${drift + enter * 260}px) rotateY(-9deg) rotateX(3deg) scale(${1 + (1 - enter) * 0.0})`,
            filter: `blur(${enter * 10}px)`,
            boxShadow: "0 80px 140px -40px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.14)",
          }}
        >
          <OffthreadVideo
            src={staticFile("arjun2.mp4")}
            trimBefore={Math.round(s.t * 30)}
            playbackRate={s.rate}
            muted
            style={{ position: "absolute", left: -cx * k, top: -cy * k, width: 1696 * k, height: 960 * k, maxWidth: "none" }}
          />
          <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(5,7,13,0.25), transparent 30%)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 430, width: 460 }}>
        <MaskLine f={l} at={1}>
          <div style={mono(18, C.hero)}>{String(i + 1).padStart(2, "0")}</div>
        </MaskLine>
        <MaskLine f={l} at={3}>
          <div style={{ ...display(68, 750), marginTop: 14 }}>{s.label}</div>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};

const STATS = [
  { kick: "Model routing", fmt: (v: number) => `${Math.round(v)}%+`, from: 0, to: 90, label: "routing accuracy across task types" },
  { kick: "Approval note", fmt: (v: number) => `${Math.round(v)} min`, from: 180, to: 20, label: "per note, down from 2–3 hours" },
  { kick: "Report processing", fmt: (v: number) => `5–${Math.round(v)}×`, from: 5, to: 10, label: "faster P&ID and report reading" },
  { kick: "Manual rework", fmt: (v: number) => `30–${Math.round(v)}%`, from: 30, to: 50, label: "less rework on every draft" },
];

export const Outro: React.FC = () => {
  const o = useCurrentFrame();

  return (
    <AbsoluteFill>
      <BgField intensity={1} />

      {/* speed / scale montage — cut on the beat */}
      {SHOTS.map((_, i) => (
        <Sequence key={i} from={i * SHOT} durationInFrames={SHOT}>
          <Shot i={i} />
        </Sequence>
      ))}

      {/* impact */}
      {o >= 216 && o < 398 && (() => {
        const i = o - 216;
        const out = ei(i, [168, 180], [0, 1], theme.ease.in);
        return (
          <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-30 * out}px)` }}>
            <div style={{ position: "absolute", left: 135, top: 250 }}>
              <MaskLine f={i} at={4}>
                <div style={mono(18, C.dim)}>Potential impact · MRPL deployment</div>
              </MaskLine>
            </div>
            {STATS.map((s, k) => {
              const a = 18 + k * 18;
              const p = sp(i, a, theme.spring.smooth);
              const v = lerp(s.from, s.to, ei(i, [a, a + 34], [0, 1], theme.ease.out));
              return (
                <div
                  key={s.kick}
                  style={{
                    position: "absolute", left: 135 + k * 420, top: 330, width: 390, height: 360, ...glass(),
                    padding: "34px 34px", boxSizing: "border-box", opacity: p, transform: `translateY(${(1 - p) * 60}px)`,
                  }}
                >
                  <div style={mono(14, C.dim)}>{s.kick}</div>
                  <div style={{ ...display(80, 700), fontVariantNumeric: "tabular-nums", marginTop: 40, whiteSpace: "nowrap", color: k === 1 ? C.hero : C.text }}>
                    {s.fmt(v)}
                  </div>
                  <div style={{ fontFamily: theme.fonts.body, fontSize: 23, color: C.dim, marginTop: 26, lineHeight: 1.35 }}>{s.label}</div>
                </div>
              );
            })}
          </AbsoluteFill>
        );
      })()}

      {/* the human moment — slow down */}
      {o >= 396 && o < 506 && (() => {
        const h = o - 396;
        const out = ei(h, [96, 108], [0, 1], theme.ease.in);
        const settle = ei(h, [52, 70], [0, 1], theme.ease.inOut);
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - out }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ opacity: lerp(1, 0.38, settle), transform: `translateY(${-10 * settle}px)` }}>
                <MaskLine f={h} at={2}>
                  <div style={display(112, 700)}>Data stays in.</div>
                </MaskLine>
              </div>
              <MaskLine f={h} at={54}>
                <div style={{ ...display(112, 700), marginTop: 6 }}>
                  Work moves <span style={{ color: C.hero }}>forward.</span>
                </div>
              </MaskLine>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* final hero: everything converges into the mark */}
      {o >= 504 && (() => {
        const z = o - 504;
        const LW = 540, LH = 540 * (470 / 530);
        const cy = 430;
        const hit = 90;
        const logoP = sp(z, hit, theme.spring.snappy);
        const flash = z < hit ? 0 : ei(z, [hit, hit + 16], [0.5, 0], theme.ease.out);
        const pulse = z >= 72 && z < hit ? 1 - 0.025 * Math.sin(((z - 72) / 18) * Math.PI) : 1;
        const fadeAll = ei(z, [216, 246], [0, 1], theme.ease.inOut);
        return (
          <AbsoluteFill style={{ opacity: 1 - fadeAll }}>
            <AbsoluteFill style={{ background: "#000", opacity: ei(z, [0, 10], [0, 0.55]) }} />
            <div style={{ position: "absolute", inset: 0, transform: `scale(${pulse})` }}>
              <Converge f={z} start={0} dur={48} cx={960} cy={cy} w={LW} h={LH} opacity={1 - ei(z, [hit, hit + 10], [0, 1])} />
            </div>
            {z >= hit - 1 && (
              <>
                <div
                  style={{
                    position: "absolute", left: 960 - LW, top: cy - LW, width: LW * 2, height: LW * 2, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(139,92,246,0.22), rgba(255,122,26,0.07) 40%, transparent 66%)", opacity: logoP,
                  }}
                />
                <Img
                  src={staticFile("logo_dark.png")}
                  style={{
                    position: "absolute", left: 960 - LW / 2, top: cy - LH / 2, width: LW,
                    opacity: Math.min(1, logoP * 1.4), transform: `scale(${(0.9 + 0.1 * logoP) * (1 + Math.sin(z / 30) * 0.006)})`,
                  }}
                />
              </>
            )}
            <div style={{ position: "absolute", left: 0, right: 0, top: 742, display: "flex", justifyContent: "center", gap: 30 }}>
              {["Sovereign.", "Secure.", "Agentic."].map((w, i) => (
                <MaskLine key={w} f={z} at={108 + i * 9}>
                  <span style={{ ...display(54, 650), letterSpacing: "0.005em" }}>{w}</span>
                </MaskLine>
              ))}
            </div>
            <div
