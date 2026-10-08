// theme.ts — single source of truth. Never inline colors, easings or springs in scenes.
import { Easing } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/InterTight";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const display = loadDisplay("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const theme = {
  colors: {
    bg: "#05070D",
    bgAlt: "#0B0F1A",
    hero: "#FF7A1A", // saffron from the logo swirl — max one hero element per frame
    accent: "#4C8DFF", // logo blue — secondary
    violet: "#8B5CF6",
    ok: "#34D399",
    bad: "#F25555",
    warn: "#F5A524",
    text: "#F4F6FB",
    dim: "#98A2B8",
    faint: "#5B657A",
    line: "rgba(255,255,255,0.10)",
    glow: "rgba(255,122,26,0.45)",
  },
  fonts: {
    display: display.fontFamily,
    body: body.fontFamily,
    mono: mono.fontFamily,
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1), // entrances
    inOut: Easing.bezier(0.83, 0, 0.17, 1), // camera moves
    std: Easing.bezier(0.4, 0, 0.2, 1), // premium standard
    in: Easing.bezier(0.7, 0, 0.84, 0), // exits only
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    soft: { damping: 26, stiffness: 70, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
} as const;
