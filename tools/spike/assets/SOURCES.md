# Asset Sources

- **font.ttf**: Inter Regular (v4.0), downloaded from https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip. Digest: 64f8be6e55c37e32ef03da99714bf3aa58b8f2099bfe4f759a7578e3b8291123. Licensed under the SIL Open Font License, Version 1.1.
- **illustrations.svg**: Hand-authored for this spike.
- **font-bold.ttf**: Inter Bold (v4.0), `extras/ttf/Inter-Bold.ttf` from the same Inter-4.0.zip release as font.ttf (that archive's Inter-Regular.ttf matches font.ttf's digest). Digest: 0cb1bc1335372d9e3a0cf6f5311c7cce87af90d2a777fdeec18be605a2a70bc1. Licensed under the SIL Open Font License, Version 1.1 (same OFL.txt).
- **illustrations.svg** additions (2026-10-09): icon_energy, icon_focus, icon_immunity, icon_wellbeing, leaf_small, heart — hand-authored flat SVG approximating the reference's benefit icons and ornaments.
- **generated/** (2026-10-09): seven transparent illustrations generated with OpenAI gpt-image-2.5-flare via the HiQS resolve-image recipe `recipe:hiqs/openai-image-generation@r2` (publication label local_candidate), edit endpoint, quality high, background transparent, with `PROJECT/2-WORKING/layout-engine-reference.png` as the style reference input (the reference is never rendered as a layer). Prompts: `generated/prompts.json`; per-image provider result (model, endpoint, sha256, alpha check): `generated/<id>.result.json`. Full-size originals are kept out of git; committed `generated/web/<id>.png` copies are downscaled to a 640 px longest side by `tools/spike/downscale-assets.mjs` (resvg, alpha preserved). Usage rights follow OpenAI's terms for API output; operator to confirm before any non-spike use.

| id | original sha256 | original bytes | web sha256 | web bytes | transparent pixel ratio |
|---|---|---|---|---|---|
| leaf_glow | 4bc48d2d150df119fdd47bc0212228d23729a432afdefc814264fab145e53583 | 2047966 | 7305cfe1fdebefa35942fbed62c6a3cd90202ae312884efb131239f73bc8de57 | 473386 | 0.164 |
| balance_scale | 5953b2aa672e62306a7df078eb3855936408f15b5e062f9a66b5cb24a9df9bfb | 1726971 | e707666408606ae31f397e96fc3dc1eabf9d33a288b2cbcfb205258819d9a82d | 216405 | 0.724 |
| skip_spike | 9c82c9617c5f498995278338f638ce3e24e256e00506aaf476ca680bf54b51c1 | 1444866 | 4d475abd1839800d68982827b3680deab0962c6707fe904c3d8c485ae815e7df | 632395 | 0.123 |
| parfait_jar | b90ea75c047c7229d2155ea02bd30d501f0f3f3e00702f3eae319a4c9aeb3ffa | 2233788 | 5a78cc66838999e34652751b10d9a43b8c5d87ea7a655ea84c9a678deea19c64 | 402087 | 0.464 |
| snack_container | 6a02102dc8a68eeab6057635ea8fe5db1df86f0a25e7abc479a12672944e692d | 1616410 | 8f444d1e21507783138fdde383ec0e610ea95c8630ec744b2df16d4d9f206585 | 644529 | 0.302 |
| chicken_wrap | 951fdbfc3a8d6abe69c4fe1a6826daa06e6c168dd91f5a9dab6bb02e80a17c69 | 2150454 | 8e513dcb605064cb40e6dd670edb8e55c230106438df10c6dd6e19c4c5b4542c | 324944 | 0.598 |
| water_bottle | c08d8a842fc48c2e3d8e0c96fac87e167c91f2de528ad7cc6303a5bc50218cbb | 1316377 | 34b26bd6acd1540a0986686f853c383cbe6d653451c5db50cf8e75c79f652f1a | 177924 | 0.687 |
