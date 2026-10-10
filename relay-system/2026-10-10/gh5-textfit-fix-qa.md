# RELAY · GH-5 text-fit blocker fix: code QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-10.
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
6. **Commit only the relay file** (`relay(gh5-textfit-fix-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `tools/render.mjs`, `tools/spike/test/canaries.test.mjs`. Context: `PROJECT/2-WORKING/GH-5-MVP-FOUNDATION.md`, `test-budget.json`.
- Reviewer: agy   ·   Producer: claude-a
- Started: 2026-10-10
- Definition of Done: the fix closes the PR #18 review blocker (text fitting reported fit:true for an unbreakable word wider than its box and published a clipped PNG): such text now shrinks until it fits or the request is refused as non-fit with no artifact published; text that already fit is unchanged; the examples that call renderSatori directly are unaffected; the change is surgical and extends an existing canary (no new test file, workflow or dependency); the red control is real.

## QA brief (read before reviewing)

Operational envelope: a local single-developer library. Grade against the Definition of Done and commensurate complexity; do not demand enterprise machinery. Review the whole diff of the last commit (`git show HEAD`) and the surrounding code in `tools/render.mjs` (the fit loop in `processRequest`, `renderSatori`, `measureLongestWords`).

Questions:
1. Is the root cause addressed (Satori clamps the text box to its container) rather than a symptom patched? Can the probe mis-measure (inherited style that is not on the text leaf, letter spacing, text transform, multi-script text, a font-weight mismatch) in a way that gives a false non-fit on text that renders fine, or a false fit? Name a concrete input.
2. Does `measureWords` stay off for every caller except the CLI render path, so example diagrams and the spike are byte-identical?
3. Is the added canary assertion falsifiable (the author disabled the fix and C1 failed with 'Missing expected rejection')? Does it leave the published run untouched on refusal?
4. Cost: the probe adds one Satori call per fit attempt; acceptable?
5. Anything wrong with the failure message or the 10-attempt / 12px-minimum behaviour for an unfittable word?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, and `swept file: yes|no`. Set STATUS Approved only on PASS.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## Log

### Reviewer - Round 1

swept file: yes

- **[Blocker]** `measureLongestWords` splits by `/\s+/` and incorrectly chooses the longest word by character length instead of rendered pixel width, causing false fits for visually wide short-character words.
  Observed input: `title: "WWWW iiiii"`
  Affected scope: `measureLongestWords` (tools/render.mjs:59)
  Falsifier: A container of width 50px measures `longestWord` as `iiiii` (e.g. 39px) and concludes it fits, completely ignoring the `WWWW` (e.g. 129px) which overflows and will clip in production.
- **[Blocker]** Inherited styles bypass the `longestWord` probe. Satori's `n.props.style` only surfaces inline props, so inherited styles (like `fontSize` or `fontWeight`) are missing, leading to `undefined` or default measurements.
  Observed input: `{ style: { fontSize: 40, fontWeight: 700 }, children: { props: { id: 'text_node' }, children: 'WWWW' } }`
  Affected scope: `measureLongestWords` filter and probe construction (tools/render.mjs:58-60)
  Falsifier: If `fontSize` is inherited, `b.style?.fontSize` is undefined, bypassing measurement altogether (`longestWord` is undefined), yielding a false fit. If `fontWeight` is inherited, the probe renders at `weight: 400`, under-measuring the bold word and yielding a false fit.
- **[Blocker]** The 10-attempt limit (`MAX_ATTEMPTS`) with a `0.9` shrink factor caps total size reduction to ~35% (`0.9^10`) of the original size, preventing large text from ever reaching the `12px` minimum.
  Observed input: `title: "W".repeat(60)` in the `solar-system` recipe.
  Affected scope: `MAX_ATTEMPTS` and shrink loop limit (tools/render.mjs:213)
  Falsifier: The `solar-system` title starts at 108px and only shrinks to 40px in 10 attempts. It fails with `non-fit after 10 attempts` because it ran out of iterations, even though it would have successfully fit at 25px (well above the `12px` minimum).
- **[Should]** The failure message conflates an unbreakable word exceeding its box width with wrapped text exceeding the parent region height.
  Observed input: `title: "W".repeat(120)`
  Affected scope: `processRequest` exception message (tools/render.mjs:281)
  Falsifier: Throws "text outside its region", but the text never actually exceeded its region height; it was simply a word wider than its box width.
- **[Pass]** `measureWords` correctly defaults to `false` in `renderSatori` (`tools/render.mjs:24`) and is only enabled in `processRequest` for the CLI path (`tools/render.mjs:227`).
- **[Pass]** The canary assertion is falsifiable (`tools/spike/test/canaries.test.mjs:92`): if the `box.longestWord` check is disabled, the test fails with "Missing expected rejection". The published run is left untouched on refusal because `processRequest` throws before `publishArtifacts` is called (`tools/render.mjs:479`).

VERDICT: FAIL
Basis: The fix introduces a false fit for words wider than their container due to character-length based word selection and inherited style blindness, and introduces a false non-fit for large text due to an inflexible iteration limit.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
