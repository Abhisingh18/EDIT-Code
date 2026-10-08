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
