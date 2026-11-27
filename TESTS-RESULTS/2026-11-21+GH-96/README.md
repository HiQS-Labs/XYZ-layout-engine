# GH-96 verification

Base d47eb25. Run the documented commands from the imaging-layer example. The example deliberately reuses the nutrition assets. No paid image generation. The controls all use the same font, geometry and poster preview. The only change in the accuracy control is which renderer does which operation.

- Rebuilt the ZIP. Compared all 18 member names and uncompressed bytes with creative-handout.zip. Only PROMPT.md and GOALS.md changed.
- Rendered the three controls and generated both anonymous viewing orders at native and 400px. Inspected the dense and concise thumbnails. All three source facts remain in the same locations; the dense version adds a footer. Coordinator visual check distinct from the blind ballots.
- Created fresh blinded consultation rooms, each containing only four rebaked PNGs with opaque filenames. The report counts a located answer against the coordinator's source key. The stored JSON keeps each reader's words and adds correct to each task. Inaccessible-image abstentions, missing answers and timeout failures are excluded from factual scoring.
- Tested empty ballots, stable votes, reading without preference, and positional reversal with controlled ballot inputs. Absence and reversal both print inconclusive. Stable votes selecting A forward and B reverse print first. A factual ballot without a choice still reports its reading.
- Archived submissions are a pilot under the old brief. First is Gemini Carbon; second is Opus. Both passed PNG, HTML and parity on a fresh run of the existing evaluator. No new rebuild/edit observation supplied.
- Run python3 evaluation/v2/report.py with a retained pair directory to reproduce the default report. The native test suite passed all four canaries in 29.8s. PDDA reported zero errors and 35 warnings.

Accuracy control: the three usable readings all recovered 3/3 on the concise accurate image and 2/3 on the reversed image. Agy preferred the correct rendering in both orders. The remaining Codex order produced no usable visual ballot. On the historical pair Codex recovered 3/3 from both in both orders, voting tie then Carbon. That is order-sensitive. Density ballots were unavailable at this checkpoint. Agy had incomplete image access or backend timeouts; no missing ballot is imputed. These pilot findings support no overall model ranking.
