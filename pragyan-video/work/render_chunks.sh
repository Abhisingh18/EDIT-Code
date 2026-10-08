#!/bin/sh
# Silent picture render in 4 chunks (low-RAM safe). Re-running skips chunks that already exist.
cd "$(dirname "$0")/.."
mkdir -p out/chunks
render() {
  name=$1; range=$2
  if [ -s out/chunks/$name.mp4 ]; then echo "$name exists, skip"; return 0; fi
  for try in 1 2 3; do
    npx remotion render src/index.ts Pragyan out/chunks/$name.tmp.mp4 --frames=$range --codec h264 --crf 16 \
      --concurrency 3 --offthreadvideo-cache-size-in-bytes 805306368 --timeout 120000 --props work/props_none.json \
      --muted --overwrite > work/chunk_$name.log 2>&1
    if [ -s out/chunks/$name.tmp.mp4 ]; then mv out/chunks/$name.tmp.mp4 out/chunks/$name.mp4; echo "$name done (try $try)"; return 0; fi
    echo "$name failed (try $try): $(tr '\r' '\n' < work/chunk_$name.log | grep -E 'Error' | head -1)"
    powershell -NoProfile -Command "Get-Process chrome-headless-shell -ErrorAction SilentlyContinue | Stop-Process -Force" 2>/dev/null
    sleep 5
  done
  return 1
}
render c1 0-1337 && render c2 1338-2855 && render c3 2856-4589 && render c4 4590-5339 && echo "ALL CHUNKS DONE"
