# Alegreya (serif with italics)

Alegreya is a calligraphic book serif, vendored for the parchment-style "Why your skill never runs" example (#60), whose display title and annotations need a serif with true italics. It is not a default for new work; Barlow Condensed stays the starter default. See `SYSTEM-INSTRUCTIONS.md` AS-5.

- License: SIL Open Font License 1.1 (`OFL.txt` in this folder). Copyright 2011 The Alegreya Project Authors.
- Upstream design: huertatipografica/Alegreya. `OFL.txt` is byte-identical to that repo's `OFL.txt` at commit `1dd6b28b57c50e3168db1cbbb8086e7978abcfbf`.
- Font files: the static latin-subset WOFF files from the npm package `@fontsource/alegreya@5.1.0` (`files/`), fetched through cdn.jsdelivr.net. Upstream ships only variable fonts, which Satori does not instance, so the static files come from Fontsource. The latin subset covers Basic Latin, Latin-1 (including `·`) and General Punctuation (including curly quotes).
- Family name: `Alegreya`. Pass regular and bold as `font.regular` / `font.bold` and the italics through `font.faces` (`tools/render.mjs`).

| File | Weight / style | sha256 |
|---|---|---|
| `alegreya-latin-400-normal.woff` | 400 normal | `2288238d2638448637421b887c8e561ffe773ef89db6850ab249de101261d7f1` |
| `alegreya-latin-700-normal.woff` | 700 normal | `1a7d45d5538dd828561249cb7407e628f523f7effb322430a9b413cffa1d6fbc` |
| `alegreya-latin-400-italic.woff` | 400 italic | `0567a8104ec353539988054ebe2e53ae51b8ef03249ae24f45387f46aed5c1e1` |
| `alegreya-latin-700-italic.woff` | 700 italic | `ec665c265cfd91e0e40879de6f4d7fd0097222a5f77bec503ec3899ff3f604fe` |
| `OFL.txt` | — | `f6f60d5d4cf4f4b1fc4e41353c897a2f5a16e6396c0cd8fa8bdfd2f4586a9a68` |
