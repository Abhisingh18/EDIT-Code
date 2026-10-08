---
name: video-editing
description: Edit videos with ffmpeg and Whisper using natural language - trim, jump cuts (silence removal), captions (Hormozi/standard/minimal), text overlays, and speed changes. Use when the user wants to cut, caption, or edit a video file.
---

# Video Editing

Edit videos using natural language instructions. Supports trimming, jump cuts (silence removal), captions with multiple styles, text overlays, and speed changes — all powered by ffmpeg and Whisper.

## Usage

Give a video file path and describe what you want done:

```
Edit my video at ~/video.mp4 — remove silence, add Hormozi-style captions, and speed it up 1.25x
```

```
Trim ~/interview.mp4 from 00:02:00 to 00:15:00 and add standard captions
```

```
Add a "Subscribe!" text overlay at the 1 minute mark in ~/video.mp4
```

## Capabilities

### Trimming
Cut video to specific start/end timestamps or duration.
```bash
scripts/trim.sh video.mp4 --start 00:01:30 --end 00:05:00
```

### Jump Cuts (Silence Removal)
Auto-detect and remove silent/dead-air sections. Configurable threshold, minimum silence duration, and padding.
```bash
scripts/jumpcut.sh video.mp4 --threshold -30 --duration 0.5 --padding 0.1
```

### Captions
Transcribe audio with Whisper, then burn subtitles into video. Three caption styles:

| Style | Description |
|-------|-------------|
| **hormozi** | Bold, centered, large — Alex Hormozi word-by-word impact style |
| **standard** | Traditional bottom subtitles with semi-transparent background |
| **minimal** | Small lower-third captions, clean and unobtrusive |

```bash
scripts/transcribe.sh video.mp4 --model base --language en
scripts/caption.sh video.mp4 video.srt --style hormozi
```

### Text Overlays
