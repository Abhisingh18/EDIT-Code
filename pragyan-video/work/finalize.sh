#!/bin/sh
# render output -> limited audio master + VS Code preview copy
set -e
cd "$(dirname "$0")/.."
IN=${1:-out/pragyan_final_v2.mp4}
ffmpeg -v error -y -i "$IN" -c:v copy -af "alimiter=limit=0.87:attack=5:release=60:level=disabled" -c:a aac -b:a 256k -ar 48000 -movflags +faststart ../Pragyan_SIH26117_Final.mp4
ffmpeg -v error -y -i ../Pragyan_SIH26117_Final.mp4 -map 0:v -map 0:a -c:v copy -c:a libopus -b:a 192k -ar 48000 -movflags +faststart ../Pragyan_SIH26117_preview_vscode.mp4
echo "finalized"
