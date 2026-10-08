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
MIN_SILENCE="0.5"
PADDING="0.1"
OUTPUT=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --threshold)
            THRESHOLD="$2"
            shift 2
            ;;
        --duration)
            MIN_SILENCE="$2"
            shift 2
            ;;
        --padding)
            PADDING="$2"
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

INPUT_DIR="$(dirname "$INPUT_VIDEO")"
INPUT_BASENAME="$(basename "$INPUT_VIDEO" | sed 's/\.[^.]*$//')"
INPUT_EXT="$(basename "$INPUT_VIDEO" | sed 's/.*\.//')"

if [[ -z "$OUTPUT" ]]; then
    OUTPUT="${INPUT_DIR}/${INPUT_BASENAME}_jumpcut.${INPUT_EXT}"
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Detecting silence..."
echo "Threshold: ${THRESHOLD}dB, Min duration: ${MIN_SILENCE}s, Padding: ${PADDING}s"

# Detect silence periods
SILENCE_LOG="${TEMP_DIR}/silence.log"
ffmpeg -i "$INPUT_VIDEO" \
    -af "silencedetect=noise=${THRESHOLD}dB:d=${MIN_SILENCE}" \
    -f null - 2>&1 | grep -E "silence_(start|end)" > "$SILENCE_LOG" || true

if [[ ! -s "$SILENCE_LOG" ]]; then
    echo "No silence detected — copying input as-is"
    cp "$INPUT_VIDEO" "$OUTPUT"
    echo "Output: $OUTPUT"
    exit 0
fi

