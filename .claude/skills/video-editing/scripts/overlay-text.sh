#!/usr/bin/env bash
set -euo pipefail

# overlay-text.sh — Add text overlays at specific timestamps
#
# Usage: ./overlay-text.sh <input_video> --text <text> [options]
#
# Options:
#   --text <text>        Text to overlay (required)
#   --start <timestamp>  When to show text (default: 00:00:00)
#   --end <timestamp>    When to hide text (default: start + 5 seconds)
#   --position <pos>     Position: center, top, bottom, top-left, top-right,
#                        bottom-left, bottom-right (default: center)
#   --fontsize <size>    Font size (default: 48)
#   --fontcolor <color>  Font color (default: white)
#   --bg <color>         Background color with opacity, e.g. black@0.5 (default: none)
#   --output <path>      Output path (default: <input>_overlay.<ext>)
#
# Examples:
#   ./overlay-text.sh video.mp4 --text "Subscribe!" --start 00:01:00 --end 00:01:05
#   ./overlay-text.sh video.mp4 --text "INTRO" --position top --fontsize 72 --bg black@0.5
#   ./overlay-text.sh video.mp4 --text "Like & Share" --position bottom-right --fontcolor yellow

print_usage() {
    sed -n '3,17p' "$0" | sed 's/^# \?//'
}

if [[ $# -lt 1 ]]; then
    print_usage
    exit 1
fi

INPUT_VIDEO="$1"
