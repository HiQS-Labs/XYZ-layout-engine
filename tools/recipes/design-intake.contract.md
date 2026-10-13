# DESIGN.md intake contract v1

`design-intake@1.0.1` is a trusted adapter for **data-only** recipes authored by an LLM using `skills/design-intake/SKILL.md`. The adapter is the validation authority; `node tools/intake.mjs capabilities` reports the current capability envelope. There is no Markdown parser or LLM API call inside the engine. A source hash and quoted requirements establish traceability, not proof that all instructions were faithfully translated.

See `examples/2026-10-12-design-intake/fixture.json` for a complete accepted package. JSON objects below require exactly the stated keys. Unknown keys, executable code and arbitrary CSS are refused.

| Field | Contract |
|---|---|
| `id`, `schemaVersion` | `design-intake`, integer `1` |
| `width`, `height` | Integer 1..8192; total at most 16,777,216 pixels; request overrides must match |
| `source` | `{path, sha256}`; nonempty Markdown source, at most 256 KiB, exact lowercase SHA-256 |
| `requirements` | 1..100 `{quote, feature, target, status, reason}` records; quote must occur verbatim in source. `mapped` needs a supported feature and existing dot-path under settings/artwork/elements/width/height. `unsupported` uses null target and a concrete reason; it blocks rendering. The agent must capture all material instructions. |
| `settings` | `{palette, fontFamily, type, spacing, cornerRadius, borderWidth}` |
| `settings.palette` | 2..12 named `#rrggbb` roles, including `paper` and `ink` |
| `settings.fontFamily` | Exactly `Barlow Condensed`, bundled OFL files; other names reported unsupported. Glyph coverage is checked during rendering. Japanese and other unsupported glyphs must not silently fall back. |
| `settings.type` | `display` and `body`, each `{size, weight, lineHeight}`: size 12..512, weight 400 or 700, lineHeight 1..2 |
| Spacing / shape treatment | `spacing` 1..128; every element x/y/width/height follows this grid. `cornerRadius` 0..128 and `borderWidth` 0..16 apply to every rectangle. No shadow/gradient fields. |
| `artwork` | `{style, items}`; one nonempty shared style and 0..32 individual items |
| Artwork item | `{id, prompt, width, height, file}`; prompt has exactly `subject, view, lighting, background, exclusions`, each nonempty text. File is null while pending, otherwise `{path, sha256}`. Dimensions match the PNG; aggregate planned pixels cannot exceed 16,777,216, even before generation. PNG checks use the engine's bounded non-interlaced 8-bit RGBA subset. Background is prompt intent, not a programmatic alpha guarantee; inspect actual pixels. |
| `elements` | 1..100 objects; unique IDs; at least one and at most 64 text elements. All artwork must be placed. |

Every element has `id, type, x, y, width, height`. IDs match `[a-z][a-z0-9_]{0,63}`. Geometry is finite, inside the canvas and on the spacing grid. Additional keys:

- `text`: `text, role, color, align`. Role is display/body; color names a palette role; align is left/center/right. Regions must not overlap other text regions. Shared fitting can shrink text to 12px; exhaustion rejects the render.
- `image`: `asset, alt`. Asset names an artwork ID; alt is nonempty. Image fits its region preserving aspect ratio.
- `rect`: `fill, stroke`. Both name palette roles. Rectangle treatment comes from settings.

Layer order is rectangles, images, then text; declaration order is preserved within a layer. Text/image overlays are deliberate and need visual review. This is not a general diagram language: curves, connectors, clipping masks and arbitrary vector paths are unsupported. Do not embed whole layouts in artwork as a workaround. Element IDs are namespaced internally (`intake_text_`, `intake_region_`), preventing collisions with legacy recipe exceptions.

All local paths are relative to the **authorized root**, normally the checkout, not the fixture file. Absolute paths, URLs, traversal, symlink escapes, modified pins and missing files fail. Copying JSON alone is insufficient: retain the source and artwork tree, or rewrite relative paths and validate. Fixture save uses the same root and validator. Source/settings/prompts are bounded by the 256 KiB request budget; nonempty strings are at most 2048 characters except the Markdown source. PNG reads and aggregate budgets reuse `tools/request.mjs` and `tools/spike/assets.mjs`.

`intake check` returns `ready`, `unsupported`, `pending`, and a scope notice. Unsupported requirements are reported together; malformed structures or bad pins fail with a named field. A draft with pending images exits 1. No output files, generation calls or network requests are made. A ready preflight only proves structural/capability admission; standard rendering still checks font coverage/fit, and visual review still judges art direction.

For supported rendering, use `tools/render.mjs` (library `processRequest`, standard CLI/HTTP/MCP routes). Satori exports PNG/SVG/HTML/inline HTML; Playwright exports PNG/HTML/inline HTML. Reuse `publishArtifacts` and `verifyPublication` for library callers. Catalog receipts pin the adapter; fixture/source/art pins establish the particular design. Never claim semantic or pixel-identical reproducibility for newly generated artwork.
