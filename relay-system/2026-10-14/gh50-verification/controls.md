# GH-50 verification evidence

Run in the disposable verify clone `XYZ-layout-engine-gh50-webp-artwork-2026-10-14-verify` at `bdf4e6f`
(Node v22.22.3, darwin-arm64). Each control mutates one boundary, runs the CLI, then restores it from git.

## Baseline digests (nutrition and solar-system unchanged)

| Recipe | Base `ed56529` | After `bdf4e6f` |
|---|---|---|
| nutrition png | `3321e800…0e93` | `3321e800…0e93` |
| nutrition svg | `708d351d…d373` | `708d351d…d373` |
| solar-system png | `b55c036c…32d9b` | `b55c036c…32d9b` |
| solar-system svg | `c5034e8e…eddf` | `c5034e8e…eddf` |

## Red controls (`controls.sh`), raw output

```
== baseline (all boundaries present)
satori png (expect refusal)                                Validation failed: [{"field":"backend","message":"WebP artwork is not rasterized by Satori/resvg; use --backend playwright for PNG"}]
playwright png,html,html-inline (expect ok)                ok (no error)
satori svg,html,html-inline (expect ok)                    ok (no error)
== (a) R4 refusal removed
satori png (expect silent success = the defect)            ok (no error)
== (b) R3(a) toHtml allowlist without webp
playwright png (expect trusted-images refusal)             Validation failed: [{"field":"src","message":"only embedded trusted images are supported"}]
== (b) R3(b) extractor without webp
playwright html (expect unsupported offline asset)         Validation failed: [{"field":"asset","message":"unsupported offline asset"}]
== (b) R3(c) publication check without webp: unexpected staged asset
playwright html (expect unexpected staged asset)           Validation failed: [{"field":"artifact","message":"unexpected staged asset"}]
== (b) R3(c) publication check without webp: invalid artifact path
playwright html (expect invalid artifact path)             ok (no error)
== (b) R3(c) publication check without webp: invalid artifact identity
playwright html (expect invalid artifact identity)         Validation failed: [{"field":"artifact","message":"invalid artifact identity/digest"}]
== (c) tampered webp byte
satori svg (expect webp digest mismatch)                   Validation failed: [{"field":"asset.examination","message":"webp digest mismatch"}]
== (d) lossy WebP without alpha (VP8)
VP8 
satori svg (expect requires transparent WebP)              ok (no error)
?? .relay-scratch/
```

Corrections to the raw output above, checked separately:

- Control (d) did fail as expected. The script's filter only captured `Validation failed`/`Error:` lines,
  and `inspectWebp` throws a plain error; the direct rerun printed
  `Unsupported WebP; requires transparent WebP` and rendered nothing.
- The manifest-path check (`render.mjs:477`) belongs to `verifyPublication`, which the CLI does not call;
  the CLI-only control therefore passed. Calling `verifyPublication` on both v6 exports:
  with WebP allowed `satori valid=true`, `playwright valid=true`; with `webp` removed from that check both
  returned `Validation failed: [{"field":"manifest","message":"invalid artifact path"}]`.

## Suite

`pnpm test`: 4/4 pass, `test-budget: PASS — 4 canaries in 41.0s (budget 60s)`.
