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
        : Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ height: 7, flex: 1, maxWidth: `${60 + ((i * 37) % 35)}%`, background: "#9097A6", borderRadius: 3, opacity: 0.75 }} />
              {kind === "report" && i % 2 === 0 && (
                <div style={{ ...mono(10, "#B42318"), fontWeight: 700, border: "1.5px solid #B42318", padding: "1px 5px", borderRadius: 3 }}>
                  FAIL
                </div>
              )}
            </div>
          ))}
      {kind === "report" && (
        <div
          style={{
            position: "absolute", left: 18, right: 18, bottom: 18, border: "2px solid #1C2333",
            ...mono(11, "#1C2333"), fontWeight: 700, padding: "6px 8px", textAlign: "center",
          }}
        >
          RESULT: FAIL · VALVE REJECTED
        </div>
      )}
    </div>
  );
};

// red rubber stamp
export const Stamp: React.FC<{ f: number; at: number; text: string; color?: string; style?: React.CSSProperties }> = ({
  f, at, text, color = C.bad, style,
}) => {
  if (f < at) return null;
  const p = sp(f, at, { damping: 13, stiffness: 260, mass: 0.6 });
  return (
    <div
      style={{
        position: "absolute",
        ...mono(30, color),
        fontWeight: 700,
        letterSpacing: "0.14em",
        border: `4px solid ${color}`,
        borderRadius: 8,
        padding: "8px 18px",
        transform: `rotate(-12deg) scale(${1.9 - 0.9 * p})`,
        opacity: Math.min(1, p * 1.4) * 0.95,
        background: "rgba(255,255,255,0.05)",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
