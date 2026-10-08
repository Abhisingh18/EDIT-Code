#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# video-editing-skill — Onboard Script
#
# Checks system dependencies, makes scripts executable,
# and installs the skill for OpenClaw / Claude Code.
#
# Usage:
#   ./scripts/onboard.sh              # install (symlink mode)
#   ./scripts/onboard.sh --copy       # install (copy mode)
#   ./scripts/onboard.sh --uninstall  # remove skill
#   ./scripts/onboard.sh --check      # dependency check only
# ──────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(dirname "$SCRIPT_DIR")"
SKILL_NAME="video-editing-skill"

# OpenClaw / Claude Code standard paths
OPENCLAW_SKILLS_DIR="${HOME}/.openclaw/skills"
CLAUDE_SKILLS_DIR="${HOME}/.claude/skills"

MODE="link"
if [[ "${1:-}" == "--copy" ]]; then
  MODE="copy"
elif [[ "${1:-}" == "--uninstall" ]]; then
  MODE="uninstall"
elif [[ "${1:-}" == "--check" ]]; then
  MODE="check"
fi

# ── Helpers ──────────────────────────────────────────────────

has_cmd() { command -v "$1" &>/dev/null; }

print_header() {
  echo ""
  echo "  video-editing-skill"
  echo "  ==================="
  echo "  6 scripts | FFmpeg + Whisper | Bash"
  echo ""
}

print_ok()   { printf "    %-18s %s\n" "$1" "OK ($2)"; }
print_fail() { printf "    %-18s %s\n" "$1" "MISSING"; }
print_skip() { printf "    %-18s %s\n" "$1" "SKIP ($2)"; }

# ── Uninstall ────────────────────────────────────────────────

if [[ "$MODE" == "uninstall" ]]; then
  print_header
  echo "  Uninstalling..."
  echo ""

  removed=0

  for skills_dir in "$OPENCLAW_SKILLS_DIR" "$CLAUDE_SKILLS_DIR"; do
    target="$skills_dir/$SKILL_NAME"
    if [[ -L "$target" || -d "$target" ]]; then
      rm -rf "$target"
      echo "  [-] removed: $target"
      removed=$((removed + 1))
    fi
  done

  if [[ $removed -eq 0 ]]; then
    echo "  Nothing to remove."
  fi

  echo ""
  echo "  Done."
  echo ""
  exit 0
fi

# ── Preflight: Check Dependencies ────────────────────────────

print_header

echo "  [1/3] Checking dependencies"
echo "  ---------------------------"

errors=0
warnings=0

# FFmpeg (required)
if has_cmd ffmpeg; then
  version="$(ffmpeg -version 2>/dev/null | head -1 | sed 's/ffmpeg version \([^ ]*\).*/\1/')"
  print_ok "ffmpeg" "$version"
else
  print_fail "ffmpeg"
  errors=$((errors + 1))
fi

# ffprobe (required, ships with FFmpeg)
if has_cmd ffprobe; then
  print_ok "ffprobe" "bundled with ffmpeg"
else
  print_fail "ffprobe"
  errors=$((errors + 1))
fi

# Whisper (optional — only needed for captions)
whisper_missing=false
if has_cmd whisper; then
  print_ok "whisper" "captions enabled"
else
  print_skip "whisper" "captions unavailable"
  whisper_missing=true
  warnings=$((warnings + 1))
fi

# Bash version check
bash_version="${BASH_VERSION%%(*}"
if [[ "${BASH_VERSINFO[0]}" -ge 4 ]]; then
  print_ok "bash" "$bash_version"
else
  print_ok "bash" "$bash_version — v4+ recommended"
  warnings=$((warnings + 1))
fi

echo ""

if [[ $errors -gt 0 ]]; then
  echo "  BLOCKED: $errors required dependency missing."
  echo ""
  echo "  Install FFmpeg:"
  echo "    macOS:        brew install ffmpeg"
  echo "    Ubuntu/Debian: sudo apt install ffmpeg"
  echo "    Arch:          sudo pacman -S ffmpeg"
  echo "    Windows:       choco install ffmpeg"
  echo ""
  if [[ "$MODE" == "check" ]]; then
    exit 1
  fi
  echo "  Continuing setup anyway (scripts will fail without FFmpeg)."
  echo ""
fi

if [[ "$whisper_missing" == true ]]; then
  echo "  Whisper not found (optional — only needed for captions)."
  echo "  Install: pip install openai-whisper"
  echo ""
fi

if [[ "$MODE" == "check" ]]; then
  if [[ $errors -eq 0 ]]; then
    echo "  All required dependencies found."
  fi
  echo ""
  exit 0
fi

# ── Step 2: Make Scripts Executable ──────────────────────────

echo "  [2/3] Making scripts executable"
echo "  --------------------------------"

for script in "$SCRIPT_DIR"/*.sh; do
  name="$(basename "$script")"
  if [[ ! -x "$script" ]]; then
    chmod +x "$script"
    printf "    %-18s %s\n" "$name" "chmod +x"
  else
