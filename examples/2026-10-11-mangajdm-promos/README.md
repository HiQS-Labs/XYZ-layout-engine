# MangaJDM — portrait promo series

Three 1080×1920 PNG masters share `mangajdm-promo@1.0.0`, the merged XYZ Layout Engine render/edit/export pipeline, pinned local Inter fonts and four supplied display assets. Open [the gallery](index.html) or [the campaign preview](preview.png); [EDITORIAL.md](EDITORIAL.md) contains separate TikTok/Instagram captions and alt text.

| Post | Primary PNG | Editable fixture | Catalog design |
|---|---|---|---|
| For the obsessed. | [01-icon.png](01-icon.png) | [01-icon.fixture.json](01-icon.fixture.json) | `2026-10-11-mangajdm-icon` |
| Every era. One obsession. | [02-eras.png](02-eras.png) | [02-eras.fixture.json](02-eras.fixture.json) | `2026-10-11-mangajdm-eras` |
| Wear your next chapter. | [03-wear.png](03-wear.png) | [03-wear.fixture.json](03-wear.fixture.json) | `2026-10-11-mangajdm-wear` |

The Integra artwork and the complete model/shirt mockup use contain; the R34 card crops blank framing while retaining the car. The apparel image is a supplied concept/mockup; captions and its on-image label disclose that. No stock, price, date, performance claim or manufacturer endorsement is implied. The domain comes from supplied branding; live store status was not established.

The 9:16 masters are intended for portrait photo/Story-style placement. Preview crops and overlays in the actual upload app; square or 4:5 feeds need deliberate recomposition. These assets were saved locally and to the repository, not posted to social accounts.

## Reproduce and edit

Run from the repository root after `pnpm install --frozen-lockfile`:

```sh
node tools/render.mjs examples/2026-10-11-mangajdm-promos/01-icon.fixture.json --recipe mangajdm-promo --format png,svg,html,html-inline --out .relay-scratch/mangajdm-icon
node tools/render.mjs examples/2026-10-11-mangajdm-promos/02-eras.fixture.json --recipe mangajdm-promo --format png,svg,html,html-inline --out .relay-scratch/mangajdm-eras
node tools/render.mjs examples/2026-10-11-mangajdm-promos/03-wear.fixture.json --recipe mangajdm-promo --format png,svg,html,html-inline --out .relay-scratch/mangajdm-wear

# Copy before editing. Cataloged designs are insert-only; do not overwrite their committed fixture/artifact.
mkdir -p .relay-scratch
cp examples/2026-10-11-mangajdm-promos/01-icon.fixture.json .relay-scratch/mangajdm-edit.json
node tools/render.mjs .relay-scratch/mangajdm-edit.json --set 'deck=One extra panel for your next chapter.' --save .relay-scratch/mangajdm-edit.json --format png,svg,html,html-inline --out .relay-scratch/mangajdm-edited
node tools/render.mjs .relay-scratch/mangajdm-edit.json --format png,svg --out .relay-scratch/mangajdm-rerender
```

Each committed `exports/<post>/manifest.json` selects one immutable `runs/<id>/` directory. It contains `render.png`, `render.svg`, `render.html` plus `assets/`, `render-inline.html` and `result.json`. Stable PNG/SVG copies at the example root match the selected manifest digests. Relocate compact HTML together with its assets directory; standalone inline HTML is one file. SVG retains raster artwork.

## Catalog

The sole catalog writer is `node tools/catalog.mjs`. [catalog-commands.json](catalog-commands.json) records actual CLI registration/render commands. Recipe identity and all three design pins/hashes are read back in [verification.json](verification.json).

```sh
node tools/catalog.mjs show mangajdm-promo --json
node tools/catalog.mjs design show 2026-10-11-mangajdm-icon --json
node tools/catalog.mjs design show 2026-10-11-mangajdm-eras --json
node tools/catalog.mjs design show 2026-10-11-mangajdm-wear --json
node tools/catalog.mjs verify
node tools/catalog.mjs export --check
```

A changed design forks a new date-slug ID. The published recipe content is immutable: changing a declared fixture, module, font or asset needs an appropriate new recipe version, not republishing changed bytes under 1.0.0. The recipe follows the catalog's existing fixed trusted file-set mechanism; no plugin registry, grid parser, new schema/table or alternate writer was added. Design log geometry/span fields stay null while Phase B is deferred.

## Sources and validation

[provenance.json](provenance.json) maps the four selected supplied source images to display derivatives with SHA-256, dimensions and bytes. The existing cell-division `make-web-asset.mjs` helper downscaled through pinned Satori/resvg; no artwork was generated, no paid provider was called and selected source hashes remain unchanged. The source folder's README distinguishes manufacturer-bearing artwork from sanitized pieces; the R34 study has a visible GT-R mark, and no official affiliation is claimed.

The palette comes from the supplied website's ink/paper/red theme. Generated output uses pinned local Inter rather than fetching website fonts; Japanese lettering present inside supplied artwork remains raster art.

See [VERIFICATION.md](VERIFICATION.md) for actual checks, boundaries and run receipts. The task plan/reviews live under `PROJECT/3-COMPLETED/GH-28-MANGAJDM-PROMOS.md` and `relay-system/2026-10-11/`.

