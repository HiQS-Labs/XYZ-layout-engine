# Codex consult answer (final message; full transcript not committed)

Source run: consult.sh, label gh20-phase-b-plan, plan draft e558939. Firsthand-verification stamp: the harness flagged one uncited claim; the adjudicated points below were re-checked by the orchestrator (RAG arithmetic, catalog pins at catalog.mjs:125,131, render.mjs:213 consumer, cell-division 2192 width, SPECS-PRD §10.1).

**ANSWER:** Modify before building. The grid module and RAG adoption are appropriately small; the bundled helper cleanup contains two blockers. Read-only `catalog verify` currently passes. I did not rerender artifacts.

**Consult questions**

1. **[Pass] Agree: defer IDs and width bands.** Designs are insert-only (`tools/catalog.sql:17-18`), all three log entries lack layouts (`tools/design-log.jsonl:1-3`), and requests reject alternate recipe dimensions (`tools/request.mjs:61-68`). The [finalized comment](https://github.com/HiQS-Labs/XYZ-layout-engine/issues/20#issuecomment-6100771786) explicitly delays stable grid IDs until ten reviewed designs. These deferrals need no new mechanism.

2. **[Pass] Agree: RAG is the right first consumer.** It calls shared renderers directly (`examples/2026-10-09-rag-system/render-diagram.mjs:126-132`), satisfying “existing render path” without recipe promotion. Computed with width 2200, gap 80: columns are 300; x positions are **100, 480, 860, 1240, 1620, 2000**; spans 2/3 are **680/1060**, matching lines 44 and 106-108. Specify complete rows—e.g. `1113-213-111111`—instead of D6’s unfinished `2…`.

3. **[Should] Modify: adopt the proposed zero semantics explicitly.** Counting zero as one empty column makes the recorded `111000-001000-111111` example valid (`PROJECT/2-WORKING/GH-20-CATALOG-DESIGNS.md:660`). Preserve leading/trailing zeros: they change placement. Any zero forces GCD=1; reject an entirely empty grid, but permit an empty row when its column count matches other rows. Put these cases in existing assertions.

4. **[Should] Disagree with the default fraction guard; also reject automatic rounding.** Fractional coordinates are deterministic and already reach backend styles. Return computed fractions; let consumers require integers if needed. The cell example is **an exact grid over 2192 pixels**: `6×312 + 5×64 = 2192`, matching its stride 376 (`examples/2026-10-09-cell-division/render-diagram.mjs:73`). The plan’s 313.33 requires assuming a 2200-pixel card region; line 129 assigns 2200 to the header. Its “near-grid” diagnosis is therefore unsupported.

5. **[Should] Modify: keep D7 as minimal feedback collection.** Validate supplied layouts and recompute derived fields during verification; retain legacy null entries. This makes the ten-design review informative (`tools/design-log.jsonl:1-3`). Change the log validation at `tools/catalog.mjs:179`; **leave line 89’s null `layout_id` invariant intact**.

6. **[Should] Modify: remove S6/S11 from this build.** They broaden a reversible geometry addition into published-recipe maintenance. Extend existing canaries, respecting `test-budget.json:7-10`; no new suite or infrastructure.

**Blocking**

- **[Blocker] “Dead re-exports” is false.** `tools/recipes/nutrition.mjs:23` exports `DEFAULT_SIZES`, consumed at `tools/render.mjs:213`, and `validateNutrition`, imported/called at `tools/spike/test/canaries.test.mjs:14,143-145`. Removing the statement breaks live consumers.
- **[Blocker] Phase 3 cannot preserve catalog validity as specified.** Nutrition and Solar modules are hashed (`tools/catalog.mjs:125,131`); edits fail verification at line 200. Identical rendered bytes do not preserve source digests. Drop cleanup or explicitly budget version publication and dependency declarations.

**Worth doing**

- **[Should]** Save baseline digests before rerendering: RAG overwrites `verification.json` (`render-diagram.mjs:179-180`).
- **[Nit]** Correct “no fingerprint definition”: `SPECS-PRD.md:380-382` defines it. C2 also skips byte checks across differing hosts (`canaries.test.mjs:368`).

**Skip:** recipe promotion, layout tables, responsive machinery, universal rounding, and global helper deduplication; none earns its scope here.

**RECOMMENDATION:** Ship parser, geometry, RAG adoption, minimal log collection, and §6.6 after correcting the blockers and arithmetic diagnosis.
