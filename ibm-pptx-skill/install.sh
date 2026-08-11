#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install.sh — IBM PPTX Skill installer
#
# Usage (one command, run from anywhere):
#   bash /path/to/.agents/skills/ibm-pptx/install.sh
#
# Or via curl from a shared location / git repo:
#   bash <(curl -fsSL https://your-host/skills/ibm-pptx/install.sh)
#
# What it does:
#   1. Copies the ibm-pptx skill into ~/.bob/skills/ibm-pptx/
#      (global install — available in every workspace for this user)
#   2. Optionally also installs into the current workspace's .agents/skills/
#      if run from inside a workspace (workspace-scope takes precedence over global)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SKILL_NAME="ibm-pptx"
GLOBAL_DEST="$HOME/.bob/skills/$SKILL_NAME"

# Resolve the directory this script lives in (works even when piped via curl)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"

# ── helpers ──────────────────────────────────────────────────────────────────
green()  { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }
red()    { printf '\033[0;31m%s\033[0m\n' "$*"; }

# ── locate source files ───────────────────────────────────────────────────────
if [[ -n "$SCRIPT_DIR" && -f "$SCRIPT_DIR/SKILL.md" ]]; then
  SRC="$SCRIPT_DIR"
else
  red "ERROR: Cannot locate SKILL.md next to install.sh."
  red "Make sure you run this script from within the skill directory, or clone the"
  red "repository first and run: bash .agents/skills/ibm-pptx/install.sh"
  exit 1
fi

# ── global install ────────────────────────────────────────────────────────────
echo ""
echo "Installing ibm-pptx skill → $GLOBAL_DEST"
mkdir -p "$GLOBAL_DEST"
cp "$SRC/SKILL.md"                "$GLOBAL_DEST/SKILL.md"
cp "$SRC/ibm-brand-guidelines.md" "$GLOBAL_DEST/ibm-brand-guidelines.md"
green "  ✓ Global install complete: $GLOBAL_DEST"

# ── workspace install (optional) ─────────────────────────────────────────────
# Detect if we're inside a workspace that already uses .agents/skills/
WS_AGENTS=".agents/skills"
if [[ -d "$WS_AGENTS" ]]; then
  WS_DEST="$WS_AGENTS/$SKILL_NAME"
  echo ""
  yellow "  Workspace .agents/skills/ detected."
  read -r -p "  Also install into workspace ($WS_DEST)? [y/N] " answer
  if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    mkdir -p "$WS_DEST"
    WS_DEST_ABS="$(cd "$WS_DEST" 2>/dev/null && pwd || echo "$WS_DEST")"
    SRC_ABS="$(cd "$SRC" && pwd)"
    if [[ "$SRC_ABS" == "$WS_DEST_ABS" ]]; then
      yellow "  Workspace destination is the same as source — already installed."
    else
      cp "$SRC/SKILL.md"                "$WS_DEST/SKILL.md"
      cp "$SRC/ibm-brand-guidelines.md" "$WS_DEST/ibm-brand-guidelines.md"
      green "  ✓ Workspace install complete: $WS_DEST"
    fi
  fi
fi

# ── done ──────────────────────────────────────────────────────────────────────
echo ""
green "╔══════════════════════════════════════════════════════════════════╗"
green "║  ibm-pptx skill installed successfully!                         ║"
green "╠══════════════════════════════════════════════════════════════════╣"
green "║  Start a new Bob conversation and try:                          ║"
green "║    /ibm-pptx                                                    ║"
green "║  Or just say:                                                   ║"
green "║    \"Generate an IBM pitch deck for watsonx\"                     ║"
green "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Skill files installed:"
echo "  $GLOBAL_DEST/SKILL.md"
echo "  $GLOBAL_DEST/ibm-brand-guidelines.md"
echo ""
echo "NOTE: The skill activates in the NEXT conversation — not the current one."
