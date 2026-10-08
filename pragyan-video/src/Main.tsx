import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { T } from "./timeline";
import { CLAMP } from "./lib";
import { Grade, Grain, Vignette } from "./components/ui";
import { ColdOpen } from "./scenes/ColdOpen";
import { Bhawna } from "./scenes/Bhawna";
import { Reveal } from "./scenes/Reveal";
import { Shreya } from "./scenes/Shreya";
import { Sting } from "./scenes/Sting";
import { Arjun2 } from "./scenes/Arjun2";
import { Outro } from "./scenes/Outro";
import { PLAY_MUSIC } from "./stem";

// [frame, volume] keyframes — music ducks under every voice, stops dead before the reveal and the final hit
const BED: [number, number][] = [
  [0, 0], [12, 0], [50, 0.42], [216, 0.46], [262, 0.34], [292, 0.085],
  [1288, 0.085], [1316, 0], [1400, 0], [1406, 0.2], [1500, 0.2], [1545, 0.085],
  [2800, 0.085], [2816, 0.4], [2852, 0.4], [9756, 0.08],
  [11316, 0.08], [11376, 0.22], [11466, 0.55], [11856, 0.55], [11876, 0.5],
  [12036, 0.5], [12042, 0], [12059, 0], [12062, 0.52], [12166, 0.45], [12216, 0],
];
const DRUMS: [number, number][] = [
  [0, 0], [140, 0], [144, 0.62], [214, 0.62], [234, 0.3], [262, 0],
  [2816, 0], [2820, 0.55], [2852, 0.55], [9738, 0],
  [11462, 0], [11466, 0.7], [11856, 0.7], [11868, 0], [12216, 0],
];
const vol = (keys: [number, number][]) => (f: number) =>
  interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), CLAMP);

export const Main: React.FC = () => (
