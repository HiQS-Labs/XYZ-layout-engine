#!/bin/bash
# usage: gen.sh <poc1|poc2> [quality]
# One quoted, single create per run (SOP.md). Prompt = prompts/base.txt + prompts/<name>.txt.
# Raw job JSON and the PNG land in ${OUT:-$TMPDIR/higgsfield-raw}, outside the repo;
# never print or commit result_url's query string or the account email.
set -u
HERE=$(cd "$(dirname "$0")" && pwd); N=$1; QUALITY=${2:-medium}
OUT=${OUT:-${TMPDIR:-/tmp}/higgsfield-raw}; mkdir -p "$OUT"
P="$(cat "$HERE/prompts/base.txt")
$(cat "$HERE/prompts/$N.txt")"
ARGS=(--prompt "$P" --variant flare --quality "$QUALITY" --resolution 1k --aspect_ratio 16:9 --background opaque)
Q=$(higgsfield generate cost gpt_image_2_5 "${ARGS[@]}" --json | jq -r .credits)
B0=$(higgsfield account status --json | jq -r .credits)
echo "quote=$Q balance_before=$B0"
[[ "$Q" =~ ^[0-9.]+$ ]] || { echo "bad quote"; exit 1; }
higgsfield generate create gpt_image_2_5 "${ARGS[@]}" --wait --json > "$OUT/$N.job.json" 2> "$OUT/$N.err"; RC=$?
echo "create exit=$RC"
jq -r '.[0] | "status=\(.status) job_type=\(.job_type) bg=\(.params.background) id=\(.id)"' "$OUT/$N.job.json" 2>/dev/null || head -c 300 "$OUT/$N.err"
URL=$(jq -r '.[0].result_url // empty' "$OUT/$N.job.json" 2>/dev/null)
[ -n "$URL" ] && curl -fsSL "$URL" -o "$OUT/$N.png" && echo "saved $OUT/$N.png"
B1=$(higgsfield account status --json | jq -r .credits); echo "balance_after=$B1"
