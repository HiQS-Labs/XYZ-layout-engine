# GH-51 — authoring verification, 2026-10-14

Scope: documentation-level adoption at base
`ed565292d280fec565c30e9612ca31240e84fbf6`. Runtime: Node v22.22.3, npm,
Python 3 on darwin-arm64. No dependency installation in the engine or paid
generation. Results apply to the SHA-256 document bytes in section-check.json;
the final relay records the reviewed commit.

| Command / probe | Observed exit and decisive result | Receipt |
|---|---|---|
| `npx --yes --package=@google/design.md@0.4.0 designmd lint DESIGN.md` | 0; errors 0, warnings 0; 5 infos explain intentional token omissions | [root-lint.json](root-lint.json) |
| Same command with `docs/design-md/DESIGN.md` | 0; errors 0, warnings 0; 1 token-summary info (3 colors, 2 type roles, 2 spacing, 1 rounded, 3 components) | [sample-lint.json](sample-lint.json) |
| Temp sample with first `"{colors.primary}"` replaced by `"{colors.missing}"` | 1; `broken-ref` error on title component | [broken-reference.json](broken-reference.json) |
| Temp sample with appended `## Colors` and body | CLI 0, no error: witnessed upstream blind spot, not a successful rejection | [duplicate-lint-limit.json](duplicate-lint-limit.json) |
| Inline section check below | 0; both real docs pass; duplicate, empty body and empty document controls rejected | [section-check.json](section-check.json) |
| Local Markdown link existence check | 0; 32 links resolve in guide/sample/review/README/SYSTEM-INSTRUCTIONS | [local-links.json](local-links.json) |
| `node tools/catalog.mjs verify --json` | 0; valid true, errors empty | [catalog-verify.json](catalog-verify.json) |
| `node tools/catalog.mjs export --check` | 0; canonical true | [catalog-export.json](catalog-export.json) |
| Installed `releases_app.py --root . check` | 0; DB/dump generation and receipts clean | [releases-check.log](releases-check.log) |
| Protected-path diff against integration base | 0; no changed runtime/fixture/asset/brief/catalog/package/test paths | [preservation.json](preservation.json) |

The existing catalog commands emit their documented experimental SQLite warning.
PDDA's [baseline](baseline-pdda.log) and [candidate](pdda.log) are retained for
comparison. See the task plan for the executed result and final QA receipt.
The primary checkout's installed RELEASES writer was used with `--root` pointing
at this isolated clone; no new governance runtime was installed.

## Reproduce the section check (bounded to these two documents)

This one-time check is recorded as manual evidence, not a parser, suite or CI gate.
It expects all eight sections in these supplied docs, even though Google's format
permits an actual design brief to omit irrelevant sections. These inputs have no
H2-looking examples inside code fences; the simple check is not a general Markdown
parser. Compare headings manually for other briefs.

```sh
python3 - <<'PY'
from pathlib import Path
import re
order = ["Overview", "Colors", "Typography", "Layout",
         "Elevation & Depth", "Shapes", "Components", "Do's and Don'ts"]
def check(text):
    parts = re.split(r'^## (.+)\n', text, flags=re.M)
    headings = parts[1::2]
    assert len(headings) == len(set(headings)), 'duplicate H2 heading'
    assert [h for h in headings if h in order] == order, 'missing/out-of-order section'
    assert all(body.strip() for body in parts[2::2]), 'empty section body'
for name in ['DESIGN.md', 'docs/design-md/DESIGN.md']:
    check(Path(name).read_text())
sample = Path('docs/design-md/DESIGN.md').read_text()
controls = [sample+'\n## Colors\n\nDuplicate red control.\n',
            sample.replace('## Colors\n', '## Empty\n\n## Colors\n', 1), '']
for text in controls:
    try:
        check(text)
    except AssertionError:
        pass
    else:
        raise AssertionError('red control passed')
print('PASS: real docs accepted; duplicate/empty controls rejected')
PY
```

## Limits and narrow disposition

No new backend render, screenshot review, WCAG audit, Stitch import/export round
trip or general YAML ingestion is claimed. The sample is an authoring document
only. Byte preservation plus catalog verification is the relevant existing-system
check; docs-only work does not justify a new runtime test or suite.

The full README link probe initially failed at the pre-existing
`examples/2026-10-08-solar-system/index.html` pointer. `git show origin/main:README.md`
confirmed it at base. Sanity-check disposition: a real but low-risk onboarding
defect in the touched README, not a core blocker. Removed only the broken gallery
link and retained the existing bundle link; the complete link probe then passed.

Research status: the requested recipe chain failed, with no source extraction.
The operator explicitly authorized the [official-source review](../../docs/design-md/REVIEW.md).
[research-provenance.json](research-provenance.json) preserves sanitized attempt
history and digests; [google-rules.json](google-rules.json) is the actual pinned
CLI rule output. No failed stage is presented as successful research.
