#!/usr/bin/env bash
# GH-50 red controls. Run from the disposable verify clone root. Each control mutates one
# boundary, runs the probe, prints the outcome, then restores the file from git.
set -u
FIX=examples/2026-10-12-belief-reference/fixture.json
run() { # $1 label, $2 backend, $3 formats
  local out=".relay-scratch/ctl-$RANDOM"
  local msg
  msg=$(node tools/render.mjs "$FIX" --recipe recursive-process --backend "$2" --format "$3" --out "$out" 2>&1 >/dev/null | grep -v -i experimental | grep -o 'Validation failed.*\|Error: .*' | head -1)
  local rc=${PIPESTATUS[0]}
  printf '%-58s %s\n' "$1" "${msg:-ok (no error)}"
}
restore() { git checkout -q -- tools examples; }

echo "== baseline (all boundaries present)"
run "satori png (expect refusal)" satori png
run "playwright png,html,html-inline (expect ok)" playwright png,html,html-inline
run "satori svg,html,html-inline (expect ok)" satori svg,html,html-inline

echo "== (a) R4 refusal removed"
perl -pi -e 's/if \(raster && attempt === 0 && JSON\.stringify\(scene\)\.includes\(.data:image\/webp.\)\) throw/if (false) throw/' tools/render.mjs
run "satori png (expect silent success = the defect)" satori png
restore

echo "== (b) R3(a) toHtml allowlist without webp"
perl -pi -e 's/data:image\\\/\(png\|webp\|svg/data:image\\\/(png|svg/' tools/render.mjs
run "playwright png (expect trusted-images refusal)" playwright png
restore

echo "== (b) R3(b) extractor without webp"
perl -pi -e 's/\|image\\\/webp\|/|/ if /const match = /' tools/render.mjs
run "playwright html (expect unsupported offline asset)" playwright html
restore

for line in 'unexpected staged asset' 'invalid artifact path' 'invalid artifact identity'; do
  echo "== (b) R3(c) publication check without webp: $line"
  perl -pi -e "s/png\\|webp\\|svg\\|ttf/png|svg|ttf/ if /\Q$line\E/" tools/render.mjs
  run "playwright html (expect $line)" playwright html
  restore
done

echo "== (c) tampered webp byte"
f=examples/2026-10-12-belief-reference/assets/web/examination.webp
printf '\x00' | dd of="$f" bs=1 seek=100 conv=notrunc 2>/dev/null
run "satori svg (expect webp digest mismatch)" satori svg
restore

echo "== (d) lossy WebP without alpha (VP8)"
cwebp -quiet -q 80 -noalpha examples/2026-10-12-belief-reference/assets/web/examination.png -o "$f"
head -c 16 "$f" | tail -c 4; echo
run "satori svg (expect requires transparent WebP)" satori svg
restore
git status --short
