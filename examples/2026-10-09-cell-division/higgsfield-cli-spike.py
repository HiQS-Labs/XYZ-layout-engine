#!/usr/bin/env python3
"""GH-8 Phase 0b: does the Higgsfield CLI's `--background transparent` return real alpha for gpt_image_2_5?

Python standard library only. The script has no network code for the API and handles no credentials: it shells out
to the `higgsfield` CLI on PATH, which owns its own sign-in (HIGGSFIELD_BIN is honoured only under the selftest's
offline guard, to select the fake shim). The only network call it makes itself is an unauthenticated download of
each public result_url. Every string that leaves the process (ledger, stdout, stderr) is redacted: URL query
strings, Authorization/Bearer values, JWT-like strings and secret-looking key=value tokens are masked.

Subcommands:
  selftest                       offline controls against a fake `higgsfield` shim (never the real CLI)
  run [--dry-run] [--only L]     the Phase 0b matrix, strictly sequential, resumable (labels with a result are skipped)
  init-ledger --smoke-json J --smoke-png P
                                 writes the baseline row and the hand-recorded T1 smoke result (once, empty ledger only)

Spend control (cap CAP_CREDITS = 20 credits): before every create the script runs `generate cost` with the same
parameters and `account status`. Spent so far is the larger of (baseline balance - current balance) and the sum of
estimates already in the ledger; that plus this estimate must be at most the cap. A `reserve` row is written before
the create; a create is never retried; an ambiguous outcome writes a `stopped` row and stops the run.

Exit codes: 0 ok, 1 error, 3 spend gate refused, 4 stopped (cost/balance unreadable or ambiguous create),
5 another process holds the ledger lock.
"""
import argparse
import contextlib
import fcntl
import hashlib
import io
import json
import math
import os
import re
import subprocess
import sys
import tempfile
import time
import traceback
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
LEDGER = ROOT / 'cli-spike-ledger.jsonl'
INSPECTOR = ROOT / 'inspect-alpha.mjs'
JOB_TYPE = 'gpt_image_2_5'
CAP_CREDITS = 20.0            # the operator's cap for this slice, in Higgsfield credits
BASELINE_CREDITS = 701.0      # balance before the first CLI generation (read by the orchestrator)
CLI_TIMEOUT_S = 120           # `generate cost` and `account status`
CREATE_TIMEOUT_S = 900        # `generate create --wait`
DOWNLOAD_TIMEOUT_S = 120
MAX_DOWNLOAD_BYTES = 64 * 1024 * 1024
CLEAN_FAILURES = {'failed', 'nsfw'}   # terminal, recorded, run continues; still counted at the estimate
EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+')

INTER = ('A single isolated animal cell in interphase, clean scientific illustration: a round cell with one large '
         'nucleus containing a nucleolus, a few mitochondria and soft cytoplasm, flat clean style, soft lighting, '
         'subject only on a transparent background, no backdrop, no shadow, no text, no labels')
CYTO = ('Two animal daughter cells at the end of cell division (cytokinesis), joined by a narrow pinched bridge, each '
        'with a round nucleus and a few mitochondria, clean scientific illustration, flat clean style, soft lighting, '
        'subject only on a transparent background, no backdrop, no shadow, no text, no labels')


def job_params(variant, quality, background, prompt):
    return {'prompt': prompt, 'variant': variant, 'quality': quality, 'resolution': '1k', 'aspect_ratio': '1:1',
            'background': background}


MATRIX = (
    ('T1-smoke-interphase', job_params('flare', 'low', 'transparent', INTER)),
    ('T2-cytokinesis', job_params('flare', 'low', 'transparent', CYTO)),
    ('T3-sunburst-interphase', job_params('sunburst', 'low', 'transparent', INTER)),
    ('T4-flare-medium-interphase', job_params('flare', 'medium', 'transparent', INTER)),
    ('C1-flare-opaque-interphase', job_params('flare', 'low', 'opaque', INTER)),
)
SMOKE = {'label': 'T1-smoke-interphase', 'job_id': '13dd16ee-df0c-4d00-8ec6-fc4eac5965a8',
         'sha256': 'ebe91c71dd84c22eae2274276ee95f62031bbba2d912e3e3e61fd93cb2938961', 'bytes': 1203763,
         'est_credits': 0.25, 'balance_after': 700.75}


class Refuse(Exception):
    """A deliberate refusal with an exit code."""
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


class Stop(Exception):
    """Cost or balance unreadable, or an ambiguous create: the run stops (exit 4), nothing is retried."""


class Offline(Exception):
    """The selftest guard blocked the real CLI or a real download."""


def now():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


URL_QUERY_RE = re.compile(r'''(https?://[^\s"'?#<>]*)\?(?!<query-stripped>)[^\s"'<>]*''')
AUTH_RE = re.compile(r'''(?i)(authorization["']?\s*[:=]\s*["']?)[^\r\n"']+''')
BEARER_RE = re.compile(r'(?i)\bbearer\s+[A-Za-z0-9._~+/=-]+')
JWT_RE = re.compile(r'[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}')
SECRET_KV_RE = re.compile(r'''(?i)\b((?:access_|refresh_|id_)?token|secret|api[_-]?key|key|password|passwd|sig|'''
                          r'''signature)(["']?\s*[:=]\s*["']?)([^\s"'&,;}]{6,})''')


def redact_secrets(text):
    """Masks signed-URL queries, Authorization/Bearer values, JWT-like strings and secret-looking key=value tokens.
    Idempotent, so text redacted twice reads the same."""
    text = URL_QUERY_RE.sub(r'\1?<query-stripped>', text)
    text = AUTH_RE.sub(r'\1***', text)
    text = BEARER_RE.sub('Bearer ***', text)
    text = JWT_RE.sub('***', text)
    return SECRET_KV_RE.sub(r'\1\2***', text)


def redact(text):
    """For anything printed: secrets and email addresses."""
    return EMAIL_RE.sub('<redacted>', redact_secrets(text))


def scrub_obj(obj):
    """redact_secrets on every string (keys and values) inside a JSON-able value, before it is serialised."""
    if isinstance(obj, str):
        return redact_secrets(obj)
    if isinstance(obj, dict):
        return {scrub_obj(k): scrub_obj(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [scrub_obj(v) for v in obj]
    return obj


def excerpt(text, n=300):
    return redact((text or '').strip())[:n]


def say(obj, stream=None):
    text = obj if isinstance(obj, str) else json.dumps(obj, sort_keys=True)
    print(redact(text), file=stream or sys.stdout, flush=True)


def _reject_constant(name):
    raise ValueError(f'non-finite JSON constant {name}')


def parse_json_text(text):
    """json.loads that refuses NaN and Infinity. Raises ValueError (JSONDecodeError is one)."""
    return json.loads(text, parse_constant=_reject_constant)


def credits_of(text, positive):
    """The `credits` number from a CLI JSON reply. Missing, bool, string, NaN, infinity, negative (or zero when
    positive) all raise ValueError so the caller stops instead of guessing."""
    doc = parse_json_text(text)
    if not isinstance(doc, dict) or 'credits' not in doc:
        raise ValueError('no credits field')
    v = doc['credits']
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        raise ValueError(f'credits has type {type(v).__name__}')
    v = float(v)
    if not (math.isfinite(v) and (v > 0 if positive else v >= 0)):
        raise ValueError(f'credits value {v} is not usable')
    return v


def gate_allows(total):
    """The spend gate. Positive conditions only, so NaN or infinity can never pass."""
    return math.isfinite(total) and total <= CAP_CREDITS


def spend_total(spent_by_balance, est_sum, estimate):
    """max(spent by balance, sum of estimates) + this estimate; NaN when any part is not a finite float, so the
    gate refuses it (max() alone can hide a NaN depending on argument order)."""
    parts = (spent_by_balance, est_sum, estimate)
    if not all(isinstance(p, float) and math.isfinite(p) for p in parts):
        return float('nan')
    return round(max(spent_by_balance, est_sum) + estimate, 6)


def url_noquery(url):
    s = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit((s.scheme, s.netloc, s.path, '', ''))


# ---------------------------------------------------------------- ledger and lock

class Ledger:
    def __init__(self, path):
        self.path = Path(path)

    def rows(self):
        if not self.path.exists():
            return []
        return [parse_json_text(l) for l in self.path.read_text(encoding='utf-8').splitlines() if l.strip()]

    def append(self, **row):
        row = scrub_obj({'ts': now(), **row})
        line = json.dumps(row, sort_keys=True, allow_nan=False)
        # The account reply carries an email address. It is refused outright rather than masked, so a code path
        # that would ledger the raw account reply fails loudly.
        if EMAIL_RE.search(line):
            raise RuntimeError('refusing to write an email address to the ledger')
        with open(self.path, 'a', encoding='utf-8') as fh:
            fh.write(line + '\n')
            fh.flush()
            os.fsync(fh.fileno())
        return row


def baseline_credits(rows):
    base = [r for r in rows if r.get('event') == 'baseline']
    if len(base) != 1:
        raise Stop(f'the ledger must hold exactly one baseline row (found {len(base)}); cannot measure spend')
    v = base[0].get('credits')
    if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(float(v)) or v < 0:
        raise Stop('the baseline row has no usable credits value')
    return float(v)


def est_sum_of(rows):
    """Sum of est_credits over every attempt: reserve rows, plus result rows with no reserve (the hand-recorded smoke
    call). A script attempt has both rows with the same attempt_id and is counted once. Unusable -> NaN."""
    reserved = {r.get('attempt_id') for r in rows if r.get('event') == 'reserve'}
    total = 0.0
    for r in rows:
        if r.get('event') == 'reserve' or (r.get('event') == 'result' and r.get('attempt_id') not in reserved):
            v = r.get('est_credits')
            if isinstance(v, bool) or not isinstance(v, (int, float)):
                return float('nan')
            total += float(v)
    return round(total, 6)


@contextlib.contextmanager
def exclusive_lock(ledger_path):
    lock_path = Path(ledger_path).with_suffix('.lock')
    fd = os.open(lock_path, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise Refuse(5, f'another process holds {lock_path.name}; refusing to start (one process at a time)')
        yield
    finally:
        os.close(fd)


# ---------------------------------------------------------------- the CLI

def cli_bin():
    """The real run always uses `higgsfield` from PATH; HIGGSFIELD_BIN is ignored unless the selftest's offline
    guard is on, and then it must point at the fake shim inside the selftest's fake dir."""
    if os.environ.get('HIGGSFIELD_CLI_SPIKE_OFFLINE') != '1':
        return 'higgsfield'
    b = os.environ.get('HIGGSFIELD_BIN') or ''
    fake_dir = os.environ.get('HIGGSFIELD_CLI_SPIKE_FAKE_DIR')
    if not (fake_dir and os.path.isabs(b) and Path(fake_dir).resolve() in Path(b).resolve().parents):
        raise Offline(f'offline guard: refusing to run {b!r}; only the selftest fake may run')
    return b


def cli(args, timeout):
    """One CLI call. Returns (returncode, stdout, stderr); raises subprocess.TimeoutExpired or OSError."""
    p = subprocess.run([cli_bin(), *args], capture_output=True, text=True, timeout=timeout, stdin=subprocess.DEVNULL)
    return p.returncode, p.stdout, p.stderr


def param_args(p):
    return ['--prompt', p['prompt'], '--variant', p['variant'], '--quality', p['quality'],
            '--resolution', p['resolution'], '--aspect_ratio', p['aspect_ratio'], '--background', p['background']]


def real_fetch(url):
    """Unauthenticated GET of a public result URL. Returns (status, content_type, bytes)."""
    if os.environ.get('HIGGSFIELD_CLI_SPIKE_OFFLINE') == '1':
        raise Offline(f'offline guard blocked a download of {url_noquery(url)}')
    with urllib.request.urlopen(urllib.request.Request(url), timeout=DOWNLOAD_TIMEOUT_S) as resp:
        return resp.status, resp.headers.get('Content-Type'), resp.read(MAX_DOWNLOAD_BYTES + 1)


def run_inspector(path):
    p = subprocess.run(['node', str(INSPECTOR), str(path)], capture_output=True, text=True, timeout=180)
    lines = [l for l in p.stdout.splitlines() if l.strip()]
    if not lines:
        raise RuntimeError(f'inspector exit {p.returncode}: {p.stderr.strip()[-500:]}')
    return json.loads(lines[-1])


def check_job(params, job):
    """Returns (echoed_background, flags). A job that is not gpt_image_2_5, or that does not echo the requested
    background, is flagged and is never eligible for a GO verdict."""
    flags = []
    if job.get('job_type') != JOB_TYPE:
        flags.append('job_type_mismatch')
    echoed = job['params'].get('background') if isinstance(job.get('params'), dict) else None
    if echoed != params['background']:
        flags.append('param_not_echoed')
    return echoed, flags


def go_eligible(params, row):
    return (params['background'] == 'transparent' and row.get('final_status') == 'completed' and not row['flags']
            and (row.get('inspection') or {}).get('real_alpha') is True)


def job_fields(job):
    return {'job_id': job.get('id'), 'job_type': job.get('job_type'), 'created_at': job.get('created_at'),
            'final_status': job.get('status'), 'params_echoed': job.get('params')}


# ---------------------------------------------------------------- the runner

class Runner:
    def __init__(self, ledger_path=LEDGER, raw_dir=None, fetch=real_fetch, inspector=run_inspector,
                 create_timeout=CREATE_TIMEOUT_S):
        self.ledger = Ledger(ledger_path)
        raw = Path(raw_dir or os.path.join(tempfile.gettempdir(), 'higgsfield-cli-raw')).resolve()
        if raw == REPO or REPO in raw.parents:
            raise Refuse(1, f'raw download dir must be outside the repository: {raw}')
        self.raw_dir = raw
        self.fetch = fetch
        self.inspector = inspector
        self.create_timeout = create_timeout

    def cost(self, params):
        try:
            rc, out, err = cli(['generate', 'cost', JOB_TYPE, *param_args(params), '--json'], CLI_TIMEOUT_S)
        except (subprocess.TimeoutExpired, OSError) as e:
            raise Stop(f'generate cost failed: {type(e).__name__}')
        if rc != 0:
            raise Stop(f'generate cost exited {rc}: {excerpt(err or out)}')
        try:
            return credits_of(out, positive=True)
        except ValueError as e:
            raise Stop(f'generate cost gave no usable price ({e}): {excerpt(out)!r}')

    def balance(self):
        # The account reply carries the account's email address: only the credits number leaves this method,
        # and no excerpt of the reply is ever put in an error message.
        try:
            rc, out, _ = cli(['account', 'status', '--json'], CLI_TIMEOUT_S)
        except (subprocess.TimeoutExpired, OSError) as e:
            raise Stop(f'account status failed: {type(e).__name__}')
        if rc != 0:
            raise Stop(f'account status exited {rc}')
        try:
            return credits_of(out, positive=False)
        except ValueError as e:
            raise Stop(f'account status gave no usable balance ({e})')

    def gate(self, params, rows):
        est = self.cost(params)
        bal = self.balance()
        base = baseline_credits(rows)
        spent = round(base - bal, 6)
        est_sum = est_sum_of(rows)
        total = spend_total(spent, est_sum, est)
        g = {'est_credits': est, 'balance_before': bal, 'baseline_credits': base, 'spent_by_balance': spent,
             'est_sum_before': est_sum, 'total_if_run': total, 'cap_credits': CAP_CREDITS}
        return gate_allows(total), g

    def balance_after(self, before):
        try:
            after = self.balance()
        except Stop as e:
            return {'balance_after': None, 'balance_after_error': str(e)}
        return {'balance_after': after, 'measured_credits': round(before - after, 6)}

    def stop(self, label, attempt, message, **extra):
        self.ledger.append(event='stopped', phase='create', label=label, attempt_id=attempt, final_status='ambiguous',
                           error=message, **extra)
        raise Stop(f'{label}: ambiguous create outcome, not retried; run stopped. {message}. '
                   f'Check the Higgsfield history and balance before any further paid call.')

    def run_label(self, label, params):
        try:
            ok, g = self.gate(params, self.ledger.rows())
        except Stop as e:
            self.ledger.append(event='stopped', phase='gate', label=label, error=str(e))
            raise
        if not ok:
            self.ledger.append(event='refused', label=label, params=params, **g)
            raise Refuse(3, f"spend gate: max(spent by balance {g['spent_by_balance']}, sum of estimates "
                            f"{g['est_sum_before']}) + estimate {g['est_credits']} = {g['total_if_run']} is over the "
                            f"cap of {CAP_CREDITS} credits; {label} not created")
        attempt = str(uuid.uuid4())
        self.ledger.append(event='reserve', label=label, attempt_id=attempt, job_type=JOB_TYPE, params=params, **g)
        say({'label': label, 'step': 'reserved', 'est_credits': g['est_credits'], 'total_if_run': g['total_if_run']})
        try:
            rc, out, err = cli(['generate', 'create', JOB_TYPE, *param_args(params), '--wait', '--json'],
                               self.create_timeout)
        except subprocess.TimeoutExpired:
            self.stop(label, attempt, f'create timed out after {self.create_timeout}s')
        except OSError as e:
            self.stop(label, attempt, f'create could not be run: {type(e).__name__}')
        if rc != 0:
            self.stop(label, attempt, f'create exited {rc}: {excerpt(err or out)!r}')
        try:
            jobs = parse_json_text(out)
        except ValueError:
            self.stop(label, attempt, f'create output is not JSON: {excerpt(out)!r}')
        if not (isinstance(jobs, list) and len(jobs) == 1 and isinstance(jobs[0], dict)):
            self.stop(label, attempt, f'expected a JSON list holding one job: {excerpt(out)!r}')
        job = jobs[0]
        status = job.get('status')
        if status != 'completed' and status not in CLEAN_FAILURES:
            self.stop(label, attempt, f'create returned status {status!r}, not completed', job_id=job.get('id'))
        row = {'event': 'result', 'label': label, 'attempt_id': attempt, 'params_requested': params,
               **job_fields(job), 'est_credits': g['est_credits'], 'balance_before': g['balance_before']}
        echoed, flags = check_job(params, job)
        row.update(echoed_background=echoed, flags=flags)
        if status == 'completed':
            self.download_and_inspect(label, job, row)
        else:
            flags.append('not_completed')
        row.update(self.balance_after(g['balance_before']))
        row['go_eligible'] = go_eligible(params, row)
        self.ledger.append(**row)
        say({'label': label, 'step': 'result', 'final_status': status, 'flags': flags,
             'real_alpha': (row.get('inspection') or {}).get('real_alpha'), 'go_eligible': row['go_eligible'],
             'measured_credits': row.get('measured_credits')})

    def download_and_inspect(self, label, job, row):
        url = job.get('result_url')
        if not (isinstance(url, str) and urllib.parse.urlsplit(url).scheme == 'https'):
            row['flags'].append('no_https_result_url')
            return
        row['result_url'] = url_noquery(url)
        try:
            status, ctype, data = self.fetch(url)
            error = None if status == 200 and 0 < len(data) <= MAX_DOWNLOAD_BYTES else f'download HTTP {status}'
        except Exception as e:  # the job completed and is paid for; record the failure, do not stop
            ctype, data, error = None, b'', f'{type(e).__name__}: {e}'
        if error:
            row.update(download_error=excerpt(error))
            row['flags'].append('download_failed')
            return
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        ext = Path(urllib.parse.urlsplit(url).path).suffix.lower() or '.bin'
        name = re.sub(r'[^A-Za-z0-9._-]+', '-', f"{label}-{str(job.get('id') or 'noid')[:8]}{ext}")
        out = self.raw_dir / name
        out.write_bytes(data)
        row.update(file=name, bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), content_type=ctype)
        try:
            row['inspection'] = self.inspector(out)
        except Exception as e:
            row['inspection_error'] = excerpt(str(e))
            row['flags'].append('inspection_failed')


# ---------------------------------------------------------------- commands

def plan(rows, only=None):
    """(labels to run, skipped labels). A label with a result row is done; a label with a reserve row but no result
    had an ambiguous outcome and is never retried."""
    done = {r.get('label') for r in rows if r.get('event') == 'result'}
    tried = {r.get('label') for r in rows if r.get('event') == 'reserve'}
    todo, skipped = [], []
    for label, params in MATRIX:
        if only and label != only:
            continue
        if label in done:
            skipped.append((label, 'result row exists'))
        elif label in tried:
            skipped.append((label, 'an earlier attempt has no result (stopped); never retried'))
        else:
            todo.append((label, params))
    return todo, skipped


def run_cmd(runner, only=None, dry_run=False):
    if only and only not in dict(MATRIX):
        raise Refuse(1, f'unknown label {only!r}; known: {", ".join(l for l, _ in MATRIX)}')
    rows = runner.ledger.rows()
    todo, skipped = plan(rows, only)
    for label, why in skipped:
        say({'label': label, 'skipped': why})
    if dry_run:  # cost and balance only; nothing is reserved or created and the ledger is not written
        bal = runner.balance()
        base = baseline_credits(rows)
        spent, est_sum = round(base - bal, 6), est_sum_of(rows)
        running = spend_total(spent, est_sum, 0.0)
        say({'dry_run': True, 'baseline_credits': base, 'balance': bal, 'spent_by_balance': spent,
             'est_sum': est_sum, 'counted_spent': running, 'cap_credits': CAP_CREDITS})
        for label, params in todo:
            est = runner.cost(params)
            running = spend_total(running, running, est)
            say({'label': label, 'would_run': True, 'est_credits': est, 'projected_total': running,
                 'gate_allows': gate_allows(running)})
        return 0
    for label, params in todo:
        runner.run_label(label, params)
    say({'run': 'done', 'ran': [l for l, _ in todo], 'skipped': [l for l, _ in skipped]})
    return 0


def init_ledger(ledger, smoke_json, smoke_png, inspector=run_inspector):
    """Writes the baseline and the hand-recorded T1 smoke result (the orchestrator ran that call by hand before
    this runner existed). Refuses unless the ledger is empty and the files match the recorded smoke values."""
    if ledger.rows():
        raise Refuse(1, 'the ledger already has rows; init-ledger only writes the first two')
    jobs = parse_json_text(Path(smoke_json).read_text(encoding='utf-8'))
    if not (isinstance(jobs, list) and len(jobs) == 1 and isinstance(jobs[0], dict)):
        raise Refuse(1, 'smoke JSON must be a list holding one job')
    job = jobs[0]
    data = Path(smoke_png).read_bytes()
    sha = hashlib.sha256(data).hexdigest()
    if job.get('id') != SMOKE['job_id'] or sha != SMOKE['sha256'] or len(data) != SMOKE['bytes']:
        raise Refuse(1, 'smoke files do not match the recorded job id, sha256 and size')
    label, params = MATRIX[0]
    echoed = job.get('params') or {}
    sent = {'prompt': echoed.get('prompt'), 'variant': echoed.get('model'), 'quality': echoed.get('quality'),
            'resolution': echoed.get('resolution'), 'aspect_ratio': echoed.get('aspect_ratio'),
            'background': echoed.get('background')}
    if sent != params:
        raise Refuse(1, 'the smoke job parameters differ from the T1 matrix entry')
    ledger.append(event='baseline', credits=BASELINE_CREDITS,
                  note='Account balance before the first CLI generation, read by the orchestrator with '
                       '`higgsfield account status --json` (credits only recorded).')
    row = {'event': 'result', 'label': label, 'attempt_id': None, 'params_requested': params, **job_fields(job),
           'est_credits': SMOKE['est_credits'], 'balance_before': BASELINE_CREDITS,
           'balance_after': SMOKE['balance_after'],
           'measured_credits': round(BASELINE_CREDITS - SMOKE['balance_after'], 6),
           'result_url': url_noquery(job['result_url']), 'file': Path(smoke_png).name, 'bytes': len(data),
           'sha256': sha, 'content_type': None,
           'note': 'Smoke call run by the orchestrator with `higgsfield generate create ... --wait --json` before '
                   'this runner existed; recorded by init-ledger. Price from `generate cost` (0.25); content type '
                   'not captured at download.'}
    echoed_bg, flags = check_job(params, job)
    row.update(echoed_background=echoed_bg, flags=flags, inspection=inspector(Path(smoke_png)))
    row['go_eligible'] = go_eligible(params, row)
    ledger.append(**row)
    say({'init_ledger': str(ledger.path), 'baseline': BASELINE_CREDITS, 'label': label,
         'real_alpha': row['inspection'].get('real_alpha'), 'go_eligible': row['go_eligible']})
    return 0


def exit_code(fn):
    try:
        return fn()
    except Refuse as e:
        say(f'REFUSED (exit {e.code}): {e}', sys.stderr)
        return e.code
    except (Stop, Offline) as e:
        say(f'STOPPED (exit 4): {e}', sys.stderr)
        return 4
    except Exception:
        say(traceback.format_exc(), sys.stderr)
        return 1


# ---------------------------------------------------------------- selftest

SHIM = r'''#!{python}
# Fake `higgsfield` for the selftest. Answers from scenario.json next to it and logs every call to calls.jsonl.
import json, os, sys, time
here = os.path.dirname(os.path.abspath(__file__))
scn_path, log_path = os.path.join(here, 'scenario.json'), os.path.join(here, 'calls.jsonl')
scn = json.load(open(scn_path))
args = sys.argv[1:]
kind = {('generate', 'cost'): 'cost', ('generate', 'create'): 'create', ('account', 'status'): 'account'}.get(tuple(args[:2]), 'other')
with open(log_path, 'a') as f:
    f.write(json.dumps({'kind': kind, 'args': args}) + '\n')
opt = lambda name: args[args.index(name) + 1] if name in args else None
if kind == 'cost':
    r = scn['cost']
    sys.stdout.write(r if isinstance(r, str) else json.dumps({'credits': r}))
    sys.exit(scn.get('cost_rc', 0))
if kind == 'account':
    r = scn['balance']
    if isinstance(r, str):
        sys.stdout.write(r)
    else:
        doc = {'credits': r, 'subscription_plan_type': 'starter'}
        if scn.get('email'):
            doc['email'] = scn['email']
        sys.stdout.write(json.dumps(doc))
    sys.exit(0)
if kind == 'create':
    mode = scn.get('create', 'completed')
    if mode == 'sleep':
        time.sleep(5)
    if mode == 'exit1':
        sys.exit(1)
    if mode == 'leaky':
        sys.stderr.write(scn['stderr'])
        sys.exit(1)
    if mode == 'garbage':
        print('Submitting job... done')
        sys.exit(0)
    if scn.get('charge') and isinstance(scn['balance'], float):
        scn['balance'] = round(scn['balance'] - float(scn['cost']), 6)
        json.dump(scn, open(scn_path, 'w'))
    n = sum(1 for line in open(log_path) if json.loads(line)['kind'] == 'create')
    jid = '00000000-0000-4000-8000-%012d' % n
    params = {'aspect_ratio': opt('--aspect_ratio'), 'background': scn.get('echo_background') or opt('--background'),
              'height': 1024, 'width': 1024, 'model': opt('--variant'), 'prompt': opt('--prompt'),
              'quality': opt('--quality'), 'resolution': opt('--resolution'), 'remove_bg': False, 'medias': [],
              'reference_elements': []}
    print(json.dumps([{'id': jid, 'job_type': args[2], 'status': mode if mode in ('running', 'failed', 'nsfw') else 'completed',
                       'display_name': 'GPT Image 2.5', 'created_at': '2026-10-09T00:00:00Z', 'params': params,
                       'result_url': 'https://cdn.example.invalid/u/%s.png?sig=selftest' % jid,
                       'min_result_url': 'https://cdn.example.invalid/u/%s_min.webp' % jid}]))
    sys.exit(0)
sys.exit(2)
'''


def selftest():
    """Offline controls. The `higgsfield` binary is a fake shim in a temp dir and an offline guard refuses any other
    binary and any real download, here and in every subprocess."""
    results = []
    tmp = Path(tempfile.mkdtemp(prefix='hf-cli-selftest-'))
    fake_dir = tmp / 'fakebin'
    fake_dir.mkdir()
    shim = fake_dir / 'higgsfield'
    shim.write_text(SHIM.replace('{python}', sys.executable))
    shim.chmod(0o755)
    os.environ.update(HIGGSFIELD_BIN=str(shim), HIGGSFIELD_CLI_SPIKE_OFFLINE='1',
                      HIGGSFIELD_CLI_SPIKE_FAKE_DIR=str(fake_dir))
    png = (ROOT.parent / '2026-10-08-solar-system/assets/web/mercury.png').read_bytes()
    fetched = []

    def fake_fetch(url):
        fetched.append(url)
        return 200, 'image/png', png

    def stub_inspector(path):
        return {'file': Path(path).name, 'real_alpha': True, 'note': 'selftest stub'}

    def scenario(**kw):
        (fake_dir / 'scenario.json').write_text(json.dumps({'cost': 0.25, 'balance': 701.0, 'charge': True, **kw}))
        (fake_dir / 'calls.jsonl').write_text('')
        fetched.clear()

    def calls(kind=None):
        lines = (fake_dir / 'calls.jsonl').read_text().splitlines()
        return [c for c in map(json.loads, lines) if kind is None or c['kind'] == kind]

    def ledger(name, *rows):
        led = Ledger(tmp / f'{name}.jsonl')
        led.append(event='baseline', credits=701.0, note='selftest')
        for r in rows:
            led.append(**r)
        return led

    def run(led, only=None, dry=False, inspector=stub_inspector, timeout=CREATE_TIMEOUT_S, fetch=fake_fetch):
        runner = Runner(led.path, raw_dir=tmp / 'raw', fetch=fetch, inspector=inspector, create_timeout=timeout)
        out = io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
            code = exit_code(lambda: run_cmd(runner, only, dry))
        return code, out.getvalue()

    def events(led, event, label=None):
        return [r for r in led.rows() if r['event'] == event and (label is None or r['label'] == label)]

    def control(name, fn):
        try:
            results.append((name, True, fn()))
        except Exception as e:
            results.append((name, False, f'{type(e).__name__}: {e}'))

    def c1():  # cap refusal at 19.7 + 0.5; 19.5 + 0.5 = 20.0 allowed
        led = ledger('c1')
        scenario(cost=0.5, balance=681.3)
        code, out = run(led, only='T2-cytokinesis')
        assert code == 3 and 'spend gate' in out, f'19.7 spent + 0.5 not refused (exit {code})'
        assert not calls('create'), 'a refused call reached create'
        ref = events(led, 'refused')[0]
        assert ref['spent_by_balance'] == 19.7 and ref['total_if_run'] == 20.2, f'refused row {ref}'
        scenario(cost=0.5, balance=681.5)
        code, _ = run(led, only='T2-cytokinesis')
        res = events(led, 'reserve')[0]
        assert code == 0 and len(calls('create')) == 1, f'19.5 + 0.5 not allowed (exit {code})'
        assert res['spent_by_balance'] == 19.5 and res['total_if_run'] == 20.0, f'reserve row {res}'
        assert gate_allows(20.0) and not gate_allows(20.000001)
        assert not any(gate_allows(x) for x in (float('nan'), float('inf'), float('-inf')))
        assert math.isnan(spend_total(float('nan'), 1.0, 0.5)) and math.isnan(spend_total(1.0, float('nan'), 0.5))
        return ('balance 681.3 (19.7 spent) + 0.5 = 20.2 refused, exit 3, 0 creates; 681.5 (19.5) + 0.5 = 20.0 '
                'allowed, 1 create; gate refuses nan/inf/-inf and a NaN in either max() argument')

    def c2():  # unusable cost or balance stops the run before any create
        bad = ['{"credits": NaN}', '{"credits": Infinity}', '{"credits": "inf"}', '{"credits": -1}', 'not json',
               '', '{}', '{"credits": true}', '{"credits": 1e999}']
        cases = [('cost', b) for b in bad + ['{"credits": 0}']] + [('balance', b) for b in bad]
        for n, (which, reply) in enumerate(cases):
            scenario(**{which: reply})
            led = ledger(f'c2-{n}')
            code, _ = run(led, only='T2-cytokinesis')
            assert code == 4, f'{which} {reply!r}: exit {code}, expected 4'
            assert not calls('create') and not events(led, 'reserve'), f'{which} {reply!r}: reserved or created'
            assert events(led, 'stopped')[0]['phase'] == 'gate'
        scenario(cost_rc=1)
        code, _ = run(ledger('c2-rc'), only='T2-cytokinesis')
        assert code == 4 and not calls('create'), f'cost exit 1: exit {code}'
        return (f'{len(cases)} unusable cost/balance replies (NaN, Infinity, "inf", -1, not JSON, empty, missing, '
                'true, 1e999; cost 0) and a failing cost command -> exit 4, gate-stopped row, 0 creates')

    def c3():  # the balance lags (never drops) but the estimates add up: the larger one is used
        led = ledger('c3', dict(event='result', label='selftest-seed', est_credits=18.75, final_status='completed'))
        scenario(cost=0.5, balance=701.0, charge=False)
        code, out = run(led)
        assert code == 3, f'exit {code}, expected the third call refused'
        assert len(calls('create')) == 2, f'{len(calls("create"))} creates, expected 2'
        r1, r2 = events(led, 'reserve')
        ref = events(led, 'refused')[0]
        got = [(r['spent_by_balance'], r['est_sum_before'], r['total_if_run']) for r in (r1, r2, ref)]
        assert got == [(0.0, 18.75, 19.25), (0.0, 19.25, 19.75), (0.0, 19.75, 20.25)], f'arithmetic {got}'
        assert ref['label'] == 'T3-sunburst-interphase' and events(led, 'result', 'T2-cytokinesis')
        return ('balance stays 701 (0 spent by balance); estimates 18.75 -> 19.25 -> 19.75: T1 at 19.25 and T2 at '
                '19.75 allowed, T3 at max(0, 19.75) + 0.5 = 20.25 refused (balance alone would give 0.5)')

    def c4():  # ambiguous creates stop the run; nothing is retried; a clean failure continues
        for mode in ('exit1', 'garbage', 'running', 'sleep'):
            scenario(create=mode)
            led = ledger(f'c4-{mode}')
            code, _ = run(led, timeout=1 if mode == 'sleep' else CREATE_TIMEOUT_S)
            assert code == 4, f'{mode}: exit {code}'
            assert len(calls('create')) == 1, f'{mode}: {len(calls("create"))} create calls'
            assert [r['event'] for r in led.rows()] == ['baseline', 'reserve', 'stopped'], f'{mode}: rows'
            assert events(led, 'stopped')[0]['attempt_id'] == events(led, 'reserve')[0]['attempt_id']
            scenario()
            code, out = run(led, only='T1-smoke-interphase')
            assert code == 0 and not calls('create') and 'never retried' in out, f'{mode}: label retried'
        scenario(create='failed')
        led = ledger('c4-failed')
        code, _ = run(led)
        assert code == 0 and len(calls('create')) == 5, f'clean failure: exit {code}, {len(calls("create"))}'
        assert all(r['final_status'] == 'failed' and not r['go_eligible'] for r in events(led, 'result'))
        assert est_sum_of(led.rows()) == 1.25, 'failed calls not counted at their estimate'
        return ('exit 1 with no output, non-JSON output, status "running" and a timeout -> stopped row, exit 4, '
                'exactly 1 create; rerun skips the stopped label (0 creates); clean "failed" x5 recorded, run '
                'continued, counted at 5 x 0.25 = 1.25')

    def c5():  # a second process is refused by the lock
        led = ledger('c5')
        scenario()
        with exclusive_lock(led.path):
            p = subprocess.run([sys.executable, __file__, '--ledger', str(led.path), '--raw-dir', str(tmp / 'raw'),
                                'run'], capture_output=True, text=True)
        assert p.returncode == 5 and 'another process' in p.stderr, f'second process exit {p.returncode}'
        assert not calls(), 'the refused process called the CLI'
        with exclusive_lock(led.path):
            pass
        return 'second process exit 5 while the lock was held, 0 CLI calls; lock reacquired after release'

    def c6():  # params.background must echo what was sent
        scenario(echo_background='opaque')
        led = ledger('c6')
        code, _ = run(led, only='T2-cytokinesis')
        r = events(led, 'result')[0]
        assert code == 0 and r['echoed_background'] == 'opaque' and 'param_not_echoed' in r['flags'], f'row {r}'
        assert r['inspection']['real_alpha'] is True and r['go_eligible'] is False, 'mismatch still GO-eligible'
        scenario()
        led2 = ledger('c6b')
        run(led2, only='T2-cytokinesis')
        assert events(led2, 'result')[0]['go_eligible'] is True, 'a clean echo should be GO-eligible'
        return 'echo "opaque" for "transparent" -> flags [param_not_echoed], go_eligible false (clean echo: true)'

    def c7():  # labels with a result row are skipped; only the missing one is created (real inspector)
        prior = [dict(event='result', label=l, est_credits=0.25, final_status='completed') for l, _ in MATRIX[:4]]
        led = ledger('c7', *prior)
        scenario(balance=700.0)
        code, out = run(led, dry=True)
        assert code == 0 and not calls('create') and not events(led, 'reserve'), 'dry run created or reserved'
        would = [json.loads(l)['label'] for l in out.splitlines() if '"would_run"' in l]
        assert would == ['C1-flare-opaque-interphase'] and '"projected_total": 1.25' in out, f'dry run {out}'
        code, _ = run(led, inspector=run_inspector)
        made = calls('create')
        assert code == 0 and len(made) == 1 and 'opaque' in made[0]['args'], f'exit {code}, creates {made}'
        r = events(led, 'result', 'C1-flare-opaque-interphase')[0]
        assert fetched == ['https://cdn.example.invalid/u/00000000-0000-4000-8000-000000000001.png?sig=selftest']
        assert '?' not in r['result_url'] and r['sha256'] == hashlib.sha256(png).hexdigest(), 'url/sha'
        assert r['content_type'] == 'image/png' and r['inspection']['real_alpha'] is True, 'pipeline'
        assert (r['balance_before'], r['balance_after'], r['measured_credits']) == (700.0, 699.75, 0.25)
        assert r['go_eligible'] is False, 'an opaque-requested control must not be GO-eligible'
        scenario(balance=699.75)
        code, _ = run(led)
        assert code == 0 and not calls('create'), 'rerun created a job'
        return ('T1-T4 have results: dry run lists only C1 (projected 1.0 + 0.25 = 1.25, 0 creates); run creates '
                'only C1 (downloaded, query stripped, sha recorded, real inspector, balance 700 -> 699.75); '
                'rerun creates nothing')

    def c8():  # the account reply's email never reaches the ledger or stdout
        scenario(email='selftest.person@example.com')
        led = ledger('c8')
        code, out = run(led)
        text = led.path.read_text()
        assert code == 0 and len(calls('create')) == 5, f'exit {code}'
        assert 'example.com' not in text and '@' not in text and 'email' not in text, 'email in the ledger'
        assert 'example.com' not in out, 'email printed'
        return 'shim account JSON carried an email; 5 creates; ledger and output contain no email or "@"'

    def c9():  # inspector controls
        transparent = ROOT.parent / '2026-10-08-solar-system/assets/web/earth.png'
        opaque = ROOT.parent / '2026-10-08-solar-system/solar-system.png'
        a, b = run_inspector(transparent), run_inspector(opaque)
        assert a['real_alpha'] is True and a['minAlpha'] == 0, f'transparent: {a}'
        assert b['real_alpha'] is False and b['minAlpha'] == 255 and b['opaqueCornerCount'] == 4, f'opaque: {b}'
        return (f"earth.png real_alpha true (transparent {a['transparentPixelRatio']}); solar-system.png "
                f"real_alpha false (minAlpha 255, 4 opaque corners)")

    def c10():  # tokens and signed URLs in CLI stderr or a download exception never reach ledger or output
        jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZWxmdGVzdCJ9.c2VsZnRlc3Qtc2lnbmF0dXJl'
        secrets = ['SECRETSIG', 'Expires=1', 'abc.def.ghi-longtokenvalue', jwt, 'tokvalue123456', 'acctok987654',
                   'DLSECRET', 'X-Amz-Expires=60']
        scenario(create='leaky', stderr=('error: upload https://cdn.example/x.png?sig=SECRETSIG&Expires=1 failed\n'
                                         f'{jwt}\n'
                                         'retry with token=tokvalue123456 {"access_token": "acctok987654"}\n'
                                         'Authorization: Bearer abc.def.ghi-longtokenvalue\n'))
        led = ledger('c10a')
        code, out_a = run(led, only='T2-cytokinesis')
        assert code == 4 and len(calls('create')) == 1, f'leaky create: exit {code}'

        def leaky_fetch(url):
            raise RuntimeError('GET https://cdn.example.invalid/u/x.png?X-Amz-Signature=DLSECRET&X-Amz-Expires=60 '
                               'returned 403')
        scenario()
        led_b = ledger('c10b')
        code, out_b = run(led_b, only='T2-cytokinesis', fetch=leaky_fetch)
        r = events(led_b, 'result')[0]
        assert code == 0 and 'download_failed' in r['flags'], f'download failure: exit {code}, {r.get("flags")}'
        text = led.path.read_text() + led_b.path.read_text()
        for s in secrets:
            assert s not in text, f'{s!r} reached the ledger'
            assert s not in out_a + out_b, f'{s!r} reached stdout/stderr'
        for form in ('https://cdn.example/x.png?<query-stripped>', 'https://cdn.example.invalid/u/x.png?<query-stripped>'):
            assert form in text, f'stripped form {form} missing from the ledger'
        assert 'https://cdn.example/x.png?<query-stripped>' in out_a, 'stripped form missing from stderr'
        assert redact_secrets(redact_secrets(text)) == redact_secrets(text) == text, 'redaction not idempotent'
        return ('stderr with a signed URL, an Authorization header, a JWT, token= and access_token, and a download exception '
                'with a signed URL: none in ledger/stdout/stderr; "?<query-stripped>" forms recorded')

    def c11():  # HIGGSFIELD_BIN is honoured only under the offline guard
        env = {k: v for k, v in os.environ.items() if not k.startswith('HIGGSFIELD_CLI_SPIKE_')}
        env['HIGGSFIELD_BIN'] = str(shim)
        code = ('import importlib.util, sys\n'
                'spec = importlib.util.spec_from_file_location("cli_spike", sys.argv[1])\n'
                'm = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)\n'
                'print(m.cli_bin())\n')
        p = subprocess.run([sys.executable, '-B', '-c', code, __file__], capture_output=True, text=True, env=env)
        assert p.returncode == 0 and p.stdout.strip() == 'higgsfield', f'guard off: {p.stdout!r} {p.stderr[-300:]}'
        assert cli_bin() == str(shim), 'guard on: override not honoured'
        return 'guard off + HIGGSFIELD_BIN=fake -> "higgsfield" (subprocess); guard on -> the fake shim path'

    for name, fn in (('(i) cap refusal 19.7+0.5 / 19.5+0.5', c1), ('(ii) unusable cost or balance stops', c2),
                     ('(iii) balance lag uses the larger', c3), ('(iv) ambiguous create stops, no retry', c4),
                     ('(v) second process refused by the lock', c5), ('(vi) param echo mismatch flagged', c6),
                     ('(vii) resumable, dry run, pipeline', c7), ('(viii) no email in the ledger', c8),
                     ('(ix) inspector controls', c9),
                     ('(x) tokens and signed URLs never reach the ledger', c10),
                     ('(xi) HIGGSFIELD_BIN only under the offline guard', c11)):
        control(name, fn)
    import shutil
    shutil.rmtree(tmp, ignore_errors=True)
    for name, ok, detail in results:
        say(f"{'PASS' if ok else 'FAIL'} {name}: {detail}")
    failed = [r for r in results if not r[1]]
    say(f'selftest: {len(results) - len(failed)}/{len(results)} controls passed')
    return 1 if failed else 0


# ---------------------------------------------------------------- CLI

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--ledger', default=str(LEDGER), help='ledger path (default: cli-spike-ledger.jsonl here)')
    ap.add_argument('--raw-dir', default=None,
                    help='download dir, outside the repo (default $TMPDIR/higgsfield-cli-raw)')
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('selftest')
    r = sub.add_parser('run')
    r.add_argument('--dry-run', action='store_true', help='cost and balance only; nothing reserved or created')
    r.add_argument('--only', default=None, help='run one matrix label')
    i = sub.add_parser('init-ledger')
    i.add_argument('--smoke-json', required=True)
    i.add_argument('--smoke-png', required=True)
    args = ap.parse_args(argv)
    if args.cmd == 'selftest':
        return selftest()

    def go():
        with exclusive_lock(args.ledger):
            if args.cmd == 'init-ledger':
                return init_ledger(Ledger(args.ledger), args.smoke_json, args.smoke_png)
            return run_cmd(Runner(args.ledger, args.raw_dir), args.only, args.dry_run)
    return exit_code(go)


if __name__ == '__main__':
    sys.exit(main())
