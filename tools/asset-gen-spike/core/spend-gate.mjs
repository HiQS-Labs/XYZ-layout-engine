// Pure Web-Standard ESM spend-gate and ledger evaluation (zero node:* dependencies)
import { parseJsonText } from './json.mjs';

export const CAP_CREDITS = 20.0;
export const BASELINE_CREDITS = 701.0;
export const CLI_TIMEOUT_S = 120;
export const CREATE_TIMEOUT_S = 900;
export const CLEAN_FAILURES = new Set(['failed', 'nsfw']);
export const JOB_TYPE = 'gpt_image_2_5';

export function creditsOf(text, positive) {
  const doc = parseJsonText(text);
  if (!doc || typeof doc !== 'object' || Array.isArray(doc) || !('credits' in doc)) {
    throw new Error('no credits field');
  }
  const v = doc.credits;
  if (typeof v === 'boolean' || (typeof v !== 'number' && !(v instanceof Number))) {
    const typeName = v === null ? 'null' : typeof v;
    throw new Error(`credits has type ${typeName}`);
  }
  const num = Number(v);
  if (!Number.isFinite(num) || (positive ? num <= 0 : num < 0)) {
    throw new Error(`credits value ${v} is not usable`);
  }
  return num;
}

export function gateAllows(total) {
  return typeof total === 'number' && Number.isFinite(total) && total <= CAP_CREDITS;
}

export function spendTotal(spentByBalance, estSum, estimate) {
  const parts = [spentByBalance, estSum, estimate];
  if (!parts.every(p => typeof p === 'number' && Number.isFinite(p))) {
    return NaN;
  }
  return Math.round((Math.max(spentByBalance, estSum) + estimate) * 1e6) / 1e6;
}

export function baselineCredits(rows) {
  const base = rows.filter(r => r && r.event === 'baseline');
  if (base.length !== 1) {
    throw new Error(`the ledger must hold exactly one baseline row (found ${base.length}); cannot measure spend`);
  }
  const v = base[0].credits;
  if (typeof v === 'boolean' || (typeof v !== 'number' && !(v instanceof Number)) || !Number.isFinite(Number(v)) || Number(v) < 0) {
    throw new Error('the baseline row has no usable credits value');
  }
  return Number(v);
}

export function estSumOf(rows) {
  const reserved = new Set(rows.filter(r => r && r.event === 'reserve').map(r => r.attempt_id));
  let total = 0.0;
  for (const r of rows) {
    if (!r) continue;
    if (r.event === 'reserve' || (r.event === 'result' && !reserved.has(r.attempt_id))) {
      const v = r.est_credits;
      if (typeof v === 'boolean' || (typeof v !== 'number' && !(v instanceof Number))) {
        return NaN;
      }
      total += Number(v);
    }
  }
  return Math.round(total * 1e6) / 1e6;
}

export function checkHiggsfieldJob(params, job) {
  const flags = [];
  if (job?.job_type !== JOB_TYPE) {
    flags.append ? flags.append('job_type_mismatch') : flags.push('job_type_mismatch');
  }
  const echoed = (job && typeof job.params === 'object' && job.params !== null) ? job.params.background : null;
  if (echoed !== params.background) {
    flags.push('param_not_echoed');
  }
  return { echoedBackground: echoed, flags };
}

export function goEligible(params, row) {
  return (
    params.background === 'transparent' &&
    row.final_status === 'completed' &&
    (!row.flags || row.flags.length === 0) &&
    row.inspection?.real_alpha === true
  );
}

export function jobFields(job) {
  return {
    job_id: job?.id,
    job_type: job?.job_type,
    created_at: job?.created_at,
    final_status: job?.status,
    params_echoed: job?.params
  };
}

export function planLedgerRows(rows, matrix, only = null) {
  const done = new Set(rows.filter(r => r && r.event === 'result').map(r => r.label));
  const tried = new Set(rows.filter(r => r && r.event === 'reserve').map(r => r.label));
  const todo = [];
  const skipped = [];
  for (const [label, params] of matrix) {
    if (only && label !== only) {
      continue;
    }
    if (done.has(label)) {
      skipped.push([label, 'result row exists']);
    } else if (tried.has(label)) {
      skipped.push([label, 'an earlier attempt has no result (stopped); never retried']);
    } else {
      todo.push([label, params]);
    }
  }
  return { todo, skipped };
}
