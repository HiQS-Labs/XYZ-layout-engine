# GH-100 render qualification

Run in the full task clone based on main@d47eb25, with the November 20 renderer and the lockfile dependencies. Plan QA approved at e01aa4b after adding the analogical-transfer study limitation.

- Main path: ran the documented DECK command against the thesis manifest. Both Satori and Chromium passed per-slide font, text geometry and overlap checks for ten slides. Copied the published PDF and HTML directly into the example and compared bytes. Counted ten PDF page objects.
- Offline smoke: launched Playwright with the network disabled and opened the distributable HTML via file URL. Advanced through all ten frames, checking the counter, title against each manifest entry and loaded image width of 1280 pixels.
- Adjacent path: unset DECK, set OUT_DIR=temp/overview-regression, and ran the same entry point. The overview verification manifest contained 15 slides; both backend checks passed throughout.
- Local preservation: counted 14 workshop slides in the dated archive outside renderer scratch. Compared the separately rebuilt offline viewer to the archived viewer byte for byte. The archive is intentionally local as requested.
- Editorial review: the experimental problem-solving result and the proposed UX application have separate text blocks. The MRI slide identifies practice-related change, its transient character and the separate question of transfer to UX. Both sources are cited in the deck and linked from the example README.
- Negative control: main’s fixed overview manifest lacks the ten thesis slide IDs; the actual navigation check asserted the thesis IDs in order. Geometry alone would accept an unrelated talk.

Final reviewer: inspect the deck, both studies’ scope, the actual renderer delta and this receipt against issue 100. Confirm the published example links resolve. Project qualification commands pnpm test and utils/pdda/pdda.sh run will also run before push by explicit operator decision. No additional test suite.
