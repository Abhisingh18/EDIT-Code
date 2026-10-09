# Pragyan — SIH 2026 Pitch Films

The code behind **Team Data_Jarvis GGV**'s Smart India Hackathon 2026 pitch video for **Pragyan**, a sovereign, on-premise agentic AI workbench (Problem Statement **SIH26117**, Smart Automation).

The whole film is built in code with [Remotion](https://www.remotion.dev/) (React → video). The audio is mixed with Python and FFmpeg.

| | |
|---|---|
| **Length** | 6:47 |
| **Format** | 1920×1080, 30 fps, H.264 + AAC |
| **Audio** | −16 LUFS integrated, true peak ≈ −2.2 dBTP |
| **Speakers** | Bhavna (problem) → Shreya (solution) → Arjun (live demo) |

> The rendered video and all source media (speaker clips, audio, images) are **not** in this repo (GitHub's 100 MB file limit). This repo holds the code, data and scripts only.

---

## Film structure

| Time | Section | What happens | Code |
|---|---|---|---|
| 0:00 | Cold open | Point of light → 3D particle lattice → hook line → kinetic problem words | `src/scenes/ColdOpen.tsx` |
| 0:09 | 01 · The problem | Cinematic refinery establishing shot with HUD, then Bhavna in a split-screen with motion graphics | `src/scenes/Establish.tsx`, `src/scenes/Bhawna.tsx` |
| 0:44 | Reveal | Half-second silence, then a particle ring forms the logo on the word "Pragyan" | `src/scenes/Reveal.tsx` |
| 0:45 | 02 · The solution | Shreya: model routing, knowledge grounding, approved knowledge, role-based access | `src/scenes/Shreya.tsx` |
| 1:34 | 03 · Live demo | Arjun's 12-chapter walkthrough: chapter stingers, a graphic per chapter, "Zero third-party API calls" payoff | `src/scenes/Sting.tsx`, `src/scenes/Arjun2.tsx` |
| 6:22 | Outro | Speed montage → impact numbers → "Data stays in." → logo finale | `src/scenes/Outro.tsx` |

---

## Repository layout

```
.
├── pragyan-video/               Remotion project
│   ├── src/
│   │   ├── Main.tsx             composition: scenes + preview music
│   │   ├── timeline.ts          master frame timings
│   │   ├── theme.ts             colours, fonts, easings, springs
│   │   ├── captions.ts          word-synced captions + Whisper fixes
│   │   ├── stem.ts              render switch: full / SFX-only / silent picture
│   │   ├── scenes/              one file per section of the film
│   │   ├── components/          UI, particles, icons, speaker frames, voice meters
│   │   └── data/                word timings, voice envelopes, Arjun's chapters + SFX cues
│   └── work/                    pipeline scripts (prep, enhance, audio, render, assemble)
├── .claude/skills/              motion-design, remotion-motion-graphics, video-editing, product-launch
└── CLAUDE.md                    repo rules
```

---

## Requirements

- Node.js 18+ and npm
- FFmpeg / FFprobe on `PATH`
- Python 3.11 with `numpy`, `scipy`, `opencv-python`, `faster-whisper`
- DeepFilterNet in its **own** virtual env (`pragyan-video/work/audio/dfenv`). It needs `numpy<2`, so don't install it globally.

```bash
cd pragyan-video
npm install
npm run studio        # live preview in the browser
```

---

## Production pipeline

All commands run from `pragyan-video/`.

### 1. Prepare the clips
| Step | Command | What it does |
|---|---|---|
| Transcribe | `python work/transcribe.py`, `python work/transcribe2.py` | Word timestamps (faster-whisper) |
| Prep | `python work/prep.py` | Shreya's jump cuts and crop, loudness |
| Enhance | `python work/enhance.py` | Denoise, CAS sharpening, clarity, colour grade |
| Music | `python work/synth.py`, `python work/synth_long.py` | Original music and SFX, generated in code (no licences needed) |

### 2. Voice post-production
| Step | Command | What it does |
|---|---|---|
| Noise removal | `work/audio/dfenv/Scripts/python work/audio/df_enhance.py` | DeepFilterNet3 speech enhancement |
| Voice chain | `python work/audio/voice_chain.py`, `python work/audio/voice_arjun2.py` | Match-EQ to a speech curve, de-ess, gentle compression, −16 LUFS, voice-meter data |

### 3. Render the picture (low-RAM safe: ≤ 3 workers, chunked)
```bash
sh work/render_chunks2.sh
```

### 4. Mix, master and assemble
```bash
python work/audio/mix2.py    # word-timed music ducking, chapter swells, SFX, −16 LUFS master
sh work/assemble2.sh         # join chunks + master audio → final MP4 (+ Opus copy for VS Code)
```

---

## Notes

- **Sync:** every speaker's audio is within 2–5 ms of their original recording.
- **VS Code playback:** VS Code's built-in player can't decode AAC audio. Use the Opus copy (`*_preview_vscode.mp4`) there, or play the main file in VLC or Media Player.
- **Captions:** Whisper mis-hears "Pragyan" as "ProGaN" or "Pryagyan". The fixes are in `src/captions.ts`.
- **Branding:** third-party branding was removed from the stock refinery still used in the establishing shot.

---

**Team Data_Jarvis GGV** · Smart India Hackathon 2026 · SIH26117
