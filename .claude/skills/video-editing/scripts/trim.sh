#!/usr/bin/env bash
set -euo pipefail

# trim.sh — Trim video by start/end timestamps
#
# Usage: ./trim.sh <input_video> [options]
#
# Options:
#   --start <timestamp>  Start time (default: 00:00:00) — format: HH:MM:SS or seconds
#   --end <timestamp>    End time (default: end of video) — format: HH:MM:SS or seconds
#   --duration <time>    Duration from start (alternative to --end)
#   --output <path>      Output path (default: <input>_trimmed.<ext>)
#
# Examples:
#   ./trim.sh video.mp4 --start 00:01:30 --end 00:05:00
#   ./trim.sh video.mp4 --start 10 --duration 60
#   ./trim.sh video.mp4 --start 00:00:30 --output clip.mp4

print_usage() {
    sed -n '3,14p' "$0" | sed 's/^# \?//'
}

if [[ $# -lt 1 ]]; then
    print_usage
    exit 1
fi

INPUT_VIDEO="$1"
shift

START=""
END=""
DURATION=""
OUTPUT=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --start)
            START="$2"
            shift 2
            ;;
        --end)
            END="$2"
            shift 2
            ;;
        --duration)
            DURATION="$2"
            shift 2
            ;;
        --output)
            OUTPUT="$2"
