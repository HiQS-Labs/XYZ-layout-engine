# RELAY · GH-85 plan QA: Python asset-generation JS spike
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-16.
-->

NEXT: done
STATUS: Approved
ROUND: 3 / 3

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
4. **Append ONE block** at the very bottom, directly **above** the marker line. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
   Reviewer headings may be `### Reviewer · Round N`, `### Round N · Reviewer · <agent>`, `### Reviewer (<agent>)` (optionally followed by `— rN`), or `### Reviewer — Round N` (optionally followed by `(<agent>)`); follow the heading with a non-empty review body.
5. **Update the header:** flip `NEXT`; set `STATUS` (`Approved` closes — Reviewer only; else `Open`);
   the Producer bumps `ROUND` when opening a new cycle. If the max `ROUND` ends without `Approved`,
   set `STATUS: Escalated`.
6. **Commit only the relay file** (`relay(gh-85-plan-qa-python-asset-generation-js-spike): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **.relay-artifacts/GH-85-JS-ASSET-SPIKE.md** (`PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md`) — base commit `e100f57`. Read-only; do NOT edit it.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-11-16
- **Operational envelope:** Technical spike in a new ESM folder (`tools/asset-gen-spike/`) proving parity with the active Python asset-generation scripts while isolating zero-dependency Web-Standard `core/` modules from Node OS adapters `node/` for eventual reuse in a single-operator Lovable Vite + TanStack app. Grade against stated requirements and commensurate complexity (`/ponytail`). Do NOT request multi-tenant cloud infra, Vite app scaffolding, npm dependency additions, deletions/edits of existing `.py` files, or new `*.test.*` / `test/` files (`test-budget.json` strictly caps the repo at 1 test file / 4 canaries). Note `releases.db`/`releases.sql` changes are written by the repo's ledger CLI, not hand edits.

**Paraphrase first (before reading any source file):** under `What this proposes` and `How the existing system works, per this document`, write 2–5 sentences each from the plan alone, plus a short `What it's not`. Then inspect the repository sources below and answer the questions with `file:line` citations.

Sources to check:
- `examples/2026-10-08-solar-system/generate-assets.py` (whole file: job admission, `job_digest`, `manifest.json`, `fcntl.flock`, FD inheritance, timeout kill, PNG verification, redaction)
- `examples/2026-10-09-cell-division/higgsfield-cli-spike.py` (whole file: `parse_strict_json`, `spend_total`, `gate_allows`, email/secret redaction, `fcntl.flock`, 11 `selftest` controls)
- `examples/2026-10-09-cell-division/higgsfield-spike.py` + `SOP.md` (NO-GO context)
- `tools/spike/test/canaries.test.mjs` (lines 343–454: generator recovery & redaction controls)
- `tools/spike/test/run.mjs` & `test-budget.json` (why verification uses `tools/asset-gen-spike/verify.mjs` outside `test/` and not `*.test.mjs`)
- `tools/render.mjs`, `tools/request.mjs`, `tools/catalog.mjs`, `package.json`

Questions:
1. Are the plan's factual claims about existing Python scripts (`generate-assets.py`, `higgsfield-cli-spike.py`, `higgsfield-spike.py`) and canary coverage (`canaries.test.mjs:343-454`, `test-budget.json`) accurate? Note any subtle edge cases in Python (e.g., `json.dumps` formatting / Unicode / safe-int checks, `parse_strict_json` `NaN`/`Infinity`/`1e999`, email refusal on ledger append, symlinked/broken manifests, signed-URL redaction idempotence) that the JS port must match.
2. Does the planned `core/` (Web-Standard ESM, zero `node:*` imports) vs `node/` (CLI + OS adapters) split cleanly serve eventual Lovable Vite + TanStack reuse without over-engineering or duplicating business rules?
3. Is the proposed atomic lockfile (`O_CREAT | O_EXCL` with `{ parentPid, childPids }` liveness check) a sound, honestly scoped Node adaptation of Python's `fcntl.flock` + FD inheritance across timeout/orphaned-child recovery tests (`canaries.test.mjs:390-399,448-453`), given Node's lack of stdlib `flock(2)`?
4. Does `tools/asset-gen-spike/verify.mjs` avoid violating `tools/spike/test/run.mjs` and `test-budget.json`?
5. Definition of Done: plan covers both active `.py` scripts, preserves existing `.py` files untouched, defines falsifiable offline + cross-language parity checks, fits `test-budget.json`, and keeps complexity commensurate with a technical spike.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer · Round 1 · codex
VERDICT: FAIL

Basis: The scope is appropriate, but the plan needs explicit provisions for Python numeric serialization, crash-safe lock ownership, and preservation of existing PNG admission checks before implementation.

swept file: yes

Reviewed the entire plan and both active Python scripts. The findings below concern the existing plan, not merely a diff. No additional plan defects found beyond those reported here. This is plan QA; implementation acceptance checks have not run.

**What this proposes**

This adds an ESM implementation of both active asset-generation runners under `tools/asset-gen-spike/`, preserving Python. Portable business logic lives in `core/`, while Node adapters own CLI, filesystem, subprocess, and locking operations. An offline verifier and report establish parity and explain future Vite reuse. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:26`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:58`)

**How the existing system works, per this document**

The Solar System runner validates jobs, tracks immutable manifest lineage, controls dispatch, and checks generated PNGs. The Higgsfield CLI runner controls credit spending, maintains a scrubbed ledger, and supplies 11 offline controls. The REST probe supplies historical NO-GO evidence for transparency. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:54`)

**What it’s not**

Python replacement, REST migration, Vite application scaffolding, dependency expansion, or modification of the existing canary suite. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:79`)

**1. Are the factual claims and parity requirements accurate?**

- **[Should] Specify numeric serialization parity beyond the 13 default jobs and reference fixtures.** Python hashes `json.dumps(..., ensure_ascii=False)` bytes, including Python’s numeric spelling. Direct read-only probes produced `{"seed":1.0}` and `{"seed":-0.0}` in Python, versus `{"seed":1}` and `{"seed":0}` with JavaScript `JSON.stringify`. Python also rejects `0.00001` because its serialization contains an exponent, although JavaScript prints that value as a decimal. The planned sorted-key serializer and default-job digest checks do not establish these contracts. Fix: add differential fixtures for integer versus float spellings, negative zero, exponent boundaries, safe-integer bounds, Unicode values, and Unicode key ordering; explain how parsing retains distinctions needed for identical digests. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:63`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:74`, `examples/2026-10-08-solar-system/generate-assets.py:82`, `examples/2026-10-08-solar-system/generate-assets.py:193`)
  
  Observed input: `parameters.seed` supplied as JSON `1.0`, `-0.0`, or `0.00001`; Python and ordinary JavaScript serialization differ as described above.
  
  Affected scope: Admitted numeric parameters, caller argument serialization, and digest compatibility.
  
  Falsifier: Run those literal JSON fixtures through Python and JS admission/digest paths; identical admission decisions, serialized bytes, and hashes would demonstrate the gap is already addressed.

- **[Pass] The main script, recovery, and NO-GO descriptions are supported.** Admission, manifest validation, immutable attempts, Sun-first execution, timeout process-group killing, and inherited run locks exist. The cited canary range exercises recovery and redaction, including orphan refusal. SOP records REST transparency as 0/12 and NO-GO. (`examples/2026-10-08-solar-system/generate-assets.py:150`, `examples/2026-10-08-solar-system/generate-assets.py:253`, `examples/2026-10-08-solar-system/generate-assets.py:290`, `tools/spike/test/canaries.test.mjs:370`, `tools/spike/test/canaries.test.mjs:448`, `SOP.md:16`)

- **[Pass] Preserve these subtleties explicitly:** the CLI parser is named `parse_json_text`, not `parse_strict_json`; it rejects literal `NaN`/`Infinity`, but parsing `1e999` produces infinity, which `credits_of` subsequently rejects. Ledger append refuses email outright after secret scrubbing; printed output masks email. Solar manifest admission rejects dangling symlinks before checking existence. Solar redaction removes URL queries/fragments, while Higgsfield uses an idempotent `?<query-stripped>` marker. These are distinct contracts, not interchangeable redactors. (`examples/2026-10-09-cell-division/higgsfield-cli-spike.py:148`, `examples/2026-10-09-cell-division/higgsfield-cli-spike.py:153`, `examples/2026-10-09-cell-division/higgsfield-cli-spike.py:198`, `examples/2026-10-09-cell-division/higgsfield-cli-spike.py:119`, `examples/2026-10-08-solar-system/generate-assets.py:88`, `examples/2026-10-08-solar-system/generate-assets.py:35`, `examples/2026-10-09-cell-division/higgsfield-cli-spike.py:829`)

**2. Does the portable-core/Node split serve the intended reuse?**

- **[Pass] Yes, at the responsibility level.** Separating pure validation, redaction, spending rules, and hashing from local process execution serves the stated future consumer without requiring an application framework. Clarify that Node supplies filesystem-derived facts to core functions: Python admission reads caller/manifest/reference files, and `job_digest` reads reference contents. Those operations cannot move unchanged into a browser core. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:62`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:68`, `examples/2026-10-08-solar-system/generate-assets.py:82`, `examples/2026-10-08-solar-system/generate-assets.py:153`, `examples/2026-10-08-solar-system/generate-assets.py:183`)

- **[Pass] The portability report must distinguish present imports from future adaptations.** Existing recipes are not uniformly browser-ready: Solar System imports `request.mjs`, which imports Node filesystem, crypto, path, and URL modules. Rendering and catalog operations also have explicit Node dependencies. (`tools/recipes/solar-system.mjs:1`, `tools/request.mjs:1`, `tools/render.mjs:2`, `tools/catalog.mjs:1`)

**3. Is the proposed PID lock a sound adaptation?**

- **[Should] Not sufficiently specified yet.** Exclusive creation establishes initial ownership, but `{ parentPid, childPids }` alone does not establish crash-safe child registration or stale-lock reclamation. Python passes an already-held descriptor when spawning; the kernel retains ownership when the parent dies. The current orphan canary kills the parent after the stub logs a call, so it does not cover the earlier spawn-to-registration window. Fix: specify a fail-closed child-start handshake, incomplete-record handling, and serialized stale-lock recovery; alternatively refuse ambiguous stale ownership pending reconciliation. Keep this local and bounded. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:69`, `examples/2026-10-08-solar-system/generate-assets.py:260`, `tools/spike/test/canaries.test.mjs:448`)
  
  Observed input: The proposed ownership record at plan line 69, with this concrete schedule: acquire lock → spawn caller → parent dies before persisting child PID → forced retry checks the dead parent and incomplete child list. No JS implementation exists yet; this is an uncovered design schedule, not a claimed reproduced implementation failure.
  
  Affected scope: Parent crashes during child registration, malformed/partial ownership records, and concurrent stale-lock reclaimers.
  
  Falsifier: Deterministically kill the parent between spawn and registration, then attempt `--force-retry`; it must refuse without a second dispatch. Also demonstrate that two reclaimers cannot both acquire ownership or unlink a successor’s lock.

**4. Does `verify.mjs` respect the test budget?**

- **[Pass] Mechanically, yes.** The scanner counts files inside `test`, `tests`, or `__tests__`, and filenames matching `.test.*` or `.spec.*`. The proposed path matches neither rule, and `pnpm test` still invokes only the existing canaries. No budget change is needed for that placement. Treat it as bounded, explicitly invoked spike verification; its filename alone does not justify unrestricted suite growth. (`tools/spike/test/run.mjs:22`, `tools/spike/test/run.mjs:29`, `tools/spike/test/run.mjs:56`, `test-budget.json:4`, `test-budget.json:10`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:72`)

**5. Does the plan meet the Definition of Done?**

- **[Pass] Scope and preservation are covered.** Both active scripts have planned adapters; Python edits, new dependencies, and canary changes are excluded. Offline verification, cross-language digests, repository checks, and additive rollback are falsifiable acceptance provisions. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:70`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:79`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:83`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:85`)

- **[Should] Preserve the existing PNG admission contract explicitly.** The plan substitutes a structural validator mentioning `tRNS` and Resvg pixel inspection, but Python deliberately invokes the existing bounded CRC/inflate validator. That owner requires non-interlaced 8-bit RGBA, rejects unsupported chunks, bounds decompression, checks exact scanline length, and validates filter bytes. Fix: retain that owner in the Node acceptance path and label the portable structural helper’s limits, or specify equivalent checks and differential rejection fixtures. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:65`, `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:70`, `examples/2026-10-08-solar-system/generate-assets.py:138`, `tools/spike/assets.mjs:19`, `tools/spike/assets.mjs:34`)
  
  Observed input: A valid truecolor PNG with IHDR color type 2 and `tRNS` transparency falls outside the existing validator’s required `[8,6,0,0,0]` IHDR suffix, despite the plan listing `tRNS` handling.
  
  Affected scope: PNG acceptance compatibility and bounded handling of malformed compressed image data.
  
  Falsifier: Both runners reject that fixture and CRC-correct fixtures with excessive inflated data, incorrect scanline length, or invalid filter bytes, while accepting existing committed RGBA fixtures.

Reversibility: **Easy** for this additive spike, as scoped at `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:11`.

Handing off to Producer — go to the Producer window and say “take your turn”.

### Producer · Round 1 · claude-a

swept file: yes

**Dispositions:**
- **[Should] Numeric serialization parity:** Implemented. Updated `PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md:63,74`. Added explicit provisions in `core/json.mjs` and `core/jobs.mjs` for Python numeric spelling parity: distinguishing integer vs float formatting (e.g. `1.0`), preserving `-0.0` signed zero, safe-integer checks (`abs(v) <= 9007199254740991`), and Python-compatible exponent rejection (`0.00001` rejected per `'e' in json.dumps(v).lower()` while `0.0001` is accepted). Added differential cross-language test fixtures in `verify.mjs` exercising integer/float spellings, negative zero, exponent boundaries, safe integer limits, Unicode values, and key sorting.
- **[Should] Crash-safe lock ownership & fail-closed handshake:** Implemented. Updated `PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md:69,75`. In `node/lock.mjs`, specified a fail-closed parent/child protocol: the parent writes an `inFlightAttempts` intent record before spawning the subprocess, and verifies child PID immediately upon process start. Stale-lock recovery is fail-closed: if the parent PID is dead, it checks candidate child processes; any ambiguous or active caller locks refuse (`concurrent manifest ownership; safely refusing`), never allowing blind re-dispatch or double-spend. `verify.mjs` reproduces the orphan recovery canary matching `canaries.test.mjs:448-453`.
- **[Should] Preserve existing PNG admission contract explicitly:** Implemented. Updated `PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md:65,70`. In `node/generate-assets.mjs`, explicitly retained the existing bounded CRC/inflate validator `tools/spike/assets.mjs` (`inspectPng`) plus `@resvg/resvg-js` for RGBA pixel transparency verification, preserving exact non-interlaced 8-bit RGBA, chunk restrictions, scanline length, and filter byte checks. `core/png.mjs` is explicitly scoped as a lightweight Web-Standard header/chunk inspector for browser/edge use.

Plan updated in `PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md` (and mirrored in `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md`).
Handing off to Reviewer for Round 2.

### Reviewer · Round 2 · codex
VERDICT: FAIL

Basis: Numeric parity and PNG admission dispositions satisfy the corresponding plan findings. Lock ownership is partially addressed, but concurrent stale-lock reclamation and its verification remain unspecified.

swept file: yes

Read the entire relay and updated plan. No additional plan defects found beyond the unresolved Round 1 item below. This is plan QA; implementation acceptance checks have not run.

- **[Pass] Numeric parity addressed at the planning level.** Python numeric spelling, signed zero, integer/float distinctions, safe-integer bounds, exponent rejection, Unicode, and differential serialization/digest checks are now explicit requirements. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:63`, `:74`, `:75`)

- **[Pass] PNG admission owner preserved.** The Node adapter retains `tools/spike/assets.mjs` plus Resvg transparency inspection; the portable helper is explicitly limited to structural inspection. This satisfies the requested reuse rather than replacement of authoritative validation. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:65`, `:70`)

- **[Should — Round 1 remains open] Specify safe stale-lock reclamation and deterministic race controls.** Pre-spawn intent recording and refusal of ambiguous ownership improve the design, but do not specify how concurrent reclaimers avoid unlinking a successor’s lock. Reproducing the existing orphan canary also misses the spawn-to-registration window: that canary waits until the caller has started before killing the parent. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:69`, `:75`; `tools/spike/test/canaries.test.mjs:448`)

  **Observed input:** The stale-recovery design at plan line 69 permits this unspecified schedule: A and B inspect the same dead-owner lock → A removes it and exclusively creates a replacement → B acts on its earlier observation and removes A’s replacement → B creates another lock. Exclusive creation alone does not prevent this sequence. This is an uncovered design schedule, not a claimed reproduced implementation failure.

  **Affected scope:** Concurrent stale-lock reclaimers, successor-lock preservation, and parent death between caller spawn and child-PID registration.

  **Fix:** Specify serialized reclamation with successor protection, or conservatively refuse stale ownership until explicit reconciliation. Add deterministic verifier controls for both the two-reclaimer schedule and parent death between spawn and registration; incomplete ownership records must refuse.

  **Falsifier:** Two synchronized reclaimers cannot both acquire ownership or unlink a successor’s lock; killing the parent between spawn and registration makes `--force-retry` refuse with zero additional dispatches.

Reversibility: **Easy** — additive spike scope remains unchanged. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:11`)

Handing off to Producer — go to the Producer window and say “take your turn”.

### Producer · Round 2 · claude-a

swept file: yes

**Dispositions:**
- **[Should] Safe stale-lock reclamation and deterministic race controls:** Implemented. Updated `PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md:69,75`. Adopted the conservative, zero-automatic-unlinking design matching `tools/catalog.mjs:492` ("a stale lock requires operator inspection and is never broken automatically") and `generate-assets.py:301` (`concurrent manifest ownership; safely refusing`). Stale or ambiguous locks are NEVER unlinked or stolen automatically by competing reclaimers—eliminating the successor-unlinking race entirely by design. To close the spawn-to-registration window, the parent registers `inFlightAttempts` synchronously before spawning the caller; an incomplete/orphaned record causes any subsequent run to fail-closed without dispatching. `verify.mjs` adds deterministic verifier controls for both: (a) parent death between spawn and registration, asserting `--force-retry` safely refuses with zero additional dispatches, and (b) synchronized concurrent processes attempting lock acquisition, asserting neither deletes or unlinks the active lock.

Plan updated in `PROJECT/1-INBOX/GH-85-JS-ASSET-SPIKE.md` (and mirrored in `.relay-artifacts/GH-85-JS-ASSET-SPIKE.md`).
Handing off to Reviewer for Round 3.

### Reviewer · Round 3 · codex
VERDICT: PASS

Basis: The Round 2 dispositions satisfy the remaining lock finding at the planning level.

swept file: yes

Read the entire relay thread and updated plan. No additional plan defects found. This is plan QA; implementation acceptance checks have not run.

- **[Pass] Stale-lock race resolved.** The plan explicitly prohibits automatic breaking or unlinking of stale or ambiguous locks. This adopts the conservative reconciliation option requested in Round 2 and removes the competing-reclaimer successor-unlinking schedule. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:69`)
- **[Pass] Spawn-to-registration gap addressed.** Synchronous pre-spawn `inFlightAttempts` registration and refusal of incomplete or orphaned records explicitly prevent automatic redispatch after ambiguous parent death. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:69`)
- **[Pass] Deterministic verification specified.** The verifier must terminate the parent in the spawn-to-registration window and assert forced retry refuses with zero additional dispatches; concurrent acquisition controls must also assert that contenders preserve the active lock. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:75`)
- **[Pass] Earlier resolutions retained.** Numeric serialization parity, differential fixtures, and reuse of authoritative Node PNG validation remain explicit. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:63`, `:65`, `:70`, `:74`)

Reversibility: **Easy** — the spike remains additive. (`.relay-artifacts/GH-85-JS-ASSET-SPIKE.md:11`)

Relay closed (Approved), no further turn needed; handing the token to done.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
