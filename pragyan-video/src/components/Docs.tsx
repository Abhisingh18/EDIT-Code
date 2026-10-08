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
