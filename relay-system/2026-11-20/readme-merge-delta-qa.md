# RELAY · README merge delta QA (upstream #74-#84 capabilities)
<!--
  Single source of truth for this two-agent relay. Read the ENTIRE file before acting.
  Scaffolded by relay-automation/new-relay.sh on 2026-11-20.
-->

NEXT: Reviewer
STATUS: Open
ROUND: 2 / 2

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
6. **Commit only the relay file** (`relay(readme-merge-delta-qa): <role> r<N>`); no push. **Stop** and report one line.
7. **Hand off explicitly — EVERY turn, not just the first** (GH-268). End your turn by naming who acts
   next and what they should do: *"handing off to <other role> — go to the <other> window and say
   'take your turn'"*, or *"relay closed (Approved), no further turn needed"*. The beta report singled
   this out: the Reviewer turn never told the user to return to the Producer window, so a relay that
   was merely waiting looked stalled. A turn that ends without this line is not finished.

## Setup
- Artifact under review: `README.md`, `FRONTDOOR.md`, `CHANGELOG.md`, `package.json`
- Change: merge commit 118bd38 brought origin/main (#74 to #84) into branch docs/readme-frontdoor, whose earlier README rewrite was approved by codex in relay-system/2026-11-20/readme-frontdoor-qa.md at ca2a990. Review only what the merge changed in the four files above: run git diff ca2a990 118bd38 -- README.md FRONTDOOR.md CHANGELOG.md package.json (plus f9a3987, a one-line FRONTDOOR echo wording nit from that review).
- Operational envelope: docs-only; private local ESM CLI; no new tests, scripts, CI or config wanted. Read-only probes under `.relay-scratch/` or `$TMPDIR` only; do not run `npx impeccable` (downloads a third-party package), `pnpm test`, or renders into tracked paths.
- Questions:
  1. Do the new README sections ("Craft linting, Impeccable and editorial assets", "Reviewing finished output", "Using the engine from another repository", the six new command-table rows, three Hallmark example rows, `--craft`, `AS-1`..`AS-14`, two new skills, layout lines) match the source? Cite `file:line` in `tools/craft-lint.mjs`, `tools/intake.mjs`, `tools/impeccable/audit.mjs`, `tools/export-editorial-asset.mjs`, `tools/hallmark.mjs`, `tools/review.mjs`, `tools/plugin-api.mjs`, `REVIEW/README.md`, `.gitignore`, `SYSTEM-INSTRUCTIONS.md`.
  2. Was any substantive fact from the upstream README sections (origin/main README: Hallmark, editorial asset provider, craft linter/audit, Impeccable, plugin API) dropped rather than carried over? Compare with git show 118bd38^2:README.md.
  3. Is the network statement correct (rendering offline; audit falls back to `npx --yes impeccable detect`)? Is the heading "Using the engine from another repository" intact for `ROUTER.md` and `tools/plugin-api.mjs` references?
  4. `package.json`: are `exports` and `engines` both present and is the merge resolution correct? Any CHANGELOG ordering or duplication problem from the merge?
  5. Anything over-built or conflicting with AGENTS.md / ROUTER.md rules?
- Reviewer: codex   ·   Producer: claude-a
- Started: 2026-11-20
- Definition of Done: every claim checked in Q1–Q4 is correct or listed as a finding with `file:line`; no upstream README fact lost; no `[Blocker]` remains. PASS → set `STATUS: Approved`.

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
Basis: current-source review found two README accuracy issues; the historical no-fact-lost criterion remains unverified. Both requested corrections are docs-only, Easy to reverse. Bet: describe the existing heuristic precisely rather than expand runtime enforcement; failure mode is readers treating a green lint as proportional-type compliance.
swept file: yes

- [Should] R1 — `README.md:124` says “exit 1 on violations”; `README.md:312–315` implies the linter enforces snapped proportional typography and all listed invariants. Actual checks only reject numeric `settings.type.*.size` when non-integer or below 12 (`tools/craft-lint.mjs:80–89`); empty plates are warnings (`:91–109`), with exit 0 (`:133–138`). Narrow the command row and prose to errors versus warnings and explicitly leave AS-12 percentages/four-size compliance to manual checks, as `skills/impeccable/SKILL.md` already does. No runtime change requested.
  Observed input: `{width:1200,height:1200,elements:[],settings:{type:{headline:{size:13}}}}` returns `ok:true` with no findings; `{width:1200,height:1200,elements:[{type:"rect",id:"empty",x:10,y:10,width:100,height:100}]}` returns `ok:true` and one warning.
  Affected scope: README descriptions of standalone craft-lint and `intake --craft`, not schema admission or runtime behavior.
  Falsifier: if those inputs returned errors, the wording might be accurate; current source and the probe show they do not.
  Probe command (exit 0): `node --input-type=module -e 'import {lintFixture} from "./tools/craft-lint.mjs"; for (const [name,fixture] of Object.entries({offScale:{width:1200,height:1200,elements:[],settings:{type:{headline:{size:13}}}},emptyPlate:{width:1200,height:1200,elements:[{type:"rect",id:"empty",x:10,y:10,width:100,height:100}]}})) console.log(name,JSON.stringify(lintFixture(fixture)));'`
  Decisive output: `offScale {"ok":true,"findings":[],"errors":[],"warnings":[]}`; `emptyPlate` had `"ok":true`, `"errors":[]`, and `"severity":"warn"` for `no-empty-decorative-plates`.
- [Should] R2 — pre-existing sentence `README.md:284` (“Generating cutouts is the only step that uses the network or costs money”) now contradicts the documented downloads at `README.md:249–252` and `:324–325`. Replace it with “Cutout generation calls a paid image API and is never part of rendering”; retain the accurate network caveats near quick start. No implementation change requested.
  Observed input: the quoted sentence alongside the explicit `npx --yes --package=@google/design.md@0.4.0` download and audit fallback.
  Affected scope: the optional paid-generation paragraph, not the offline rendering guarantee.
  Falsifier: neither optional tool could download packages; `tools/impeccable/audit.mjs:69–70` explicitly invokes `npx` with `--yes impeccable detect`.
- [Pass] Q1/Q3, audit and intake wiring: `tools/impeccable/audit.mjs:10–24,27–45,63–73` matches README binary precedence, recursive first-file discovery and exact fallback; `tools/intake.mjs:6,14–18,27–30` runs the shared linter with `--craft`. The cross-repository heading is intact at `README.md:362`, matching `ROUTER.md` and `tools/plugin-api.mjs:8–9`. Fix R2 to make the whole-file network wording consistent. Offline rendering/browser behavior was not dynamically rerun.
- [Pass] Q1, review/public API: `tools/review.mjs:9,14–22,25–33,48–51` supports engine-root publication, replacement, newest-first indexing and both CLI modes; `.gitignore:13–14` and `REVIEW/README.md` support the privacy convention. `tools/plugin-api.mjs:13–15` exports exactly the two documented names. These are static checks; no publication was invoked.
- [Pass] Q1/Q4, package and example/export facts: `package.json:4–11` retains private ESM, both root/package-json exports and Node `>=22.13`; the alias dependency in `README.md:370` makes importing as `xyz-layout-engine` valid despite the internal package name. `tools/export-editorial-asset.mjs:17–20,54–74,87–104,113–124` supports the flags, crop, default scale/transparency, dimensions and markup. JSON inspection of the three Hallmark fixtures found `design-intake` with 1200×1200, 1200×1200 and 1200×1600 respectively; Bento `card_hero` is 624×504 with no top-level title, matching the documented 1248×1008 / default-alt example (`README.md:345–346`). `tools/hallmark.mjs:9–19,119–146,174–219` supports reading from an external local clone. `SYSTEM-INSTRUCTIONS.md:73–85` supports steering verbs and AS-14; the new skill files exist and describe the README workflows.
- [Nit] Q4, whole-file historical ordering: `CHANGELOG.md:532–567` contains `[Unreleased]` followed by three dated October 9 entries below October 1, and `:100–145` also mixes October 14/15. No duplicate exact H2 headings or conflict markers were found by a read-only Python scan (exit 0: `duplicate changelog headings: []`, `merge markers: False`). Do not claim globally chronological ordering; no historical rewrite requested for this merge review. No additional pre-existing defects found in the four-file sweep beyond the network sentence and these historical ordering issues; FRONTDOOR's already-open FD-07–FD-10 remain recorded, not newly resolved.
- [Unverified — historical comparison unavailable] Q2 and exact merge provenance: the enclosing turn expressly prohibits every Git invocation, overriding Setup's `git diff`/`git show` requests. Neither `118bd38^2:README.md` nor the historical diff was supplied in the relay, so I cannot certify that no upstream substantive fact was lost or that `FRONTDOOR.md:11`'s `e100f57` identity matches the stated merge. Supply the requested historical comparison as harness/Producer evidence for the next review; do not infer preservation from current-section coverage alone.
- [Unverified — needs clone run] Fresh install, full renders, synchronous require failure, canaries and PDDA gates were not rerun under this reviewer envelope. Prior CHANGELOG/FRONTDOOR execution receipts are author evidence, not independent execution this turn. Graph discovery was attempted first; MCP returned `MCP tool call requires approval, but approval policy is never`, so direct source reads were used. No new tests/scripts/config are justified by these prose corrections (Q5).

Handing off to Producer (claude-a) — address R1/R2 and provide historical comparison evidence, then return for round 2. No artifact files were edited by this reviewer; harness owns the relay-only commit.

### Producer · Round 1 disposition · claude-a

- R1 — Accepted (commit afe60f0). Command row now reads "Check a fixture for some of the `AS-14` craft rules; exit 1 on errors, warnings still pass." The Craft linter paragraph lists exactly the error rules (nested card with duplicate border+fill, border+shadow, side stripe on rounded card, `settings.type.*.size` non-integer or < 12 px; the `report()` calls in tools/craft-lint.mjs) and the warning-only rule (empty rect, severity `'warn'`), and says the `% of S` scale and four-size limit (`AS-12`) are not checked and must be checked by hand. Bento lint still prints `craft-lint: PASSED (0 warning(s))`, exit 0.
- R2 — Accepted. The paid-generation paragraph now opens "Cutout generation calls a paid image API and is never part of rendering." The quick-start network sentence already names the audit `npx` fallback; the DESIGN.md lint download stays stated beside its command.
- Nit (CHANGELOG historical ordering) — Acknowledged: pre-existing, out of scope; no claim of global chronological order is made.
- Q2 evidence (supplied because the turn forbids git). Provenance: `git rev-parse --short 118bd38^2` → `e100f57`, equal to `origin/main` at merge time; merge base with the approved head ca2a990 is `eac7023`, so FRONTDOOR.md's `e100f57` is the merged upstream tip. Below is every line upstream ADDED to README.md between `eac7023` and `e100f57` (`git diff eac7023 e100f57 -- README.md`, `+` lines only; the one changed line replaced `AS-1`..`AS-12` with `AS-1`..`AS-14`). Fact → new README location:
  - Hallmark: 21 macrostructures / 50 themes, `--from <path>`, no third-party files in core, Bento `intake --craft` and render commands → Examples (three Hallmark rows, plus a Hallmark paragraph with the `tools/hallmark.mjs` usage line, `HALLMARK_PATH`, default `../hallmark`).
  - Editorial asset provider: high-DPI transparent SVG/PNG, infographics/cards/badges, React/Next.js/Vite, responsive `<img>`, the `--element card_hero --scale 2` command and its markup → "Editorial assets for web apps" (which adds the tool's full usage line).
  - Craft linter + audit: AS-13 verbs, AS-14 invariants, `craft-lint.mjs`, `impeccable/audit.mjs <dir>` → "Craft linter" (now precise per R1) and "Headless HTML audit".
  - Impeccable section: 62-rule detector (WCAG AA contrast, cramped padding, font-size floors, layout tension), the direct `npx impeccable detect` form, the Editorial Asset Factory rationale (CSS struggles with infographics, editorial cards, diagrams), the four verbs and their definitions → "Headless HTML audit", "Steering verbs", "Editorial assets for web apps". Upstream's "without adding external runtime dependencies" is true for package.json but not for the network, so the README states the `npx` download instead of copying that phrase.
  - "Using the engine from another repository": carried over verbatim except line wrapping and "git-ignored" → "gitignored".
  - AS-1..AS-14 → the "What to read first" table.

```text
- **Hallmark Macrostructures & Themes (`tools/hallmark.mjs`)**:
  [Bento Grid](examples/2026-11-09-hallmark-bento/README.md), [Stat-Led](examples/2026-11-09-hallmark-stat-led/README.md), and [How to Skateboard Guide](examples/2026-11-09-hallmark-skate-guide/README.md). Dynamically parses 21 Hallmark macrostructures and 50 print/editorial themes from an external clone (`tools/hallmark.mjs --from <path>`) without baking third-party files into core.
  ```sh
  node tools/intake.mjs check examples/2026-11-09-hallmark-bento/fixture.json --craft
  node tools/render.mjs examples/2026-11-09-hallmark-bento/fixture.json --format png,svg,html,html-inline --out .relay-scratch/hallmark-bento
  ```
- **Editorial Asset Provider (`tools/export-editorial-asset.mjs`)**:
  Compiles isolated, high-DPI transparent SVG and PNG editorial components (infographics, cards, badges) directly from recipe fixtures for embedding into external web applications (React, Next.js, Vite) with auto-generated responsive `<img>` markup:
  ```sh
  node tools/export-editorial-asset.mjs examples/2026-11-09-hallmark-bento/fixture.json --element card_hero --scale 2 --out temp/hero-card.png
  ```
- **Craft Floor Linter & Headless HTML Audit**:
  [`SYSTEM-INSTRUCTIONS.md`](SYSTEM-INSTRUCTIONS.md) defines `AS-13` (steering verbs: `distill`, `bolder`, `quieter`, `typeset`) and `AS-14` (anti-slop invariants). Enforced deterministically by [`tools/craft-lint.mjs`](tools/craft-lint.mjs) (no nested cards, elevation singularity, no asymmetric side stripes, typography ramp snapping) and verified via headless HTML auditing:
  ```sh
  node tools/craft-lint.mjs examples/2026-11-09-hallmark-bento/fixture.json
  node tools/impeccable/audit.mjs examples/2026-11-09-hallmark-bento/renders
  ```
  [`SYSTEM-INSTRUCTIONS.md`](SYSTEM-INSTRUCTIONS.md) defines the repository-wide anti-slop visual rules (`AS-1`..`AS-14`, including directional ground/contact cast shadows vs. whole-shape silhouette drop-shadows, proportional `% of S` type scale, steering verbs, and craft invariants), and [`SOP.md`](SOP.md) (paired with [`skills/higgsfield-cli/SKILL.md`](skills/higgsfield-cli/SKILL.md)) documents transparent PNG asset generation (`gpt-image-2.5-flare` via the HiQS caller and Higgsfield CLI), corner-alpha verification ([`inspect-alpha.mjs`](examples/2026-10-09-cell-division/inspect-alpha.mjs)), and pinned asset provenance (`provenance.json`).

## Using XYZ Layout Engine with Impeccable

[Impeccable](https://github.com/pbakaus/impeccable) provides coding agents with a structured design vocabulary and deterministic anti-slop detection for web applications. **XYZ Layout Engine** pairs naturally with Impeccable in three complementary ways:

### 1. Headless HTML Quality Auditing
XYZ Layout Engine compiles reproducible, self-contained HTML exports (`render.html` and `render-inline.html`). You can audit rendered output using Impeccable's deterministic 62-rule detector (checking WCAG AA contrast ratios, cramped container padding, font size floors, and layout tension) without adding external runtime dependencies:

```sh
# Audit a rendered publication directory using the engine's integration helper:
node tools/impeccable/audit.mjs examples/2026-11-09-hallmark-bento/renders

# Or run Impeccable CLI directly against the standalone HTML export:
npx impeccable detect .relay-scratch/nutrition-export/render-inline.html
```

### 2. Editorial Asset Provider for Web Apps
Impeccable-steered coding agents excel at structuring web pages, forms, and application chrome in React, Vite, Next.js, or SvelteKit, but CSS flexbox often struggles with complex visual infographics, multi-panel editorial cards, or technical diagrams.

Use XYZ Layout Engine as an **Editorial Asset Factory**: compile an entire recipe or crop a specific sub-component into an isolated, high-DPI transparent PNG or SVG asset:

```sh
# Export an individual card at 2x Retina scale with transparent alpha:
node tools/export-editorial-asset.mjs examples/2026-11-09-hallmark-bento/fixture.json \
  --element card_hero \
  --scale 2 \
  --out src/assets/hero-card.png
```
The command outputs the asset and ready-to-use responsive HTML markup:
```html
<img src="hero-card.png" width="624" height="504" alt="Editorial Asset" loading="lazy" decoding="async" />
```

### 3. Steering Recipe Iterations with Impeccable Verbs
When prompting coding agents to iterate on or refine an XYZ Layout Engine recipe, use Impeccable's 4 core steering verbs (`AS-13`) to eliminate ambiguity:

- **`distill`**: Strip secondary boxes, remove container borders, delete filler copy, and let white space and typographic scale carry the layout.
- **`bolder`**: Increase scale contrast (expand headline toward the upper 10% limit of $S$, punch dominant darks, widen outer margins for editorial drama).
- **`quieter`**: Tone down saturated colors, soften rules into subtle hairlines, increase line-heights, and add air between sections.
- **`typeset`**: Snap all text sizes strictly to the `% of S` scale (max 4 distinct sizes on canvas), align cap-heights to baselines, and balance paragraph measure (40–60 characters).

## Using the engine from another repository

Modules that live in their own repository (private or third-party) use the engine through one declared
surface, `tools/plugin-api.mjs`, which `package.json` `exports` maps to the package root. Link a checkout
of this repository as a package and import by name:

```jsonc
// the other repository's package.json — then run `pnpm install` there (no network needed for a link)
{ "dependencies": { "xyz-layout-engine": "link:../XYZ-layout-engine" } }
```

```js
import { launchPlaywright, publishForReview } from 'xyz-layout-engine';

const browser = await launchPlaywright();          // the engine's own Chromium; close it when done
try { /* render pages */ } finally { await browser.close(); }
await publishForReview('my-project', ['out/page.png'], { note: 'Page 1' });
```

| Name | What it does |
|---|---|
| `launchPlaywright()` | Starts the engine's Playwright Chromium and returns the browser; the caller closes it. |
| `publishForReview(project, files, { note })` | **Replaces** `REVIEW/<project>/` in the engine checkout with copies of `files` and rebuilds `REVIEW/index.html`. That folder's contents are git-ignored, so private output never enters this repository. |

The package is ESM-only: use `import` (or `await import()` from CommonJS); synchronous `require('xyz-layout-engine')` fails with `ERR_REQUIRE_ASYNC_MODULE`. Run `pnpm install` in the engine checkout first; on a machine that has never run Playwright, also run
`pnpm exec playwright install chromium` there. Nothing else is public: any other engine path imported by
package name fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` (only `xyz-layout-engine/package.json` is also
exported), and engine files may change without notice. A module that needs another engine function asks for it to be added to
`tools/plugin-api.mjs` (see that file's header). Loading outside recipes into the engine's own request
pipeline is not supported yet; see `PROJECT/2-WORKING/SPECS-PRD.md` §6.5.
```

<!-- ↓↓↓ NEXT TURN goes here (append above nothing — this marker stays last) ↓↓↓ -->
