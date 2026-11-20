# REVIEW

The one folder a human opens to look at finished output. Every project puts its final files here, so
nobody has to dig through project folders.

Open `REVIEW/index.html`: every project, newest first, with its previews and links to each file.

## The rule

- `REVIEW/<project>/` holds **final output only**: the deliverables a reviewer judges (for example the
  print PNG, the PDF and a preview). Sources, prompts, receipts and intermediate files stay in the
  project's own folder.
- A project's renderer publishes here as its last step, replacing the folder's contents each time so it
  never holds stale files:

  ```js
  // Code inside this repository imports it by relative path ('../tools/review.mjs' and so on);
  // a module in another repository imports it by package name (README: "Using the engine from another repository"):
  import { publishForReview } from 'xyz-layout-engine';
  await publishForReview('my-project', [pngPath, pdfPath, previewPath], { note: 'one line for the reviewer' });
  ```

  or from a shell: `node tools/review.mjs my-project out/a.png out/a.pdf`.
- `review.json` in each project folder records where the files came from.

## Privacy: contents are not committed

This repository is public. `REVIEW/` is where private and unreleased work lands, so git ignores
everything in it except this file. The folder and the convention are public; what is inside stays on
this machine.

To publish one reviewed item deliberately, copy it into `examples/` with its provenance, which is where
public output lives.
