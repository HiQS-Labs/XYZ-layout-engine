# RELAY · GH-1 spike artwork revision QA
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-10-08.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 2 / 4

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
6. **Commit only the relay file** (`relay(gh1-spike-artwork-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: commit 33d93a1: `tools/spike/scene.mjs`, `tools/spike/fixture.json`, `tools/spike/assets.mjs`, `tools/spike/assets/illustrations.svg`, `tools/spike/assets/SOURCES.md`, `tools/spike/assets/generated/prompts.json`, `tools/spike/downscale-assets.mjs`, `tools/spike/render.mjs`, `tools/spike/verify.mjs`, `tools/spike/output/measurements.json`, `tools/spike/output/runtime.json`, `tools/spike/REPORT.md`, `PROJECT/2-WORKING/SPECS-PRD.md`, `CHANGELOG.md`, `.gitignore`. Also read (binary/per-item): `tools/spike/assets/font-bold.ttf`, tools/spike/assets/generated/ID.result.json and tools/spike/assets/generated/web/ID.png for the seven ids in prompts.json, and the output PNGs.
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-10-08
- Definition of Done: the revised fixture/scene still satisfies the approved Phase 2 contract (backend-owned geometry, bounded fitting, override, hero, probes, digests) with `pnpm run spike:verify` as a real gate; the generated assets have honest provenance (model, recipe, reference-as-style-input, digests, alpha) and the reference image is never rendered as a layer; every number in the updated report/PRD/changelog is traceable to the delivered JSON or a recorded receipt; the two new backend findings are stated accurately; nothing pending is marked complete.

## Ground rules
1. This file is the single source of truth. The agents never share memory — read the whole file.
2. Take a turn only if `NEXT` names your role — otherwise reply "not my turn" and stop.
3. One turn = one block appended at the very bottom, above the marker. Never edit earlier turns.
4. Stay tight — findings are bullets, not essays. Grade every finding.
5. **The Reviewer never edits the artifact.** It proposes graded findings; the Producer implements.
6. The relay ends on **Approved** (Reviewer only). End each turn by committing just this file; no push.

## QA brief (read before reviewing)

Context: GH-1 Phase 0 spike, artwork revision after Phase 2/3 were approved (`relay-system/2026-10-08/gh1-spike-p2-postbuild.md`, `gh1-spike-p3-postbuild.md`). The operator asked to match `PROJECT/2-WORKING/layout-engine-reference.png`. Operational envelope: local spike scripts and documents; commensurate complexity, no engine/CI/framework.

Read: the commit diff, `PROJECT/2-WORKING/layout-engine-reference.png`, `tools/spike/output/{satori,playwright,override-satori,override-playwright}.png`, `tools/spike/assets/generated/web/*.png`, both evidence JSON files, `tools/spike/assets/SOURCES.md`, and the changed doc sections.

You may run narrow read-only probes under `.relay-scratch/` or `$TMPDIR`; do not run the renderer/verifier/PDDA here. Orchestrator receipts (full clone, Node v22.22.3, M1 Max): `node tools/spike/render.mjs` exit 0 (`satori: eligible`, `playwright: eligible`); `pnpm run spike:verify` exit 0 `VERDICT: PASS`; red control — append 1 byte to `assets/generated/web/water_bottle.png` → `VERDICT: FAIL`, `Basis: generated/web/water_bottle.png digest not recorded in SOURCES.md` (restored, PASS); `utils/pdda/pdda.sh run` exit 0, 0 errors, same 3 pre-existing warnings. Generation receipts: seven `chain.mjs image` calls, all exit 0, endpoint edit, alpha verified (ratios in SOURCES.md).

Questions:
1. Does the revised scene keep the Phase 2 evidence contract intact (text ids, containment map, overlap exclusions, fitting, override fields `sections.header.headline` / `sections.items[0].caption`)? Any id or containment entry that would let a real overlap escape the check?
2. Is the `height: '100%'` leaf sizing sound in both backends per `cases.*.*.bounds.hero_img` and `hero`, and does the override reflow without overflow?
3. Provenance: do SOURCES.md, prompts.json and each result.json agree (model, recipe ref, publication label, endpoint, original sha256, alpha)? Do the committed web PNG digests match the files? Is it clear the reference was a style input only and never rendered? Is the "usage per OpenAI terms, operator to confirm" note adequate?
4. The verifier additions (bold font digest; per-asset digest in SOURCES.md, alpha in result.json, RGBA colour type): correct and proportionate? Any way a swapped or opaque asset passes?
5. Report/PRD/changelog: are the two backend findings (line-height glyph overflow that font-size fitting cannot cure — 50 → 29.5 px; image stretch sizing differs — 518 vs 480) described accurately and only as strongly as the evidence supports? Note: those intermediate runs were superseded; their figures are from orchestrator observation during development, not from the delivered JSON — judge whether that is labelled clearly enough. Are all current timings/memory/size figures traceable to the delivered JSON or file sizes?
6. Agent visual assessment vs the reference: is it fair, and are remaining differences listed? Human acceptance must remain pending.
7. Scope: anything speculative, dead, or left over (e.g. the hand-authored SVG items now shadowed by generated PNGs, `bottle` vs `water_bottle`)?

Output: graded findings with citations, `VERDICT: PASS|FAIL|PARKED`, `Basis:`, `swept file: yes|no`; STATUS Approved only if nothing blocking remains. Hand off to claude-a if changes are requested.

## Log

### Reviewer · Round 1 (codex)

Review outcome: Changes requested
swept file: yes

The artwork revision needs three corrections before approval: asset digests are not bound to their ids, intermediate observations are presented under a delivered-JSON-only claim, and the geometry comparison is overstated. Bet: a small id-specific digest check and accurate evidence labels satisfy this local spike's contract; the failure mode is accepting substituted artwork or treating an unretained observation as reproducible evidence. Reversibility: Easy — this turn changes only the relay header and appended review.

Scope: swept the complete Setup sources, fixture, SVG, provenance/prompts, all seven result JSON records, both evidence JSON records, REPORT.md, PRD, CHANGELOG.md and .gitignore; inspected the bold font bytes and viewed the reference, all seven web assets and all eight output PNGs. Pre-existing code was in scope; the small statistics defect in finding 4 predates this revision. No other material pre-existing defect was found in this bounded sweep. MCP list_projects offsets 0/50 returned all 82 projects without this checkout/task clone; check_index_coverage returned `project not found or not indexed`, so graph generation/coverage are unavailable and direct source inspection is the fallback. README.md is absent. No git, renderer, verifier, PDDA, suite or executable fixture ran. Full-clone receipts are attributed; all probe output stayed in .relay-scratch/tmp.

- **1. [Should] Bind each web digest to its own asset id.** `tools/spike/verify.mjs:59-64` accepts any digest appearing anywhere in SOURCES.md, then checks alpha from the original result and only the web PNG's RGBA colour type. An in-memory replacement of leaf_glow with the delivered balance_scale bytes satisfies all three predicates despite disagreeing with the leaf row (`assets/SOURCES.md:11-12`). Fix: parse the existing table once and compare each id's file with that row's web digest; no new manifest or framework. Keep the current font checks.
  Observed input: target `generated/web/leaf_glow.png`, replacement bytes from `generated/web/balance_scale.png`, sha256 `e707666408606ae31f397e96fc3dc1eabf9d33a288b2cbcfb205258819d9a82d`; leaf's recorded web digest is `7305cfe1fdebefa35942fbed62c6a3cd90202ae312884efb131239f73bc8de57`.
  Affected scope: the seven generated web assets checked by the existing Phase 1 provenance loop; an unchanged image must retain its own identity, even when another image is also recorded and transparent.
  Falsifier: unchanged assets pass; swapping leaf_glow/balance_scale fails on the id-specific digest. If the current three predicates reject the replacement, this finding is wrong. Full `spike:verify` red-control execution is [Unverified — needs clone run]; the predicate counterexample below is measured without changing any asset.

  Probe command, exit 0:
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  python3 - <<'PY' > "$TMPDIR/swap-receipt.txt"
  from pathlib import Path
  import json,hashlib
  p=Path("tools/spike/assets"); s=(p/"SOURCES.md").read_text()
  b=(p/"generated/web/balance_scale.png").read_bytes()
  r=json.loads((p/"generated/leaf_glow.result.json").read_text())
  leafrow=next(x for x in s.splitlines() if x.startswith("| leaf_glow |"))
  h=hashlib.sha256(b).hexdigest()
  print("replacement_sha256",h)
  print("digest_anywhere",h in s,"original_alpha",r["alpha"]["hasAlphaChannel"] is True and r["alpha"]["transparentPixelRatio"]>0,"web_RGBA",b[25]==6,"digest_in_leaf_row",h in leafrow)
  PY
  probe_status=$?
  cat "$TMPDIR/swap-receipt.txt"
  exit "$probe_status"
  ```
  Decisive output: `digest_anywhere True original_alpha True web_RGBA True digest_in_leaf_row False`. This establishes the asset-check escape, not a newly executed full-gate result.

- **2. [Should] Label superseded development observations and cite their receipt.** `tools/spike/REPORT.md:7,9` says “Every number below is read from the delivered” JSON and “All figures below are from the post-revision render”, but lines 78-79 use 50→29.5 px, 5 iterations, 21.5 px and 518-vs-480 px from superseded runs. Delivered `cases.*.*.fitting` instead has six iteration-0 records and empty finalSizes. PRD:440 and CHANGELOG.md:6 repeat the history without the distinction; REPORT.md:124's “shrink path was never exercised” also needs “by the delivered acceptance cases.” Fix the opening exception and label these as orchestrator-observed intermediate runs, citing this relay's QA brief question 5; retain only numeric detail covered by a recorded observation/receipt. Attribute earlier 26.5/68.8 ms medians to the Phase 3 Round 2 receipt. The engineering implications can remain, bounded to the observed Inter/scene/backend configuration; “cannot reliably cure” is more accurate than an unconditional impossibility when rounding eventually passed.
  Observed input: REPORT.md:78-79 versus delivered six `iterations=0, finalSizes={}` records; the QA brief explicitly says the intermediate figures are not from delivered JSON.
  Affected scope: evidence labels in REPORT.md, PRD findings and the new changelog entry; no historical rerender is required if the attribution and limits are honest.
  Falsifier: a cited retained intermediate record or explicit orchestrator observation supporting each historical number, clearly separated from the current JSON, satisfies this request. Do not change current evidence to imitate an old run.

- **3. [Should] Bound the cross-backend geometry claim to the actual differences.** REPORT.md:102 and PRD:437 say the backends agree to “about half a pixel on section geometry.” Delivered baseline headline width is 597 vs 600.58 px; override hero y is 264 vs 262.5 px, and override header height differs by 1.5 px. The two chosen baseline examples are accurate but do not establish the broader bound. Fix: say the renders are visually similar, name the measured differences and avoid an overall half-pixel claim. REPORT.md:79's “resolves identically” should likewise allow the recorded half-pixel height difference.
  Observed input: `cases.baseline.{satori,playwright}.bounds.header_headline.width=[597,600.58]`; `cases.override.*.bounds.hero.y=[264,262.5]`.
  Affected scope: quantitative visual/geometry descriptions, not fitting, backend selection or artwork changes.
  Falsifier: limit the comparison to specifically cited bounds, or report the observed range; the claim then agrees with the delivered record. No pixel-parity promise is required.

- **4. [Nit] The pre-existing timing statistic is an upper median.** `render.mjs:270-273` selects sorted index 5 for ten samples rather than averaging indexes 4/5. Current Satori sample median is 137.84 ms versus recorded 137.86; browser 260.94 versus 260.95. These tiny differences do not alter the recommendation. Optional fix: label the statistic “upper median”, or use the conventional even-sample median on the next authorized regeneration. No extra benchmark suite requested.

- **5. [Pass] Delivered provenance records agree, and the reference is a style input.** SOURCES.md:7,11-17, prompts.json's `model/quality/background/reference/items`, and each `generated/<id>.result.json:1` agree on `gpt-image-2.5-flare`, recipe r2, local_candidate, edit endpoint, one reference, high quality, original bytes/digests and original alpha ratios. All seven actual web digests/byte sizes match their own table rows; PNGs have RGBA data and transparent background pixels. Bold font digest matches SOURCES.md:5 / verify.mjs:53-55, with font metadata Inter Bold, Version 4.000, weight 700. Original full-size hashes are provider-receipt evidence; originals are excluded by .gitignore and were not independently rehashed here. Scene:65-70 resolves individual ids; assets.mjs:8-24 reads generated web PNGs or individual SVGs, with no reference-image load. Saved Satori SVG contains all seven web digests and no reference-image digest. SOURCES.md's “operator to confirm before any non-spike use” preserves the pending rights review; this is not legal clearance. No asset change requested apart from finding 1's gate correction.

- **6. [Pass] Current geometry, override, hero and probes preserve the Phase 2 contract.** Scene:14-41's text ids/containment match all delivered text records; the only absent optional text is header_caption. Direct inspection of all six cases found no missing required containment member, child outside its parent, undeclared labeled overlap or inconsistent raw text-overflow flag. `render.mjs:160-202` still derives fitting from backend measurements with a 10-iteration cap; lines 372-379 apply the exact two override fields. Delivered fitting is `(fit=true, iterations=0, unresolved=[])` everywhere. Hero image height equals its hero row in both nutrition cases: 518/518.5 baseline and 363/363.5 override; viewed override headline/caption wrap to three/four lines without apparent clipping. Both product heroes are 1200×630, with browser document overflow false. All eight output PNG hashes match their records; repeat digests and probe classifications remain consistent with `measurements.digests`, `probes` and `probeArtifacts`. No current scene/containment defect or second layout engine was found; no fix requested.

  Saved-evidence probe for findings 2, 3 and 6 (also current sizes/timing/memory), exit 0:
  ```sh
  export PYTHONDONTWRITEBYTECODE=1 TMPDIR="$PWD/.relay-scratch/tmp"
  python3 - <<'PY' > "$TMPDIR/review-receipt.txt"
  import json,hashlib
  from pathlib import Path
  p=Path("tools/spike"); m=json.loads((p/"output/measurements.json").read_text()); rt=json.loads((p/"output/runtime.json").read_text())
  print("fits",[(n,b,c["fitting"]["iterations"],c["fitting"]["finalSizes"]) for n,per in m["cases"].items() for b,c in per.items()])
  for n in ("baseline","override"):
   print(n,"heroHeight",[(b,m["cases"][n][b]["bounds"]["hero_img"]["height"]) for b in ("satori","playwright")])
  print("baselineHeadlineWidth",[m["cases"]["baseline"][b]["bounds"]["header_headline"]["width"] for b in ("satori","playwright")])
  print("overrideHeroY",[m["cases"]["override"][b]["bounds"]["hero"]["y"] for b in ("satori","playwright")])
  records=[c for per in m["cases"].values() for c in per.values()]+list(m["probeArtifacts"].values())
  print("outputHashesMatch",all(hashlib.sha256((p/c["png"]).read_bytes()).hexdigest()==c["sha256"] for c in records))
  print("sizes",{"fixture":(p/"fixture.json").stat().st_size,"webTotal":sum(f.stat().st_size for f in (p/"assets/generated/web").glob("*.png")),"maxPNG":max(f.stat().st_size for f in (p/"output").glob("*.png")),"SVG":(p/"output/satori.svg").stat().st_size})
  print("warmMedian",[rt[b]["warm"]["median"] for b in ("satori","playwright")],"rssMiB",[round(rt[b]["memory"]["nodeProcess"]["rss"]/2**20,2) for b in ("satori","playwright")])
  PY
  probe_status=$?
  cat "$TMPDIR/review-receipt.txt"
  exit "$probe_status"
  ```
  Decisive output: six iteration-0/empty-size records; hero heights `[518,518.5]` / `[363,363.5]`; baseline headline width `[597,600.58]`; override hero y `[264,262.5]`; `outputHashesMatch True`; sizes `{fixture:1988, webTotal:2871670, maxPNG:550004, SVG:4023437}`; warm medians `[137.86,260.95]`, Node rss MiB `[472.03,661.53]`. Current report size/memory/timing figures are traceable to these fields (minor displayed truncation/rounding does not change the call).

- **7. [Pass] Scope and pending acceptance stay bounded.** REPORT.md:102,116,124-126 and PRD:141,449 keep human artwork acceptance and deployment measurements pending; later phase QA boxes remain open. Viewed art follows the required composition, with visibly smaller illustrations/more whitespace than the reference as well as the listed font/icon/leaf differences; similarity is an agent assessment. `illustrations.svg:19-23`'s `bottle` is still used by hero-fixture.json, distinct from nutrition's generated `water_bottle`; five older SVG ids are unused by the delivered fixtures, not shadow copies of the new generated ids. Their optional removal/comment cleanup is minor, with no speculative engine/CI/framework introduced. No additional scope expansion requested.

- **8. [Unverified — needs clone run] Full gates remain attributed.** The QA brief records full-clone render exit 0, verifier PASS, the tampered water-bottle red control and PDDA exit 0/zero errors/three existing warnings. This turn did not rerun those commands; fresh execution and the swapped-id red control belong to the harness/full clone after producer changes.

VERDICT: FAIL
Basis: The delivered artwork and current geometry/fitting evidence are sound within the spike's limits, but findings 1-3 fail the requested gate-integrity and honest-evidence contract. Correct those without adding an engine, manifest framework or test suite; keep human acceptance pending.

Handing off to claude-a (Producer) — disposition findings 1-3, implement the bounded gate/document fixes and obtain full-clone receipts; go to the Producer window and say 'take your turn'.

### Producer · Round 1 → 2 (claude-a)

Fixes committed as `bf06d76`. Full-clone receipts (Node v22.22.3, M1 Max). No re-render was needed: no change affects rendered output, and the delivered evidence files are unchanged.

- **1. [Should] id-bound web digests — Implemented.** `verify.mjs` now finds the `| <id> |` row in SOURCES.md and compares the file's sha256 with that row's web-digest cell; a missing row fails. Receipt (your exact input): copy `generated/web/balance_scale.png` over `generated/web/leaf_glow.png` → `VERDICT: FAIL` / `Basis: generated/web/leaf_glow.png does not match its own SOURCES.md web digest`; restored → `VERDICT: PASS`. Font checks unchanged.
- **2. [Should] development observations — Implemented.** REPORT.md opening now reads "Except where a figure is explicitly labelled as a development observation, every number below is read from the delivered …"; the revision note says the two §5 development observations are labelled. §5 introduces both findings as "orchestrator development observations from intermediate renders that were superseded … not in the delivered JSON (whose six acceptance cases all fit at iteration 0), and no intermediate evidence file was retained". The same qualifier is in the PRD bullet and the CHANGELOG line. The Known-gaps sentence now says the delivered acceptance cases never exercise the shrink path, and that it ran only in the superseded development render, where it degraded the headline.
- **3. [Should] geometry claim — Implemented.** The half-pixel claim is removed from REPORT.md §8 and the PRD. Both now give the measured spread over all 98 labelled boxes in baseline and override: median per-box difference 0.63 px and largest 3.58 px (`baseline` `header_headline` width 597 vs 600.58), plus override `hero` y 264 vs 262.5. Both state that this is not a pixel-parity claim. The §5 image-sizing note now says `height: 100%` resolves to the row height in both, with delivered `hero_img` heights differing by at most 0.5 px. Also added your visual note that the illustrations are drawn smaller, with more whitespace, than in the reference.
- **4. [Nit] median — Implemented as a label.** The report and PRD now say "upper median (sorted index 5 of 10)", and a source comment on `stats()` says the same. Values are unchanged, so the documents still match the delivered JSON with no re-render.
- **5–7. [Pass] — acknowledged; optional cleanup done.** The five SVG illustrations no fixture uses any more (leaf_and_glow, apple, water_drop, leaf, grain) are removed; `bottle` stays because the hero fixture uses it. Gate after removal: `VERDICT: PASS`. Output PNG digests are unchanged, which shows the removal did not affect any render.
- **8. [Unverified] — receipts.** `pnpm run spike:verify` → exit 0 PASS; swapped-id red control above → FAIL then PASS; `utils/pdda/pdda.sh run` → exit 0, no errors, the same 3 pre-existing warnings.

VERDICT: PASS
Basis: findings 1–3 are implemented with a red/green receipt for the gate change, the nit is labelled without altering evidence, and the optional dead-SVG cleanup is done.

Handing off to codex (Reviewer) — round 2 against `bf06d76`; go to the Reviewer window and say 'take your turn'.

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
