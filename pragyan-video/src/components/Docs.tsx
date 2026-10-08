import React from "react";
import { theme } from "../theme";
import { ei, sp } from "../lib";
import { mono } from "./ui";

const C = theme.colors;

// paper documents rendered in code (no stock imagery)
export const DocCard: React.FC<{
  f: number;
  at: number;
  kind: "report" | "note" | "plain";
  title: string;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
}> = ({ f, at, kind, title, w = 300, h = 380, style }) => {
  const rows = kind === "report" ? 7 : 9;
  const paper =
    kind === "report"
      ? "linear-gradient(180deg, #ECE9E1, #D9D5CB)"
      : "linear-gradient(180deg, #F6F8FC, #E3E8F1)";
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 14,
        background: paper,
        boxShadow: "0 40px 70px -24px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.25) inset",
        padding: 22,
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
        filter: kind === "report" ? "contrast(1.05)" : undefined,
        ...style,
      }}
    >
      <div style={{ ...mono(12, "#4A5368"), letterSpacing: "0.14em", fontWeight: 700 }}>{title}</div>
      <div style={{ height: 2, background: "#1C2333", opacity: 0.8, margin: "10px 0 14px" }} />
      {kind === "note"
        ? ["PROBLEM", "EVIDENCE", "REQUIRED ACTION", "APPROVAL REQUEST"].map((lab, i) => {
            const p = ei(f, [at + 6 + i * 5, at + 22 + i * 5], [0, 1]);
            return (
              <div key={lab} style={{ marginBottom: 14, opacity: p }}>
                <div style={{ ...mono(10, "#1E3A8A"), fontWeight: 700, letterSpacing: "0.12em" }}>{lab}</div>
                <div style={{ height: 6, width: `${(92 - i * 7) * p}%`, background: "#9AA6BC", borderRadius: 3, marginTop: 6 }} />
                <div style={{ height: 6, width: `${(70 - i * 5) * p}%`, background: "#B8C1D2", borderRadius: 3, marginTop: 5 }} />
              </div>
            );
          })
