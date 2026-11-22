# Individual PNG artwork and replay

Six separate image-model outputs supply the diagram's illustrations. The image
model does not draw labels, arrows, hexagons, cards or the entire diagram.
The accepted profile is reused five times. The design contract and generation
inputs live in `tools/recipes/recursive-process.design.md` and
`tools/recipes/recursive-process.artwork.json`.

`assets/source/` retains original provider PNGs, including their caBX provenance
metadata. `assets/web/` contains 256px display derivatives created through the
existing `examples/2026-10-09-cell-division/make-web-asset.mjs` helper.
`provenance.json` records source/display hashes, actual full prompts, model,
settings, alpha evidence and provider recipe identities. `receipts/` retains
provider responses with home-directory prefixes replaced by `~`.

## This run

Seven successful paid calls: six initial subjects and one fresh examination
illustration. All calls used `gpt-image-2.5-flare`, 1024x1024, medium quality,
transparent PNG, and `recipe:hiqs/openai-image-generation@r2`; publication was
reported `local_candidate`. The accepted examination uses `refinementPrompt`.
The initial examination had extensive exterior shading (2.56% transparent
pixels); the replacement has 85.65% transparent pixels. Other accepted source
images have 64.98–81.42% transparent pixels. Some soft edge shading remains;
generation is probabilistic, and alpha presence alone does not prove good art.

The original six calls used the existing solar `--jobs` runner. It reported
unresolved results despite each provider receipt showing success, one dispatched
attempt, matching bytes/digest and verified alpha. Re-reading each source with
`inspectPng` reproduced `Unsupported PNG chunk/order`. All six contain `caBX`;
that narrow validator only admits IHDR/IDAT/IEND. Every source chunk's CRC and
the provider's SHA-256 were checked before conversion, and all six display
derivatives pass the unchanged bounded PNG/digest reader. No paid job was blindly
retried and no PNG guard was weakened. Original batch state and the rejected
examination stay in the ignored `temp/2026-10-12-belief-generation/` archive.

Root cause: a provider-source PNG was checked against a display-derivative-only
PNG contract. Resolution for this task: preserve the source and use the existing
display conversion path. The generic batch validator is unchanged; its source
metadata limitation remains, so the reproduction path below calls the existing
single-image caller directly.

## Fresh artwork generation

Install/configure the resolve-image / hiqs-chain skill and supply its physical
`scripts/chain.mjs` path via `HIQS_CHAIN_CALLER`. Credentials remain device-local;
do not commit them. Generate into a **new** directory, never over accepted assets.
The following uses six bounded single-image calls with no automatic retry or
fallback. It stops on the first failed receipt; inspect saved evidence before
explicitly retrying an uncertain paid outcome.

```sh
export BELIEF_ASSET_RUN="$PWD/temp/belief-new-assets"
python3 - <<'PY'
import json, os, pathlib, subprocess
spec = json.loads(pathlib.Path('tools/recipes/recursive-process.artwork.json').read_text())
out = pathlib.Path(os.environ['BELIEF_ASSET_RUN']).resolve()
out.mkdir(parents=True, exist_ok=False)
caller = str(pathlib.Path(os.environ['HIQS_CHAIN_CALLER']).expanduser().resolve(strict=True))
assert len(spec['assets']) == 6
for asset in spec['assets']:
    prompt = asset.get('refinementPrompt', spec['sharedStyle'] + ' ' + asset['subject'])
    settings = spec['generation']
    args = ['node', caller, 'image', '--prompt', prompt,
            '--out', str(out / (asset['id'] + '.png'))]
    for key in ['model', 'size', 'quality', 'background']:
        args.extend(['--' + key, settings[key]])
    with (out / (asset['id'] + '.receipt.json')).open('w') as receipt:
        subprocess.run(args, stdout=receipt, check=True)
PY
```

Review the six images together against the design contract. Validate source
receipt bytes/hashes and transparency; preserve originals. Convert each accepted
image with the existing helper, for example:

```sh
node examples/2026-10-09-cell-division/make-web-asset.mjs \
  "$BELIEF_ASSET_RUN/person-profile.png" \
  "$BELIEF_ASSET_RUN/person-profile-display.png" 256
```

The helper prints dimensions, bytes and SHA-256. Repeat for the six accepted
assets. Fork the example/provenance and publish a new recipe version through
the catalog CLI when admitting changed artwork; do not overwrite these pinned
files in an existing published version. Fresh generation should resemble the
reference but is not a pixel-identity promise. To replay this accepted design,
use the committed assets with the rendering commands in README.md; no model
calls or external upload are needed.
