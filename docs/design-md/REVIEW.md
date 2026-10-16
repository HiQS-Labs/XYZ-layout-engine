# Google DESIGN.md review — 2026-10-14

**Verdict: adopt a small authoring profile; no renderer migration is needed.**
This is an official-source review, not a successful Gemini/Perplexity synthesis.
The requested resolve-research run failed in both search stages with
`contract_rejected`; extraction never ran. The operator authorized this separate
review. Its sanitized [attempt receipt](../../TESTS-RESULTS/2026-10-14-GH-51/research-provenance.json)
retains recipe, snapshot, policy and result digests.

## Format and scope

Google's [alpha specification](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md)
describes a portable design-system document, not a rendering API. It permits
optional YAML frontmatter and Markdown rationale. Its recognized H2 sections
are Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components,
and Do's and Don'ts, in that order; irrelevant sections may be omitted.

Token groups cover colors, typography, spacing, rounded corners and components.
Dimensions use px/em/rem; unitless spacing and line-height values have defined
uses. References use `{path.to.token}`; component typography may reference a
composite token. Colors accept CSS formats, though hex is the simplest portable
choice. Additional headings should be preserved; duplicate headings should be
rejected. Domain-specific components are encouraged, so an explainer does not
need invented buttons or form fields. Tokens are normative within their design
document. Nothing in this format requires a particular backend.

## Tooling and disagreements

The [official CLI documentation](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/README.md)
provides lint, diff, spec and token exports to Tailwind/DTCG. The published
[`@google/design.md@0.4.0`](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/packages/cli/package.json)
has a `designmd` alias that avoids the Markdown file-association problem on
Windows. Use a pinned optional authoring command, rather than adding it to the
engine's dependency graph:

```sh
npx --yes --package=@google/design.md@0.4.0 designmd lint DESIGN.md
```

Observed probes on 2026-10-14: prose-only input exits 0 with a no-YAML warning;
an adjacent duplicate `## Colors` in the minimal probe exits 0 without a finding.
The later appended-duplicate sample control exits 0 with an order warning,
but still does not reject the duplicate; a broken component reference exits 1.
The [parser](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/packages/cli/src/linter/parser/handler.ts)
accepts YAML fences as well as frontmatter, while the document convention
specifies frontmatter. The [section-order rule](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/packages/cli/src/linter/linter/rules/section-order.ts)
warns about order but does not reject repeated equal headings. Consequently,
lint exit 0 alone is insufficient evidence of document conformance.

The [Stitch authoring skill](https://github.com/google-labs-code/stitch-skills/blob/0337446dadde6f8c94210444e2aa9d546126480f/plugins/stitch-utilities/skills/design-md/SKILL.md)
still prescribes numbered, prose-oriented headings and natural-language output.
That is useful extraction guidance, but it differs from the format specification.
Use the specification for new local briefs; retain older briefs as source
material rather than claiming that their filenames establish compatibility.

Contrast lint examines declared component text/background pairs. It cannot prove
contrast on rendered gradients, images, or undeclared pairs, nor prove good
composition or accessibility of an exported artifact.

## Fit for XYZ Layout Engine

Current `main` already supports agent-authored art direction, JSON fixtures and
trusted recipes. Nutrition's DESIGN.md and the recursive-process design contract
are hashed published content. Reformatting either in place would invalidate
catalog verification; changing their runtime authority would introduce two
competing owners for styling.

The smallest adequate adoption is a repository guide, a token-bearing sample,
startup/visual-authoring pointers and explicit README limits. New briefs use the
format; the agent translates supported choices into existing fixture/recipe
owners and records gaps. The core continues to consume JSON, not Markdown.
Existing published briefs migrate only alongside deliberate future recipe
versions. The unmerged intake adapter in PR #43 remains separate.

**Effort assessment:** small, documentation-only; Easy to revert. No package,
parser, schema, asset, catalog, backend or rendering changes are required.
This meets low-to-medium authoring compatibility, not general token ingestion
or Google certification. Direct import, automatic token synchronization and
bulk migration are materially larger work and should be reconsidered only when
a concrete caller needs them.

Retrieval scope: official spec/README, CLI package and selected parser/rule source,
Stitch skill, published CLI probes, and the repo's current authoring/render
boundary. This was not a complete audit of Google's implementation, a Stitch
round-trip, or a WCAG audit. Source commit and CLI release are recorded separately;
the alpha spec may change.
