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
