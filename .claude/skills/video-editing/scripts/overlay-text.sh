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
shift

TEXT=""
START="0"
END=""
POSITION="center"
FONTSIZE="48"
FONTCOLOR="white"
BG=""
OUTPUT=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --text)
            TEXT="$2"
            shift 2
            ;;
        --start)
            START="$2"
            shift 2
            ;;
        --end)
            END="$2"
            shift 2
            ;;
        --position)
            POSITION="$2"
            shift 2
            ;;
        --fontsize)
            FONTSIZE="$2"
            shift 2
            ;;
        --fontcolor)
            FONTCOLOR="$2"
            shift 2
            ;;
        --bg)
            BG="$2"
            shift 2
            ;;
        --output)
            OUTPUT="$2"
            shift 2
            ;;
        *)
            echo "Error: Unknown option '$1'"
            print_usage
            exit 1
            ;;
    esac
done

if [[ ! -f "$INPUT_VIDEO" ]]; then
    echo "Error: Input video not found: $INPUT_VIDEO"
    exit 1
fi

if [[ -z "$TEXT" ]]; then
    echo "Error: --text is required"
    print_usage
    exit 1
fi

INPUT_DIR="$(dirname "$INPUT_VIDEO")"
