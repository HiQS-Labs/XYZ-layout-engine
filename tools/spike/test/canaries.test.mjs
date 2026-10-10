// GH-2 regression canaries for the GH-1 renderer spike. Run through `pnpm test` (tools/spike/test/run.mjs),
// which enforces test-budget.json. Plain `test()` only; every name starts with `guards: <failure mode>`.
// Supported host: the recorded darwin-arm64 developer host (see PROJECT/3-COMPLETED/GH-2-REGRESSION-CANARIES.md).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, cpSync, appendFileSync, rmSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { processRequest, selectedRun, selectedSpikeRun, toDocument, publishArtifacts, outputRoot, runCLI, verifyPublication } from '../../render.mjs';
import { normalizeRequest } from '../../request.mjs';
import { validateNutrition } from '../../recipes/nutrition.mjs';
import { inspectPng } from '../assets.mjs';

const SPIKE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMMITTED = path.join(SPIKE, 'output');
const GOLDEN = process.env.SPIKE_GOLDEN_ROOT || COMMITTED;
const FRESH = mkdtempSync(path.join(os.tmpdir(), 'gh2-fresh-'));
let FRESH_OUTPUT = FRESH;
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const runDir = root => selectedSpikeRun(root, JSON.parse(readFileSync(path.join(SPIKE, '../../package.json'))).name).directory;
const node = (script, env) => spawnSync(process.execPath, [path.join(SPIKE, script)], { env: { ...process.env, ...env }, encoding: 'utf8', timeout: 50_000 });

test('guards: render pipeline breaks on a clean checkout', async () => {
  const root = path.resolve(SPIKE, '..', '..');
  const srcCheck = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(path.join(SPIKE, 'render.mjs'))}); await import(${JSON.stringify(path.join(root, 'tools/render.mjs'))});`], { env: { ...process.env, SPIKE_OUTPUT_ROOT: FRESH }, encoding: 'utf8' });
  assert.equal(srcCheck.status, 0, srcCheck.stderr);
  assert.deepEqual(readdirSync(FRESH), [], 'imports wrote output');
  const space = path.join(FRESH, 'space path');
  mkdirSync(space);
  cpSync(path.join(root, 'tools'), path.join(space, 'tools'), { recursive: true });
  cpSync(path.join(root, 'package.json'), path.join(space, 'package.json'));
  symlinkSync(path.join(root, 'node_modules'), path.join(space, 'node_modules'), 'dir');
  const cli = (args, env = {}) => spawnSync(process.execPath, [path.join(space, 'tools/render.mjs'), 'tools/spike/fixture.json', '--out', 'local-output', ...args], { cwd: space, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 15_000 });
  const first = cli([]);
  assert.equal(first.status, 0, first.stderr);
  const firstReceipt = JSON.parse(first.stdout);
  assert.equal(firstReceipt.normalized.backend, 'satori');
  assert.equal(firstReceipt.validation.valid, true);
  assert.equal(firstReceipt.catalog.serial, 'RCP-0001');
  assert.equal(firstReceipt.catalog.verified, true);
  const local = path.join(space, 'local-output');
  const snapshot = target => {
    const selected = selectedRun(target), manifest = readFileSync(path.join(target, 'manifest.json'));
    const rec = JSON.parse(manifest);
    return { selected, manifest: sha256(manifest), digests: Object.fromEntries(rec.files.map(file => [file, sha256(readFileSync(path.join(selected, file)))])) };
  };
  const beforeSecond = snapshot(local);
  const second = cli(['--format', 'svg']);
  assert.equal(second.status, 0, second.stderr);
  assert.notEqual(snapshot(local).selected, beforeSecond.selected, 'second same-day publication did not advance');
  assert.match(readFileSync(path.join(selectedRun(local), 'render.svg'), 'utf8'), /<svg/);
  const prior = snapshot(local);
  const late = cli([], { RENDER_INJECT_PUBLICATION_FAILURE: '1' });
  assert.equal(late.status, 1, late.stderr);
  assert.match(late.stderr, /injected late publication failure/);
  assert.deepEqual(snapshot(local), prior, 'late failure changed selected manifest or referenced bytes');
  assert.ok(!readdirSync(local).some(f => f.startsWith('.staging-') || f.startsWith('.manifest-')), 'orphan stage/pointer');
  const unknown = cli(['--fallback', 'browser']);
  assert.equal(unknown.status, 1); assert.match(unknown.stderr, /unsupported option/);

  // P4 failure modes extend C1: durable copy, strict edit admission, formats and offline references.
  const edited = cli(['--set', 'sections.header.headline=Saved <label> & "quoted"', '--set', 'theme.palette.primary=#335577', '--save', 'edited.json', '--format', 'svg,html,html-inline']);
  assert.equal(edited.status, 0, edited.stderr);
  const savedReceipt = JSON.parse(edited.stdout);
  const editedPath = path.join(space, 'edited.json');
  const savedBytes = readFileSync(editedPath);
  assert.equal(JSON.parse(savedBytes).sections.header.headline, 'Saved <label> & "quoted"');
  assert.equal(JSON.parse(savedBytes).theme.palette.primary, '#335577');
  const rerender = await processRequest({ inputPath: editedPath, format: 'svg' }, { root: space });
  assert.equal(rerender.request.digests.svg, savedReceipt.digests.svg, 'saved edit did not survive rerender');
  assert.equal(rerender.result.png, undefined, 'SVG-only request rasterized PNG');
  assert.equal(rerender.timings.rasterMs, 0);
  const distribution = selectedRun(local);
  const distributionManifest = JSON.parse(readFileSync(path.join(distribution, 'manifest.json')));
  assert.ok(!distributionManifest.files.includes('render.png'), 'unrequested PNG exported');
  const compact = readFileSync(path.join(distribution, 'render.html'), 'utf8');
  const inline = readFileSync(path.join(distribution, 'render-inline.html'), 'utf8');
  assert.ok(!compact.includes('data:'));
  assert.match(inline, /data:image\//);
  assert.ok(!inline.includes('assets/'), 'self-contained HTML references sibling assets');
  assert.match(compact, /Saved &lt;label&gt; &amp; &quot;quoted&quot;/);
  for (const match of compact.matchAll(/(?:src="|url\()(assets\/[a-f0-9]{64}\.(?:png|svg|ttf))/g)) {
    assert.ok(distributionManifest.files.includes(match[1]), 'reference absent from manifest');
    assert.ok(readFileSync(path.join(distribution, match[1])).length > 0);
  }
  const unchanged = snapshot(local);
  await assert.rejects(runCLI(['edited.json', '--out', 'local-output', '--set', 'sections.header.unknown=x', '--save', 'edited.json'], { root: space }), /unknown field/);
  assert.deepEqual(readFileSync(editedPath), savedBytes);
  assert.deepEqual(snapshot(local), unchanged);
  // An unbreakable word wider than its box must refuse (non-fit), never publish clipped text.
  await assert.rejects(runCLI(['edited.json', '--out', 'local-output', '--set', `sections.header.headline=${'W'.repeat(120)}`], { root: space }), /non-fit/);
  assert.deepEqual(snapshot(local), unchanged);
  // Only scratch copies are edited; the comparison renderer still reads its untouched fixture.
  assert.deepEqual(readFileSync(path.join(space, 'tools/spike/fixture.json')), readFileSync(path.join(SPIKE, 'fixture.json')));
  const beforeRender = readdirSync(space).sort();
  await processRequest({ inputPath: editedPath, format: 'svg' }, { root: space });
  assert.deepEqual(readdirSync(space).sort(), beforeRender, 'redraw created derivative cache');
  const { chromium: offlineChromium } = await import('playwright');
  const offlineBrowser = await offlineChromium.launch({ headless: true });
  try {
    const offlineContext = await offlineBrowser.newContext({ javaScriptEnabled: false });
    const network = [];
    await offlineContext.route(/^https?:/, route => { network.push(route.request().url()); return route.abort(); });
    const standalone = path.join(space, 'standalone.html');
    cpSync(path.join(distribution, 'render-inline.html'), standalone);
    for (const htmlPath of [path.join(distribution, 'render.html'), standalone]) {
      const page = await offlineContext.newPage();
      await page.goto(pathToFileURL(htmlPath).href);
      const evidence = await page.evaluate(async () => {
        await document.fonts.ready;
        return { fonts: document.fonts.check('16px Inter') && document.fonts.check('700 16px Inter'), faces: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, status: f.status })), images: [...document.images].map(i => i.complete && i.naturalWidth > 0) };
      });
      assert.equal(evidence.fonts, true);
      assert.deepEqual(evidence.faces.map(f => f.weight).sort(), ['400', '700']);
      assert.ok(evidence.faces.every(f => f.family.replace(/^["']|["']$/g, '') === 'Inter' && f.status === 'loaded'));
      assert.ok(evidence.images.length > 0 && evidence.images.every(Boolean), 'offline images failed to load');
      await page.close();
    }
    assert.deepEqual(network, [], 'offline export attempted network access');
    await offlineContext.close();
  } finally { await offlineBrowser.close(); }

  const fixturePath = path.join(SPIKE, 'fixture.json');
  await assert.rejects(normalizeRequest({ inputPath: fixturePath, surprise: 1 }), /surprise/);
  await assert.rejects(normalizeRequest({ inputPath: fixturePath, scale: 0.1 }), /scale/);
  await assert.rejects(normalizeRequest({ inputPath: fixturePath, width: 8192, height: 8192, scale: 0.1 }), /budget/);
  await assert.rejects(normalizeRequest({ inputPath: SPIKE }), /regular file/);
  const tooBig = path.join(space, 'huge.json'); writeFileSync(tooBig, ' '.repeat(262145));
  await assert.rejects(normalizeRequest({ inputPath: tooBig }, { root: space }), /byte budget/);
  symlinkSync(fixturePath, path.join(space, 'escape.json'));
  await assert.rejects(normalizeRequest({ inputPath: 'escape.json' }, { root: space }), /symlink escape/);
  const data = JSON.parse(readFileSync(fixturePath));
  await assert.rejects(validateNutrition({ ...data, surprise: 1 }), /fixture.surprise/);
  await assert.rejects(validateNutrition({ ...data, width: 1000000000 }), /fixture.width/);
  await assert.rejects(validateNutrition({ ...data, theme: { ...data.theme, background: 'red"><script>1</script>' } }), /background/);
  const html = toDocument({ type: 'div', props: { style: { backgroundColor: 'red"><script>1</script>' }, children: 'control' } }, { regular: Buffer.alloc(0), bold: Buffer.alloc(0) }, 100, 100);
  assert.ok(!html.includes('<script>'), 'serializer allows attribute escape');
  const bad = Buffer.alloc(24); Buffer.from('89504e470d0a1a0a', 'hex').copy(bad); bad.writeUInt32BE(1, 16); bad.writeUInt32BE(1, 20);
  assert.throws(() => inspectPng(bad), /Invalid PNG/);
  const validPng = readFileSync(path.join(SPIKE, 'assets/generated/web/balance_scale.png'));
  assert.ok(inspectPng(validPng).width > 0);
  const broken = Buffer.from(validPng); broken[broken.length - 1] ^= 1;
  assert.throws(() => inspectPng(broken), /checksum/);
  const web = path.join(space, 'tools/spike/assets/generated/web');
  mkdirSync(web + '-escape'); writeFileSync(path.join(web + '-escape', 'outside.png'), validPng);
  symlinkSync(path.join(web + '-escape', 'outside.png'), path.join(web, 'linked.png'));
  const assetProbe = spawnSync(process.execPath, ['--input-type=module', '-e', `const {resolveIllustration}=await import(${JSON.stringify(path.join(space, 'tools/spike/assets.mjs'))}); try { await resolveIllustration('linked'); process.exitCode=9; } catch(e) { if(!e.message.includes('symlink escape')) throw e; }`], { encoding: 'utf8' });
  assert.equal(assetProbe.status, 0, assetProbe.stderr);
  await assert.rejects(outputRoot(path.join(SPIKE, 'output')), /read-only/);
  symlinkSync(root, path.join(space, 'output-escape'), 'dir');
  await assert.rejects(outputRoot('output-escape/new-output', space), /symlink escape/);

  // Native browser launch substitution proves owning cleanup on a postlaunch error without leaving Chromium alive.
  const { chromium } = await import('playwright');
  const launch = chromium.launch; let closes = 0;
  chromium.launch = async () => ({ newContext: async () => { throw new Error('injected context failure'); }, close: async () => { closes++; } });
  try { await assert.rejects(processRequest({ inputPath: fixturePath, backend: 'playwright' }), /injected context failure/); assert.equal(closes, 1); }
  finally { chromium.launch = launch; }
  const operation = await processRequest({ inputPath: fixturePath, format: 'html' });
  const htmlArtifact = operation.artifacts.find(artifact => artifact.name === 'render.html');
  assert.ok(htmlArtifact, 'requested HTML page missing from compact bundle');
  assert.equal(htmlArtifact.mime, 'text/html');
  assert.match(htmlArtifact.bytes.toString(), /<!doctype html>/);
  operation.request.validation.valid = false;
  await assert.rejects(publishArtifacts(operation, 'rejected', { root: space }), /cannot publish/);

  const comparisonEnv = { ...process.env, SPIKE_RENDER_DEADLINE_MS: '40000' };
  delete comparisonEnv.SPIKE_OUTPUT_ROOT;
  const compare = script => spawnSync(process.execPath, [path.join(space, 'tools/spike', script)], { cwd: space, env: comparisonEnv, encoding: 'utf8', timeout: 50_000 });
  const r = compare('render.mjs');
  assert.equal(r.status, 0, r.stderr.slice(-1000));
  assert.match(r.stdout, /^render: selection /m);
  FRESH_OUTPUT = path.join(space, 'tools/output/spike');
  const lastGood = runDir(FRESH_OUTPUT);
  mkdirSync(path.join(FRESH_OUTPUT, '9999-12-31-xyz-layout-engine-spike'));
  assert.equal(runDir(FRESH_OUTPUT), lastGood, 'failed later date hid last-good selection');
  const v = compare('verify.mjs');
  assert.equal(v.status, 0, (v.stdout + v.stderr).slice(-1000));
  assert.match(v.stdout, /^VERDICT: PASS$/m);
  const file = path.join(lastGood, 'satori.png'), original = readFileSync(file);
  appendFileSync(file, 'x');
  const tampered = compare('verify.mjs');
  assert.equal(tampered.status, 1, 'default verifier ignored new selected output');
  assert.match(tampered.stderr, /does not match the recorded digest/);
  writeFileSync(file, original);
  { // Solar System controls extend C1; no fifth test.
  const ssFixturePath = path.join(SPIKE, '../../examples/2026-10-08-solar-system/fixture.json');
  const data = JSON.parse(readFileSync(ssFixturePath, 'utf8'));

  // 1. Image visibility canary (pixels instead of metadata)
  const { loadSatori, renderSatori } = await import('../../render.mjs');
  const { getFonts } = await import('../assets.mjs');
  await loadSatori();
  const fonts = await getFonts();
  const sunPng = readFileSync(path.join(SPIKE, '../../examples/2026-10-08-solar-system/assets/web/sun.png'));
  const sunDataUri = 'data:image/png;base64,' + sunPng.toString('base64');

  const scene = {
    type: 'div',
    props: {
      style: { display: 'flex', width: 220, height: 220, backgroundColor: '#000000' },
      children: [{ type: 'img', props: { src: sunDataUri, style: { width: 220, height: 220, objectFit: 'contain' } } }]
    }
  };
  const res = await renderSatori(scene, fonts, 220, 220);

  const emptyScene = { type: 'div', props: { style: { display: 'flex', width: 220, height: 220, backgroundColor: '#000000' } } };
  const emptyRes = await renderSatori(emptyScene, fonts, 220, 220);
  const { Resvg } = await import('@resvg/resvg-js');
  const painted = new Resvg(res.svg).render(), empty = new Resvg(emptyRes.svg).render();
  assert.notDeepEqual(Buffer.from(painted.pixels), Buffer.from(empty.pixels), 'actual painted pixels required for image visibility');

  // 2. Real shrink (success after iterations)
  const shrinkFixture = { ...data, title: data.title.repeat(2) };
  const p1 = path.join(FRESH, 'shrink.json');
  writeFileSync(p1, JSON.stringify(shrinkFixture));
  const op1 = await processRequest({ inputPath: p1, format: 'png', recipe: 'solar-system' }, { root: FRESH });
  assert.equal(op1.request.fitting.attempts > 1, true, 'must actually shrink');
  assert.equal(op1.request.validation.valid, true);
  assert.ok(op1.request.fitting.attempts <= 10);
  assert.ok(Object.values(op1.request.fitting.finalSizes).every(size => size >= 12));
  const { validate: validateSolar } = await import('../../recipes/solar-system.mjs');
  await assert.rejects(validateSolar({ ...data, surprise: 1 }), /fixture.surprise/);
  await assert.rejects(validateSolar({ ...data, planets: [{ ...data.planets[0], asset: '../outside' }, ...data.planets.slice(1)] }), /asset/);
  await assert.rejects(validateSolar({ ...data, center: { ...data.center, x: '<script>' } }), /bounded geometry/);
  await assert.rejects(normalizeRequest({ inputPath: ssFixturePath, recipe: 'solar-system', width: 1200, height: 850 }), /recipe-owned/);
  const spatial = path.join(FRESH, 'spatial.json');
  for (const mutate of [
    f => { f.planets[0].radiusX = 8192; },
    f => { f.center.x = 8192; },
    f => { f.planets[0].imageSize = 8192; },
    f => { f.planets[0].labelX = 8192; }
  ]) {
    const changed = structuredClone(data); mutate(changed); writeFileSync(spatial, JSON.stringify(changed));
    await assert.rejects(processRequest({ inputPath: spatial, recipe: 'solar-system' }, { root: FRESH }), /fixture.*unsupported off-canvas/);
  }
  const unsupported = path.join(FRESH, 'unsupported-script.json');
  writeFileSync(unsupported, JSON.stringify({ ...data, title: '营养' }));
  for (const backend of ['satori', 'playwright']) await assert.rejects(processRequest({ inputPath: unsupported, recipe: 'solar-system', backend }, { root: FRESH }), /unsupported text\/font/);

  // 3. Exhaustion (non-fit)
  const failFixture = { ...data, title: data.title.repeat(20) };
  const p2 = path.join(FRESH, 'fail.json');
  writeFileSync(p2, JSON.stringify(failFixture));
  await assert.rejects(processRequest({ inputPath: p2, format: 'png', recipe: 'solar-system' }, { root: FRESH }), /text outside its region|missing\/invalid text geometry|text outside canvas/);

  // Generator recovery controls stay inside C1 and never invoke a provider.
  const stubJS = path.join(FRESH, 'stub.mjs'), stubCount = path.join(FRESH, 'stub-count');
  writeFileSync(stubJS, `
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
const args=process.argv, out=args[args.indexOf('--out')+1];
appendFileSync(process.env.STUB_COUNT, 'call\\n');
if(process.env.STUB_SLEEP) await new Promise(resolve=>setTimeout(resolve, Number(process.env.STUB_SLEEP)));
if(process.env.STUB_CORRUPT) { writeFileSync(out,'bad'); console.log('not json'); }
else {
 const png=readFileSync(process.env.STUB_PNG); if(!process.env.STUB_MISSING) writeFileSync(out,png);
 const hash=b=>createHash('sha256').update(b).digest('hex');
 console.log(JSON.stringify({status:'success', image:{sha256:hash(png),bytes:png.length}, alpha:{hasAlphaChannel:true,verified:true,transparentPixelRatio:0.5}, recipeRef:'configured-caller:'+hash(readFileSync(fileURLToPath(import.meta.url))), argv:args.slice(2),attempts:[{status:'success'}],usage:{images:1},cost:{usd:0.01}}));
}
`);
  const py = path.join(SPIKE, '../../examples/2026-10-08-solar-system/generate-assets.py');
  const genRoot = path.join(FRESH, 'gen'); mkdirSync(genRoot);
  const jobsFile = path.join(genRoot, 'jobs.json'), manifestFile = path.join(genRoot, 'manifest.json');
  const job = { id: 'sun', prompt: 'a', model: 'm', size: '1024x1024', quality: 'medium', background: 'transparent' };
  const genEnv = { ...process.env, STUB_COUNT: stubCount, STUB_PNG: path.join(SPIKE, 'assets/generated/web/balance_scale.png') };
  const argv = ['--caller',stubJS,'--assets-dir',genRoot,'--jobs',jobsFile];
  const runGen = (extra=[],env={}) => spawnSync(process.env.PYTHON || 'python3',[py,...argv,...extra], {env:{...genEnv,...env},encoding:'utf8',timeout:15000});
  const calls = () => readFileSync(stubCount,'utf8').trim().split('\n').filter(Boolean).length;
  writeFileSync(jobsFile, JSON.stringify([job]));
  let result=runGen(); assert.equal(result.status,0,result.stdout+result.stderr); assert.equal(calls(),1);
  result=runGen(); assert.equal(result.status,0,result.stdout+result.stderr); assert.equal(calls(),1,'resume dispatched another call');
  const publishedPrompts=path.join(genRoot,'prompts.json'); writeFileSync(publishedPrompts,'historical input');
  writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'changed'}]));
  result=runGen(['--dry-run']); assert.equal(result.status,0,result.stdout+result.stderr); assert.equal(calls(),1); assert.equal(readFileSync(publishedPrompts,'utf8'),'historical input');
  result=runGen(['--max-calls','0']); assert.equal(result.status,4); assert.equal(calls(),1);
  result=runGen(); assert.equal(result.status,0,result.stdout+result.stderr); assert.equal(calls(),2,'one change must dispatch once');
  writeFileSync(jobsFile,JSON.stringify([job])); result=runGen(); assert.equal(result.status,0,result.stdout+result.stderr); assert.equal(calls(),2,'A -> B -> A lost immutable lineage');
  let manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
  const original=Object.entries(manifest).find(([,state])=>state.input.prompt==='a');
  writeFileSync(path.join(genRoot,original[1].output),'tampered');
  result=runGen(); assert.equal(result.status,4); assert.match(result.stdout,/corrupt output/); assert.equal(calls(),2,'corruption caused blind paid retry');
  writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'unknown'}]));
  result=runGen([],{STUB_CORRUPT:'1'}); assert.equal(result.status,4); const paidCalls=calls();
  result=runGen(); assert.equal(result.status,4); assert.match(result.stdout,/unknown requires explicit retry/); assert.equal(calls(),paidCalls);
  writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'unknown'},{...job,id:'earth',prompt:'earth'}]));
  result=runGen(); assert.equal(result.status,4); assert.equal(calls(),paidCalls,'unresolved Sun permitted Earth');
  manifest=JSON.parse(readFileSync(manifestFile,'utf8')); const unknown=Object.values(manifest).find(state=>state.input.prompt==='unknown'); unknown.status='in-flight';writeFileSync(manifestFile,JSON.stringify(manifest));
  result=runGen(); assert.equal(result.status,4); assert.match(result.stdout,/in-flight requires explicit retry/);assert.equal(calls(),paidCalls);
  writeFileSync(jobsFile,JSON.stringify([{...job,id:'../escape',prompt:'unsafe'}]));result=runGen(); assert.equal(result.status,4);assert.equal(calls(),paidCalls);
  writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'concurrency'}]));
  const holder=spawn(process.env.PYTHON || 'python3',[py,...argv],{env:{...genEnv,STUB_SLEEP:'900'},stdio:['ignore','pipe','pipe']});
  let holderOut='',holderError=''; holder.stdout.on('data',data=>holderOut+=data);holder.stderr.on('data',data=>holderError+=data);
  const closed=new Promise(resolve=>holder.on('close',resolve));
  try {
    const until=Date.now()+3000; while(calls()===paidCalls && Date.now()<until) await new Promise(resolve=>setTimeout(resolve,20));
    assert.equal(calls(),paidCalls+1,'first caller did not start');
    result=runGen(); assert.equal(result.status,4); assert.match(result.stdout,/concurrent manifest ownership/);
    assert.equal(await closed,0,holderOut+holderError);assert.equal(calls(),paidCalls+1,'overlap dispatched twice');
  } finally { if(holder.exitCode===null) holder.kill(); }
  writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'deadline'}]));
  result=runGen(['--timeout','0.1','--run-timeout','0.2'],{STUB_SLEEP:'3000'});assert.equal(result.status,4);const afterTimeout=calls();
  result=runGen();assert.equal(result.status,4);assert.equal(calls(),afterTimeout,'timeout blindly retried');
  writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'missing-output'}]));
  result=runGen([],{STUB_MISSING:'1'});assert.equal(result.status,4);const afterMissing=calls();
  result=runGen();assert.equal(result.status,4);assert.equal(calls(),afterMissing,'missing output caused replay');
  const ref=path.join(genRoot,'reference.png');writeFileSync(ref,validPng);
  const edit={...job,prompt:'reference-edit',references:[ref],parameters:{moderation:'low'},refinement_id:'sun-r2'};
  writeFileSync(jobsFile,JSON.stringify([edit]));result=runGen();assert.equal(result.status,0,result.stdout+result.stderr);
  const edited=Object.values(JSON.parse(readFileSync(manifestFile,'utf8'))).find(state=>state.input.prompt==='reference-edit');
  const editReceipt=JSON.parse(readFileSync(path.join(genRoot,edited.receipt),'utf8'));
  assert.equal(editReceipt.argv[editReceipt.argv.indexOf('--param')+1],'moderation=low');
  const snapshot=editReceipt.argv[editReceipt.argv.indexOf('--reference')+1];assert.notEqual(snapshot,ref);assert.equal(sha256(readFileSync(snapshot)),sha256(validPng));
  const beforeReferenceChange=calls();writeFileSync(ref,sunPng);result=runGen();assert.equal(result.status,0,result.stdout+result.stderr);assert.equal(calls(),beforeReferenceChange+1,'reference content change did not invalidate one job');
  const manifestBytes=readFileSync(manifestFile), beforeBroken=calls();writeFileSync(manifestFile,'{broken');result=runGen();assert.equal(result.status,4);assert.equal(calls(),beforeBroken);writeFileSync(manifestFile,manifestBytes);
  const beforeInvalidState=calls(); const lost=JSON.parse(manifestBytes); delete Object.values(lost)[0].status;writeFileSync(manifestFile,JSON.stringify(lost));result=runGen();assert.equal(result.status,4);assert.equal(calls(),beforeInvalidState);writeFileSync(manifestFile,manifestBytes);
  rmSync(manifestFile);symlinkSync(path.join(genRoot,'lost-manifest.json'),manifestFile);result=runGen();assert.equal(result.status,4);assert.equal(calls(),beforeInvalidState);rmSync(manifestFile);writeFileSync(manifestFile,manifestBytes);
  for(const seed of [0.0000001,9007199254740993]) { writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'numeric',parameters:{seed}}]));result=runGen();assert.equal(result.status,4);assert.match(result.stderr,/round-trip/);assert.equal(calls(),beforeInvalidState); }
  writeFileSync(jobsFile,JSON.stringify([{...job,prompt:'numeric',parameters:{seed:0.5}}]));result=runGen();assert.equal(result.status,0,result.stdout+result.stderr);assert.equal(calls(),beforeInvalidState+1);
  const numericManifest=JSON.parse(readFileSync(manifestFile,'utf8')); const numeric=Object.values(numericManifest).find(state=>state.input.prompt==='numeric'); const numericReceipt=path.join(genRoot,numeric.receipt), savedReceipt=readFileSync(numericReceipt);const wrongRecipe=JSON.parse(savedReceipt);wrongRecipe.recipeRef='wrong-recipe';writeFileSync(numericReceipt,JSON.stringify(wrongRecipe));numeric.receipt_sha256=sha256(readFileSync(numericReceipt));writeFileSync(manifestFile,JSON.stringify(numericManifest));const beforeRecipeReuse=calls();result=runGen(['--max-calls','0']);assert.equal(result.status,4);assert.equal(calls(),beforeRecipeReuse);writeFileSync(numericReceipt,savedReceipt);
  const deadlineProbe=spawnSync(process.env.PYTHON || 'python3',['-B','-c',`
import importlib.util, pathlib, sys, tempfile
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('g',sys.argv[1]);g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
now=[100.0]; original=g.update_manifest
job={'id':'sun','prompt':'deadline-preparation','model':'m','size':'1024x1024','quality':'medium','background':'transparent'}
def delayed(*args):
 result=original(*args)
 if args[2].get('status')=='in-flight': now[0]+=2
 return result
def forbidden(*args,**kwargs): raise AssertionError('launch after deadline')
with patch.object(g.time,'monotonic',lambda:now[0]),patch.object(g,'update_manifest',delayed),patch.object(g.subprocess,'Popen',forbidden):
 assert g.generate([job],pathlib.Path(tempfile.mkdtemp()),pathlib.Path(sys.argv[2]),run_timeout=1) is False
`,py,stubJS],{encoding:'utf8',timeout:10000});assert.equal(deadlineProbe.status,0,deadlineProbe.stdout+deadlineProbe.stderr);
  console.log('# C1: import/space CLI, admission, HTML, cleanup, publication, Solar fitting and generation recovery passed');
  }
});

test('guards: unintended visual or layout drift', () => {
  const fresh = runDir(FRESH_OUTPUT), golden = runDir(GOLDEN);
  const fm = JSON.parse(readFileSync(path.join(fresh, 'measurements.json'))), gm = JSON.parse(readFileSync(path.join(golden, 'measurements.json')));
  const keys = m => Object.entries(m.cases).flatMap(([c, per]) => Object.entries(per).flatMap(([b, rec]) => Object.keys(rec.bounds).map(l => `${c}/${b}/${l}`))).sort();
  assert.deepEqual(keys(fm), keys(gm), 'case/backend/label sets differ between fresh and golden runs');
  let compared = 0;
  for (const k of keys(gm)) {
    const [c, b, l] = k.split('/');
    const f = fm.cases[c][b].bounds[l], g = gm.cases[c][b].bounds[l];
    for (const d of ['x', 'y', 'width', 'height']) {
      assert.ok(Number.isFinite(f[d]) && Number.isFinite(g[d]), `${k}.${d} is not finite`);
      assert.ok(Math.abs(f[d] - g[d]) <= 0.5, `${k}.${d} drifted: fresh ${f[d]} vs golden ${g[d]}`);
    }
    compared++;
  }
  assert.ok(compared > 0, 'compared zero boxes');
  console.log(`# C2 geometry: ${compared} boxes compared within 0.5 px`);
  const host = r => { const j = JSON.parse(readFileSync(path.join(r, 'runtime.json'))); return `${j.environment.platform}/${j.environment.arch}/${j.dependencies.chromium?.version}`; };
  if (host(fresh) !== host(golden)) { console.log(`# C2 digests: skipped (host differs: ${host(fresh)} vs ${host(golden)})`); return; }
  const files = readdirSync(golden).filter(f => /\.(png|svg|html)$/.test(f)).sort();
  assert.ok(files.length > 0, 'no golden artifacts to compare');
  for (const f of files) assert.equal(sha256(readFileSync(path.join(fresh, f))), sha256(readFileSync(path.join(golden, f))), `${f} differs from golden`);
  console.log(`# C2 digests: ${files.length} artifacts byte-identical`);
});

test('guards: committed evidence no longer satisfies the gate', () => {
  const catalog = spawnSync(process.execPath, [path.join(SPIKE, '../catalog.mjs'), 'verify'], { encoding: 'utf8', timeout: 15_000 });
  assert.equal(catalog.status, 0, `catalog verify exited ${catalog.status}: ${catalog.stdout}${catalog.stderr}`);
  const v = node('verify.mjs', { SPIKE_OUTPUT_ROOT: COMMITTED }); // pinned: an exported override must not redirect this gate
  assert.equal(v.status, 0, `verify on committed evidence exited ${v.status}: ${(v.stdout + v.stderr).slice(-400)}`);
  assert.match(v.stdout, /^VERDICT: PASS$/m);
});

test('guards: the verifier stops detecting tampering', async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'gh2-tamper-'));
  try {
    const src = runDir(COMMITTED);
    cpSync(src, path.join(root, path.basename(src)), { recursive: true });
    appendFileSync(path.join(root, path.basename(src), 'satori.png'), 'x');
    const v = node('verify.mjs', { SPIKE_OUTPUT_ROOT: root });
    assert.equal(v.status, 1, `tampered evidence was not rejected (exit ${v.status})`);
    assert.match(v.stderr, /does not match the recorded digest/);
    const fixture = path.join(root, 'fixture.json');
    cpSync(path.join(SPIKE, 'fixture.json'), fixture);
    const literal = 'data:image/png;base64,Zg==';
    const op = await processRequest({ inputPath: fixture, format: 'html,html-inline', edits: [{ path: 'sections.header.subtitle', value: literal }] }, { root });
    assert.ok(op.artifacts.find(a => a.name === 'render.html').bytes.toString().includes(literal), 'data URL text rewritten as an asset');
    const publication = await publishArtifacts(op, 'offline', { root });
    assert.equal((await verifyPublication(publication.root)).valid, true);
    const assetName = publication.manifest.files.find(name => name.startsWith('assets/'));
    const assetFile = path.join(publication.directory, assetName), originalAsset = readFileSync(assetFile);
    appendFileSync(assetFile, 'tamper');
    await assert.rejects(verifyPublication(publication.root), /recorded digest/);
    writeFileSync(assetFile, originalAsset);
    assert.equal((await verifyPublication(publication.root)).valid, true);
    // Supplied-art tamper fails before reuse; repair restores the immutable source, no derivative rebuild.
    mkdirSync(path.join(root, 'tools/recipes'), { recursive: true });
    cpSync(path.join(SPIKE, '../recipes/solar-system.mjs'), path.join(root, 'tools/recipes/solar-system.mjs'));
    cpSync(path.join(SPIKE, '../request.mjs'), path.join(root, 'tools/request.mjs'));
    mkdirSync(path.join(root, 'tools/spike'), { recursive: true });
    cpSync(path.join(SPIKE, 'assets.mjs'), path.join(root, 'tools/spike/assets.mjs'));
    cpSync(path.join(SPIKE, '../../examples/2026-10-08-solar-system'), path.join(root, 'examples/2026-10-08-solar-system'), { recursive: true });
    const { loadAssets } = await import(pathToFileURL(path.join(root, 'tools/recipes/solar-system.mjs')).href);
    const initialAssets = await loadAssets();
    const sun = path.join(root, 'examples/2026-10-08-solar-system/assets/web/sun.png'), originalSun = readFileSync(sun);
    writeFileSync(sun, readFileSync(path.join(root, 'examples/2026-10-08-solar-system/assets/web/earth.png')));
    await assert.rejects(loadAssets(), /digest mismatch/);
    writeFileSync(sun, originalSun);
    assert.deepEqual(await loadAssets(), initialAssets);
    // GH-10: C4 also guards immutable publication, serial retention and canonical storage.
    // Existing canaries do not exercise catalog transactions or declared recipe bytes.
    for (const name of ['catalog.mjs', 'catalog.sql']) cpSync(path.join(SPIKE, '..', name), path.join(root, 'tools', name));
    cpSync(path.join(SPIKE, '../recipes/nutrition.mjs'), path.join(root, 'tools/recipes/nutrition.mjs'));
    for (const name of ['scene.mjs','fixture.json']) cpSync(path.join(SPIKE, name), path.join(root, 'tools/spike', name));
    cpSync(path.join(SPIKE, 'assets'), path.join(root, 'tools/spike/assets'), { recursive:true });
    const { SCHEMA, loadDump, exportDump } = await import('../../catalog.mjs');
    // Always isolate from Phase 2's populated committed dump.
    const catalogFile = path.join(root, 'tools/catalog.sql');
    writeFileSync(catalogFile, SCHEMA + 'INSERT INTO schema_migrations VALUES (1);\n');
    const catalog = (...args) => spawnSync(process.execPath, [path.join(root,'tools/catalog.mjs'), ...args], { cwd:root, encoding:'utf8', timeout:10000 });
    const succeeds = (...args) => { const r=catalog(...args); assert.equal(r.status,0,r.stdout+r.stderr); return r; };
    succeeds('add','nutrition','--title',"Nutrition's recipe");
    succeeds('publish','nutrition','1.0.0');
    const published = readFileSync(catalogFile), stat = (await import('node:fs')).statSync(catalogFile);
    succeeds('publish','nutrition','1.0.0');
    assert.deepEqual(readFileSync(catalogFile),published,'same publication rewrote bytes');
    assert.equal((await import('node:fs')).statSync(catalogFile).mtimeMs,stat.mtimeMs,'same publication rewrote dump');
    for (const args of [['list','--json'],['show','RCP-0001','--json'],['verify','--json'],['export','--check']]) succeeds(...args);
    assert.deepEqual(readFileSync(catalogFile),published,'read verb changed dump');
    assert.equal((await import('node:fs')).statSync(catalogFile).mtimeMs,stat.mtimeMs,'read verb changed mtime');
    assert.equal(readdirSync(path.join(root,'tools')).includes('.catalog.lock'),false,'lock leaked');
    // The named P1-A6 red control must fail if the actual UPDATE trigger is removed.
    const db = loadDump(published.toString());
    try {
      assert.throws(() => db.prepare("UPDATE recipe_versions SET content_sha256=?").run('0'.repeat(64)), /published version immutable/);
      assert.throws(() => db.prepare("DELETE FROM recipe_versions").run(), /published version immutable/);
      assert.throws(() => db.prepare("UPDATE recipe_version_files SET sha256=?").run('0'.repeat(64)), /published files immutable/);
      assert.throws(() => db.prepare("DELETE FROM recipes").run(), /recipe identity retained/);
      assert.equal(exportDump(db),published.toString());
    } finally { db.close(); }
    const sceneFile = path.join(root,'tools/spike/scene.mjs'), originalScene=readFileSync(sceneFile);
    appendFileSync(sceneFile,'\n// changed content\n');
    let rejected=catalog('publish','nutrition','1.0.0');
    assert.equal(rejected.status,1); assert.match(rejected.stderr,/already published with different content/);
    assert.deepEqual(readFileSync(catalogFile),published,'rejected publication changed dump');
    rejected=catalog('verify','--json'); assert.equal(rejected.status,1); assert.match(rejected.stdout,/modified declared file/);
    rmSync(sceneFile); rejected=catalog('verify'); assert.equal(rejected.status,1); assert.match(rejected.stdout,/missing\/unreadable declared file/);
    writeFileSync(sceneFile,originalScene); succeeds('verify');
    const extraPng = path.join(root,'tools/spike/assets/generated/web/heart.png');
    writeFileSync(extraPng,readFileSync(path.join(root,'tools/spike/assets/generated/web/balance_scale.png')));
    rejected=catalog('verify'); assert.equal(rejected.status,1); assert.match(rejected.stdout,/namespace differs/); rmSync(extraPng);
    succeeds('add','solar-system','--title','Solar'); succeeds('retire','solar-system','--reason','retention control');
    succeeds('add','third-recipe','--title','Third');
    const rows=JSON.parse(succeeds('list','--json').stdout); assert.deepEqual(rows.map(r => r.serial),['RCP-0001','RCP-0002','RCP-0003']);
    const dump=succeeds('export').stdout, importFile=path.join(root,'roundtrip.sql'); writeFileSync(importFile,dump);
    // Fresh destination admission preserves every GID and natural-key order.
    writeFileSync(catalogFile,SCHEMA + 'INSERT INTO schema_migrations VALUES (1);\n');
    succeeds('import',importFile); assert.equal(succeeds('export').stdout,dump,'dump round trip differs');
    succeeds('export','--check');
    const reversed=readFileSync(catalogFile,'utf8').split('\n'), rowIndexes=reversed.map((line,i) => line.startsWith('INSERT INTO recipes ') ? i : -1).filter(i => i>=0);
    [reversed[rowIndexes[0]],reversed[rowIndexes[1]]]=[reversed[rowIndexes[1]],reversed[rowIndexes[0]]];
    writeFileSync(catalogFile,reversed.join('\n')); assert.equal(catalog('export','--check').status,1,'noncanonical row order accepted');
    writeFileSync(catalogFile,dump);
    succeeds('update','nutrition','--title','Updated'); assert.notEqual(readFileSync(catalogFile,'utf8'),dump,'update failed to change dump');
    writeFileSync(path.join(root,'tools/.catalog.lock'),'held');
    rejected=catalog('update','nutrition','--title','Blocked'); assert.equal(rejected.status,1); assert.match(rejected.stderr,/catalog lock exists/);
    succeeds('list'); rmSync(path.join(root,'tools/.catalog.lock'));
    assert.equal(catalog('show').status,2,'usage exit differs');
    console.log('# C4 catalog: publication, SQL triggers, serial retention, round trip, reads, drift, namespace and lock controls passed');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

after(() => rmSync(FRESH, { recursive: true, force: true }));
