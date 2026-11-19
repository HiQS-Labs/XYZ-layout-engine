// XYZ Studio page logic. Talks only to tools/studio.mjs on the same origin.
(() => {
  const $ = id => document.getElementById(id);
  const el = (tag, attrs = {}, ...kids) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') node.className = v; else if (k === 'text') node.textContent = v; else node.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined) node.append(kid);
    return node;
  };
  const TOKEN = document.querySelector('meta[name="studio-token"]').content;
  const store = { get: k => { try { return localStorage.getItem('xyz-studio:' + k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('xyz-studio:' + k, v); } catch { /* storage off */ } } };

  // ---------- theme ----------
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  let themeMode = store.get('theme') || 'auto';
  const applyTheme = () => {
    document.documentElement.setAttribute('data-bs-theme', themeMode === 'auto' ? (mq.matches ? 'dark' : 'light') : themeMode);
    $('themeBtn').textContent = 'Theme: ' + themeMode;
  };
  mq.addEventListener('change', applyTheme);
  $('themeBtn').addEventListener('click', () => { themeMode = { auto: 'light', light: 'dark', dark: 'auto' }[themeMode]; store.set('theme', themeMode); applyTheme(); });
  applyTheme();
  $('hostChip').textContent = location.host;

  // ---------- api + toast ----------
  const toast = bootstrap.Toast.getOrCreateInstance($('studioToast'), { delay: 3600 });
  const say = msg => { $('toastBody').textContent = msg; toast.show(); };
  async function api(method, url, body) {
    const res = await fetch(url, { method, headers: body ? { 'content-type': 'application/json', 'x-studio-token': TOKEN } : {}, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { details: data.details, status: res.status });
    return data;
  }

  // ---------- state ----------
  const state = { fixtures: [], current: null, fields: [], baseline: null, latest: null, seq: 0, timer: null };
  const HIDDEN = /(^|\.)(id|asset|index|width|height|[A-Za-z]+Id)$/;
  const COLOR = /^#[0-9a-f]{6}$/i;

  function flatten(value, prefix, out) {
    if (Array.isArray(value)) value.forEach((v, i) => flatten(v, prefix ? `${prefix}.${i}` : String(i), out));
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) { if (/^[A-Za-z0-9_]+$/.test(k)) flatten(v, prefix ? `${prefix}.${k}` : k, out); }
    else if (typeof value === 'string' || typeof value === 'number') out.push({ path: prefix, value });
    return out;
  }
  const labelFor = p => { const parts = p.split('.'); const last = parts.at(-1); const name = /^\d+$/.test(last) ? `${parts.at(-2) ?? 'item'} ${Number(last) + 1}` : last; return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()); };

  // ---------- fixtures ----------
  async function loadFixtureList(select) {
    const { fixtures } = await api('GET', '/api/fixtures');
    state.fixtures = fixtures;
    const pick = $('fixturePick');
    pick.replaceChildren();
    for (const root of ['examples', '.relay-scratch', 'temp']) {
      const group = el('optgroup', { label: root + '/' });
      for (const f of fixtures.filter(x => x.root === root)) group.append(el('option', { value: f.path, text: `${f.title} · ${f.recipe}` }));
      if (group.children.length) pick.append(group);
    }
    const wanted = select ?? store.get('fixture');
    pick.value = fixtures.some(f => f.path === wanted) ? wanted : (fixtures.find(f => f.recipe === 'nutrition')?.path ?? fixtures[0]?.path ?? '');
    return pick.value;
  }

  async function openFixture(path) {
    if (!path) return;
    const data = await api('GET', '/api/fixture?path=' + encodeURIComponent(path));
    state.current = data; state.baseline = null; state.latest = null;
    store.set('fixture', path);
    $('fixturePick').value = path;
    $('fixturePath').textContent = path;
    $('savePath').value = data.savePath;
    buildForm(data.fixture);
    // Playwright cannot export SVG; keep the format list valid for the chosen backend.
    await render({ baseline: true });
  }

  function buildForm(fixture) {
    const entries = flatten(fixture, '', []).filter(e => !HIDDEN.test(e.path));
    const groups = new Map();
    for (const e of entries) { const top = e.path.split('.')[0]; if (!groups.has(top)) groups.set(top, []); groups.get(top).push(e); }
    state.fields = [];
    const box = $('fields'); box.replaceChildren();
    let first = true, n = 0;
    for (const [top, items] of groups) {
      const body = el('div', { class: 'field-body' });
      const section = el('details', { class: 'field-section', open: first || items.length <= 6 }, el('summary', {}, labelFor(top), el('span', { class: 'count', text: `(${items.length})` })), body);
      first = false;
      for (const item of items) {
        const id = 'f' + (n++), kind = typeof item.value === 'number' ? 'number' : COLOR.test(item.value) ? 'color' : String(item.value).length > 64 ? 'long' : 'text';
        const input = kind === 'long' ? el('textarea', { class: 'form-control form-control-sm', id, rows: 3 }) : el('input', { class: 'form-control form-control-sm', id, type: kind === 'number' ? 'number' : 'text', step: kind === 'number' ? 'any' : undefined });
        input.value = String(item.value);
        const field = { path: item.path, orig: item.value, kind, input, wrap: null };
        let control = input;
        if (kind === 'color') {
          const swatch = el('input', { type: 'color', class: 'form-control form-control-color', 'aria-label': labelFor(item.path) + ' swatch' });
          swatch.value = item.value.toLowerCase();
          swatch.addEventListener('input', () => { input.value = swatch.value; changed(); });
          input.addEventListener('input', () => { if (COLOR.test(input.value.trim())) swatch.value = input.value.trim().toLowerCase(); });
          control = el('div', { class: 'color-row' }, swatch, input);
        }
        input.addEventListener('input', changed);
        field.wrap = el('div', { 'data-path': item.path.toLowerCase() }, el('label', { class: 'form-label', for: id, text: labelFor(item.path) }), control, el('code', { class: 'field-path', text: item.path }));
        body.append(field.wrap);
        state.fields.push(field);
      }
      box.append(section);
    }
    if (!entries.length) box.append(el('p', { class: 'text-body-secondary small', text: 'This fixture has no editable text, colour or number fields.' }));
    $('fieldFilter').value = '';
    refresh();
  }

  const valueOf = f => f.kind === 'number' ? Number(f.input.value) : f.input.value;
  const isEdited = f => f.kind === 'number' ? Number(f.input.value) !== f.orig : f.input.value !== f.orig;
  const edits = () => state.fields.filter(isEdited).map(f => ({ path: f.path, value: valueOf(f) }));
  const backend = () => document.querySelector('input[name="backend"]:checked').value;
  function formats() {
    const extra = [...document.querySelectorAll('#fmtSvg, #fmtHtml, #fmtInline')].filter(c => c.checked && !(c.value === 'svg' && backend() === 'playwright')).map(c => c.value);
    return ['png', ...extra].join(',');
  }
  const requestBody = () => ({ inputPath: state.current?.path, recipe: state.current?.recipe, backend: backend(), format: formats(), edits: edits() });

  function refresh() {
    const e = edits();
    state.fields.forEach(f => f.input.classList.toggle('is-edited', isEdited(f)));
    $('editCount').textContent = e.length ? `${e.length} unsaved edit${e.length === 1 ? '' : 's'}` : 'No edits';
    $('reqBody').textContent = JSON.stringify(requestBody(), null, 2);
    $('fmtSvg').disabled = backend() === 'playwright';
  }
  function changed() {
    refresh();
    clearTimeout(state.timer);
    if ($('autoRender').checked) state.timer = setTimeout(() => render(), 700);
  }

  // ---------- render ----------
  async function render({ baseline = false } = {}) {
    if (!state.current) return;
    const seq = ++state.seq, body = requestBody();
    if (baseline) body.edits = [];
    $('busy').hidden = false;
    try {
      const result = await api('POST', '/api/render', body);
      if (seq !== state.seq) return;
      if (baseline) state.baseline = result;
      state.latest = result;
      $('cmpEdited').checked = true;
      showRun(result);
      showReceipt(result, null);
    } catch (error) {
      if (seq !== state.seq) return;
      showReceipt(null, error);
      say(error.status === 400 ? 'The fixture did not pass validation. See the receipt.' : error.message);
    } finally { if (seq === state.seq) $('busy').hidden = true; }
  }

  function showRun(result) {
    const img = $('previewImg');
    img.src = result.files['render.png']; img.hidden = false; $('previewEmpty').hidden = true;
    img.alt = `Render of ${state.current.path}`;
    const r = result.receipt.normalized;
    $('previewMeta').replaceChildren(
      el('div', {}, 'Run ', el('span', { text: result.run.replace(/^.*\/runs\//, 'runs/').slice(0, 18) + '…' })),
      el('div', { text: `${r.width} × ${r.height} px` }),
      el('div', {}, 'Backend ', el('span', { text: `${r.backend} ${result.receipt.versions.backend}` })),
      el('div', {}, 'Time ', el('span', { text: `${(result.ms / 1000).toFixed(1)} s` })));
    $('fileLinks').replaceChildren(...Object.entries(result.files).filter(([n]) => n !== 'result.json').map(([name, url]) => el('a', { class: 'btn btn-sm btn-outline-secondary', href: url, target: '_blank', rel: 'noopener', text: name })),
      el('a', { class: 'btn btn-sm btn-outline-secondary', href: result.files['result.json'], target: '_blank', rel: 'noopener', text: 'result.json' }));
  }

  function pill(cls, text) { return el('span', { class: `status-pill ${cls}`, text }); }
  function showReceipt(result, error) {
    const pills = $('pills');
    $('previewImg').classList.toggle('stale', !!error);
    if (error) {
      pills.replaceChildren(pill('bad', error.status === 400 ? 'Invalid' : 'Render failed'));
      $('errorsBlock').hidden = false;
      $('errorList').replaceChildren(...(error.details?.length ? error.details.map(d => el('li', {}, el('code', { text: d.field }), ` ${d.message}`)) : [el('li', { text: error.message })]));
      $('sizesBlock').hidden = true; $('digestBlock').hidden = true;
      state.fields.forEach(f => f.input.classList.toggle('is-invalid', !!error.details?.some(d => d.field === f.path || d.field.endsWith('.' + f.path.split('.').at(-1)) && d.field.includes(f.path.split('.')[0]))));
      $('fitPill').className = 'status-pill bad'; $('fitPill').textContent = 'Invalid';
      $('fitDetail').textContent = error.details?.map(d => `${d.field}: ${d.message}`).join('; ') || error.message;
      return;
    }
    state.fields.forEach(f => f.input.classList.remove('is-invalid'));
    const rc = result.receipt, fit = rc.fitting ?? {};
    pills.replaceChildren(
      pill(rc.validation?.valid ? 'good' : 'bad', rc.validation?.valid ? 'Valid' : 'Invalid'),
      pill(fit.fit ? (fit.iterations ? 'warn' : 'good') : 'bad', fit.fit ? (fit.iterations ? `Fits after ${fit.iterations} shrink${fit.iterations === 1 ? '' : 's'}` : 'Text fits') : 'Text overflows'),
      pill(rc.catalog?.verified ? 'good' : 'warn', rc.catalog?.verified ? `${rc.catalog.slug}@${rc.catalog.version}` : 'Catalog not verified'));
    $('errorsBlock').hidden = !(fit.unresolved?.length);
    $('errorList').replaceChildren(...(fit.unresolved ?? []).map(u => el('li', { text: `Still overflowing: ${typeof u === 'string' ? u : JSON.stringify(u)}` })));
    const sizes = fit.finalSizes ?? {}, first = fit.steps?.[0]?.sizes ?? sizes, max = Math.max(1, ...Object.values(sizes));
    $('sizesBlock').hidden = !Object.keys(sizes).length;
    $('fitNote').textContent = `${fit.attempts ?? 1} attempt${fit.attempts === 1 ? '' : 's'}`;
    $('sizeRows').replaceChildren(...Object.entries(sizes).map(([k, v]) => {
      const bar = el('i'); bar.style.width = `${(v / max) * 100}%`;
      return el('tr', { class: v < (first[k] ?? v) ? 'shrunk' : '' }, el('td', {}, k, el('div', { class: 'fit-bar' }, bar)), el('td', { text: v < (first[k] ?? v) ? `${first[k]} → ${v} px` : `${v} px` }));
    }));
    $('digestBlock').hidden = !rc.digests?.png; $('digest').textContent = rc.digests?.png ?? '';
    $('fitPill').className = `status-pill ${fit.fit ? 'good' : 'bad'}`; $('fitPill').textContent = fit.fit ? 'Valid, fits' : 'Overflow';
    $('fitDetail').textContent = `${Object.keys(sizes).length} text boxes checked in ${fit.attempts ?? 1} attempt(s) on ${rc.normalized.backend}.`;
  }

  $('cmpSaved').addEventListener('change', () => { if (state.baseline) { showRun(state.baseline); showReceipt(state.baseline, null); } else say('Render the fixture once to get the saved version.'); });
  $('cmpEdited').addEventListener('change', () => { if (state.latest) { showRun(state.latest); showReceipt(state.latest, null); } });

  // ---------- controls ----------
  $('fixturePick').addEventListener('change', e => openFixture(e.target.value).catch(err => say(err.message)));
  $('renderBtn').addEventListener('click', () => { clearTimeout(state.timer); render(); });
  document.querySelectorAll('input[name="backend"], #fmtSvg, #fmtHtml, #fmtInline').forEach(c => c.addEventListener('change', () => { refresh(); if (c.name === 'backend') { state.baseline = null; render({ baseline: !edits().length }); } }));
  $('fieldFilter').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    state.fields.forEach(f => { f.wrap.hidden = !!q && !f.wrap.dataset.path.includes(q) && !f.input.value.toLowerCase().includes(q); });
    document.querySelectorAll('.field-section').forEach(s => { const any = [...s.querySelectorAll('.field-body > div')].some(d => !d.hidden); s.hidden = !any; if (q && any) s.open = true; });
  });

  // ---------- save ----------
  $('saveModal').addEventListener('show.bs.modal', () => {
    const n = edits().length;
    $('saveSummary').textContent = state.current?.editableInPlace ? `${n} edit${n === 1 ? '' : 's'} will be written.` : `${n} edit${n === 1 ? '' : 's'} will be written to a copy; ${state.current?.path ?? 'the example'} stays unchanged.`;
  });
  $('saveForm').addEventListener('submit', async ev => {
    ev.preventDefault();
    const savePath = $('savePath').value.trim();
    $('saveConfirm').disabled = true;
    try {
      const result = await api('POST', '/api/save', { ...requestBody(), format: 'png', savePath });
      bootstrap.Modal.getOrCreateInstance($('saveModal')).hide();
      say(`Saved to ${result.saved}`);
      await loadFixtureList(result.saved);
      await openFixture(result.saved);
    } catch (error) {
      say(error.details?.length ? `Not saved: ${error.details.map(d => `${d.field} ${d.message}`).join('; ')}` : `Not saved: ${error.message}`);
    } finally { $('saveConfirm').disabled = false; }
  });

  // ---------- gallery ----------
  async function loadGallery() {
    const grid = $('galleryGrid');
    try {
      const { items } = await api('GET', '/api/gallery');
      grid.replaceChildren(...items.map(item => {
        const thumb = el('div', { class: 'thumb' }, item.preview ? el('img', { src: item.preview.url, alt: `Preview of ${item.title}`, loading: 'lazy' }) : 'No preview yet');
        const open = el('button', { class: 'btn btn-sm btn-primary', type: 'button', text: 'Open in editor' });
        open.addEventListener('click', async () => { bootstrap.Tab.getOrCreateInstance($('tab-editor')).show(); await openFixture(item.path).catch(err => say(err.message)); });
        const card = el('article', { class: 'g-card', 'data-q': `${item.title} ${item.recipe} ${item.path}`.toLowerCase() }, thumb,
          el('div', { class: 'body' }, el('h3', { text: item.title }),
            el('div', { class: 'meta', text: `${item.recipe}${item.width ? ` · ${item.width}×${item.height}` : ''}` }),
            el('div', { class: 'meta', text: item.path }),
            el('div', { class: 'actions' }, open, item.preview ? el('span', { class: 'meta', text: item.preview.source === 'studio' ? 'last studio run' : 'committed render' }) : null)));
        return card;
      }));
      filterGallery();
    } catch (error) { grid.replaceChildren(el('p', { class: 'text-body-secondary', text: `Could not load the gallery: ${error.message}` })); }
  }
  function filterGallery() {
    const q = $('gallerySearch').value.trim().toLowerCase(); let shown = 0;
    document.querySelectorAll('#galleryGrid .g-card').forEach(c => { c.hidden = !!q && !c.dataset.q.includes(q); if (!c.hidden) shown++; });
    $('galleryEmpty').hidden = shown > 0 || !document.querySelector('#galleryGrid .g-card');
  }
  $('gallerySearch').addEventListener('input', filterGallery);
  $('tab-gallery').addEventListener('shown.bs.tab', loadGallery);

  // ---------- checks ----------
  $('runCatalog').addEventListener('click', async () => {
    $('catalogPill').className = 'status-pill idle'; $('catalogPill').textContent = 'Running…';
    try {
      const r = await api('POST', '/api/check', { kind: 'catalog' });
      $('catalogPill').className = `status-pill ${r.ok ? 'good' : 'bad'}`; $('catalogPill').textContent = r.ok ? 'Passed' : 'Failed';
      $('catalogDetail').textContent = r.ok ? 'All published versions match their files.' : (r.result.errors ?? []).map(e => typeof e === 'string' ? e : JSON.stringify(e)).join('; ');
    } catch (error) { $('catalogPill').className = 'status-pill bad'; $('catalogPill').textContent = 'Error'; $('catalogDetail').textContent = error.message; }
  });
  $('runCraft').addEventListener('click', async () => {
    if (!state.current) return;
    $('craftPill').className = 'status-pill idle'; $('craftPill').textContent = 'Running…';
    try {
      const r = await api('POST', '/api/check', { kind: 'craft', inputPath: state.current.path });
      const findings = r.result.findings ?? [];
      $('craftPill').className = `status-pill ${r.ok ? 'good' : 'bad'}`; $('craftPill').textContent = r.ok ? 'Clean' : `${findings.length} finding${findings.length === 1 ? '' : 's'}`;
      $('craftDetail').replaceChildren(findings.length ? el('ul', { class: 'error-list' }, ...findings.map(f => el('li', {}, el('code', { text: f.rule }), ` ${f.message}`))) : `No findings in ${state.current.path}.`);
    } catch (error) { $('craftPill').className = 'status-pill bad'; $('craftPill').textContent = 'Error'; $('craftDetail').textContent = error.message; }
  });
  $('runFit').addEventListener('click', () => { bootstrap.Tab.getOrCreateInstance($('tab-editor')).show(); render(); });

  // ---------- tabs in the hash ----------
  const tabFor = { editor: 'tab-editor', gallery: 'tab-gallery', checks: 'tab-checks' };
  Object.entries(tabFor).forEach(([name, id]) => $(id).addEventListener('shown.bs.tab', () => history.replaceState(null, '', '#' + name)));
  const route = () => { const id = tabFor[location.hash.slice(1)]; if (id) bootstrap.Tab.getOrCreateInstance($(id)).show(); };
  window.addEventListener('hashchange', route);

  // ---------- start ----------
  route();
  loadFixtureList().then(openFixture).catch(error => { $('fixturePath').textContent = `Could not load fixtures: ${error.message}`; });
})();
