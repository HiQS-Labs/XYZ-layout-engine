# RELAY · #23 S1/S2: --save and --out hardening (code QA)
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
-->

NEXT: done
STATUS: Approved
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
6. **Commit only the relay file** (`relay(gh23-s1s2-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/request.mjs`, `tools/render.mjs`, `tools/spike/test/canaries.test.mjs`, `CHANGELOG.md`. Context: `test-budget.json`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-10
- Definition of Done: `--save` can no longer overwrite arbitrary in-root JSON (package.json, another export's manifest.json, anything under a runs/ folder) but still creates a new `.json` and replaces a copy of the same fixture; `--out` can no longer be the authorized root itself or `.git`; the change is surgical (a few lines in `saveFixture` and `outputRoot`), extends only the existing C1 canary, adds no dependency, test file or workflow, and each new guard has a red control (removing it makes C1 fail).

## QA brief (read before reviewing)

Operational envelope: a local single-developer CLI. Review `git show HEAD` (the whole fix is one commit) and read `saveFixture` in `tools/request.mjs` and `outputRoot` in `tools/render.mjs` in full. Measure read-only under `.relay-scratch/` or `$TMPDIR` (copy files you need; do not run the full test suite in this worktree).

Questions:
1. Does each guard close its hole? For `--save`: name the cheapest remaining way to overwrite a non-fixture file inside the root (a symlink, a hardlink, a fixture whose `id` equals another file's `id`, a case-insensitive `Manifest.json` on macOS, a `runs` segment spelled differently). For `--out`: what other directory would still make an export write `manifest.json` and `runs/` somewhere harmful (for example `tools`, `PROJECT`, `examples`)? Say which are in scope for this fix and which are not.
2. Is any legitimate flow broken (creating a new fixture, replacing the same fixture, an existing `.json` that is a valid fixture of the other recipe)?
3. Does the existing-file check read the target safely (size bound, no symlink follow, no TOCTOU between the check and the atomic replace)?
4. Are the new C1 assertions falsifiable (the author removed each guard and C1 failed with `Missing expected rejection`)? Is anything over-built?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Every `[Blocker]` or `[Should]` asking for a behaviour change must carry `Observed input:`, `Affected scope:` and `Falsifier:` lines.

**Close rules for this thread (harness note, forge #1020):** when you approve, set the `STATUS:` line at the **top of this file** to `Approved` and `NEXT:` to `done`, in addition to your block. Do not run any `tick` command; the harness closes the token.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer — Round 1 (agy)

swept file: yes

* **[Pass]** Does each guard close its hole? Yes. None of the listed methods can overwrite a non-fixture file:
  * Symlinks are explicitly blocked by `stat.isSymbolicLink()` (tools/request.mjs:122).
  * Hardlinks are neutralized by the atomic `fs.rename()` (tools/request.mjs:134), which breaks the link and overwrites the directory entry rather than modifying the original file.
  * A case-insensitive `Manifest.json` on macOS resolving to an existing `manifest.json`, or any other non-fixture file, will be read but rejected by `existing?.id !== fixture.id` (tools/request.mjs:126) because it lacks the required recipe `id`.
  * A `runs` segment spelled differently (e.g. `Runs/`) simply creates a new fixture inside that directory rather than overwriting an existing non-fixture file.
* **[Pass]** For `--out`, directories like `tools`, `PROJECT`, or `examples` are still valid targets and would allow writing `manifest.json` and `runs/` inside them. However, they are out of scope for this fix, as the DoD only mandates forbidding the authorized root itself and `.git`, which is correctly implemented via `path.relative(root, absolute) === '' || path.relative(root, absolute).split(path.sep)[0] === '.git'` (tools/render.mjs:406).
* **[Pass]** Is any legitimate flow broken? No. Creating a new fixture works (ENOENT is caught), and replacing the same fixture works. Replacing an existing `.json` that is a valid fixture of the *other* recipe is blocked by `existing?.id !== fixture.id`, but this strictly adheres to the DoD which only asks to "replace a copy of the same fixture".
* **[Pass]** Does the existing-file check read safely? Yes. It uses `readBounded` with `LIMITS.inputBytes` for size bounds (tools/request.mjs:125), `lstat` and `O_NOFOLLOW` to prevent symlink following, and an atomic `fs.rename()` which eliminates TOCTOU vulnerabilities during the actual overwrite.
* **[Nit]** Are the C1 assertions falsifiable / Is anything over-built? The C1 assertions are falsifiable because they match specific rejection messages. However, the explicit `path.basename(target) === 'manifest.json'` guard in `saveFixture` (tools/request.mjs:117) is partially over-built. If it were removed, attempting to overwrite an existing `manifest.json` would still fail the `existing?.id !== fixture.id` check. The guard mostly serves to change the error message to match the specific C1 regex `/export manifest or run folder/` instead of `/existing file is not this fixture/`.
* **[Pass]** Pre-existing defects sweep: I reviewed `tools/request.mjs` and `tools/render.mjs` entirely and found no pre-existing defects in the touched files.

VERDICT: PASS
Basis: The fix is surgical, safely implements all constraints defined in the DoD, and contains no holes or TOCTOU vulnerabilities. The C1 canary assertions are sound.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
