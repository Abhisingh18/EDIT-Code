#!/bin/sh
# chunks -> one silent picture -> + mastered audio -> final deliverables (old finals backed up first)
set -e
cd "$(dirname "$0")/.."
printf "file 'chunks/c1.mp4'\nfile 'chunks/c2.mp4'\nfile 'chunks/c3.mp4'\nfile 'chunks/c4.mp4'\n" > out/chunks.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks.txt -c copy out/picture.mp4
echo "picture frames: $(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 out/picture.mp4)"
mkdir -p out/v1
for f in Pragyan_SIH26117_Final.mp4 Pragyan_SIH26117_preview_vscode.mp4; do
  [ -f ../$f ] && [ ! -f out/v1/$f ] && mv ../$f out/v1/$f || true
done
ffmpeg -v error -y -i out/picture.mp4 -i work/audio/master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart ../Pragyan_SIH26117_Final.mp4
ffmpeg -v error -y -i ../Pragyan_SIH26117_Final.mp4 -map 0:v -map 0:a -c:v copy -c:a libopus -b:a 192k -ar 48000 -movflags +faststart ../Pragyan_SIH26117_preview_vscode.mp4
echo "assembled"
