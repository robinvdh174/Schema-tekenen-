#!/bin/bash
# ============================================================================
# SessionStart-hook voor Claude Code (web).
#
# Doel 1 (belangrijkste): controleren of er op de JUISTE live-branch gewerkt
#   wordt. Zo niet, dan verschijnt er een luide waarschuwing in de context van
#   Claude met de instructie om te stoppen en de gebruiker te verwittigen.
# Doel 2: dependencies installeren zodat build/typecheck in de web-sessie werken.
#
# De stdout van deze hook komt in de context van Claude terecht; daarom houden
# we de uitvoer kort en sturen we ruis (npm install) naar een logbestand.
# ============================================================================
set -uo pipefail

LIVE_BRANCH="claude/symbol-corrections-review-rn81ep"
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
BRANCH="$(git -C "$ROOT" branch --show-current 2>/dev/null || true)"
[ -z "$BRANCH" ] && BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"

if [ "$BRANCH" != "$LIVE_BRANCH" ]; then
  cat <<EOF
============================================================
⛔ VERKEERDE BRANCH — STOP, NIET AANPASSEN
   Huidige branch : $BRANCH
   Vereiste branch: $LIVE_BRANCH
   (de enige juiste live-/standaardbranch)

   Dit is eerder misgelopen. Maak GEEN wijzigingen. Meld dit
   eerst aan de gebruiker en schakel over naar de juiste branch
   voordat je verder werkt. Zie CLAUDE.md (STAP 0).
============================================================
EOF
else
  echo "[branch-check] OK — juiste live-branch ($LIVE_BRANCH)."
fi

# Dependencies installeren (enkel in de web-omgeving), ruis naar een logbestand.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  LOG="${TMPDIR:-/tmp}/arei-session-start-install.log"
  if (cd "$ROOT" && npm install) >"$LOG" 2>&1; then
    echo "[deps] OK — npm install voltooid (build/typecheck beschikbaar)."
  else
    echo "[deps] LET OP — npm install faalde. Zie $LOG."
  fi
fi

exit 0
