import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { ei } from "../lib";
import { BgField, MaskLine, Sfx, display, mono } from "../components/ui";

const C = theme.colors;

export const Sting: React.FC = () => {
  const f = useCurrentFrame();
  const split = ei(f, [0, 8], [12, 0]);
  const whip = ei(f, [26, 36], [0, 1], theme.ease.in);
  return (
    <AbsoluteFill>
      <BgField intensity={0.7} grid={false} />
      <AbsoluteFill
        style={{
          alignItems: "center", justifyContent: "center",
          transform: `translateX(${-520 * whip}px)`, filter: `blur(${whip * 14}px)`, opacity: 1 - whip * 0.7,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
          <div
            style={{
              ...display(250, 800), color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.55)",
              transform: `scale(${ei(f, [0, 10], [1.15, 1])})`, opacity: ei(f, [0, 3], [0, 1]),
              filter: `drop-shadow(${-split}px 0 rgba(255,70,70,0.6)) drop-shadow(${split}px 0 rgba(70,170,255,0.6))`,
            }}
          >
            03
          </div>
          <div>
            <MaskLine f={f} at={3}>
              <div style={display(86, 750)}>Live demo</div>
            </MaskLine>
            <div style={{ height: 3, width: 260 * ei(f, [6, 22], [0, 1], theme.ease.inOut), background: C.hero, marginTop: 14 }} />
            <MaskLine f={f} at={8}>
              <div style={{ ...mono(17, C.dim), marginTop: 18 }}>Pragyan on a refinery inspection</div>
            </MaskLine>
          </div>
        </div>
      </AbsoluteFill>
      <Sfx at={0} name="thud" vol={0.6} />
      <Sfx at={24} name="whoosh" vol={0.3} />
    </AbsoluteFill>
  );
};
