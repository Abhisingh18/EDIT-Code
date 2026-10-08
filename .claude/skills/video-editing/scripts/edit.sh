#!/usr/bin/env bash
set -euo pipefail

# edit.sh — Main orchestrator for video editing operations
#
# Usage: ./edit.sh <input_video> [operations...]
#
# Operations (applied in order):
#   --trim-start <ts>      Trim: set start time
#   --trim-end <ts>        Trim: set end time
#   --trim-duration <sec>  Trim: set duration from start
#   --jumpcut              Remove silence/dead air
#   --jumpcut-threshold <dB>   Silence threshold (default: -30)
#   --jumpcut-duration <sec>   Min silence to cut (default: 0.5)
#   --jumpcut-padding <sec>    Padding around speech (default: 0.1)
#   --caption              Add captions (transcribe + burn in)
#   --caption-style <style>    hormozi, standard, minimal (default: standard)
#   --caption-model <model>    Whisper model (default: base)
#   --caption-language <lang>  Language code (default: auto)
#   --caption-srt <path>       Use existing SRT instead of transcribing
#   --overlay-text <text>      Add text overlay
#   --overlay-start <ts>       Overlay start time (default: 0)
#   --overlay-end <ts>         Overlay end time (default: start+5)
#   --overlay-position <pos>   center, top, bottom, etc. (default: center)
#   --overlay-fontsize <size>  Font size (default: 48)
#   --speed <factor>       Speed change (e.g., 1.5 for 1.5x, 0.5 for half speed)
#   --output <path>        Final output path (default: <input>_edited.<ext>)
#
# Examples:
#   ./edit.sh video.mp4 --jumpcut --caption --caption-style hormozi
#   ./edit.sh video.mp4 --trim-start 00:00:10 --trim-end 00:05:00 --speed 1.25
#   ./edit.sh video.mp4 --jumpcut --overlay-text "Subscribe!" --overlay-start 00:01:00

