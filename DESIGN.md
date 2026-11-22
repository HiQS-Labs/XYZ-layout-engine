---
version: alpha
name: XYZ Layout Engine authoring profile
description: Domain-neutral guidance for authoring design briefs; no shared visual theme.
omitted:
  - section: colors
    reason: Each design defines its own palette; the engine has no global brand palette.
  - section: typography
    reason: Exact type roles and sizes belong to the selected design and recipe.
  - section: spacing
    reason: Geometry and spacing depend on the selected composition and canvas.
  - section: rounded
    reason: Shape treatment depends on the subject and documented taste exceptions.
  - section: components
    reason: Components are specific to each recipe rather than shared UI widgets.
---

# XYZ Layout Engine — DESIGN.md authoring profile

## Overview

Use Google's [alpha DESIGN.md convention](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md)
for **new design briefs**. This root document is authoring guidance, not a global
theme. The [token-bearing sample](docs/design-md/DESIGN.md) demonstrates the format
without assigning its visual choices to existing recipes.

Name the reader, takeaway and three hierarchy decisions before composing.
Read [SYSTEM-INSTRUCTIONS.md](SYSTEM-INSTRUCTIONS.md) for taste rules and reporting.
Those rules and AGENTS.md retain their existing precedence.

### Authoring procedure and compatibility boundary

1. Put `DESIGN.md` beside the new design's fixture and record its source/reference.
2. Use unique canonical H2 headings in the order shown here. Omit irrelevant
   sections with a reason; preserve useful custom sections, such as artwork
   provenance. Do not number or rename the canonical headings.
3. YAML frontmatter is optional. When included, use `name`, optional
   `version: alpha`/`description`, and the recognized `colors`, `typography`,
   `spacing`, `rounded`, `components` groups. Quote hex colors and references.
   An `omitted` entry may explain a deliberately absent token group.
4. Translate the brief into the existing JSON fixture and trusted recipe.
   Record unsupported fonts, effects, dimensions or interpretations before
   rendering; resolve gaps explicitly. Markdown and YAML are not runtime inputs.

Tokens are exact values **within the brief**. Fixture JSON owns the implemented
copy/palette and recipe code owns implemented geometry/font/layout behavior.
Keep them aligned during authoring; if an existing implementation differs,
record the conflict and version the intended change instead of silently
overriding either owner. Nothing here enables arbitrary CSS or executable input.

Existing custom briefs remain usable source material. Published design contracts
are hashed: adopt the new format only with a deliberate future recipe version.
Do not reformat pinned content in place just to obtain a lint badge.

## Colors

Each new design names its primary palette and the role of every color. Use
quoted hex values for simple interchange; the upstream schema also allows CSS
colors. Do not put a gradient string in a color token: describe its stops and
purpose in prose. The renderer's accepted palette values remain recipe-specific.
Review actual text/background contrast, including images and gradient regions.

## Typography

Use meaningful type roles. YAML typography values are objects with properties
such as `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`.
Dimensions use px/em/rem; unitless line-height is a multiplier.
Follow AS-5 for vendored fonts and its Barlow Condensed starter default, unless
the brief or recipe names another font. Token syntax does not vendor a font,
add a fallback, or make unsupported glyphs renderable.

## Layout

State canvas, reading order, anchors, spacing rhythm and any responsive intent.
Use dimension strings for spacing distances; use unitless numbers only for
genuine counts/ratios. Map these deliberately into recipe-owned geometry.
Design-document flexibility does not extend the selected recipe's canvas or
backend capabilities.

## Elevation & Depth

Explain hierarchy through spacing, contrast and alignment before adding effects.
Follow AS-2 and AS-11 for justified effects and ground/contact shadows.
Record reference-specific exceptions and supported implementation explicitly;
the format itself is not an effects capability declaration.

## Shapes

Choose shape treatment for meaning and consistency, following AS-3 and AS-6.
Put corner-radius values in `rounded` when useful. Avoid inventing a universal
radius for diagrams whose subjects require different shapes.

## Components

Describe actual domain elements: labels, callouts, arrows, legends or panels.
No buttons/forms are required for an infographic. Component token maps can
reference primitive values, such as `{colors.primary}`, or typography objects,
such as `{typography.body}`. Resolve every reference; preserve additional
guidance without pretending an unknown property is supported by the engine.

## Do's and Don'ts

- Do keep claims, sources, schematic disclosures and artwork provenance honest.
- Do review full-size and thumbnail exports under AS-10; a lint pass cannot
  judge composition or prove rendered accessibility.
- Do check nonempty sections, unique H2s and their order, as well as token lint.
- Don't add another styling owner, silently upload inputs or generate paid art
  merely because a brief requests it.

### Optional authoring check

From the repository root:

```sh
npx --yes --package=@google/design.md@0.4.0 designmd lint DESIGN.md
npx --yes --package=@google/design.md@0.4.0 designmd lint docs/design-md/DESIGN.md
```

Replace the file argument with your brief's path. First use may download the
CLI from npm; this is not an engine dependency or a rendering prerequisite.
Review findings even when exit is 0. CLI 0.4.0 does not reject duplicate H2s,
so inspect section uniqueness/order separately. This is a low-to-medium
**authoring profile**, not a general importer or certification.
See the [dated review](docs/design-md/REVIEW.md) for sources and known limits.
