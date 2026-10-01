# Guiding Principles

The north star this repo's goals and implementation decisions answer to. When a design choice is
unclear, the option that better serves these principles wins.

## Purpose

XYZ Layout Engine turns structured data and versioned recipes into reproducible visual artifacts. Its core
stays domain-neutral; local and remote workflows use the same engine through library, CLI, HTTP API,
and MCP. The product contract lives in [SPECS-PRD.md](PROJECT/2-WORKING/SPECS-PRD.md).

## Architecture principles

1. **Balance total cost.** DRY, durability, maintainability, security, and performance guide design
   together. Security and data integrity are baseline requirements; optimize measured bottlenecks
   without making ownership or recovery harder to understand.
2. **One rule, one owner.** Share request schemas, recipe resolution, validation, geometry, and render
   operations across entry points. Keep transport, storage, and deployment concerns outside the core.
   DRY removes duplicated knowledge; it does not justify a generic framework for unrelated behavior.
3. **Durable contracts, reproducible results.** Resolve immutable recipe versions, pin render inputs,
   and make accepted async work recoverable and safe to retry. No cloud dependency for local rendering;
   no silent upload or deployment switch. Version public contracts deliberately.
4. **The smallest mechanism that meets the requirement.** Apply the ponytail ladder: omit speculative
   machinery, then prefer the standard library, platform facilities, installed dependencies, and the
   minimum code. A new package, queue, abstraction, or dependency names the present need it serves and
   why the simpler option fails. SOLID supports clear responsibilities, not interface proliferation.
5. **Secure at the boundary.** Validate untrusted input, bound resource use, enforce tenant/resource
   authorization, and keep executable recipes trusted. Every entry point uses the same protections;
   renderer or protocol convenience must not bypass them.
6. **Measure before expanding.** Record the runtime, fixtures, and observed latency/resource use.
   Reuse existing checks; a new test or CI gate names a concrete failure mode and why existing checks
   cannot catch it. Keep verification proportional to risk.

## Project-state principles

PDDA supports this product by keeping docs a reliable source of truth for long-running work, so a
human or cold agent can stop, resume, or hand off without relying on chat history.

1. **Docs are the runtime state, not a record of it.** The current `PROJECT/**` docs *are* the
   project's state. If reality and the docs disagree, that is the bug to fix.
2. **Resumable by a cold agent.** Every active doc must let an agent with zero prior context answer
   "what was just done, what's next" in seconds — that's why the status header is a contract.
3. **Deterministic where judgment isn't needed.** Scripts enforce the mechanical rules; the LLM
   reviewer only handles what regex can't. Never make an agent re-decide settled hygiene.
4. **One canonical place per fact.** The configured planning ledger (`releases.db` here) points,
   project docs hold detail, and `CHANGELOG.md` logs outcomes. No fact lives in two places where they can drift.
5. **A clear signal of what is live.** `PROJECT/2-WORKING` holds only truly active work, so "what
   should an agent pick up" is never ambiguous.
6. **Low-friction and portable.** The contract must be cheap to adopt (a one-command install) and
   cheap to obey, or agents will route around it.
7. **Default to the reversible action; require evidence for the expensive one.** When an item is
   stale, orphaned, or its dependency has left the repo, *close / park / archive is the default* —
   those are cheap and undoable. Keeping it open is what costs: it buys recurring triage attention on
   every future pass. So the burden of proof sits on **keeping**, not on closing. State a default and
   the one fact that would overturn it, rather than presenting symmetric options — "close as obsolete,
   or re-scope?" is how an item sits untouched for nine days.
8. **A finding that was reported is not a finding that was seen.** Detection is only half a check.
   If a run's closing line contradicts its own output, the signal is lost no matter how correct the
   detector was — so summary lines must reflect what was actually found. Corollary of #3: being
   deterministic about *detecting* is wasted if the *reporting* rounds it off.

## How to apply

When designing XYZ Layout Engine, ask: *what present requirement does this serve, who owns the rule, how does
it fail safely, and what evidence earns the complexity?* State the tradeoff and revisit trigger.

When changing governance, ask: *does this make project state more resumable,
less ambiguous, and harder to drift for a long-running agent?* If not, reconsider.

When triaging existing work, ask: *what is the reversible move here, and what single fact would
argue against it?* Then say that, rather than listing options.
