#!/bin/bash
# Block skill usage when gstack is not installed globally.
set -uo pipefail

# Drain the PreToolUse payload. Claude Code writes tool JSON to stdin; exiting
# without reading it can hand the caller an EPIPE.
cat >/dev/null 2>&1 || true

if [ ! -d "$HOME/.claude/skills/gstack/bin" ]; then
  cat >&2 <<'MSG'
BLOCKED: gstack is not installed globally.

gstack is required for AI-assisted work in this repo.

Install it:
  git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
  cd ~/.claude/skills/gstack && ./setup --team

Then restart your AI coding tool.
MSG
  # Two shapes on purpose: hookSpecificOutput is the documented PreToolUse
  # contract, the flat key is the older form some builds still read. Exit 2 is
  # what actually blocks the call, so the guard holds even if neither shape is
  # parsed - a deny that exits 0 reads as "allowed".
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"gstack is required but not installed. See stderr for install instructions."},"permissionDecision":"deny","message":"gstack is required but not installed. See stderr for install instructions.","systemMessage":"gstack is required but not installed. See stderr for install instructions."}'
  exit 2
fi

echo '{}'
exit 0
