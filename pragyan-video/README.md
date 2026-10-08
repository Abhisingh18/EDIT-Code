# Pragyan — SIH 2026 pitch film

Remotion project for Team Data_Jarvis GGV (SIH26117). Output: `E:\EDIT\Pragyan_SIH26117_Final.mp4` (1920×1080, 30 fps, ~6:47 — v3 with Arjun's full walkthrough).

## Structure

| Time | Section | File |
|---|---|---|
| 0:00 | Cold open: point of light → 3D lattice → hook → kinetic problem words | `src/scenes/ColdOpen.tsx` |
| 0:09 | 01 The problem — establishing shot, then Bhavna (split-screen + motion graphics) | `src/scenes/Establish.tsx`, `src/scenes/Bhawna.tsx` |
| 0:44 | Reveal — silence, particle ring forms the logo on "Pragyan" | `src/scenes/Reveal.tsx` |
| 0:45 | 02 The solution — Shreya (routing, knowledge, access) | `src/scenes/Shreya.tsx` |
| 1:34 | 03 Live demo — Arjun's 12-chapter walkthrough (chapter stingers over his cards, per-chapter graphics, payoff) | `src/scenes/Sting.tsx`, `src/scenes/Arjun2.tsx`, `src/data/arjun2_chapters.json` |
| 6:22 | Montage → impact → "Data stays in" → logo finale | `src/scenes/Outro.tsx` |

Master timings: `src/timeline.ts`. Colours, fonts and easings: `src/theme.ts`. Music ducking: `src/Main.tsx`.

## Edit and re-render

```bash
npm run studio   # live preview in the browser
npm run render   # writes out/pragyan_final.mp4
```

- Caption wording fixes (Whisper hears "Pragyan" as "ProGaN"): `src/captions.ts`.
