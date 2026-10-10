**NO FIRSTHAND VERIFICATION CITED** — treat conclusions as conditional (agy's answer carries an unsupported [Pass]/verified/confirmed-style claim with no quoted span or file:line citation nearby, despite the consult PREAMBLE asking advisors to cite evidence.)

### ANSWER
The Phase 1 surgical recovery plan is fundamentally sound in its goals but over-engineers PNG validation and risks failing on basic filesystem mechanics. It correctly isolates validation, enforces limits, and escapes inputs, but the proposed "bounded zlib inspection" and "atomic directory rename" ignore simpler, already-existing facilities in the codebase that achieve the same safety with far less code.

### FINDINGS
- **[Blocker] Atomic directory rename will fail with `ENOTEMPTY`.**
  *Location:* Plan step 4 ("rename it once after validation").
  *Analysis:* In Node.js, using `fs.rename` to overwrite an existing non-empty directory (like a prior run's `YYYY-MM-DD-xyz-layout-engine-spike`) throws an `ENOTEMPTY` error on POSIX systems.
  *Simpler existing facility:* `verify.mjs:18` natively supports the `SPIKE_OUTPUT_ROOT` environment variable. Generate a unique staging root (e.g., `output/staging-<id>/YYYY-MM-DD-xyz-layout-engine-spike/`), and validate it by passing `SPIKE_OUTPUT_ROOT` to the verifier. On success, rename the old target folder out of the way (e.g., to a `.bak` suffix) before moving the new one into place, which avoids the `ENOTEMPTY` conflict entirely while keeping the verifier logic untouched.

- **[Should] "Bounded zlib inspection" is over-engineered (ponytail violation).**
  *Location:* Plan step 2 ("bounded zlib inspection").
  *Analysis:* Writing a custom zlib parser to inspect PNGs is unnecessary and introduces new failure modes. The pipeline already hands the data to battle-tested Rust (resvg) and Chromium native decoders.
  *Simpler existing facility:* `verify.mjs:25-28` already contains a concise `pngSize()` function. Reuse this 4-line function to check the 8-byte PNG magic signature and read the IHDR width/height dimensions. Couple this with a strict file byte-size limit (e.g., `< 5MB`), and let the native decoders safely handle the rest.

- **[Pass] Input shape normalization and limits.**
  *Analysis:* Bounding JSON reads, restricting to `scale=1`, enforcing `realpath` boundaries, and strictly shaping the nutrition recipe data perfectly address the vulnerabilities logged in `red-controls.log` and the Codex review.

- **[Pass] Output escaping and backend lifecycle.**
  *Analysis:* Escaping HTML attributes/styles and ensuring Chromium cleanup in a `finally` block directly resolves the script/markup injection and standalone loader failures.

- **[Pass] Test extensions (C1).**
  *Analysis:* Adding space-path checks, actual import observation, and injection survival to C1 meets the reviewer's strict safety demands without exceeding the four-test budget.

### RECOMMENDATION
Proceed with the plan, but drop the custom zlib inspection in favor of a byte-cap plus the existing `pngSize` header check, and leverage `SPIKE_OUTPUT_ROOT` to isolate immutable staging directories without fighting `ENOTEMPTY` rename errors.
