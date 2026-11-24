# GH-100 render qualification

Run in the full task clone based on main@d47eb25, with the November 20 renderer and the lockfile dependencies. Plan QA approved at e01aa4b after adding the analogical-transfer study limitation.

- Main path: ran the documented DECK command against the thesis manifest. Both Satori and Chromium passed per-slide font, text geometry and overlap checks for ten slides. Copied the published PDF and HTML directly into the example and compared bytes. Counted ten PDF page objects.
- Offline smoke: launched Playwright with the network disabled and opened the distributable HTML via file URL. Advanced through all ten frames, checking the counter, title against each manifest entry and loaded image width of 1280 pixels.
- Adjacent path: unset DECK, set OUT_DIR=temp/overview-regression, and ran the same entry point. The overview verification manifest contained 15 slides; both backend checks passed throughout.
- Local preservation: counted 14 workshop slides in the dated archive outside renderer scratch. Compared the separately rebuilt offline viewer to the archived viewer byte for byte. The archive is intentionally local as requested.
- Editorial review: the experimental problem-solving result and the proposed UX application have separate text blocks. The MRI slide identifies practice-related change, its transient character and the separate question of transfer to UX. Both sources are cited in the deck and linked from the example README.
- Negative control: main’s fixed overview manifest lacks the ten thesis slide IDs; the actual navigation check asserted the thesis IDs in order. Geometry alone would accept an unrelated talk.

Final reviewer: inspect the deck, both studies’ scope, the actual renderer delta and this receipt against issue 100. Confirm the published example links resolve. Project qualification commands pnpm test and utils/pdda/pdda.sh run will also run before push by explicit operator decision. No additional test suite.

## Acceptance and evidence map for independent review

Issue: https://github.com/HiQS-Labs/XYZ-layout-engine/issues/100. Integration base d47eb25, product commit aa52167. Inspect the committed tree of this checkout, particularly the paths below, in addition to this receipt.

1. Standalone talk, audience, per-slide contents, career application. Read examples/2026-11-23-beyond-the-prompt/deck.json, IDs audience, contents and judgment. Contents pulls each slide’s preview in manifest order from examples/2026-11-20-layout-engine-deck/render-deck.mjs and the two-column scene in its sibling recipe.mjs. Run git diff d47eb25 aa52167 -- examples/2026-11-20-layout-engine-deck to inspect.
2. Two attributed primary studies and explicit limits. Read the analogy and plasticity slides and examples/2026-11-23-beyond-the-prompt/README.md. Gick and Holyoak (1983) concern experimental problem solving. The following block identifies UX as our application. Draganski et al. (2004) concern learning to juggle; the second block explicitly separates UX judgment. Sources: https://reasoninglab.psych.ucla.edu/wp-content/uploads/sites/273/2021/04/Gick_Holyoak1983_SchemaInduction.pdf and https://doi.org/10.1038/427311a.
3. Delivered artifacts: examples/2026-11-23-beyond-the-prompt/renders/riso/deck.html and deck.pdf. Independent of the primary and task trees, provisioned a disposable full qualification clone at 379cf40 (same product tree as aa52167). Main and adjacent commands there both exited 0:

   DECK=examples/2026-11-23-beyond-the-prompt/deck.json node examples/2026-11-20-layout-engine-deck/render-deck.mjs

   OUT_DIR=temp/overview-regression node examples/2026-11-20-layout-engine-deck/render-deck.mjs

   jq '.slides|length' temp/{beyond-the-prompt,overview-regression}/verification.json returned 10 then 15. cmp of published HTML and committed HTML exited 0. PDF byte comparison passed in the original rendering run; PDF metadata can vary on rebuild. The committed PDF contained 10 page objects. Offline navigation in the disposable clone returned “All ten offline viewer frames and titles navigable in manifest order.” The actual probe is below.
4. Workshop recoverability and optional Part II. On the maintained machine, jq '.slides|length' temp/beyond-the-prompt-workshop-2026-11-24/deck.json returned 14. cmp temp/workshop-snapshot-rebuild/deck.html temp/beyond-the-prompt-workshop-2026-11-24/renders/riso/deck.html exited 0. These paths are local-only by request. No Part II implementation.

~~~js
import { launchPlaywright } from './tools/render.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const dir='examples/2026-11-23-beyond-the-prompt';
const manifest=JSON.parse(fs.readFileSync(dir+'/deck.json'));
assert.deepEqual(manifest.slides.map(s=>s.id),['beyond-the-prompt','audience','contents','promise','evidence','analogy','transfer','plasticity','judgment','closing']);
const b=await launchPlaywright();
try {
 const ctx=await b.newContext({offline:true});
 const p=await ctx.newPage();
 await p.goto(pathToFileURL(path.resolve(dir+'/renders/riso/deck.html')).href);
 for(let i=0;i<manifest.slides.length;i++){
   if(i) await p.locator('#next').click();
   assert.equal(await p.locator('#counter').textContent(),(i+1)+' / 10');
   assert.equal(await p.locator('#cap-title').textContent(),manifest.slides[i].title);
   await p.waitForFunction(()=>document.querySelector('.stage img').naturalWidth===1280);
 }
 console.log('All ten offline viewer frames and titles navigable in manifest order.');
} finally {await b.close();}
~~~

Disposable-clone gates at 379cf40: pnpm test passed all four canaries (30.4 seconds, 60-second budget). utils/pdda/pdda.sh run exited 0 with 35 warnings under issue-doc-sync and governance in the unvendored clone. Re-run the pre-push checks on the publication revision. These are local gates.
