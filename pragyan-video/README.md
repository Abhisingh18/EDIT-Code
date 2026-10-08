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
- Clip prep (Shreya jump cuts + crop + grade, loudness for all three): `python work/prep.py`, then the picture-quality pass `python work/enhance.py` (denoise, CAS sharpening, clarity, colour; same cuts and audio).
- 0:09–0:12 establishing shot (refinery plate + HUD): `src/scenes/Establish.tsx`; the plate `public/plate_refinery.jpg` is a cleaned, graded 4K still from Bhavna's B-roll (third-party branding removed).
- Original music and SFX are synthesised, no licences needed: `python work/synth.py`.

## Final delivery files

- `E:\EDIT\Pragyan_SIH26117_Final.mp4` — H.264 1080p30 + AAC 256k, −16 LUFS, true peak ≈ −2.3 dBTP. Use this for upload / submission / WhatsApp.
- `E:\EDIT\Pragyan_SIH26117_preview_vscode.mp4` — same video with Opus audio. VS Code's built-in player can't play AAC, so use this one there.
- Previous version (v1) is kept in `out/v1/`.

## Audio post-production (voice-first mix)

1. `work/audio/dfenv/Scripts/python work/audio/df_enhance.py` — DeepFilterNet3 noise removal (isolated venv, numpy<2; never install it globally — global numpy must stay 2.x).
2. `python work/audio/voice_chain.py` — match-EQ to a speech curve (80% strength), de-ess, gentle compression, slow levelling, −16 LUFS per speaker; Shreya's jump cuts are rebuilt frame-accurately from her VFR source; writes `src/data/voice_env.json` for the on-screen voice meters.
3. Render the effects stem: `npx remotion render src/index.ts Pragyan out/stem_sfx.wav --codec wav --props work/props_sfx.json --concurrency 2`.
4. `python work/audio/mix.py` — word-timed sidechain ducking (+ spectral dip) for the music, ducked SFX, bus compression, −16 LUFS, 4x-oversampled limiter.

## Picture render and assembly (low-RAM machine: ≤3 workers)

```bash
sh work/render_chunks2.sh  # v3 silent picture in chunks (c2 reused), retries failed chunks
python work/audio/mix2.py  # v3 mix: Arjun2 voice + launch pulse + stinger swells; SFX rebuilt from cues
sh work/assemble2.sh       # concat + mastered audio -> both final files (previous finals moved to out/v2)
```
