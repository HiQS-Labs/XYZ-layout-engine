---
version: alpha
name: Neutral explainer sample
description: Illustrative authoring example; not a published recipe or global theme.
colors:
  primary: "#223344"
  surface: "#FFFFFF"
  accent: "#315D73"
typography:
  headline:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: Barlow Condensed
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.4
spacing:
  margin: 24px
  gutter: 16px
rounded:
  panel: 4px
components:
  title:
    textColor: "{colors.primary}"
    typography: "{typography.headline}"
  note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    padding: "{spacing.margin}"
    rounded: "{rounded.panel}"
  label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    typography: "{typography.body}"
    padding: "{spacing.gutter}"
---

# Neutral explainer — illustrative DESIGN.md

## Overview

A quiet explainer for a reader learning a short process. Give the takeaway the
most space, align stages in a clear reading direction, and keep supporting notes
secondary. These are sample choices for demonstrating tokens and rationale,
not mandatory engine defaults. No rendered artifact or runtime adapter is
delivered with this document.

## Colors

Primary slate supplies readable text; white is the supporting surface.
The blue accent identifies stage labels without assigning unrelated colors
to every stage. Declared text/surface pairs can be contrast-linted; any future
artwork still needs its own visual check.

## Typography

Use the headline role for the takeaway and the body role for short notes.
Barlow Condensed 400/700 is already vendored in the repository. These sample
sizes are explicit choices for this brief, not automatic changes to any recipe.
Revisit long paragraphs with a deliberately vendored regular-width body face.

## Layout

Use a fixed composition with an outer margin and consistent gutters. Specify
the actual canvas and positions in the implementing recipe before rendering;
these spacing tokens alone do not define engine geometry or responsive behavior.

## Elevation & Depth

Keep this sample flat. Establish hierarchy with type size, whitespace and
contrast. It specifies no gradients, glow or ground shadows.

## Shapes

The note uses a restrained 4px corner radius for its distinct supporting role.
Avoid boxing every stage; use alignment for the main reading path.

## Components

The title, supporting note and stage label are domain-specific components.
Their token references demonstrate primitive and composite typography links.
An authoring agent must translate them into supported fixture/recipe fields;
component names are not native engine widgets.

## Do's and Don'ts

- Do replace the sample content and justify palette, geometry and type for the
  actual reader, following the [repository profile](../../DESIGN.md).
- Do preserve source attribution and disclose illustrative or generated content.
- Don't infer rendered WCAG compliance, backend support or automatic token
  ingestion from this document's lint result.
