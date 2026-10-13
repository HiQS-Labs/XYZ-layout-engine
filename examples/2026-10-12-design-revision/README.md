# Design revision — PR 32 and PR 37

## Before checkpoint

Baseline commit: `9f5aa7947e9518445771964129cd4554c5c11c76`.
The original fixtures and artwork remain in `examples/2026-10-11-mangajdm-promos/`
and `examples/2026-10-11-belief-updating/`. Their immutable catalog design records
remain unchanged. Check out the baseline to run its recipe versions:
`mangajdm-promo@1.0.1` and `recursive-process@1.0.0`.

This revision will record the design direction, new versioned recipes, and new
renders separately. Git replay restores source and retained rendered bytes;
fresh rendering requires the pinned dependencies and fonts. Runtime receipts
and generated run IDs may differ between executions.
