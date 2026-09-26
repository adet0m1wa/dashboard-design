#!/bin/bash
# Runs every phase flow (and the reduced-motion variants) against the dev server.
# Usage: bash scripts/test-all.sh [out-dir]
out="${1:-/tmp/hop-flows}"
status=0
for f in scripts/flows/phase*.mjs; do
  for mode in "" "--reduced"; do
    name="$(basename "$f" .mjs) ${mode}"
    result=$(node scripts/flow.mjs "$f" --out="$out" $mode 2>&1)
    summary=$(echo "$result" | grep -E "checks passed" | tail -1)
    fails=$(echo "$result" | grep -E "^FAIL|^CRASH|console errors" )
    printf "%-22s %s\n" "$name" "$summary"
    [ -n "$fails" ] && { echo "$fails" | sed 's/^/    /'; status=1; }
  done
done
exit $status
