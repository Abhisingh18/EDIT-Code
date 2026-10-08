#!/usr/bin/env bash
set -euo pipefail

# transcribe.sh — Transcribe video/audio to SRT using Whisper
#
# Usage: ./transcribe.sh <input_file> [options]
#
# Options:
#   --model <model>      Whisper model: tiny, base, small, medium, large (default: base)
#   --language <lang>    Language code, e.g. en, es, fr (default: auto-detect)
#   --output <path>      Output SRT path (default: <input_basename>.srt)
#
# Examples:
#   ./transcribe.sh video.mp4
#   ./transcribe.sh video.mp4 --model medium --language en
#   ./transcribe.sh video.mp4 --output /tmp/captions.srt

WHISPER_BIN="${WHISPER_BIN:-$(command -v whisper 2>/dev/null || echo "whisper")}"

print_usage() {
    sed -n '3,12p' "$0" | sed 's/^# \?//'
}

if [[ $# -lt 1 ]]; then
    print_usage
    exit 1
fi
