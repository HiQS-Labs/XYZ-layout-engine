# RELAY · GH50 WebP artwork plan QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-14.
-->

NEXT: Producer
STATUS: Open
ROUND: 1 / 3

## ▶ TAKE YOUR TURN — read this first (works for ANY agent: Claude, Codex, agy)
1. **Read this whole file** (header, Setup, Ground rules, every block in the Log).
2. **Check it's your turn:** `NEXT` (top) names the role to act. Confirm you are bound to it and the
   last Log block isn't already yours. If not → STOP and reply "wrong window — nudge the <other> window."
3. **Do your role's work** on the artifact named in Setup:
   - **Reviewer:** review vs the Definition of Done → graded findings
     (`[Blocker]`/`[Should]`/`[Nit]`/`[Pass]`), each with a concrete fix → set a **VERDICT**
     (exactly PASS, FAIL, or PARKED) and a **Basis** (explanation). **Review the whole file, not just the diff** (GH-268):
     a beta test had this loop reach `Approved` in two rounds while an independent audit of the same
     branch found 20 issues (1 critical, 4 high) — every one of them in the pre-existing code the
     change sat on, which nobody had read. Pre-existing defects in a file you are touching are IN
     SCOPE; if you find none, say so explicitly rather than leaving it unstated.
     **Declare it: every review block must contain a literal `swept file: yes` or `swept file: no`
     line.** Without it a reviewer that skipped the sweep is indistinguishable in the transcript from
     one that did it and found nothing — which is how the original 20 issues stayed invisible.
     Any `[Pass]` or "verified"/"confirmed" finding MUST
     carry a quoted span or a `file:line` citation — an uncited one is mechanically downgraded to
     `[Unverified — no citation]` (GH-173 B3). Do **not** edit the artifact; only append findings here.
     **A finding that asks for a behaviour change is a generalization unless you can paste the concrete
     input — a row, a value, a `file:line` — that fails under the current code** (GH-681: the gh673
     final QA relay generalized one late-error observation into "or a later invalid identity", the
     Producer implemented it, the same seat `[Pass]`ed it next round, and one historical NULL-URL
     ledger row then blanked every issue). Every `[Blocker]` or `[Should]` requesting a behaviour
     change MUST carry three lines: `Observed input:` (the failing input you saw), `Affected scope:`
     (the input predicate the change would govern), `Falsifier:` (the fixture or data that would show
     the change unnecessary or wrong, and its expected result).
     A `[Blocker]` must cite an observed failure. This is a protocol rule, not a mechanical check —
     the Producer may disposition a request lacking these as `Declined — unproven generalization`.
   - **Producer:** log a disposition for every open finding (Implemented / Modified / Declined + why,
     including `Declined — unproven generalization` for a behaviour-change request that carries no
     `Observed input:` / `Affected scope:` / `Falsifier:`), make the change, then add new work.
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh50-webp-artwork-plan-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-50-WEBP-ARTWORK.md** — the read-only path that
  `relay-drive.sh --artifact-file PROJECT/2-WORKING/GH-50-WEBP-ARTWORK.md` seeds into the isolated worktree (read it there; do NOT edit it).
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-14
- Definition of Done: the plan is approved for implementation when it satisfies issue #50
  (https://github.com/HiQS-Labs/XYZ-layout-engine/issues/50) and the questions below have no open Blocker.

**Requirements (from the operator and issue #50).** Add optional, MVP-level transparent WebP artwork
beside the PNG path, and make the latest diagram (`examples/2026-10-12-belief-reference/`, recipe
`recursive-process`) use WebP files. Operator decision: WebP + Chromium PNG. SVG/HTML exports and the
Playwright PNG support WebP; the default Satori PNG refuses with a clear error (resvg-js 2.6.2 silently
drops WebP). No new npm dependency; no new test file (test-budget.json ratchet).

**Operational envelope.** Local single-operator CLI renderer with trusted, catalog-pinned recipes and
committed artwork. Grade against these requirements and commensurate complexity, not multi-tenant or
untrusted-upload threat models. Challenge speculative machinery.

**Read these sources** (the plan cites line numbers on base `ed56529`):
- `tools/request.mjs` (readPinnedPngs, readBounded, LIMITS)
- `tools/spike/assets.mjs` (inspectPng)
- `tools/render.mjs` (processRequest Satori/Playwright branch ~236-250; HTML extractor ~340-352)
- `tools/catalog.mjs` (declaredFiles ~120-148, snapshot, publish)
- `tools/recipes/recursive-process.mjs`, `tools/recipes/nutrition.mjs`, `tools/recipes/solar-system.mjs`
- `tools/spike/test/canaries.test.mjs` (assertOfflineExport ~28-52; GH-36 block ~263-284) and `test-budget.json`
- `examples/2026-10-12-belief-reference/` (provenance.json, README.md, verification-v5.json, SHA256SUMS)

**Questions.**
1. Are the plan's claims grounded in the actual code paths (line refs, which files the catalog pins for
   which recipe, the HTML extractor's refusal)? Cite any claim that is wrong.
2. Is any requirement from issue #50 missing or mis-scoped?
3. Does the plan extend the existing reader/inspector/extractor owners rather than adding a parallel
   loader or writer? Is keeping the `readPinnedPngs` name (to avoid editing pinned nutrition/solar
   modules) the right trade?
4. Is the `inspectWebp` header contract (RIFF size, VP8X alpha flag or VP8L alpha bit, plain VP8 refused,
   shared budgets) sufficient and correct for `cwebp -lossless -exact` output, without overbuilding?
5. Is the Satori PNG refusal placed at the right owner and condition? Can it misfire (e.g. on SVG-only
   or HTML-only Satori runs, or on the Playwright coverage pass that calls renderSatori with raster:false)?
6. Is 6.0.0 (major) the correct semver under the repo's catalog rules, and are blast radius, rollback,
   the PR #43 overlap and the acceptance map/red controls sufficient and falsifiable?
7. Is editing the existing C1 GH-36 block (no new test() or file) consistent with test-budget.json rules?
8. Is the 55/20/50/60 rating grounded (appeal neutral, effort = cheapness)?

Output graded findings with file:line citations per the protocol.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1

VERDICT: FAIL
Basis: Block implementation until the HTML serializer accepts WebP. The plan otherwise follows issue #50's operator-selected backend split, but its canary adaptation and rollback instructions also need correction.
swept file: yes

Reviewed the entire seeded plan, including pre-existing sections, against the named sources and the live issue. Graph tools were unavailable; used direct source reads and narrow probes. No test suite, executable fixture, validate.sh or Git command was run. Review-file edit reversibility: **Easy**.

- **[Blocker] B1 — R3 omits the HTML serializer's independent allowlist.** `.relay-artifacts/GH-50-WEBP-ARTWORK.md:85` changes only extraction. `tools/render.mjs:111` rejects both `data:image/webp` and `assets/<digest>.webp`; `renderPlaywright` calls `toDocument` at line 143, and both HTML export paths also reach it (lines 348–359). Therefore the planned Playwright PNG and both backends' HTML exports still throw after implementing R3 as written. Extend both branches of the existing `toHtml` source allowlist to WebP, retaining its anchored trusted-source restriction; include that owner in R3 and its acceptance map.
  Observed input: a real conversion of `examples/2026-10-12-belief-reference/assets/web/examination.png` using `cwebp -quiet -lossless -exact ... -o "$TMPDIR/examination.webp"` produced a 13,718-byte VP8L file, 256×256, alpha bit 1, matching RIFF length. Passing its base64 data URL to `toHtml({type:"img",props:{src}})` threw `Validation failed: [{"field":"src","message":"only embedded trusted images are supported"}]`. Conversion plus Node probe exited 0 (the exception was caught and printed). Independent exact probe command: `node --input-type=module <<'JS'` with the following body, then `JS` (exit 0):
  ```js
  import { toHtml } from "./tools/render.mjs";
  for (const src of ["data:image/png;base64,AAAA", "data:image/webp;base64,AAAA", "assets/" + "a".repeat(64) + ".webp"]) {
    try { console.log(src + " => " + toHtml({type:"img",props:{src}})); }
    catch (error) { console.log(src + " => " + error.message); }
  }
  ```
  Decisive output: PNG serialized to `<img src="data:image/png;base64,AAAA" style="">`; both WebP inputs printed the validation error above. This measures the allowlist, independently of decoding.
  Affected scope: trusted embedded WebP images and hashed local WebP assets passing through `toHtml`/`toDocument`.
  Falsifier: after the targeted allowlist edit, both WebP forms serialize; PNG/SVG still serialize and an external HTTP image remains rejected. The existing offline C1 then loads the converted artwork in compact and inline exports.

- **[Should] S1 — preserve existing non-fit and unsupported-font controls when adding R4.** Step 5 names only `canaries.test.mjs:263–276`, but `rpReject` at `tools/spike/test/canaries.test.mjs:277–287` still requests default Satori PNG. R4 will intercept the valid-shape long-caption and CJK cases before fitting/glyph checks, producing the backend refusal instead of their expected errors. Change this helper to request Satori SVG (or another supported path), retaining the original assertions; keep the WebP PNG rejection as its own assertion in the existing C1.
  Observed input: line 282 sets `states[0].caption = 'W'.repeat(2000)` and expects `/non-fit/`; line 287 sets `events[0].caption = 'Belief 漢'` and expects `/unsupported text\/font/`; line 280 sends both with `format: 'png'`. R4 explicitly refuses before rendering (`.relay-artifacts/GH-50-WEBP-ARTWORK.md:88–92`).
  Affected scope: the existing recursive-process render-level negative controls; schema-domain controls should remain intact.
  Falsifier: in a disposable clone, both edited controls reach their original errors while the separate valid-fixture Satori PNG request receives the Playwright guidance. **[Unverified — needs clone run]**: interception is a source-derived consequence of the proposed change, not a measured suite failure.

- **[Should] S2 — distinguish source rollback from catalog-history deletion.** The instruction “revert the PR” at `.relay-artifacts/GH-50-WEBP-ARTWORK.md:61–64` also reverses the new `catalog.sql`/design-log rows, contradicting the adjacent promise that v6 and its design remain. Describe a selective source rollback retaining the published rows, design log and referenced v6 artifact; restore the v5 module, reader, provenance and declaration set consistently, then verify the current v5 pins and retained designs. No new rollback mechanism is needed. `tools/catalog.mjs:237–249` prohibits historical row removal on import, and `tools/catalog.mjs:219–222` still checks every retained design artifact.

- **[Pass] Ownership, version and test size:** keeping `readPinnedPngs` and placing the opt-in inspector in request.mjs avoids unrelated pinned-module edits: `tools/catalog.mjs:125–146` pins assets.mjs for all three recipes and request.mjs only for recursive-process; existing callers are `nutrition.mjs:136`, `solar-system.mjs:87`, `recursive-process.mjs:71`. Major 6.0.0 fits `README.md:103–106` because previously admitted output bytes change as well as PNG capability. Extending the existing C1 fits `test-budget.json`'s “Only plain node:test test()” rule and its 4-test/1-file budget; actual ≤60s remains a clone gate.

- **[Pass] MVP envelope and refusal condition:** R4's “Satori branch” plus `raster` condition (`.relay-artifacts/GH-50-WEBP-ARTWORK.md:88–92`) correctly excludes SVG/HTML-only calls and the Playwright `raster:false` coverage pass (`tools/render.mjs:211,241–249`). The RIFF/VP8L header proposal matches the measured converter output above and the [WebP container](https://developers.google.com/speed/webp/docs/riff_container) and [lossless header specification](https://developers.google.com/speed/webp/docs/webp_lossless_bitstream_specification); it is reasonable for trusted committed derivatives. Header flags are not a pixel-decoding guarantee. At implementation, bound header reads/chunk payloads before accessing dimension fields; retain the planned real-alpha inspection rather than adding a decoder dependency.

- **[Nit] Evidence precision:** lines 154–155 overstate runtime malformed-body detection: `renderPlaywright` checks geometry/fonts and screenshots at `tools/render.mjs:143–174`; `naturalWidth` is checked by the C1 helper (`canaries.test.mjs:39–46`), not ordinary rendering. State that committed-asset validation/C1 supplies this evidence. Several extractor references are stale: the actual regex/map are `tools/render.mjs:352–355`. PR #43's live file list also overlaps canaries, README and CHANGELOG, so include these in the rebase note. The 55/20/50/60 rationale at plan lines 159–161 is reasonable judgment with appeal neutral and effort interpreted as cheapness; it is not an objective measurement.

Root cause: WebP is refused by two existing HTML boundaries, while the plan changes only extraction; Fix site: extend the existing serializer allowlist and extractor together; Why not upstream/downstream: recipe-specific workarounds would duplicate the transport rule, and Chromium never receives the currently rejected source.

Handing off to Producer (claude-a) — address B1, S1 and S2, disposition the remaining notes, then request the next review. Implementation and runtime gates remain unverified until the authorized disposable-clone run.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
