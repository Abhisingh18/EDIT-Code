import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei, sp, lerp } from "../lib";
import { at } from "../captions";
import { BgField, Sfx, SyncWords, display } from "../components/ui";
import { PointOfLight, TorusRing } from "../components/Particles";

const C = theme.colors;
const OFF = 15; // Shreya's audio starts 15 frames into the reveal
const S = (w: string, n = 0) => at("shreya", w, n) + OFF;

// hand-off target: the core logo of Shreya's first beat
export const CORE = { x: 1315, y: 545, w: 230 };
const LOGO_W = 460;
const LOGO_AR = 470 / 530;

export const Reveal: React.FC = () => {
  const r = useCurrentFrame();
  const hitAt = S("progan", 0);
  const form = ei(r, [12, hitAt - 4], [0, 1], theme.ease.inOut);
  const pitch = ei(r, [15, hitAt], [1.25, 0.12], theme.ease.inOut);
  const yaw = ei(r, [15, hitAt], [0.5, 0], theme.ease.inOut) + Math.sin(r / 40) * 0.05;
  const burst = ei(r, [hitAt, hitAt + 26], [0, 1], theme.ease.out);
  const flash = r < hitAt ? 0 : ei(r, [hitAt, hitAt + 14], [0.42, 0], theme.ease.out);
  const logoP = sp(r, hitAt, theme.spring.snappy);

  // fly to the core position of beat 1
  const fly = ei(r, [192, 214], [0, 1], theme.ease.inOut);
  const breathe = 1 + Math.sin(r / 24) * 0.008;
  const w = lerp(LOGO_W, CORE.w, fly) * breathe;
  const cx = lerp(960, CORE.x, fly);
  const cy = lerp(450, CORE.y, fly);
  const bgO = 1 - ei(r, [192, 212], [0, 1], theme.ease.inOut);
  const subO = 1 - ei(r, [190, 202], [0, 1], theme.ease.in);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: bgO }}>
        <AbsoluteFill style={{ opacity: ei(r, [hitAt, hitAt + 30], [0, 0.85]) }}>
          <BgField intensity={0.7} grid={false} />
        </AbsoluteFill>
      </AbsoluteFill>

      {r < hitAt + 4 && (
        <PointOfLight size={sp(r, 2, theme.spring.snappy) * 6 * (1 - form)} o={ei(r, [2, 6], [0, 1])} y={450} />
      )}
      {r < hitAt + 30 && (
        <TorusRing f={r} form={form} yaw={yaw} pitch={pitch} radius={190} burst={burst} cy={450} />
      )}

      {r >= hitAt - 1 && (
        <>
          <div
            style={{
              position: "absolute",
              left: cx - w * 0.9,
              top: cy - w * 0.9,
              width: w * 1.8,
              height: w * 1.8,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(139,92,246,0.20), rgba(255,122,26,0.06) 40%, transparent 68%)`,
              opacity: logoP,
            }}
          />
          <Img
            src={staticFile("logo_dark.png")}
            style={{
              position: "absolute",
              left: cx - w / 2,
              top: cy - (w * LOGO_AR) / 2,
              width: w,
              opacity: Math.min(1, logoP * 1.3),
              transform: `scale(${0.86 + 0.14 * logoP})`,
            }}
          />
        </>
      )}

      {/* category line synced to her words */}
