# Blind evaluation

Distribute only a candidate ZIP. Record its track, model, runtime, tool access and credit cap separately. Hide those details from the reader until scoring is complete. Use a fresh sandbox for candidate code and a trusted checkout containing this evaluator and Playwright. Keep the ballot and evaluator outside the model workspace.

1. Run the automated checks against the candidate’s output directory. The report always includes automatedPercent (0–100), a deterministic artifact and caption-coverage score. It rewards co-located technical terms; an incorrect sentence can still contain the terms, and unconventional phrasing can miss them. Use gradePercent for the evidence-backed comprehension and design grade. The script inspects both artifacts and opens HTML in Chromium with external resources blocked. Run it inside an evaluator sandbox with networking disabled. It never invokes the submitted rebuild command.
2. Give a reader only the diagram. Ask them where to edit the words, change the illustration and move the leaf, then to trace the two render paths and describe what the viewer receives. Record what they actually identify. Compare factual answers with the supplied recipe and renderer. Score each observation in rubric.json as pass or fail. Record a specific location, answer or failed check as evidence. Run the rebuild and edit challenges separately in a disposable, isolated candidate workspace. Use the same questions, viewport and time allowance for every model.
3. Copy ballot-template.json outside the packet, fill in every verdict and evidence, and rerun with the ballot. Award full points or zero for each criterion. Until the ballot is complete, the report shows earned and pending points without issuing a final grade.

From this directory:

    node grade.mjs /path/to/output
    node grade.mjs /path/to/output completed-ballot.json > score.json

A matching score means the same recorded observations earned the same percentage. Human judgments about legibility and comprehension can differ. Report reader disagreement separately and adjudicate using the pictured evidence. A model's visual decision and tool cost are useful qualitative notes. Tool use earns no points. The score does not establish filesystem isolation or compliance with the credit cap; verify those from the run environment.

For the opt-in editorial judgment task, see [v2 pilot instructions](v2/README.md). Historical packets and grades use the procedure above.
