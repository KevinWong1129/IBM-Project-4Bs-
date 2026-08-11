#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install.sh — frontend-slides Bob Skill installer
#
# Usage (one command, run from anywhere):
#   bash /path/to/frontend-slides/install.sh
#
# Or via curl from the GitHub repo:
#   bash <(curl -fsSL https://raw.githubusercontent.com/KevinWong1129/IBM-Project-4Bs-/main/frontend-slides/install.sh)
#
# What it does:
#   Copies the entire frontend-slides skill into ~/.bob/skills/frontend-slides/
#   (global install — available in every workspace for this user)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SKILL_NAME="frontend-slides"
GLOBAL_DEST="$HOME/.bob/skills/$SKILL_NAME"

# Resolve the directory this script lives in
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"

# The actual skill files live in skills/frontend-slides/ relative to this script
SRC="$SCRIPT_DIR/skills/$SKILL_NAME"

# ── helpers ──────────────────────────────────────────────────────────────────
green()  { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }
red()    { printf '\033[0;31m%s\033[0m\n' "$*"; }

# ── locate source files ───────────────────────────────────────────────────────
if [[ ! -f "$SRC/SKILL.md" ]]; then
  red "ERROR: Cannot locate SKILL.md at $SRC"
  red "Make sure you run this script from within the frontend-slides directory:"
  red "  bash frontend-slides/install.sh"
  red "Or clone the repo first:"
  red "  git clone https://github.com/KevinWong1129/IBM-Project-4Bs-.git"
  red "  bash IBM-Project-4Bs-/frontend-slides/install.sh"
  exit 1
fi

# ── global install ────────────────────────────────────────────────────────────
echo ""
echo "Installing $SKILL_NAME skill → $GLOBAL_DEST"

# Remove stale install, then copy fresh
rm -rf "$GLOBAL_DEST"
cp -r "$SRC" "$GLOBAL_DEST"

green "  ✓ Global install complete: $GLOBAL_DEST"
echo ""
echo "  Installed files:"
find "$GLOBAL_DEST" -type f | sed "s|$GLOBAL_DEST/|    |" | sort

# ── workspace install (optional) ─────────────────────────────────────────────
WS_AGENTS=".agents/skills"
if [[ -d "$WS_AGENTS" ]]; then
  WS_DEST="$WS_AGENTS/$SKILL_NAME"
  echo ""
  yellow "  Workspace .agents/skills/ detected."
  read -r -p "  Also install into workspace ($WS_DEST)? [y/N] " answer
  if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    SRC_ABS="$(cd "$SRC" && pwd)"
    WS_DEST_ABS="$(mkdir -p "$WS_DEST" && cd "$WS_DEST" && pwd)"
    if [[ "$SRC_ABS" == "$WS_DEST_ABS" ]]; then
      yellow "  Workspace destination is the same as source — already installed."
    else
      rm -rf "$WS_DEST"
      cp -r "$SRC" "$WS_DEST"
      green "  ✓ Workspace install complete: $WS_DEST"
    fi
  fi
fi

# ── done ──────────────────────────────────────────────────────────────────────
echo ""
green "╔══════════════════════════════════════════════════════════════════╗"
green "║  frontend-slides skill installed successfully!                  ║"
green "╠══════════════════════════════════════════════════════════════════╣"
green "║  Start a new Bob conversation and try:                          ║"
green "║    /frontend-slides                                             ║"
green "║  Or just say:                                                   ║"
green "║    \"Create an HTML presentation about IBM watsonx\"              ║"
green "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "NOTE: The skill activates in the NEXT conversation — not the current one."
