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

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

print_usage() {
    sed -n '3,28p' "$0" | sed 's/^# \?//'
}

if [[ $# -lt 1 ]]; then
    print_usage
    exit 1
fi

INPUT_VIDEO="$1"
shift

if [[ ! -f "$INPUT_VIDEO" ]]; then
    echo "Error: Input video not found: $INPUT_VIDEO"
    exit 1
fi

# Operation flags
DO_TRIM=false
TRIM_START=""
TRIM_END=""
TRIM_DURATION=""

DO_JUMPCUT=false
JUMPCUT_THRESHOLD="-30"
JUMPCUT_DURATION="0.5"
JUMPCUT_PADDING="0.1"

DO_CAPTION=false
CAPTION_STYLE="standard"
CAPTION_MODEL="base"
CAPTION_LANGUAGE=""
CAPTION_SRT=""

DO_OVERLAY=false
OVERLAY_TEXT=""
OVERLAY_START="0"
OVERLAY_END=""
OVERLAY_POSITION="center"
OVERLAY_FONTSIZE="48"

DO_SPEED=false
SPEED_FACTOR=""

OUTPUT=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --trim-start)
            DO_TRIM=true
            TRIM_START="$2"
            shift 2
            ;;
        --trim-end)
            DO_TRIM=true
            TRIM_END="$2"
            shift 2
            ;;
        --trim-duration)
            DO_TRIM=true
            TRIM_DURATION="$2"
            shift 2
            ;;
        --jumpcut)
            DO_JUMPCUT=true
            shift
            ;;
        --jumpcut-threshold)
            JUMPCUT_THRESHOLD="$2"
            shift 2
            ;;
        --jumpcut-duration)
            JUMPCUT_DURATION="$2"
            shift 2
            ;;
        --jumpcut-padding)
            JUMPCUT_PADDING="$2"
            shift 2
            ;;
        --caption)
            DO_CAPTION=true
            shift
            ;;
        --caption-style)
            CAPTION_STYLE="$2"
            shift 2
            ;;
        --caption-model)
            CAPTION_MODEL="$2"
            shift 2
            ;;
        --caption-language)
            CAPTION_LANGUAGE="$2"
            shift 2
            ;;
        --caption-srt)
            CAPTION_SRT="$2"
            shift 2
            ;;
        --overlay-text)
            DO_OVERLAY=true
            OVERLAY_TEXT="$2"
            shift 2
            ;;
        --overlay-start)
            OVERLAY_START="$2"
            shift 2
            ;;
        --overlay-end)
            OVERLAY_END="$2"
            shift 2
            ;;
        --overlay-position)
            OVERLAY_POSITION="$2"
            shift 2
            ;;
        --overlay-fontsize)
            OVERLAY_FONTSIZE="$2"
            shift 2
            ;;
        --speed)
            DO_SPEED=true
            SPEED_FACTOR="$2"
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

INPUT_DIR="$(dirname "$INPUT_VIDEO")"
INPUT_BASENAME="$(basename "$INPUT_VIDEO" | sed 's/\.[^.]*$//')"
INPUT_EXT="$(basename "$INPUT_VIDEO" | sed 's/.*\.//')"

if [[ -z "$OUTPUT" ]]; then
    OUTPUT="${INPUT_DIR}/${INPUT_BASENAME}_edited.${INPUT_EXT}"
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

CURRENT_FILE="$INPUT_VIDEO"
STEP=0

next_intermediate() {
    STEP=$((STEP + 1))
    echo "${WORK_DIR}/step_${STEP}.${INPUT_EXT}"
}

echo "=== Video Edit Pipeline ==="
echo "Input: $INPUT_VIDEO"
echo ""

