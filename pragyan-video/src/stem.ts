import { getInputProps } from "remotion";

// Render-time stem switch: "all" (preview), "sfx" (effects only), "none" (silent picture for the final mux)
export const STEM: string = ((getInputProps() as { stem?: string }).stem ?? "all");
export const PLAY_VOICE = STEM === "all";
export const PLAY_MUSIC = STEM === "all";
export const PLAY_SFX = STEM === "all" || STEM === "sfx";
