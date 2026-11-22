# XYZ Forge diagrams

Three diagrams of the [XYZ Forge](https://github.com/HiQS-Labs/XYZ-forge) software factory, grouped by lens.
All share the belief-reference visual language and the repository's shared renderer; each folder has its
own fixture, render script, outputs and README.

## Today — how the factory works

- [System, version 1](today/system-v1/README.md): the operator-supplied XYZ Forge system diagram redrawn
  in the belief-reference style (GH-55).
- [Software factory, version 2](today/software-factory-v2/README.md): the operator commands that carry
  work from a daily read to merged, reconciled changes. `/start-task` opens with a prior-art check.

## Future — proposals, not built

- [/shift outer loop](future/shift-proposal/README.md): an 8-to-5 factory day over the existing skills
  (HiQS-Labs/XYZ-forge#1081). Its morning open runs a prior-art check before proposing the day's items.

Render any of them from the repository root, outside the Claude Code macOS sandbox:

```sh
node examples/xyz-forge/today/system-v1/render-diagram.mjs
node examples/xyz-forge/today/software-factory-v2/render-diagram.mjs
node examples/xyz-forge/future/shift-proposal/render-diagram.mjs
```
