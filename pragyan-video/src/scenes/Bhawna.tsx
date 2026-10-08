import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp, rnd } from "../lib";
import { at, pages } from "../captions";
import {
  BgField, Beat, Captions, ChapterTag, Chip, MaskLine, Sfx, SyncWords, display, glass, mono,
} from "../components/ui";
import { Icon } from "../components/Icon";
import { DocCard, Stamp } from "../components/Docs";
import { Establish } from "./Establish";
import { SpeakerDecor, VoiceMeter } from "../components/SpeakerDecor";
import { PLAY_VOICE } from "../stem";

const C = theme.colors;
const W = (word: string, n = 0) => at("bhawna", word, n);
const CAPS = pages("bhawna", 3.0, 26.7, 4);

/* camera states for the footage layer (clip + transform, origin 0 0) */
type Cam = { t: number; r: number; b: number; l: number; rad: number; tx: number; ty: number; s: number };
// her picture-in-picture region in the source (x 48..795, y 272..1022) -> card at (70,170)
const SK = 747 / 700;
const SPLIT: Cam = { t: 272, r: 1125, b: 108, l: 95, rad: 28 / SK, tx: 70 - 95 * SK, ty: 170 - 272 * SK, s: SK };
// circle around her face (455,470) r150 -> centre (200,880) at 0.72
// card collapsed to its centre line — opens with a vertical wipe out of the establishing shot
const HID: Cam = { ...SPLIT, t: 272 + 350, b: 108 + 350 };
const PIP: Cam = { t: 320, r: 1315, b: 460, l: 305, rad: 150, tx: 200 - 455 * 0.72, ty: 880 - 470 * 0.72, s: 0.72 };
const KEYS: [number, Cam][] = [
  [0, HID],
  [94, HID],
  [114, SPLIT],
  [798, SPLIT],
  [818, PIP],
];
const camAt = (f: number): Cam => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [f0, a] = KEYS[i];
    const [f1, b] = KEYS[i + 1];
    if (f <= f1) {
      const p = ei(f, [f0, f1], [0, 1], theme.ease.inOut);
      const o = {} as Cam;
      (Object.keys(a) as (keyof Cam)[]).forEach((k) => (o[k] = lerp(a[k], b[k], p)));
      return o;
    }
  }
  return KEYS[KEYS.length - 1][1];
};

const PX = 880; // right panel left edge
const PCX = 1365; // right panel centre

export const Bhawna: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const sceneOut = ei(f, [1040, 1053], [0, 1], theme.ease.in);

  return (
    <AbsoluteFill style={{ opacity: 1 - sceneOut }}>
      <BgField intensity={0.9} />

      {/* footage layer: full frame -> split card -> face circle */}
      <AbsoluteFill
        style={{
          clipPath: `inset(${cam.t}px ${cam.r}px ${cam.b}px ${cam.l}px round ${cam.rad}px)`,
          transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`,
          transformOrigin: "0 0",
          filter: "saturate(1.04) contrast(1.04)",
        }}
      >
        <OffthreadVideo src={staticFile("bhawna.mp4")} muted={!PLAY_VOICE} />
      </AbsoluteFill>

      {/* broadcast talent-box dressing while docked */}
      {f < 800 && (
        <SpeakerDecor
          f={f} x={70} y={170} w={747} h={747} r={28} appear={104} who="bhawna" envFrame={f}
          name="Bhavna" role="The problem" index="01 / 03"
          o={ei(f, [786, 798], [1, 0], theme.ease.in)}
        />
      )}
      {/* light sweep across the card as it opens */}
      {f >= 110 && f < 132 && (
        <div style={{ position: "absolute", left: 70, top: 170, width: 747, height: 747, borderRadius: 28, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, bottom: -100, width: 260, left: lerp(-320, 820, ei(f, [110, 130], [0, 1], theme.ease.inOut)), background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.16), transparent)", transform: "skewX(-14deg)" }} />
        </div>
      )}
      {f >= 818 && (
        <div
          style={{
            position: "absolute", left: 200 - 112, top: 880 - 112, width: 224, height: 224, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.35)", boxShadow: "0 0 0 8px rgba(255,255,255,0.04)",
            opacity: ei(f, [818, 832], [0, 1]),
          }}
        />
      )}


      {/* titles */}
      {f < 800 && (
        <AbsoluteFill style={{ opacity: ei(f, [786, 800], [1, 0], theme.ease.in) }}>
          <ChapterTag f={f} at={100} num="01" title="The problem" style={{ left: 72, top: 62 }} />
        </AbsoluteFill>
      )}

      {/* P1 — highly sensitive data */}
      <Beat f={f} from={95} to={182}>
        <div style={{ position: "absolute", left: PX, top: 196 }}>
          <MaskLine f={f} at={100}>
            <span style={mono(17, C.dim)}>Refinery data · classified</span>
          </MaskLine>
        </div>
        {[
          { t: "P&ID DRAWING", x: -190, r: -10, d: 0 },
          { t: "SOP-CDU-014", x: 190, r: 10, d: 5 },
          { t: "INSPECTION REPORT", x: 0, r: 0, d: 10 },
        ].map((d, i) => {
          const p = sp(f, 102 + d.d, theme.spring.smooth);
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: PCX - 150 + d.x, top: 330,
                transform: `translateY(${(1 - p) * 140}px) rotate(${d.r * p}deg)`, opacity: p,
              }}
            >
              <DocCard f={f} at={102} kind={i === 2 ? "report" : "plain"} title={d.t} />
            </div>
          );
        })}
        <Stamp f={f} at={W("sensitive") - 2} text="CONFIDENTIAL" style={{ left: PCX - 150, top: 470 }} />
      </Beat>

      {/* P2 — analyse report -> approval-ready note */}
      <Beat f={f} from={182} to={334}>
        <div style={{ position: "absolute", left: PX, top: 196 }}>
          <MaskLine f={f} at={186}>
            <span style={mono(17, C.dim)}>The daily task</span>
          </MaskLine>
        </div>
        {(() => {
          const pIn = sp(f, 186);
          const prog = ei(f, [W("analyze"), W("note") + 6], [0, 1], theme.ease.inOut);
          const scanY = ei(f, [W("analyze"), W("analyze") + 40], [0, 360], theme.ease.inOut);
          const noteP = sp(f, W("approval") - 4);
          return (
            <>
              <div style={{ position: "absolute", left: 930, top: 340, opacity: pIn, transform: `translateY(${(1 - pIn) * 60}px)` }}>
                <DocCard f={f} at={186} kind="report" title="INSPECTION REPORT" />
                {f >= W("analyze") && f < W("analyze") + 44 && (
                  <div style={{ position: "absolute", left: -6, right: -6, top: scanY, height: 3, background: C.accent, boxShadow: `0 0 18px ${C.accent}` }} />
                )}
              </div>
              <div style={{ position: "absolute", left: 1262, top: 520, width: 210 }}>
                <div style={{ ...mono(14, C.dim), textAlign: "center", marginBottom: 12, opacity: ei(f, [W("analyze") - 4, W("analyze") + 6], [0, 1]) }}>
                  Analyse
                </div>
                <div style={{ height: 2, background: "rgba(255,255,255,0.14)", borderRadius: 2 }}>
                  <div style={{ height: 2, width: `${prog * 100}%`, background: C.text, borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ position: "absolute", left: 1500, top: 340, opacity: noteP, transform: `translateX(${(1 - noteP) * 50}px) scale(${0.94 + 0.06 * noteP})` }}>
                <DocCard f={f} at={W("approval") - 4} kind="note" title="APPROVAL NOTE" />
              </div>
              <Chip f={f} at={W("note")} icon="check" label="Approval-ready" tone="ok" style={{ position: "absolute", left: 1528, top: 750 }} />
            </>
          );
        })()}
      </Beat>

      {/* P3 — public AI is not allowed */}
      <Beat f={f} from={334} to={502}>
        <div style={{ position: "absolute", left: PX, top: 196 }}>
          <MaskLine f={f} at={338}>
            <span style={mono(17, C.dim)}>Using public AI?</span>
          </MaskLine>
        </div>
        {(() => {
          const pIn = sp(f, 340);
          const block = W("not");
          const travel = ei(f, [352, block], [0, 1], theme.ease.inOut);
          const back = ei(f, [block, block + 14], [0, 1], theme.ease.out);
          const px = f < block ? lerp(1150, 1352, travel) : lerp(1352, 1290, back);
          const pkO = f < block ? ei(f, [352, 358], [0, 1]) : 1 - back;
          const barrier = sp(f, block - 10, theme.spring.snappy);
          const red = ei(f, [block, block + 4], [0, 1]) * ei(f, [block + 20, block + 40], [1, 0.55]);
          const cloudP = sp(f, 346);
          return (
            <>
              <div style={{ position: "absolute", left: 930, top: 330, opacity: pIn, transform: `translateY(${(1 - pIn) * 50}px)` }}>
                <DocCard f={f} at={340} kind="report" title="SENSITIVE REPORT" w={220} h={280} />
              </div>
              <div
                style={{
                  position: "absolute", left: 1560, top: 330, width: 240, height: 280, ...glass({ borderRadius: 28 }),
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
                  opacity: cloudP * (1 - red * 0.35), transform: `scale(${0.9 + 0.1 * cloudP})`,
                }}
              >
                <Icon name="cloud" size={84} color={C.text} stroke={1.4} />
                <div style={mono(17, C.text)}>Public AI</div>
                <div style={{ ...mono(12, C.faint), letterSpacing: "0.1em" }}>third-party servers</div>
              </div>
              {/* packet */}
              <div style={{ position: "absolute", left: px - 9, top: 461, width: 18, height: 18, borderRadius: 9, background: C.text, opacity: pkO, boxShadow: `0 0 20px ${C.text}` }} />
              {/* barrier */}
              <div
                style={{
                  position: "absolute", left: 1364, top: 470 - 150 * barrier, width: 3, height: 300 * barrier,
                  background: red > 0 ? `rgba(242,85,85,${0.5 + red * 0.5})` : "rgba(255,255,255,0.4)",
                  boxShadow: red > 0 ? `0 0 ${30 * red}px ${C.bad}` : undefined, borderRadius: 2,
                }}
              />
              {f >= block && (
                <div
                  style={{
                    position: "absolute", left: 1365 - 34, top: 470 - 34, width: 68, height: 68, borderRadius: 34,
                    background: C.bad, display: "flex", alignItems: "center", justifyContent: "center",
                    transform: `scale(${sp(f, block, theme.spring.bouncy)})`, boxShadow: `0 0 40px ${C.bad}88`,
                  }}
                >
                  <Icon name="x" size={38} color="#fff" stroke={3} />
                </div>
              )}
              <div style={{ position: "absolute", left: 1365 - 160, top: 640, width: 320, textAlign: "center" }}>
                <MaskLine f={f} at={W("allowed")}>
                  <span style={{ ...mono(20, C.bad), fontWeight: 700 }}>Not allowed</span>
                </MaskLine>
              </div>
              <div style={{ position: "absolute", left: PX, width: 970, top: 740, display: "flex", justifyContent: "center", gap: 14 }}>
                <Chip f={f} at={W("organization")} icon="building" label="Organisation policy" />
                <Chip f={f} at={W("security")} icon="lock" label="Security" />
                <Chip f={f} at={W("competences")} icon="shield" label="Compliance" />
              </div>
            </>
          );
        })()}
      </Beat>

      {/* P4 — two options, both bad */}
      <Beat f={f} from={502} to={800}>
        <div style={{ position: "absolute", left: PX, top: 196 }}>
          <MaskLine f={f} at={508}>
            <span style={mono(17, C.dim)}>So they're left with two options</span>
          </MaskLine>
        </div>
        {(() => {
          const aP = sp(f, W("either") - 4);
          const bP = sp(f, W("secondly") - 4);
          const hrs = ei(f, [W("wasting") - 6, W("hours") + 24], [0, 3], theme.ease.out);
          const leak = f - W("pasting");
          const card = (y: number, p: number, dim: number): React.CSSProperties => ({
            position: "absolute", left: PX, top: y, width: 970, height: 230, ...glass(),
            opacity: p * (1 - dim * 0.5), transform: `translateY(${(1 - p) * 50}px)`,
            display: "flex", alignItems: "center", padding: "0 44px", boxSizing: "border-box", gap: 30,
          });
          return (
            <>
              <div style={card(270, aP, ei(f, [W("secondly"), W("secondly") + 12], [0, 1]))}>
                <div style={mono(18, C.faint)}>01</div>
                <div style={{ width: 88, height: 88, borderRadius: 44, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="clock" size={46} color={C.text} stroke={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={display(42, 650)}>Do it all manually</div>
                  <div style={{ ...display(22, 450, C.dim), letterSpacing: 0, marginTop: 8 }}>Read, cross-check and draft by hand.</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...display(76, 700), fontVariantNumeric: "tabular-nums" }}>{hrs.toFixed(1)}</div>
                  <div style={mono(14, C.dim)}>hours lost</div>
                </div>
