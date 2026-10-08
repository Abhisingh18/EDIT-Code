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
