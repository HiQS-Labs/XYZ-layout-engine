# MangaJDM verification — 2026-10-11

Three final 1080×1920 posts passed local rendering, offline export and catalog checks on Node v22.22.3, macOS arm64. Base: `a9aabf1d3dfd68923d091f202b5f463e96cfba94`. No paid image calls, new dependencies, registered tests or CI workflows.

## Observed checks

- Frozen-lockfile install passed in the fresh full clone. Existing `pnpm test`: **4/4 in31.9seconds**, within the unchanged60second budget. Full output: [canaries.log](../../relay-system/2026-10-11/gh28-verification/canaries.log).
- Each selected export passed `verifyPublication`; stable PNG/SVG copies match manifest-selected immutable artifacts. PNG dimensions are1080×1920. Two fresh Satori rerenders per post produce identical PNG/SVG SHA-256s. Playwright renders also pass fitting and catalog validation. Both backends retain intended sizes: headline100, deck/CTA32, website36 and labels24px.
- All six relocated compact/inline HTML files loaded three images and Inter400/700 with **zero HTTP(S) requests**. All eight named text nodes per post stayed within x75–921/y160–1631 and had no scroll overflow. These bounds describe this composition, not a platform specification.
- A saved-copy `--set deck=... --save ...` changed only that text; the original fixture stayed byte-identical, and a fresh PNG/SVG render matched the edited publication. Unsupported artwork and a wrong canvas were refused. Swapping a display asset with another valid PNG was refused by its digest; original bytes were restored and checked.
- CLI `add`/`publish` registered `mangajdm-promo@1.0.0`; CLI `design add` recorded all three date-slug designs. Readback matches fixture hashes, primary PNG hashes and recipe pins. `catalog verify` and `export --check` exit0. Duplicate design ID exits1 with exact dump/log bytes preserved. Every original catalog row and the original append-only log prefix remain intact; six designs total, no new grammar-review trigger.
- All four selected source-file hashes still match provenance. Final PNGs and gallery screenshot were inspected: R34 silhouette retained, complete four-car Integra artwork visible, full supplied model/shirt print retained, English text readable, apparel concept label present.

[verification.json](verification.json) contains measured bounds, hashes, controls and runtime. [catalog-commands.json](catalog-commands.json) records the actual final CLI writes and renders. The one-off author acceptance probe was local scratch, not a new maintained suite; its transcript is [manual.log](../../relay-system/2026-10-11/gh28-verification/manual.log). Independent plan and final reviews are separate native relay receipts under `relay-system/2026-10-11/`.

PDDA `run` exited0 with no errors and two pre-existing governance warnings: missing installed `.claude/skills/pdda/SKILL.md` reference and unused `PDDA_SYNC_TMP` reference. Those unchanged installed-governance files are outside this task. [pdda.log](../../relay-system/2026-10-11/gh28-verification/pdda.log). RELEASES CLI check initially generation51/55receipts; final-QA S1 CLI repoint corrected the structured plan pointer, with clean readback/check at generation52/56receipts. [Ledger repair receipt](../../relay-system/2026-10-11/gh28-verification/ledger-repoint.json).

## Findings resolved before final registration

Initial Chromium fitting exposed headline leading shorter than Inter glyph height. Only this new recipe's line-height/region was corrected; shared fitting and containment checks stayed strict. Integra and apparel use contain to preserve complete supplied imagery. An early local draft registration was preserved in task-clone scratch and rolled back to the exact origin catalog/log checkpoint before final CLI registration; no committed or remote catalog history was rewritten. The acceptance probe also corrected its assumptions about the existing publication summary, design hash field names and CLI error handling; these were probe fixes, not product API changes.

## Recheck and boundaries

Use the render/edit and catalog commands in [README.md](README.md); run `pnpm test` and `utils/pdda/pdda.sh run` from the repo root. Recipe content digest: `567cba8527914dd1b483c5c3c4a6e349201d5046609960bce96e6399bb2c8204`.

The artwork is supplied imagery, with source Japanese lettering baked into rasters. The apparel is a concept/mockup. Live store availability was not established. Actual TikTok/Instagram overlay and feed-crop previews still belong to the upload step; these are9:16 masters, with no claim about every placement. Nothing was posted to a social account. A changed cataloged design requires a new design ID; changed declared recipe bytes require a new version. The catalog retains its pre-existing two-file dump/log recovery limitation and deferred layout grammar fields.

## Independent QA

Native Codex plan QA Approved in Round1. Final native Codex QA Approved in Round2, driver exit0 and [attestation](../../relay-system/2026-10-11/gh28-final-attestation.json) on reviewed04160ed3bf932c5559bcd93674e58855b54231a5. [Full review](../../relay-system/2026-10-11/gh28-final.codex.md) independently reproduces PNG/SVG bytes, text fit, design pins/hashes and red controls, plus visual inspection. S1 structured plan pointer was repaired through CLI; no open Blocker/Should. These final receipt/document edits change no published recipe or output bytes.

## Integration repair — 2026-10-12

Integrated main da97d78. The changelog repair removes one extra heading blank line and preserves all dated sections; canonical CLI replay preserves both GH28 and GH34 ledger rows/ratings. Current public-repo policy required replacing home-directory prefixes in three relay files. Native attestation values describe the original review bytes; their path strings are now redacted archival metadata. Original review commits remain in Git history.

The three export receipts now use repo-relative input paths. Existing `publishArtifacts` created new immutable selected runs and manifest hashes from the same render/artifact bytes; earlier runs remain recoverable in Git history and private scratch. PNG/SVG/compact and inline HTML/fonts/images are byte-identical, catalog recipe digest and design hashes unchanged. [Republication receipt](../../relay-system/2026-10-12/gh28-merge-verification/republication.json). No published recipe content or runtime guard changed.

Integration gate status: **held**, not a new passing-suite claim. Six attempts hit the unchanged60s deadline, including a clean-main control; see [attempt evidence](../../relay-system/2026-10-12/gh28-merge-verification/deadline-attempts.json). Current catalog/publications and pre-merge ledger gate pass; original artwork and native QA remain intact. Resume full canaries when host load is reduced before merging.

The integration hold is resolved: after concurrent workloads were paused, the unchanged suite passed4/4 in41.0s (zero skips) on6a059ed, with the default environment and60s budget. [Passing canaries](../../relay-system/2026-10-12/gh28-merge-verification/resumed-canaries.log). Catalog and ledger checks remain clean. Earlier deadline evidence is retained as history.
