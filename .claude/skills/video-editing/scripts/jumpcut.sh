#!/usr/bin/env bash
set -euo pipefail

# jumpcut.sh — Auto-remove silence/dead air from video using ffmpeg silencedetect
#
# Usage: ./jumpcut.sh <input_video> [options]
#
# Options:
#   --threshold <dB>     Silence threshold in dB (default: -30)
#   --duration <sec>     Minimum silence duration to cut, in seconds (default: 0.5)
#   --padding <sec>      Padding to keep around speech, in seconds (default: 0.1)
#   --output <path>      Output path (default: <input>_jumpcut.<ext>)
#
# Examples:
#   ./jumpcut.sh video.mp4
#   ./jumpcut.sh video.mp4 --threshold -35 --duration 0.8
#   ./jumpcut.sh video.mp4 --padding 0.15 --output edited.mp4

print_usage() {
    sed -n '3,14p' "$0" | sed 's/^# \?//'
}

if [[ $# -lt 1 ]]; then
    print_usage
    exit 1
fi

INPUT_VIDEO="$1"
shift

THRESHOLD="-30"
