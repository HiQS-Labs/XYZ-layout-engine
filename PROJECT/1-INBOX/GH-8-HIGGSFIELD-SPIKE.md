---
gh_issue: 8
source: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/8
title: "Add Higgsfield MCP connector as a first-class transparent image generation provider (pluggable provider architecture)"
status: "Phase 0 landed in PR #15 (4d9aa2c) on 2026-10-09 with a NO-GO verdict on REST; Phases 1 to 4 stay open (issue #8 open)."
created: 2026-10-09
doc_type: feedback
effort: 3
complexity: 3
risk: 3
phases: 5
ratings_provisional: true
related:
  - PROJECT/1-INBOX/GH-5-MVP-FOUNDATION.md
  - examples/2026-10-08-solar-system/README.md
  - examples/2026-10-09-rag-system/README.md
reversibility: "Easy for this slice (new example folder and docs); the spend is not recoverable, so it is capped. The later provider contract is Costly once more providers depend on it."
---

# GH-8 — Higgsfield Phase 0 spike and cell-division example

## Why

Issue #8 gates the whole provider architecture on one unverified fact: does any Higgsfield surface return a real alpha channel for GPT Image 2.5 (Flare, Sunburst)? Higgsfield's documented Flare schema has no transparency field. This slice answers that with measurement, and ships the result as a worked example (a basic cell division diagram) so the answer is concrete rather than a memo.

The operator supplied a Higgsfield API key file and a hard spend cap of **$2.00** for the spike, and asked that the PNG transparency settings for Images 2.5 be tried explicitly.

## Recon (base `65439d9`, 2026-10-09)

- Read in full: issue #8 body and its five recon comments (including the consolidated Phase 0 to 4 checklist), `examples/2026-10-08-solar-system/generate-assets.py` and README (the HiQS generation pattern, receipts, `provenance.json`), `examples/2026-10-09-rag-system/` (the diagram pattern).
- Higgsfield docs read 2026-10-09: the Flare page (`POST https://api.higgsfield.ai/marketing-studio/image/flare`, header `Authorization: Key ID:SECRET`, `Idempotency-Key`, input fields `prompt`, `quality`, `resolution`, `aspect_ratio`, `image_urls`, `preset_id`, `moderation`, `enhance_prompt`; `additionalProperties: false`; async `request_id`, `status_url`, result `images[].url`); authentication, errors, billing pages. Only successful generations are charged; `failed` and `nsfw` are not; whether a 4xx validation rejection is charged is not stated. An estimate endpoint exists (`POST /estimate/<endpoint-id>`, response `credits` and `usd`) and its value is "the authoritative amount". There is no balance endpoint. Output is kept at least 7 days.
- The published OpenAPI document lists only `higgsfield-ai/soul/standard` as an image path (fields `prompt`, `num_images`, `resolution`, `aspect_ratio`); none of its paths or fields mention transparency. Marketing Studio pages are not in the docs index, so any other Marketing Studio endpoint id is unknown here.
- The MCP connector (`https://mcp.higgsfield.ai/mcp`) is **not testable in this session**: no Higgsfield tool is connected and its OAuth flow cannot run here. This slice tests REST only and records MCP as untested.
- The credential file is one `KEY_ID:SECRET` line, mode 644. It stays outside the repo; the script reads its path from an environment variable.
- Constraints from the issue: no contract or provider code until GH-5's marathon lands (that branch is still unmerged), so this slice adds no engine, contract or shared-layer code.
- Not traced: the console's model list, the MCP tool list, rate limits for this account.

## Requirements

1. `examples/2026-10-09-cell-division/higgsfield-spike.py` runs the Phase 0 probe matrix against REST only: schema probes sending `background: "transparent"`, `output_format: "png"` and both, on Flare and (if its endpoint exists) Sunburst; prompt-only runs (3 per variant at 1k, low quality); estimate-only discovery of other endpoint ids. Rejected probes are recorded with their error bodies after scrubbing (see requirement 3).
2. **Spend control.** Submissions run strictly one at a time (no concurrency), under an exclusive lock on the ledger so a second process refuses to start. Before every paid submit the script calls the estimate endpoint, writes a reserve row for it to an on-disk ledger and adds it to the running total (`ledger.jsonl`: label, endpoint, parameter hash, estimated credits and USD, request id, status), and refuses to submit if the total would pass **$1.90**. The $2.00 cap covers the whole slice, including the example's assets. A paid call is never resubmitted blindly: an ambiguous failure stops the run and is reported.
3. **Secrets.** The key path comes from the environment variable `HIGGSFIELD_KEY_FILE`. At startup the script `stat`s the file and refuses to run unless it is mode 600 or 400 (no group or world access), printing the `chmod 600` command to fix it; the recon note records that the operator's file is currently mode 644, so the operator must tighten it before the spike runs (one command, already advised). Red control: a dummy key file at mode 644 must abort before any read of its contents. the key is never printed, logged, written to the ledger or receipts, or placed in a URL. Every error body, exception message, header dump and URL is scrubbed of the key ID and secret (replaced with `***`) before it is printed or written. A pre-commit check searches the staged diff, the ledger and the findings for the key ID and secret strings and must find none. Red control: a mock 4xx body containing the secret must be recorded scrubbed, and a throwaway file containing the key ID must make the scan fail.
4. **Inspection.** Every returned file is checked by content type, URL extension and magic bytes, plus PNG color type from the header, plus decoded alpha statistics (`hasAlphaChannel`, `transparentPixelRatio`, `opaqueCornerCount`, minimum alpha) from a short Node script, `examples/2026-10-09-cell-division/inspect-alpha.mjs`, that decodes the image with the pinned runtime's Chromium (canvas pixel read). No hand-written PNG decoder. The method is proven first on known files: a committed transparent Solar System web PNG must pass and the opaque Solar System poster must fail.
5. `examples/2026-10-09-cell-division/FINDINGS.md` records per surface: schema accepts a transparency flag (Y/N, exact error), real alpha returned (Y/N), format, latency, credits per call, and the verdict GO, NO-GO or UNCERTAIN under the issue's definitions (UNCERTAIN counts as NO-GO for transparent generation). MCP is recorded as untested.
6. `examples/2026-10-09-cell-division/` also holds the diagram "How cells reproduce (mitosis)": fixture-driven, rendered through the pinned runtime in `examples/2026-10-08-solar-system/runtime/` by the same pattern as the RAG example (both backends, required stage ids, geometry checks, red controls on throwaway copies, both PNGs inspected). Stages: interphase, prophase, metaphase, anaphase, telophase, cytokinesis, plus a short "why it matters" panel. Art follows the verdict: Higgsfield assets with provider provenance if GO; hand-drawn SVG icons if NO-GO or UNCERTAIN. Nothing keyed or matted is presented as native transparency.
7. Provenance for every Higgsfield asset used: provider, endpoint, parameters, request id, sha256, alpha statistics, credits and USD.
8. README, `CHANGELOG.md` entry, and a findings comment on issue #8 once the verdict is known.

## Non-goals

- No provider contract, shared layer, `ingest` operation, or change to `tools/spike/**`, `package.json`, `test-budget.json`. No new test, workflow or dependency. No background-removal or matting step (a separate issue if the verdict needs one).
- No Higgsfield skill or connector code in this slice. A skill documenting unverified transparency would overclaim; it follows the verdict, and the contract phases follow GH-5.
- No MCP testing, and no use of the key beyond `api.higgsfield.ai` and the result image URLs it returns.

## Bet and rejected alternatives

- Bet: a bounded REST probe settles whether Higgsfield exposes alpha for Images 2.5, and a real worked diagram tests the output in use. Failure mode: results are inconsistent (intermittent mattes) or the answer lives only in the MCP surface this session cannot reach; both are recorded as UNCERTAIN or untested rather than guessed.
- Rejected: building the provider contract now (blocked by GH-5 and by the verdict); matting with a local tool to fake a GO (a different capability); testing MCP by guessing its protocol.
- Spend: capped at $2.00; the ledger is the evidence. Rollback of the code is Easy; money spent is not.

## Verification (existing checks only)

- Inspector controls pass and fail as stated (requirement 4), shown in the findings. Spend-gate check: a dry run with the ledger pre-set to $1.80 and a $0.094 estimate must accept the first call (total $1.894, at or under $1.90) and refuse the second (total $1.988); a second process started while one runs must refuse to start.
- Every paid call appears in `ledger.jsonl`; total estimated USD at the end is at or under $1.90, and the file is committed.
- Secret scan finds neither the key ID nor the secret in the staged diff, ledger or findings. Red controls: the mock-error scrub and the throwaway-file scan above.
- The example renders to `PASS` in both backends; three red controls fail by named id and are restored (as the RAG example).
- `utils/pdda/pdda.sh run` has no errors, `releases check` is clean. `pnpm test` is not required (no `tools/spike/**` change) and is not run in a path containing a space.

## Ordered implementation

1. Write the Node alpha inspector and prove it on the two control files.
2. Write the spike runner with ledger, estimate-before-submit and secret handling; dry-run it with estimates only (free) and review the projected spend.
3. Run schema probes, then the prompt-only runs, inspecting each file as it arrives; stop on any anomaly or at the cap.
4. Record the verdict in `FINDINGS.md`.
5. Build the cell-division example per the verdict; render; red controls; inspect both PNGs.
6. README, changelog, secret scan, PDDA and ledger checks; commit; final relay QA; PR with `Refs #8` (the issue stays open).

## Per-issue map

| Issue | Requirement | State |
|---|---|---|
| #8 | Phase 0 (spike) via requirements 1 to 5; example via 6 and 7; docs via 8. Phases 1 to 4 untouched. | Phase 0 done; verdict NO-GO on REST (MCP untested); example built with SVG art; awaiting final QA, then PR (ready, not merged); #8 stays open |

## Rating rationale (2026-10-09)

pri 40 / sev 10 / appeal 50 / effort 30. Severity: a missing provider option, no data or work at risk. Priority: the operator asked for it now and it gates later provider work. Appeal: neutral default. Effort: multi-phase work with an external paid dependency and an unverified premise. Recurrence: not applicable (not a defect); trend unknown. This rates the whole issue; this slice is its first phase.

## Evidence and deviations (2026-10-09)

| Item | Result |
|---|---|
| Plan QA | Agy, 3 rounds, Approved (Codex's backend returned 503 twice, so the reviewer was changed at the operator's direction) |
| Code QA | Agy, 3 rounds. Rounds 1 and 2 passed after the estimate-404 fallback; round 3 (after the live pricing finding) raised two blockers, `NaN` bypassing the gate and a malformed quote under-reserved, both fixed in `8c525ae` and verified by the final reviewer (selftest 8/8, code read); no fourth round because the cap was exhausted |
| Selftest | 8/8 controls pass (mode 644 refused, mock 4xx scrubbed, spend gate 1.894 / 1.988, lock, secret scan red/green, inspector controls, estimate fallback, malformed quotes); each mutation fails its control |
| Free live checks | Estimate route for Flare and Sunburst returns a pricing description, not a quote; `generate-and-edit` is `model_not_found` (404) |
| Paid matrix | 12 of 12 accepted, completed, opaque RGB PNG; ledger total reserved $1.20 (assumed $0.10 each) |
| Verdict | NO-GO on REST; MCP untested (see `examples/2026-10-09-cell-division/FINDINGS.md`) |
| Diagram | `PASS`, three red controls fail by named id, both PNGs inspected |

Deviations from the plan: (1) the estimate route gave no price, so spend was controlled by an assumed $0.10 per 1k/low call instead of a quoted estimate; the real charge is unmeasured. (2) Requirement 3's secret scan found the real key ID and secret nowhere (see commit message). (3) The key file was mode 644 and was tightened to 600 by the orchestrator with the operator's explicit permission, as the runner requires.

## Phase 0b: the CLI route (added 2026-10-09, after the REST NO-GO)

### Why

The REST route returned no alpha (PR #15). The installed Higgsfield CLI (`higgsfield` 1.1.26, OAuth-signed-in, workspace "Private", starter plan, 701 credits) exposes the same model as `gpt_image_2_5` with a `background` parameter (`auto`, `opaque`, `transparent`), `variant` (`flare`, `sunburst`), `quality`, `resolution`, `aspect_ratio` and `image_references`. It also lists an `image_background_remover` model. Whether `--background transparent` returns a real alpha channel is untested. The operator approved up to **20 credits** and asked that two of the six cell images in the cell-division diagram be replaced with transparent PNGs if that works. Findings so far were posted on #8 (comment 6092825389).

### Recon (2026-10-09, read-only; nothing generated)

- `higgsfield generate cost gpt_image_2_5 --background transparent --variant {flare,sunburst} --quality {low,medium} --resolution 1k` returns 0.25 credits (low) and 0.5 credits (medium) for either variant. The CLI price check is a number, unlike the REST estimate route. `higgsfield account status` prints the balance, so real spend can be measured by balance difference.
- `higgsfield generate create <job_type> [--param value]... --wait` blocks until the job finishes and prints result URLs; `--json` gives raw JSON. Its output shape is not yet known and the first paid call will reveal it.
- The CLI owns its OAuth token. This slice never reads, prints or stores that token; the script only shells out to `higgsfield`.
- Reused: `examples/2026-10-09-cell-division/inspect-alpha.mjs` (alpha inspector, already proven on known files) and the diagram's render script and checks. The REST runner `higgsfield-spike.py` stays as is.
- Not traced: the CLI's token location, rate limits, other models' `background` options, the MCP connector.

### Requirements

1. `examples/2026-10-09-cell-division/higgsfield-cli-spike.py` (Python standard library; calls the `higgsfield` CLI by subprocess; no network code of its own, no credential handling). Subcommands: `selftest` (offline, against a fake `higgsfield` shim) and `run`.
2. **Spend control.** Hard cap 20 credits for this slice. Before every create the script runs `generate cost` with the same parameters and `account status`; it refuses unless (credits already spent, measured as starting balance minus current balance, taken as the larger of that and the sum of estimates) plus this estimate is at most 20. Calls run strictly one at a time under an exclusive file lock. No create is ever retried; an ambiguous outcome stops the run. Every call is recorded in `cli-spike-ledger.jsonl` (label, parameters, estimate, balance before and after, job id, result file hash, inspector result). If the CLI cannot report a numeric cost or balance, the run stops.
3. **Matrix** (about 2 credits). T1 interphase and T2 cytokinesis prompts on `gpt_image_2_5 --variant flare --quality low --resolution 1k --background transparent` (these two are also the candidate diagram images); T3 sunburst, low, transparent; T4 flare, medium, transparent; C1 flare, low, `--background opaque` (control showing the parameter's effect). The first call is a smoke test whose output shape the script then parses. Downloads go to a temp folder outside the repo; result URLs are stored without query strings.
4. **Inspection.** Every image is checked with `inspect-alpha.mjs` (real alpha requires minimum alpha below 255 and a non-zero transparent share) and viewed by the operator-side reviewer for baked checkerboards, white boxes or fringes. Verdict for the CLI route: GO if at least one image has real alpha and looks clean; otherwise NO-GO.
5. **Diagram.** If GO, replace the `interphase` and `cytokinesis` icons in `render-diagram.mjs` and `fixture.json` with downscaled transparent PNGs (`assets/web/<id>.png`, web size, committed; originals not committed, hashes recorded). A stage may carry an optional `image` field; the script must (a) still produce exactly one `asset_<id>` image node per stage, (b) refuse a raster asset that is not real alpha, (c) record asset digests, provider, model, parameters, job id, credits and alpha statistics in `provenance.json`, and (d) keep every existing check (required ids, both backends, geometry, overflow, overlap). The other four stages keep their hand-drawn SVG icons. Both PNGs and the HTML viewer are rendered and inspected; three red controls (overflow, missing icon, off-canvas Chromium text) plus a fourth for an opaque raster asset must fail by named id. If NO-GO, the diagram is unchanged and this is reported.
6. Docs: `FINDINGS.md` gains a CLI-route section with the matrix table and verdict; README and `CHANGELOG.md` updated; a findings comment on #8. The PR says `Refs #8` and avoids any closing keyword next to an issue number.

### Non-goals

- No provider contract, shared layer or Higgsfield provider (Phases 1 to 4 of #8), no skill or connector work, no change to `tools/spike/**`, `package.json`, `test-budget.json`, no new test, workflow or dependency.
- No MCP testing and no `image_background_remover` test (a separate capability; only on the operator's request).
- No use of the installed Higgsfield companion skills; the CLI is called directly so the spend gate applies.

### Bet and rejected alternatives

- Bet: the CLI's `background: transparent` returns real alpha for GPT Image 2.5, at about 0.25 to 0.5 credits per image. Failure mode: it behaves like the REST route (accepted, opaque result) or bakes a matte; both are recorded as NO-GO or UNCERTAIN and the diagram stays on SVG. Rejected: running the companion skills (they would bypass the spend gate); wrapping the REST runner again (the CLI already handles auth and the job lifecycle).
- Spend: capped at 20 credits (about $1.25 at the documented credit price); expected about 2.5. The balance is the evidence.
- Rollback: Easy for code and docs (revert the PR). Spent credits are not recoverable and were capped.

### Verification

- Selftest against a fake CLI: cap refusal (balance already at 19.8 spent plus a 0.5 estimate is refused), no create after an ambiguous outcome, second process refused by the lock, missing cost or balance stops the run; each mutation fails only its control.
- Inspector controls as before (a known transparent PNG passes, the opaque poster fails), plus the new raster-asset-without-alpha red control in the diagram.
- Real run: ledger totals and balance difference at or under 20 credits; the key-free repo needs no secret scan beyond confirming that no OAuth token string appears in the diff (the CLI's token file is not read).
- Diagram `PASS` in both backends with red controls; `utils/pdda/pdda.sh run` no errors; `releases check` clean.

### Ordered implementation

1. Build the CLI runner and its selftest; review the code.
2. Run the smoke call, fix the output parser, then the matrix; inspect every result.
3. Record the verdict; if GO, wire the two images into the diagram and render; red controls; look at both PNGs.
4. Docs, findings comment, gates, final QA, PR.

### Per-issue map

| Issue | Requirement | State |
|---|---|---|
| #8 | Phase 0b via requirements 1 to 6. Phases 1 to 4 untouched. | Phase 0b done: verdict GO on the CLI route (4 of 4 real alpha), diagram uses two transparent PNGs; awaiting final QA, then PR (ready, not merged); #8 stays open |

### Phase 0b evidence (2026-10-09)

| Item | Result |
|---|---|
| Plan QA | Agy, 1 round, Approved |
| Code QA | Agy, 2 rounds: round 1 found token and signed-URL redaction and an unvalidated binary override (both fixed, 11/11 selftest controls, mutation-checked); round 2 Approved |
| Live matrix | 5 jobs (1 smoke by hand, 4 by the runner): T1, T2, T3, T4 transparent, C1 opaque control; balance 701 to 699.5 credits (1.5), quoted equals measured |
| Result | 4 of 4 transparent requests real alpha; control opaque; parameter echo matched in all five |
| Diagram | interphase = T4, cytokinesis = T2 as 256 px web copies; `PASS` in both backends; red controls (overflow, missing icon, off-canvas text, opaque raster, swapped file) fail by named id |
| Cap | 1.5 of 20 credits used |

Deviations: (1) the smoke call was run by hand before the runner existed (recorded in the ledger by `init-ledger` from the saved output). (2) The raster display size is 176 px (the SVG icon box), not the 112 or 144 px first suggested, because the wide cytokinesis image looked undersized.
