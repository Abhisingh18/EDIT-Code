#!/usr/bin/env bash
set -euo pipefail

# caption.sh — Burn SRT captions into video with style options
#
# Usage: ./caption.sh <input_video> <srt_file> [options]
#
# Options:
#   --style <style>    Caption style: hormozi, standard, minimal (default: standard)
#   --output <path>    Output video path (default: <input>_captioned.<ext>)
#
# Styles:
#   hormozi   — Bold, centered, large word-by-word captions (Alex Hormozi style)
#   standard  — Traditional bottom subtitles with semi-transparent background
#   minimal   — Small lower-third captions, clean and unobtrusive
#
# Examples:
#   ./caption.sh video.mp4 video.srt
#   ./caption.sh video.mp4 video.srt --style hormozi
#   ./caption.sh video.mp4 video.srt --style minimal --output final.mp4

print_usage() {
    sed -n '3,15p' "$0" | sed 's/^# \?//'
}

