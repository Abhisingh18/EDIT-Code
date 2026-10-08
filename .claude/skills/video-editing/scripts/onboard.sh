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

