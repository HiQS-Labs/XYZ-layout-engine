# RELAY · GH-86 final QA: JS asset generation spike PR #86
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-16.
-->

NEXT: Producer
STATUS: Open
ROUND: 1 / 4

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
6. **Commit only the relay file** (`relay(gh-86-final-qa-js-asset-generation-spike-pr-86): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: **tools/asset-gen-spike/REPORT.md** (and implementation in `tools/asset-gen-spike/`) — PR #86.
- Reviewer: claude-fable (Claude Fable 5, `claude-fable-5-1`, effort high)   ·   Producer: claude-a
- Started: 2026-11-16
- **Operational envelope:** Technical spike evaluating the porting of Python asset generation to JavaScript (ESM, Node 22+) for eventual use in a Lovable Vite + TanStack web application. Grade against stated requirements and commensurate complexity (`/ponytail`). Do NOT request multi-tenant cloud infra, Vite app scaffolding, external npm dependencies, deletions/edits of existing `.py` files, or new `*.test.*` / `test/` files (`test-budget.json` strictly caps the repo at 1 test file / 4 canaries).

Questions:
1. **Web-Standard Core Isolation:** Does `tools/asset-gen-spike/core/` contain zero `node:*` imports or Node-specific built-ins, adhering strictly to Web Standards (`Uint8Array`, `DataView`, `TextEncoder`, `URL`, `crypto.subtle`)? Cite file:line imports.
2. **Python File Preservation:** Do existing Python scripts (`examples/2026-10-08-solar-system/generate-assets.py` and `examples/2026-10-09-cell-division/higgsfield-cli-spike.py`) remain completely untouched?
3. **Verification & Differential Parity:** Does `node tools/asset-gen-spike/verify.mjs` pass cleanly offline? Does the verification substantiate cross-language numeric and digest parity, spend cap refusal, balance accounting, and recovery mechanisms?
4. **Lockfile & Concurrency Safety:** Are lockfile semantics in `node/lock.mjs` fail-closed against concurrent manifest ownership, with pre-spawn intent tracking and zero automatic unlinking of ambiguous locks?
5. **Portability Matrix Accuracy:** Does `tools/asset-gen-spike/REPORT.md` accurately detail the client vs edge/server boundary for a Lovable Vite + TanStack web application?
6. **Commensurate Complexity & Hygiene:** Is the implementation surgical, DRY, and free of private data, leaked tokens, or unnecessary runtime abstractions?

Definition of Done: All 6 questions addressed with `file:line` citations; offline verification passes; existing python scripts untouched; no blockers.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns. Plain blank separators may be added or removed between sections; preserve every substantive line, indentation, and fenced/literal blank line. A historical FAIL→PASS edit or changed fenced example is forbidden.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Round 1 · Reviewer · claude-fable
VERDICT: FAIL
Basis: one observed live-path defect, one ledger-guard regression vs Python, and three REPORT parity/matrix overclaims. Probes were run read-only from scratch; commands, exit status and decisive output quoted inline.

swept file: yes — all 10 files under `tools/asset-gen-spike/` read in full (2919 lines); no pre-existing code was touched by the PR (all files are `A`dded; `git diff --name-status main...HEAD` shows no `M` outside `releases.*`/`PROJECT/`).

**Q1 Web-standard core isolation — [Pass]**
- Only relative imports in `core/`: `core/jobs.mjs:2`, `core/redact.mjs:2`, `core/spend-gate.mjs:2` (`./json.mjs`); `core/json.mjs` and `core/png.mjs` import nothing. `rg -n "import|require\(|process\.|Buffer|__dirname|fs\.|path\." tools/asset-gen-spike/core/` → 7 matches, none Node-specific. Web APIs used: `TextEncoder`/`DataView`/`BigInt` (`core/json.mjs:94-103`), `crypto.subtle.digest` (`core/json.mjs:142`), `URL` (`core/redact.mjs:80`), `Uint8Array`/`DataView` (`core/png.mjs:3,41`).
- Hand-rolled `sha256Sync` verified against `node:crypto` at padding edges (lengths 0,1,55,56,63,64,65,119,120,1000): `a sha256Sync mismatches: 0`.
- [Nit] `verify.mjs:36-38` static scan only matches `from 'node:` / `require(` / `process.`; a bare `import fs from 'fs'` or `Buffer` use would pass it. Current files are clean (rg above), so REPORT.md:36 "0 violations" is true, but the scan is weaker than the claim. Fix: add `/from\s+['"](fs|path|os|crypto|child_process|url)['"]/` and `/\bBuffer\b/` to the scan.

**Q2 Python preservation — [Pass]**
- `git diff --stat main...HEAD -- examples/2026-10-08-solar-system/generate-assets.py examples/2026-10-09-cell-division/higgsfield-cli-spike.py` → empty output, rc=0. `git diff --name-status main...HEAD` lists no `examples/` path. REPORT.md:6 claim holds.

**Q3 Verification & differential parity**
- `node tools/asset-gen-spike/verify.mjs` end-to-end: **[Unverified — needs clone run]** (spawns processes and writes under `os.tmpdir()`; belongs in the disposable clone / harness gate). Syntax of all 10 `.mjs` files passes `node --check`.
- [Pass] 13-job digest parity is plausible: `jobDigest` (`core/jobs.mjs:60-68`) mirrors `generate-assets.py:82-85` (`sort_keys`, `(',',':')`, `ensure_ascii=False`); all SOLAR prompts are ASCII (`rg '[^\x00-\x7F]' core/jobs.mjs` → 0 matches), and `canonicalJson` string/key handling matches `ensure_ascii=False`.
- **[Should] Float-parameter digests diverge from Python on the live CLI path; REPORT.md:40 overclaims.** `node/generate-assets.mjs:717` loads jobs with plain `JSON.parse`, not `parseJsonText(text, {preserveNumbers:true})`, so `PyNumber` never enters the CLI path, and `node/generate-assets.mjs:399` emits `--param` via `JSON.stringify(val)` which drops the `.0` even for a `PyNumber`.
  - Observed input: `{"id":"sun","prompt":"p","model":"m","size":"1024x1024","quality":"medium","background":"transparent","parameters":{"seed":1.0}}` → `jobDigest(JSON.parse(txt))` = `ea5c8d19…0389`; Python `job_digest` on the same text = `eca51c18…4660`; `canonicalJson` emitted `{"seed":1}` where Python emits `{"seed":1.0}`.
  - Affected scope: any job whose `parameters` carry a float with a zero fraction (`1.0`, `2.0`); a manifest written by the Python runner is not recognised by the JS runner for such jobs → a second paid dispatch of an already-complete job (the `attempt folders exist` guard at `:574` keys on the digest too, so it does not catch it).
  - Falsifier: the same job text with `"seed":1.5` or with no `parameters` → identical digests in both languages (the 13 SOLAR jobs already show this), proving the gap is confined to zero-fraction floats.
  - Fix: at `:717` use `parseJsonText(text, {preserveNumbers:true})`; at `:399` use `val instanceof PyNumber ? val.raw : JSON.stringify(val)`; or, if out of spike scope, change REPORT.md:40 to say parity holds for the `pyFloat` helper only and name this limit.
- [Should] REPORT.md:41 "Key sorting order matches Python … across ASCII and Unicode" is false for astral keys: JS `Object.keys().sort()` orders by UTF-16 code unit, Python by code point. Observed input: keys `"￿"` and `"😀"` → JS `{"😀":2,"￿":1}`, Python puts `"￿"` first. Affected scope: REPORT wording only — admitted job keys are fixed ASCII and param names match `/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/` (`core/jobs.mjs:157`), so no runtime path hits this. Falsifier: BMP-only keys sort identically. Fix: narrow the claim to "ASCII and BMP keys" or sort with a code-point comparator.
- [Pass] Spend-cap, balance-lag, ambiguous-create, lock, redaction and offline controls are present in `selftest()` (`node/higgsfield-cli.mjs:722-941`, controls i–xi) and the JS gate arithmetic (`core/spend-gate.mjs:28-38`) matches the Python constants (`higgsfield-cli-spike.py:47-54`).

**Q4 Lockfile & concurrency — [Pass] with one accuracy note**
- Fail-closed: `node/lock.mjs:42` opens with `'wx'`, `:44-46` returns `null` on `EEXIST`, caller refuses at `node/generate-assets.mjs:511-514` (`concurrent manifest ownership; safely refusing`). Zero automatic unlinking: the only `unlinkSync` is `node/lock.mjs:92`, gated on `record.parentPid === process.pid`. Pre-spawn intent: `registerAttempt` at `node/generate-assets.mjs:411`, before `spawnSync` at `:415`.
- [Should] REPORT.md:59-60 claims `childPids` tracking as the FD-inheritance analogue, but the live path (`executeJobSync`, uses `spawnSync`) never calls `registerChild`; its only caller is `:272` inside `runJob`, which is dead (see Hygiene). `checkLiveness`/`readLockInfo`/`isPidAlive` (`node/lock.mjs:4-37`) have zero callers (`rg checkLiveness|readLockInfo|isPidAlive` outside lock.mjs → 0). Fix: delete the dead liveness helpers and the `childPids` row, or wire them in; state in REPORT that the live lock is `O_EXCL`-only.
- [Nit] `verify.mjs:311-335` labels this a "deterministic race control" but the dead-PID/`inFlightAttempts` content it writes is never read — the refusal comes purely from `EEXIST`. The behaviour is correct; the test description overstates what it exercises.

**Q5 Portability matrix — [Should]**
- REPORT.md:77 lists `tools/recipes/*.mjs` as browser-ready. `tools/recipes/design-intake.mjs:2-4` imports `node:fs/promises`, `node:path`, `node:crypto`. Observed input: that row. Affected scope: the matrix row only. Falsifier: `tools/recipes/solar-system.mjs`, `nutrition.mjs`, `recursive-process.mjs` carry no `node:` import (rg over `tools/recipes/` → only `design-intake.mjs` matches). Fix: exclude `design-intake.mjs` or split the row.
- [Pass] Other rows check out: `@resvg/resvg-js`, `satori`, `playwright` are the actual deps (`package.json:19-21`); `node/` adapters use `child_process` (`node/generate-assets.mjs:5`, `node/higgsfield-cli.mjs:6`) so "browser: No" is right.
- [Nit] REPORT.md:62 "fully portable … containerized filesystems": `O_EXCL` is not atomic on NFSv2 and some FUSE mounts; name the limit.

**Q6 Commensurate complexity & hygiene**
- **[Blocker] The live (online) download path cannot work.** `node/higgsfield-cli.mjs:206` `realFetch` is `async` (returns a Promise) but `downloadAndInspect` (`:414-418`) calls `this.fetch(url)` synchronously and reads `resp.status`, so every completed job is flagged `download_failed` and never inspected; only the selftest's synchronous `fakeFetch` (`:659`) works. Python `real_fetch` (`higgsfield-cli-spike.py:275`) is synchronous, so this is a port regression and REPORT.md:4 "complete porting" is not yet true.
  - Observed input: `new Runner(ledger, rawDir)` with default `fetchFn`, `HIGGSFIELD_CLI_SPIKE_OFFLINE=1`, job `{id:'1', result_url:'https://cdn.example.invalid/u/x.png'}` → `row` = `{"flags":["download_failed"],"result_url":"https://cdn.example.invalid/u/x.png","download_error":"download HTTP undefined"}` plus `unhandledRejection: offline guard blocked a download of …` (the guard's refusal surfaces as an unhandled rejection, never as the row's error).
  - Affected scope: every `completed` job in a real `run`; `go_eligible` can never be true outside selftest.
  - Falsifier: a synchronous `fetchFn` (selftest c7, `:844-852`) yields `content_type: 'image/png'` and `go_eligible` true — showing the plumbing works once the Promise is awaited.
  - Fix: make `downloadAndInspect` → `runLabel` → `runCmd` → `main` `async`/`await` (and `exitCode` await its thunk), or add a selftest control that drives `Runner` with the real `realFetch` under the offline guard and asserts `download_error` names the guard. Keep `fakeFetch` async too so the control is honest.
- **[Should] Ledger email guard is stateful and leaks on the second call.** `core/redact.mjs:44` `EMAIL_RE` has the `g` flag and `node/higgsfield-cli.mjs:131` uses `.test()` on it, so `lastIndex` persists between appends (Python `re.search` is stateless).
  - Observed input: `led.append({event:'x', note:'mail someone@example.com here'})` → refused; immediately `led.append({event:'x', note:'other@example.com'})` → **NOT refused**, and the ledger file then contains `@`.
  - Affected scope: any process that survives one refusal and appends again (e.g. `stop()` rows after a leaky `excerpt`, or a future caller); `scrubObj` (`:129`) strips secrets but not emails, so the `.test` guard is the only email barrier for row values.
  - Falsifier: with a non-global regex (or `EMAIL_RE.lastIndex = 0` before `.test`) the second append is refused too.
  - Fix: `new RegExp(EMAIL_RE.source).test(line)` or `line.match(EMAIL_RE)`.
- [Should] Dead and duplicated code (ponytail): `node/generate-assets.mjs:160-312` `runJob` is an exported, half-written async variant (`:302-304` are placeholder no-ops; it spawns a detached child, never awaits it, returns `undefined`) that duplicates `executeJobSync` (`:315-471`) almost line for line; it has no callers (`rg '\brunJob\b'` → definition only). If called it would dispatch a paid job and leave the manifest `in-flight`. Fix: delete it (and the now-unused `registerChild`). Likewise `core/png.mjs` has zero callers (`rg inspectPngHeader|inspectAlphaFromImageData|crc32` outside png.mjs → 0; `node/generate-assets.mjs:9` reuses `tools/spike/assets.mjs inspectPng` instead) and `verify.mjs:7,13-16,18` imports `crypto`, `redactUtils`, `pngUtils`, `spendGate`, `generateRunner` without using them. Either exercise `core/png.mjs` in `verify.mjs` or drop it and its matrix row (REPORT.md:74).
- [Nit] `core/spend-gate.mjs:71` `flags.append ? flags.append(...) : flags.push(...)` is a Python leftover; arrays have no `append`. Fix: `flags.push(...)`.
- [Nit] `node/generate-assets.mjs:479,491,725` accept `maxWorkers` but execution is strictly sequential (`:675-691`); Python uses a `ThreadPoolExecutor` (`generate-assets.py:362`). Name the simplification in REPORT or drop the flag.
- [Pass] No private data or tokens: `rg -i "api[_-]?key|token|secret|bearer|/Users/" tools/asset-gen-spike` → only selftest fixtures (`node/higgsfield-cli.mjs:883-921`) and REPORT prose; `SMOKE` constants (`:71-78`) mirror the Python file; no new deps, no `*.test.*`/`test/` files (`tools/spike/test/run.mjs:22-33` walk would not count `verify.mjs`).

**Basis:** Q1, Q2 and Q4's fail-closed core hold with citations. The Blocker is an observed, reproduced failure in the live download path of the Higgsfield port; the ledger email guard regression is reproduced too. The remaining Shoulds are REPORT accuracy (float digests, astral sort, recipes row, childPids) and dead code. None requires new tests, infra or `.py` edits.

Handing off to Producer — go to the claude-a window and say "take your turn": disposition each finding, fix the Blocker and Shoulds (or decline with reason), bump ROUND to 2.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
