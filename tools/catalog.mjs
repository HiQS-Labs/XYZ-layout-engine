import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { invalid, within } from './request.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const digestPattern = /^[a-f0-9]{64}$/;
const gidPattern = /^(rcp|rcv)-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const check = (ok, field, message) => { if (!ok) throw invalid(field, message); };
export const SCHEMA_V1 = `-- XYZ Layout Engine recipe catalog; migration 1; canonical LF dump.
-- GIDs retained; rows ordered by natural keys; no timestamps or binary database.
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY CHECK(version = 1)) STRICT;
CREATE TABLE recipes (gid TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','deprecated','retired')), reason TEXT NOT NULL) STRICT;
CREATE TABLE recipe_versions (gid TEXT PRIMARY KEY, recipe_gid TEXT NOT NULL REFERENCES recipes(gid), version TEXT NOT NULL, content_sha256 TEXT NOT NULL, schema_sha256 TEXT NOT NULL, UNIQUE(recipe_gid,version)) STRICT;
CREATE TABLE recipe_version_files (version_gid TEXT NOT NULL REFERENCES recipe_versions(gid), path TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('module','schema','content')), sha256 TEXT NOT NULL, PRIMARY KEY(version_gid,path)) STRICT;
CREATE TABLE recipe_outputs (version_gid TEXT NOT NULL REFERENCES recipe_versions(gid), format TEXT NOT NULL CHECK(format IN ('png','svg','html','html-inline')), PRIMARY KEY(version_gid,format)) STRICT;
CREATE TRIGGER recipes_no_delete BEFORE DELETE ON recipes BEGIN SELECT RAISE(ABORT,'recipe identity retained'); END;
CREATE TRIGGER recipes_identity BEFORE UPDATE OF gid,slug ON recipes BEGIN SELECT RAISE(ABORT,'recipe identity immutable'); END;
CREATE TRIGGER versions_no_update BEFORE UPDATE ON recipe_versions BEGIN SELECT RAISE(ABORT,'published version immutable'); END;
CREATE TRIGGER versions_no_delete BEFORE DELETE ON recipe_versions BEGIN SELECT RAISE(ABORT,'published version immutable'); END;
CREATE TRIGGER files_no_update BEFORE UPDATE ON recipe_version_files BEGIN SELECT RAISE(ABORT,'published files immutable'); END;
CREATE TRIGGER files_no_delete BEFORE DELETE ON recipe_version_files BEGIN SELECT RAISE(ABORT,'published files immutable'); END;
CREATE TRIGGER outputs_no_update BEFORE UPDATE ON recipe_outputs BEGIN SELECT RAISE(ABORT,'published outputs immutable'); END;
CREATE TRIGGER outputs_no_delete BEFORE DELETE ON recipe_outputs BEGIN SELECT RAISE(ABORT,'published outputs immutable'); END;
`;
const DESIGNS_DDL = `CREATE TABLE designs (id TEXT PRIMARY KEY, use_case TEXT, use_case_version TEXT, layout_id TEXT, fixture_path TEXT NOT NULL, data_hash TEXT NOT NULL, artifact_path TEXT NOT NULL, artifact_digest TEXT NOT NULL, CHECK((use_case IS NULL) = (use_case_version IS NULL))) STRICT;
CREATE TRIGGER designs_no_update BEFORE UPDATE ON designs BEGIN SELECT RAISE(ABORT,'design immutable'); END;
CREATE TRIGGER designs_no_delete BEFORE DELETE ON designs BEGIN SELECT RAISE(ABORT,'design immutable'); END;
`;
export const SCHEMA = SCHEMA_V1.replace('; migration 1;', '; migration 2;').replace('CHECK(version = 1)', 'CHECK(version IN (1,2))') + DESIGNS_DDL;
const relativePath = value => typeof value === 'string' && /^[a-zA-Z0-9_./-]+$/.test(value) && !path.isAbsolute(value) && !value.split('/').some(p => !p || p === '.' || p === '..');
const designID = value => {
  const match = /^(\d{4}-\d{2}-\d{2})-(.+)$/.exec(value);
  if (!match || !slugPattern.test(match[2]) || match[2].length < 3 || match[2].length > 64) return false;
  const date = new Date(match[1] + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === match[1];
};
const designFlags = ['needed_row_span','non_grid_family','needed_span_over_9','layout_forced'];
const logKeys = ['id','use_case','use_case_version','canvas','layout','columns','rows','boxes','span_histogram','workaround_boxes','friction',...designFlags,'no_recipe'];
const TABLES = [
  ['schema_migrations', ['version'], 'SELECT * FROM schema_migrations ORDER BY version', 'INSERT INTO schema_migrations VALUES (?)'],
  ['recipes', ['gid','slug','title','status','reason'], 'SELECT * FROM recipes ORDER BY slug', 'INSERT INTO recipes VALUES (?,?,?,?,?)'],
  ['recipe_versions', ['gid','recipe_gid','version','content_sha256','schema_sha256'], 'SELECT v.* FROM recipe_versions v JOIN recipes r ON r.gid=v.recipe_gid ORDER BY r.slug,v.version', 'INSERT INTO recipe_versions VALUES (?,?,?,?,?)'],
  ['recipe_version_files', ['version_gid','path','role','sha256'], 'SELECT f.* FROM recipe_version_files f JOIN recipe_versions v ON v.gid=f.version_gid JOIN recipes r ON r.gid=v.recipe_gid ORDER BY r.slug,v.version,f.path', 'INSERT INTO recipe_version_files VALUES (?,?,?,?)'],
  ['recipe_outputs', ['version_gid','format'], 'SELECT o.* FROM recipe_outputs o JOIN recipe_versions v ON v.gid=o.version_gid JOIN recipes r ON r.gid=v.recipe_gid ORDER BY r.slug,v.version,o.format', 'INSERT INTO recipe_outputs VALUES (?,?)'],
  ['designs', ['id','use_case','use_case_version','layout_id','fixture_path','data_hash','artifact_path','artifact_digest'], 'SELECT * FROM designs ORDER BY id', 'INSERT INTO designs VALUES (?,?,?,?,?,?,?,?)']
];
const quote = value => value === null ? 'NULL' : typeof value === 'number' ? String(value) : "'" + value.replaceAll("'", "''") + "'";
const contentDigest = files => hash(files.map(f => `${f.path}\0${f.sha256}\n`).join(''));
export function exportDump(db) {
  return SCHEMA + TABLES.map(([table, columns, query]) => db.prepare(query).all().map(row =>
    `INSERT INTO ${table} VALUES (${columns.map(c => quote(row[c])).join(',')});\n`).join('')).join('');
}
function validateLedger(db) {
  check(db.prepare('PRAGMA foreign_key_check').all().length === 0, 'dump', 'foreign key violation');
  check(JSON.stringify(db.prepare('SELECT version FROM schema_migrations ORDER BY version').all().map(r => r.version)) === '[1,2]', 'dump', 'migrations 1,2 required');
  const recipes = db.prepare('SELECT * FROM recipes ORDER BY slug').all();
  for (const r of recipes) {
    check(gidPattern.test(r.gid) && r.gid.startsWith('rcp-'), 'gid', 'invalid recipe GID');
    check(slugPattern.test(r.slug) && r.slug.length >= 3 && r.slug.length <= 64, 'slug', 'invalid slug');
    for (const field of ['title','reason']) check(!r[field].includes('\0'), field, 'NUL unsupported');
    check(r.title.trim().length > 0 && (r.status === 'active' || r.reason.trim().length > 0), 'recipe', 'title/status reason required');
  }
  for (const v of db.prepare('SELECT * FROM recipe_versions').all()) {
    check(gidPattern.test(v.gid) && v.gid.startsWith('rcv-'), 'gid', 'invalid version GID');
    check(versionPattern.test(v.version), 'version', 'strict MAJOR.MINOR.PATCH required');
    const files = db.prepare('SELECT * FROM recipe_version_files WHERE version_gid=? ORDER BY path').all(v.gid);
    for (const f of files) {
      check(relativePath(f.path), 'path', 'relative normalized path required');
      check(digestPattern.test(f.sha256), 'sha256', 'invalid file digest');
    }
    const schemas = files.filter(f => f.role === 'schema');
    check(files.some(f => f.role === 'module') && schemas.length === 1, 'files', 'module and one schema required');
    check(digestPattern.test(v.content_sha256) && contentDigest(files) === v.content_sha256 && schemas[0].sha256 === v.schema_sha256, 'digest', 'inconsistent published digest');
    check(db.prepare('SELECT format FROM recipe_outputs WHERE version_gid=?').all(v.gid).length > 0, 'outputs', 'published outputs required');
  }
  for (const d of db.prepare('SELECT * FROM designs ORDER BY id').all()) {
    check(designID(d.id), d.id, 'invalid design ID');
    for (const [key, suffix] of [['fixture_path','.json'],['artifact_path','.png']])
      check(relativePath(d[key]) && d[key].startsWith('examples/') && d[key].endsWith(suffix), d.id, 'invalid design path');
    check(digestPattern.test(d.data_hash) && digestPattern.test(d.artifact_digest), d.id, 'invalid design digest');
    check(d.layout_id === null, d.id, 'layout must be null until Phase B');
    check((d.use_case === null && d.use_case_version === null) || db.prepare('SELECT 1 FROM recipes r JOIN recipe_versions v ON v.recipe_gid=r.gid WHERE r.slug=? AND v.version=?').get(d.use_case,d.use_case_version), d.id, 'unknown use-case pin');
  }
}
// Admit only our fixed DDL and literal INSERT rows, never execute supplied SQL.
export function loadDump(text) {
  const header = text.startsWith(SCHEMA) ? SCHEMA : SCHEMA_V1;
  check(text.startsWith(header) && text.endsWith('\n'), 'dump', 'migration 1 or 2 schema/header required');
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys=ON'); db.exec(SCHEMA);
    for (const line of text.slice(header.length).split('\n').filter(Boolean)) {
      const match = /^INSERT INTO ([a-z_]+) VALUES \((.*)\);$/.exec(line);
      const spec = match && TABLES.find(t => t[0] === match[1]);
      check(spec && !(header === SCHEMA_V1 && spec[0] === 'designs'), 'dump', 'unsupported row');
      const values = [], source = match[2]; let offset = 0;
      while (offset < source.length) {
        const token = /^(?:'(?:[^'\r\n\0]|'')*'|[0-9]+|NULL)/.exec(source.slice(offset));
        check(token, spec[0] === 'designs' ? values[0] ?? 'design-log' : 'dump', 'invalid SQL literal');
        const raw = token[0]; values.push(raw[0] === "'" ? raw.slice(1,-1).replaceAll("''", "'") : raw === 'NULL' ? null : Number(raw));
        offset += raw.length;
        if (offset < source.length) { check(source[offset] === ',' && offset + 1 < source.length, spec[0] === 'designs' ? values[0] ?? 'design-log' : 'dump', 'invalid delimiter'); offset++; }
      }
      check(values.length === spec[1].length, spec[0] === 'designs' ? values[0] ?? 'design-log' : 'dump', 'wrong column count');
      try { db.prepare(spec[3]).run(...values); } catch (error) { if (spec[0] === 'designs') throw invalid(values[0] ?? 'design-log',error.message); throw error; }
    }
    if (header === SCHEMA_V1) db.prepare('INSERT INTO schema_migrations VALUES (?)').run(2);
    validateLedger(db); return db;
  } catch (error) { db.close(); throw error; }
}
const PNG_ROOT = 'tools/spike/assets/generated/web/';
const SOLAR_ROOT = 'examples/2026-10-08-solar-system/';
async function declaredFiles(root, slug) {
  if (slug === 'nutrition') return [
    ['tools/recipes/nutrition.mjs','module'], ['tools/spike/fixture.json','schema'],
    ['tools/spike/scene.mjs','module'], ['tools/spike/assets.mjs','module'],
    ['tools/spike/assets/illustrations.svg','content'],
    ...(await fs.readdir(path.join(root, PNG_ROOT))).filter(n => n.endsWith('.png')).sort().map(n => [PNG_ROOT + n,'content'])
  ];
  if (slug === 'solar-system') return [
    ['tools/recipes/solar-system.mjs','module'], ['tools/spike/assets.mjs','module'],
    [SOLAR_ROOT + 'fixture.json','schema'], [SOLAR_ROOT + 'verification.json','content'],
    ...['asteroid-belt-diagram','earth','jupiter','mars','mercury','milky-way','neptune','saturn-clean','sun','uranus','venus'].map(n => [SOLAR_ROOT + `assets/web/${n}.png`,'content'])
  ];
  throw invalid('slug', 'no trusted declared file set');
}
async function fileBytes(root, relative) {
  const target = await fs.realpath(path.join(root, relative));
  check(within(root, target), relative, 'file escapes root');
  check((await fs.stat(target)).isFile(), relative, 'regular file required');
  return fs.readFile(target);
}
async function moduleIdentity(root, slug) {
  const source = (await fileBytes(root, `tools/recipes/${slug}.mjs`)).toString('utf8');
  // Trusted delivered modules declare literal exports. Do not execute recipe code for catalog reads.
  const name = /^export const name = '([^']+)';$/m.exec(source)?.[1];
  const version = /^export const version = '([^']+)';$/m.exec(source)?.[1];
  check(name === slug && versionPattern.test(version ?? ''), 'module', 'literal name/version exports required');
  return version;
}
async function snapshot(root, slug, version) {
  check(await moduleIdentity(root, slug) === version, 'version', 'must match module version');
  const files = await Promise.all((await declaredFiles(root, slug)).map(async ([p, role]) => ({ path:p, role, sha256:hash(await fileBytes(root, p)) })));
  files.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return { files, content:contentDigest(files), schema:files.find(f => f.role === 'schema').sha256 };
}
function recipe(db, key) {
  const r = db.prepare('SELECT * FROM recipes WHERE slug=?').get(key);
  check(r, 'recipe', 'unknown recipe'); return r;
}
function show(db, key) {
  const r = recipe(db, key);
  return { ...r, versions:db.prepare('SELECT * FROM recipe_versions WHERE recipe_gid=? ORDER BY version').all(r.gid).map(v => ({...v,
    files:db.prepare('SELECT path,role,sha256 FROM recipe_version_files WHERE version_gid=? ORDER BY path').all(v.gid),
    outputs:db.prepare('SELECT format FROM recipe_outputs WHERE version_gid=? ORDER BY format').all(v.gid).map(o => o.format)
  })) };
}
async function designLog(root) {
  let text;
  try { text = await fs.readFile(path.join(root,'tools/design-log.jsonl'),'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return []; throw invalid('design-log',error.message); }
  check(!text || text.endsWith('\n'), 'design-log', 'log must end with LF');
  return text ? text.slice(0,-1).split('\n').map(line => {
    let entry;
    try { entry = JSON.parse(line); } catch { throw invalid('design-log','invalid JSON line'); }
    check(entry && typeof entry === 'object' && !Array.isArray(entry) && JSON.stringify(entry) === line && JSON.stringify(Object.keys(entry)) === JSON.stringify(logKeys), 'design-log', 'non-canonical log line');
    check(designID(entry.id), 'design-log', 'invalid log ID');
    check(entry.canvas === null || (entry.canvas && JSON.stringify(Object.keys(entry.canvas)) === '["width","height"]' && Number.isSafeInteger(entry.canvas.width) && entry.canvas.width > 0 && Number.isSafeInteger(entry.canvas.height) && entry.canvas.height > 0), entry.id, 'invalid canvas');
    check(['layout','columns','rows','boxes','span_histogram'].every(k => entry[k] === null) && (entry.workaround_boxes === null || (Number.isSafeInteger(entry.workaround_boxes) && entry.workaround_boxes >= 0)), entry.id, 'invalid layout/workarounds');
    check(typeof entry.friction === 'string' && entry.friction.trim() && entry.friction.length <= 200 && !/[\0\r\n]/.test(entry.friction) && [...designFlags,'no_recipe'].every(k => typeof entry[k] === 'boolean'), entry.id, 'invalid friction/flags');
    return entry;
  }) : [];
}
async function verify(db, root, text) {
  const errors = [];
  const canonical = exportDump(db);
  if (canonical !== text) {
    const withoutDesigns = value => value.replace(/^INSERT INTO designs .*\n/gm,'');
    errors.push({field:withoutDesigns(canonical) === withoutDesigns(text) ? 'design-log' : 'dump',message:'non-canonical dump bytes'});
  }
  for (const r of db.prepare('SELECT * FROM recipes ORDER BY slug').all()) {
    try {
      const version = await moduleIdentity(root, r.slug);
      const v = db.prepare('SELECT * FROM recipe_versions WHERE recipe_gid=? AND version=?').get(r.gid, version);
      check(v, 'version', 'current module version is unpublished');
      const files = db.prepare('SELECT path,role,sha256 FROM recipe_version_files WHERE version_gid=? ORDER BY path').all(v.gid);
      const expected = (await declaredFiles(root, r.slug)).map(([p,role]) => `${p}\0${role}`).sort();
      if (JSON.stringify(files.map(f => `${f.path}\0${f.role}`).sort()) !== JSON.stringify(expected)) errors.push({field:r.slug,message:'declared file namespace differs'});
      for (const f of files) {
        try { if (hash(await fileBytes(root, f.path)) !== f.sha256) errors.push({field:f.path,message:'modified declared file'}); }
        catch (error) { errors.push({field:f.path,message:`missing/unreadable declared file: ${error.message}`}); }
      }
    } catch (error) { errors.push({field:r.slug,message:error.message}); }
  }
  const designs = db.prepare('SELECT * FROM designs ORDER BY id').all();
  for (const d of designs) {
    for (const [key, digest] of [['fixture_path','data_hash'],['artifact_path','artifact_digest']]) {
      try { check(hash(await fileBytes(root,d[key])) === d[digest], d.id, 'modified design file'); }
      catch (error) { errors.push({field:d.id,message:error.message}); }
    }
  }
  try {
    const lines = await designLog(root), seen = new Set();
    for (const line of lines) {
      check(!seen.has(line.id), line.id, 'duplicate design log ID'); seen.add(line.id);
      const d = designs.find(d => d.id === line.id);
      check(d, 'design-log', 'orphan design log line');
      check(line.use_case === d.use_case && line.use_case_version === d.use_case_version && line.no_recipe === (d.use_case === null), d.id, 'design log pin differs');
    }
    for (const d of designs) check(seen.has(d.id), d.id, 'design must have one log line');
  } catch (error) { errors.push(...JSON.parse(error.message.slice('Validation failed: '.length))); }
  return { valid:errors.length === 0, errors };
}
function preserveHistory(before, after) {
  for (const r of before.prepare('SELECT * FROM recipes').all()) {
    const next = after.prepare('SELECT * FROM recipes WHERE gid=?').get(r.gid);
    check(next && next.slug === r.slug, 'import', 'cannot remove/change recipe identity');
  }
  for (const v of before.prepare('SELECT gid FROM recipe_versions').all()) {
    for (const query of ['SELECT path,role,sha256 FROM recipe_version_files WHERE version_gid=? ORDER BY path', 'SELECT format FROM recipe_outputs WHERE version_gid=? ORDER BY format']) {
      check(JSON.stringify(before.prepare(query).all(v.gid)) === JSON.stringify(after.prepare(query).all(v.gid)), 'import', 'cannot extend/change published files or outputs');
    }
  }
  for (const [table,,query] of TABLES.slice(2)) {
    const incoming = after.prepare(query).all().map(row => JSON.stringify(row));
    for (const row of before.prepare(query).all()) check(incoming.includes(JSON.stringify(row)), 'import', `cannot remove/change published ${table}`);
  }
}
async function atomicDump(file, text) {
  const temp = `${file}.${randomUUID()}.tmp`; let handle;
  try {
    handle = await fs.open(temp, 'wx'); await handle.writeFile(text); await handle.sync(); await handle.close(); handle = undefined;
    await fs.rename(temp, file);
  } finally { if (handle) await handle.close(); await fs.rm(temp, { force:true }); }
}
class Usage extends Error {}
function parse(args) {
  const design = args[0] === 'design';
  if (design && !['list','show','add'].includes(args[1])) throw new Usage('catalog design list|show <id>|add <id> --fixture P --artifact P --friction T');
  const [verb, ...tail] = design ? args.slice(1) : args, positions = [], flags = {};
  for (let i=0; i<tail.length; i++) {
    if (!tail[i].startsWith('--')) { positions.push(tail[i]); continue; }
    const key = tail[i].slice(2);
    if (Object.hasOwn(flags,key)) throw new Usage('duplicate option');
    if (['json','check'].includes(key)) flags[key] = true;
    else if (['title','reason','fixture','artifact','friction','use-case','flags','workarounds'].includes(key) && tail[i+1] && !tail[i+1].startsWith('--')) flags[key] = tail[++i];
    else throw new Usage('unknown/missing option');
  }
  const counts = {list:0,show:1,add:1,publish:2,update:1,deprecate:1,retire:1,verify:0,export:0,import:1};
  const allowed = design ? {list:['json'],show:['json'],add:['fixture','artifact','friction','use-case','flags','workarounds']} : {list:['json'],show:['json'],verify:['json'],export:['json','check'],add:['title'],publish:[],update:['title'],deprecate:['reason'],retire:['reason'],import:[]};
  if (!Object.hasOwn(counts,verb) || positions.length !== counts[verb] || Object.keys(flags).some(k => !allowed[verb].includes(k)) || (!design && ['add','update'].includes(verb) && !flags.title) || (design && verb === 'add' && ['fixture','artifact','friction'].some(k => !flags[k])) || (['deprecate','retire'].includes(verb) && !flags.reason)) throw new Usage('catalog list|show <slug>|add <slug> --title T|publish <slug> <version>|update <slug> --title T|deprecate|retire <slug> --reason R|verify|export [--check]|import <dump>');
  for (const value of Object.values(flags)) if (typeof value === 'string') check(value.trim() && !/[\0\r\n]/.test(value), design ? positions[0] ?? 'design-log' : 'option', 'nonempty single line required');
  return {verb,positions,flags,design};
}
// Only this module owns catalog I/O. Imports allocate no database or filesystem handle.
export async function runCLI(args, options = {}) {
  const {verb,positions:p,flags:f,design} = parse(args);
  const root = await fs.realpath(options.root ?? ROOT), file = path.join(root,'tools/catalog.sql'), lock = path.join(root,'tools/.catalog.lock');
  const write = ['add','publish','update','deprecate','retire','import'].includes(verb);
  let ownership, db, incoming;
  try {
    if (write) { try { ownership = await fs.open(lock,'wx'); } catch (error) { if (error.code === 'EEXIST') throw invalid('lock', 'catalog lock exists; inspect stale/concurrent ownership manually'); throw error; } }
    const original = await fs.readFile(file,'utf8'); db = loadDump(original);
    if (!write) {
      if (design) {
        const value = verb === 'list' ? db.prepare('SELECT * FROM designs ORDER BY id').all() : db.prepare('SELECT * FROM designs WHERE id=?').get(p[0]);
        check(value, p[0] ?? 'design-log', 'unknown design');
        return {code:0,value,json:f.json};
      }
      if (verb === 'list') return {code:0,value:db.prepare('SELECT * FROM recipes ORDER BY slug').all(),json:f.json};
      if (verb === 'show') return {code:0,value:show(db,p[0]),json:f.json};
      if (verb === 'verify') { const value = await verify(db,root,original); return {code:value.valid ? 0 : 1,value,json:f.json}; }
      const canonical = exportDump(db);
      return {code:f.check && canonical !== original ? 1 : 0,value:f.check ? {canonical:canonical === original} : canonical,json:f.json};
    }
    db.exec('BEGIN IMMEDIATE'); let value, logLine;
    try {
      if (design) {
        const id = p[0], lines = await designLog(root);
        check(!db.prepare('SELECT 1 FROM designs WHERE id=?').get(id) && !lines.some(line => line.id === id), id, 'design already recorded');
        check(designID(id), id, 'invalid design ID');
        for (const [key,suffix] of [['fixture','.json'],['artifact','.png']]) check(relativePath(f[key]) && f[key].startsWith('examples/') && f[key].endsWith(suffix), id, 'invalid design path');
        let useCase = null, version = null;
        if (f['use-case']) {
          const pin = f['use-case'].split('@');
          check(pin.length === 2 && slugPattern.test(pin[0]) && versionPattern.test(pin[1]) && db.prepare('SELECT 1 FROM recipes r JOIN recipe_versions v ON v.recipe_gid=r.gid WHERE r.slug=? AND v.version=?').get(...pin), id, 'unknown use-case pin');
          [useCase,version] = pin;
        }
        const flags = f.flags ? f.flags.split(',') : [];
        check(flags.every(flag => designFlags.includes(flag)) && new Set(flags).size === flags.length, id, 'unknown/duplicate design flag');
        check(!f.workarounds || (/^(0|[1-9]\d*)$/.test(f.workarounds) && Number.isSafeInteger(Number(f.workarounds))), id, 'non-negative integer workarounds required');
        check(f.friction.length <= 200, id, 'friction must be 1–200 characters');
        let fixture, artifact;
        try { fixture = await fileBytes(root,f.fixture); artifact = await fileBytes(root,f.artifact); }
        catch (error) { throw invalid(id,error.message); }
        let data;
        try { data = JSON.parse(fixture.toString('utf8')); } catch { throw invalid(id,'invalid fixture JSON'); }
        const canvas = Number.isSafeInteger(data?.width) && data.width > 0 && Number.isSafeInteger(data?.height) && data.height > 0 ? {width:data.width,height:data.height} : null;
        db.prepare('INSERT INTO designs VALUES (?,?,?,?,?,?,?,?)').run(id,useCase,version,null,f.fixture,hash(fixture),f.artifact,hash(artifact));
        value = db.prepare('SELECT * FROM designs WHERE id=?').get(id);
        logLine = JSON.stringify({id,use_case:useCase,use_case_version:version,canvas,layout:null,columns:null,rows:null,boxes:null,span_histogram:null,workaround_boxes:f.workarounds === undefined ? null : Number(f.workarounds),friction:f.friction,...Object.fromEntries(designFlags.map(flag => [flag,flags.includes(flag)])),no_recipe:useCase === null}) + '\n';
      } else if (verb === 'import') {
        incoming = loadDump(await fs.readFile(path.resolve(root,p[0]),'utf8')); preserveHistory(db,incoming); value = {imported:true};
      } else if (verb === 'add') {
        check(slugPattern.test(p[0]) && p[0].length >= 3 && p[0].length <= 64, 'slug', '3–64 lowercase slug required');
        db.prepare("INSERT INTO recipes VALUES (?,?,?,'active','')").run(`rcp-${randomUUID()}`,p[0],f.title); value = show(db,p[0]);
      } else {
        const r = recipe(db,p[0]);
        if (verb === 'publish') {
          check(versionPattern.test(p[1]), 'version', 'strict MAJOR.MINOR.PATCH required');
          const s = await snapshot(root,r.slug,p[1]);
          const prior = db.prepare('SELECT * FROM recipe_versions WHERE recipe_gid=? AND version=?').get(r.gid,p[1]);
          if (prior) check(prior.content_sha256 === s.content, 'version', 'already published with different content');
          else {
            check(r.status === 'active', 'status', 'only active recipes can publish');
            const gid = `rcv-${randomUUID()}`;
            db.prepare('INSERT INTO recipe_versions VALUES (?,?,?,?,?)').run(gid,r.gid,p[1],s.content,s.schema);
            for (const file of s.files) db.prepare('INSERT INTO recipe_version_files VALUES (?,?,?,?)').run(gid,file.path,file.role,file.sha256);
            for (const format of ['png','svg','html','html-inline']) db.prepare('INSERT INTO recipe_outputs VALUES (?,?)').run(gid,format);
          }
        } else if (verb === 'update') db.prepare('UPDATE recipes SET title=? WHERE gid=?').run(f.title,r.gid);
        else db.prepare('UPDATE recipes SET status=?,reason=? WHERE gid=?').run(verb === 'retire' ? 'retired' : 'deprecated',f.reason,r.gid);
        value = show(db,r.slug);
      }
      validateLedger(incoming ?? db);
      const canonical = exportDump(incoming ?? db);
      // Keep exact bytes and mtime on idempotent publication/import.
      if (canonical !== original) await atomicDump(file,canonical);
      if (logLine) {
        try { await fs.appendFile(path.join(root,'tools/design-log.jsonl'),logLine,{flag:'a'}); }
        catch (error) { throw invalid(p[0],error.message); }
      }
      db.exec('COMMIT'); return {code:0,value};
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  } catch (error) {
    if (error instanceof Usage || error.message.startsWith('Validation failed:')) throw error;
    throw invalid('catalog',error.message);
  } finally {
    incoming?.close(); db?.close();
    if (ownership) { await ownership.close(); await fs.unlink(lock); }
  }
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCLI(process.argv.slice(2)).then(({code,value,json}) => {
    console.log(typeof value === 'string' && !json ? value.trimEnd() : JSON.stringify(value,null,2)); process.exitCode = code;
  }).catch(error => { console.error(error.message); process.exitCode = error instanceof Usage ? 2 : 1; });
}
