# Individual PNG artwork and replay (`nutrition@2.0.0`)

Seven separate `gpt-image-2.5-flare` transparent PNG cutouts supply the
illustrated subjects for `examples/2026-10-13-nutrition-infographic/`. The image
model never draws headlines, captions, borders, panels, or the overall poster.
Small monochrome benefit badges (`icon_energy`, `icon_focus`, `icon_immunity`,
`icon_wellbeing`) and leaf/heart ornaments (`leaf_small`, `heart`) remain
deterministic vector SVGs in `tools/spike/assets/illustrations.svg`.

- **Style guide & layout contract:** [`DESIGN.md`](DESIGN.md)
- **Structured prompt & generation spec:** [`artwork.json`](artwork.json)
- **Pinned display hashes, prompts & alpha verification:** [`provenance.json`](provenance.json)
- **Sanitized provider receipts:** [`receipts/`](receipts/) (`<id>.result.json`)
- **Committed web-sized transparent PNGs (640 px max side):** [`assets/web/`](assets/web/)

## Verified asset table

All seven assets were generated with `gpt-image-2.5-flare` via the HiQS
`resolve-image` recipe (`recipe:hiqs/openai-image-generation@r2`, `endpoint: "edit"`,
`quality: "high"`, `background: "transparent"`) using
`PROJECT/2-WORKING/layout-engine-reference.png` as the style reference input,
verified for alpha transparency (`opaqueCornerCount: 0`), and downscaled to
640 px maximum dimension in `assets/web/`:

| Asset ID | Gen size | Display size | Source SHA-256 | Display (`assets/web/`) SHA-256 | Display bytes | Transparent pixel ratio |
|---|---|---|---|---|---|---|
| `leaf_glow` | `1024x1536` | `427x640` | `4bc48d2d150df119fdd47bc0212228d23729a432afdefc814264fab145e53583` | `7305cfe1fdebefa35942fbed62c6a3cd90202ae312884efb131239f73bc8de57` | `473,386` | `0.164` |
| `balance_scale` | `1536x1024` | `640x427` | `5953b2aa672e62306a7df078eb3855936408f15b5e062f9a66b5cb24a9df9bfb` | `e707666408606ae31f397e96fc3dc1eabf9d33a288b2cbcfb205258819d9a82d` | `216,405` | `0.724` |
| `skip_spike` | `1024x1024` | `640x640` | `9c82c9617c5f498995278338f638ce3e24e256e00506aaf476ca680bf54b51c1` | `4d475abd1839800d68982827b3680deab0962c6707fe904c3d8c485ae815e7df` | `632,395` | `0.123` |
| `parfait_jar` | `1024x1536` | `427x640` | `b90ea75c047c7229d2155ea02bd30d501f0f3f3e00702f3eae319a4c9aeb3ffa` | `5a78cc66838999e34652751b10d9a43b8c5d87ea7a655ea84c9a678deea19c64` | `402,087` | `0.464` |
| `snack_container` | `1024x1024` | `640x640` | `6a02102dc8a68eeab6057635ea8fe5db1df86f0a25e7abc479a12672944e692d` | `8f444d1e21507783138fdde383ec0e610ea95c8630ec744b2df16d4d9f206585` | `644,529` | `0.302` |
| `chicken_wrap` | `1536x1024` | `640x427` | `951fdbfc3a8d6abe69c4fe1a6826daa06e6c168dd91f5a9dab6bb02e80a17c69` | `8e513dcb605064cb40e6dd670edb8e55c230106438df10c6dd6e19c4c5b4542c` | `324,944` | `0.598` |
| `water_bottle` | `1024x1536` | `427x640` | `c08d8a842fc48c2e3d8e0c96fac87e167c91f2de528ad7cc6303a5bc50218cbb` | `34b26bd6acd1540a0986686f853c383cbe6d653451c5db50cf8e75c79f652f1a` | `177,924` | `0.687` |

## Fresh artwork generation (`HIQS_CHAIN_CALLER`)

Deterministic renders of `nutrition@2.0.0` use the committed PNGs in `assets/web/`
verified against `provenance.json` via `readPinnedPngs` (`tools/request.mjs`) and
make zero network or model calls.

To generate a fresh candidate set into a separate scratch directory (never
overwriting committed assets), supply the local `resolve-image` / `hiqs-chain`
script via `HIQS_CHAIN_CALLER`:

```sh
export NUTRITION_ASSET_RUN="$PWD/temp/nutrition-new-assets"
python3 - <<'PY'
import json, os, pathlib, subprocess
spec = json.loads(pathlib.Path('examples/2026-10-13-nutrition-infographic/artwork.json').read_text())
out = pathlib.Path(os.environ['NUTRITION_ASSET_RUN']).resolve()
out.mkdir(parents=True, exist_ok=False)
caller = str(pathlib.Path(os.environ['HIQS_CHAIN_CALLER']).expanduser().resolve(strict=True))
ref = str(pathlib.Path(spec['reference']).resolve(strict=True))
settings = spec['generation']
for asset in spec['assets']:
    prompt = f"{asset['subject']} {spec['sharedStyle']}"
    args = [
        'node', caller, 'image',
        '--prompt', prompt,
        '--reference', ref,
        '--model', settings['model'],
        '--size', asset['size'],
        '--quality', settings['quality'],
        '--background', settings['background'],
        '--out', str(out / f"{asset['id']}.png"),
    ]
    with (out / f"{asset['id']}.result.json").open('w') as receipt:
        subprocess.run(args, stdout=receipt, check=True)
PY
```

After inspecting alpha and visual cohesion across all 7 outputs, downscale into
a candidate `assets/web/` folder using `examples/2026-10-09-cell-division/make-web-asset.mjs`
(or `tools/spike/downscale-assets.mjs`), update `provenance.json`, and publish a
new `nutrition` version via `node tools/catalog.mjs publish`.
