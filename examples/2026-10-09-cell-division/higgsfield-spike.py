#!/usr/bin/env python3
"""GH-8 Phase 0: does Higgsfield return real alpha for GPT Image 2.5 (Flare, Sunburst)?

REST only, Python standard library only. Subcommands:
  selftest                         offline red/green controls (dummy key, fake HTTP layer, no network)
  estimate --endpoint ID --body J  free price check (POST /estimate/<ID>)
  submit --label L --endpoint ID --body J   estimate -> reserve -> one paid submit -> poll -> download -> inspect
  matrix [--dry-run]               the Phase 0 probe matrix, strictly sequential
  discover                         estimate-only existence check for candidate endpoint ids (404 = absent)
  scan-secrets [--paths P ...]     search the staged diff, the ledger and FINDINGS.md for the key ID or secret

The key file path comes only from HIGGSFIELD_KEY_FILE. Its mode is checked before its contents are read.
The key is never printed, logged, written or placed in a URL; everything printed or written goes through scrub().
Exit codes: 0 ok, 1 error or scan hit, 2 key refused, 3 spend gate refused, 4 ambiguous failure (run stopped),
5 another spike process holds the lock.
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
import shlex
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
API_HOST = 'api.higgsfield.ai'
API = 'https://' + API_HOST
LEDGER = ROOT / 'spike-ledger.jsonl'
INSPECTOR = ROOT / 'inspect-alpha.mjs'
CAP_USD = 1.90       # reservation gate for this spike
HARD_CAP_USD = 2.00  # the operator's cap for the whole slice; never exceeded even if CAP_USD were edited
POLL_INTERVAL_S = 3
POLL_DEADLINE_S = 300
HTTP_TIMEOUT_S = 60
MAX_DOWNLOAD_BYTES = 64 * 1024 * 1024
PROBE_FIELDS = ('background', 'output_format')  # not in the documented schema; stripped for the estimate
# Flare/Sunburst estimate routes return a pricing description (token-based), not a quote, and other routes may
# 404. Either way the call has no numeric price. For 1k/low bodies only, reserve this assumed per-call price:
# the docs' own estimate example and the Higgsfield blog both put 1K Low at 1.5 credits (about $0.075 to $0.094),
# and billing is token-based with image output at $30 per 1M tokens, so a 1k/low image is far below $0.10.
# $0.10 is a conservative per-call reservation. The real charge is reconciled by Higgsfield on completion and is
# not readable through the API (there is no balance endpoint). Any other body without a quote is refused.
ASSUMED_USD = 0.10
ASSUMED_NOTE_404 = 'estimate route returned 404 or no quote; assumed $0.10 for 1k/low'
ASSUMED_NOTE_DESC = 'estimate route returned a pricing description, not a quote; assumed $0.10 for 1k/low'
TERMINAL = {'completed', 'failed', 'nsfw', 'canceled', 'cancelled'}
P = 'A single isolated red blood cell, studio lighting'
P2 = ('A single isolated animal cell shown as a clean scientific illustration, transparent background, '
      'no backdrop, no ground, no shadow, no checkerboard, subject only')
MATRIX_ENDPOINTS = ('marketing-studio/image/flare', 'marketing-studio/image/sunburst')
DISCOVER_ENDPOINTS = ('marketing-studio/image/sunburst', 'marketing-studio/image/generate-and-edit',
                      'higgsfield-ai/soul/standard', 'higgsfield-ai/soul/v2/standard')
ENDPOINT_RE = re.compile(r'^[a-z0-9][a-z0-9._-]*(/[a-z0-9][a-z0-9._-]*)*$')


class Refuse(Exception):
    """A deliberate refusal with an exit code. The message is scrubbed before it is shown."""
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


class Ambiguous(Exception):
    """Timeout, network error, 5xx or unreadable reply: the outcome of a paid call may be unknown."""


class Offline(Exception):
    """The offline guard blocked a network call (selftest and its subprocesses)."""


# ---------------------------------------------------------------- secrets

class Scrubber:
    def __init__(self, key_id=None, secret=None):
        raw = [s for s in ((f'{key_id}:{secret}' if key_id and secret else None), key_id, secret) if s]
        variants = set(raw)
        for s in raw:
            variants.add(urllib.parse.quote(s, safe=''))
            variants.add(urllib.parse.quote_plus(s))
        self.needles = sorted(variants, key=len, reverse=True)

    def __call__(self, value):
        text = value if isinstance(value, str) else str(value)
        for n in self.needles:
            text = text.replace(n, '***')
        return text


SCRUB = Scrubber()


def scrub(text):
    return SCRUB(text)


def scrub_obj(obj):
    """Scrub every string inside a JSON-able value before it is serialised (escaping cannot hide a needle)."""
    if isinstance(obj, str):
        return scrub(obj)
    if isinstance(obj, dict):
        return {scrub_obj(k): scrub_obj(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [scrub_obj(v) for v in obj]
    return obj


def say(obj, stream=None):
    stream = stream or sys.stdout
    print(scrub(obj if isinstance(obj, str) else json.dumps(obj, sort_keys=True)), file=stream, flush=True)


def _read_text(path):
    with open(path, 'r', encoding='utf-8') as fh:
        return fh.read()


def load_key(path=None, reader=_read_text):
    """Check the key file's mode with os.stat, then (and only then) read it. Installs the global scrubber."""
    global SCRUB
    path = path or os.environ.get('HIGGSFIELD_KEY_FILE')
    if not path:
        raise Refuse(2, 'HIGGSFIELD_KEY_FILE is not set; point it at the KEY_ID:SECRET file (mode 600).')
    try:
        st = os.stat(path)
    except OSError as e:
        raise Refuse(2, f'cannot stat HIGGSFIELD_KEY_FILE ({path}): {e.strerror}')
    mode = stat.S_IMODE(st.st_mode)
    if not stat.S_ISREG(st.st_mode) or mode not in (0o600, 0o400):
        raise Refuse(2, f'refusing to read {path}: mode {mode:o} allows group or world access '
                        f'(or is not a regular file). Fix with: chmod 600 {shlex.quote(str(path))}')
    text = reader(path).strip()
    if text.count(':') < 1 or '\n' in text:
        raise Refuse(2, 'key file must hold one KEY_ID:SECRET line')
    key_id, secret = text.split(':', 1)
    if len(key_id) < 4 or len(secret) < 4:
        raise Refuse(2, 'key file must hold one KEY_ID:SECRET line')
    SCRUB = Scrubber(key_id, secret)
    return key_id, secret


# ---------------------------------------------------------------- HTTP

class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):  # never forward the Authorization header anywhere
        return None


def real_http(method, url, headers, body, timeout):
    """Returns (status, headers, body bytes). Raises Ambiguous on transport failure, Offline under the guard."""
    if os.environ.get('HIGGSFIELD_SPIKE_OFFLINE') == '1':
        raise Offline(f'offline guard blocked {method} {url}')
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    opener = urllib.request.build_opener(_NoRedirect) if 'Authorization' in headers else urllib.request.build_opener()
    try:
        with opener.open(req, timeout=timeout) as resp:
            return resp.status, dict(resp.headers.items()), resp.read(MAX_DOWNLOAD_BYTES + 1)
    except urllib.error.HTTPError as e:
        try:
            data = e.read()
        except Exception:
            data = b''
        return e.code, dict(e.headers.items()) if e.headers else {}, data
    except Exception as e:  # timeout, DNS, TLS, reset: the outcome is unknown
        raise Ambiguous(f'{type(e).__name__}: {e}')


# ---------------------------------------------------------------- ledger and lock

def canon(body):
    return json.dumps(body, sort_keys=True, separators=(',', ':'))


def body_hash(body):
    return hashlib.sha256(canon(body).encode()).hexdigest()


class Ledger:
    def __init__(self, path):
        self.path = Path(path)

    def rows(self):
        if not self.path.exists():
            return []
        return [json.loads(line) for line in self.path.read_text().splitlines() if line.strip()]

    def reserved_usd(self):
        return round(sum(float(r.get('est_usd') or 0) for r in self.rows() if r.get('event') == 'reserve'), 6)

    def append(self, **row):
        row = {'ts': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), **row}
        line = scrub(json.dumps(scrub_obj(row), sort_keys=True)) + '\n'
        with open(self.path, 'a', encoding='utf-8') as fh:
            fh.write(line)
            fh.flush()
            os.fsync(fh.fileno())
        return row


@contextlib.contextmanager
def exclusive_lock(ledger_path):
    lock_path = Path(ledger_path).with_suffix('.lock')
    fd = os.open(lock_path, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise Refuse(5, f'another spike process holds {lock_path.name}; refusing to start (one process at a time)')
        yield
    finally:
        os.close(fd)


# ---------------------------------------------------------------- the spike

def check_endpoint(endpoint):
    if not ENDPOINT_RE.match(endpoint) or '..' in endpoint:
        raise Refuse(1, f'invalid endpoint id: {endpoint!r}')


def assumed_price_applies(body):
    """Only a 1k, low-quality body may be reserved at ASSUMED_USD when the estimate route returns 404."""
    return body.get('resolution') == '1k' and body.get('quality') == 'low'


def url_ext(url):
    return Path(urllib.parse.urlsplit(url).path).suffix.lower().lstrip('.') or None


def url_noquery(url):
    s = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit((s.scheme, s.netloc, s.path, '', ''))


def _reject_constant(name):
    raise ValueError(f'non-finite JSON constant {name}')


QUOTE_RE = re.compile(r'[0-9]+(\.[0-9]+)?|\.[0-9]+')


def parse_quote(doc):
    """None when there is no quote ('usd' absent or JSON null). Otherwise a finite, non-negative float from a
    number or a plain numeric string; anything else (bool, list, dict, '$5.00', NaN, Infinity, negative) raises
    ValueError so the caller stops instead of guessing."""
    if doc.get('usd') is None:
        return None
    v = doc['usd']
    if isinstance(v, bool) or not isinstance(v, (int, float, str)):
        raise ValueError(f'usd has type {type(v).__name__}')
    if isinstance(v, str) and not QUOTE_RE.fullmatch(v.strip()):
        raise ValueError(f'usd string {v[:40]!r} is not a plain number')
    f = float(v)
    if not math.isfinite(f):
        raise ValueError('usd is not finite')
    if f < 0:
        raise ValueError(f'usd is negative ({f})')
    return f


def gate_allows(total):
    """The spend gate. Written so that NaN or infinity can never pass: every comparison must be true."""
    return math.isfinite(total) and total <= CAP_USD and total <= HARD_CAP_USD


def parse_json(data):
    try:
        return json.loads(data.decode('utf-8'), parse_constant=_reject_constant)
    except Exception:
        return None


def find_images(obj):
    """images[].url at the top level or one level down (result/output/data)."""
    if not isinstance(obj, dict):
        return []
    for holder in (obj, obj.get('result'), obj.get('output'), obj.get('data')):
        if isinstance(holder, dict) and isinstance(holder.get('images'), list):
            return [i.get('url') for i in holder['images'] if isinstance(i, dict) and i.get('url')]
    return []


class Spike:
    def __init__(self, key, ledger_path=LEDGER, http=real_http, raw_dir=None, sleep=time.sleep,
                 clock=time.monotonic, inspector=None):
        self.key_id, self.secret = key
        self.ledger = Ledger(ledger_path)
        self.http = http
        self.sleep = sleep
        self.clock = clock
        self.inspector = inspector or run_inspector
        raw = Path(raw_dir or os.path.join(tempfile.gettempdir(), 'higgsfield-spike-raw')).resolve()
        if raw == REPO or REPO in raw.parents:
            raise Refuse(1, f'raw download dir must be outside the repository: {raw}')
        self.raw_dir = raw

    # -- transport
    def _authed(self, method, url, body=None, extra=None):
        s = urllib.parse.urlsplit(url)
        if s.scheme != 'https' or s.hostname != API_HOST:
            raise Refuse(1, f'refusing to send the key to {s.scheme}://{s.hostname} (only {API_HOST})')
        headers = {'Authorization': f'Key {self.key_id}:{self.secret}', 'Accept': 'application/json', **(extra or {})}
        if body is not None:
            headers['Content-Type'] = 'application/json'
        return self.http(method, url, headers, None if body is None else canon(body).encode(), HTTP_TIMEOUT_S)

    def estimate(self, endpoint, body):
        """Returns (http_status, credits, usd, scrubbed_reply_or_None, est_source, note).

        est_source is 'api' for a 2xx with a numeric usd; 'assumed' (usd = ASSUMED_USD) when the route gave no
        quote (404, or a 2xx JSON object whose usd is absent or null, such as a pricing description) and the body
        is 1k/low; None when the call is not priced. A 5xx, transport failure, unparseable 2xx (including NaN or
        Infinity constants) or a malformed, non-finite or negative usd -> Ambiguous."""
        check_endpoint(endpoint)
        status, _, data = self._authed('POST', f'{API}/estimate/{endpoint}', body)
        if status >= 500:
            raise Ambiguous(f'estimate {endpoint}: HTTP {status}: {scrub(data[:2000].decode("utf-8", "replace"))}')
        doc = parse_json(data)
        reply = scrub(data[:4000].decode('utf-8', 'replace'))
        if 200 <= status < 300:
            if not isinstance(doc, dict):
                raise Ambiguous(f'estimate {endpoint}: HTTP {status} with an unparseable body')
            try:
                usd = parse_quote(doc)
            except ValueError as e:  # a quote was given but is malformed: never fall back to the assumed price
                raise Ambiguous(f'estimate {endpoint}: HTTP {status} with a malformed price quote ({e})')
            if usd is not None:
                return status, doc.get('credits'), usd, None, 'api', None
            no_quote_note = ASSUMED_NOTE_DESC  # 2xx with no usd (absent or null): a description, not a quote
        elif status == 404:
            no_quote_note = ASSUMED_NOTE_404
        else:
            return status, None, None, reply, None, None
        if assumed_price_applies(body):
            return status, None, ASSUMED_USD, reply, 'assumed', no_quote_note
        return status, None, None, reply, None, no_quote_note

    # -- the paid path
    def submit(self, label, endpoint, body):
        """One logical paid call: estimate, gate, reserve (once), submit (never retried), poll, download, inspect."""
        check_endpoint(endpoint)
        est_body = {k: v for k, v in body.items() if k not in PROBE_FIELDS}
        stripped = sorted(set(body) - set(est_body))
        bh = body_hash(body)
        est_status, credits, usd, est_err, est_source, est_note = self.estimate(endpoint, est_body)
        if usd is None and est_note:  # no quote (404 or description-only) and the body is not 1k/low
            self.ledger.append(event='refused', label=label, endpoint=endpoint, body_hash=bh, http_status=est_status,
                               error_body=est_err, reason='no quote from the estimate route and body is not 1k/low; '
                                                         'not priced')
            raise Refuse(3, f'{label}: the estimate route gave no quote (HTTP {est_status}) and the body is not '
                            f'1k/low, so the call cannot be priced; not submitted')
        if usd is None:
            self.ledger.append(event='estimate_rejected', label=label, endpoint=endpoint, body_hash=bh,
                               http_status=est_status, error_body=est_err, estimate_body_stripped=stripped)
            say({'label': label, 'step': 'estimate_rejected', 'http_status': est_status, 'error_body': est_err})
            return {'label': label, 'outcome': 'estimate_rejected', 'http_status': est_status}
        cum = self.ledger.reserved_usd()
        total = round(cum + usd, 6)
        if not gate_allows(total):
            self.ledger.append(event='refused', label=label, endpoint=endpoint, body_hash=bh, est_credits=credits,
                               est_usd=usd, est_source=est_source, cum_est_usd=cum, would_be_usd=total)
            raise Refuse(3, f'spend gate: reserved ${cum:.4f} + estimate ${usd:.4f} ({est_source}) = ${total:.4f} > '
                            f'${CAP_USD:.2f}; {label} not submitted')
        idem = str(uuid.uuid4())
        note = {'est_note': est_note, 'est_reply': est_err} if est_source == 'assumed' else {}
        self.ledger.append(event='reserve', label=label, endpoint=endpoint, body=body, body_hash=bh,
                           estimate_body_stripped=stripped, est_credits=credits, est_usd=usd, est_source=est_source,
                           cum_est_usd=total, idempotency_key=idem, **note)
        say({'label': label, 'step': 'reserved', 'est_usd': usd, 'est_source': est_source, 'cum_est_usd': total})
        t0 = self.clock()
        try:
            status, _, data = self._authed('POST', f'{API}/{endpoint}', body, {'Idempotency-Key': idem})
        except (Ambiguous, Offline) as e:
            self._stop(label, endpoint, bh, idem, f'submit transport failure: {e}')
        doc = parse_json(data)
        if status >= 500 or (200 <= status < 300 and not isinstance(doc, dict)) or 300 <= status < 400:
            self._stop(label, endpoint, bh, idem, f'submit HTTP {status}: {data[:2000].decode("utf-8", "replace")}',
                       http_status=status)
        if status == 404:  # the generation route itself is absent: the only evidence 'absent' accepts
            err = scrub(data[:4000].decode('utf-8', 'replace'))
            self.ledger.append(event='absent', label=label, endpoint=endpoint, body_hash=bh, idempotency_key=idem,
                               http_status=status, final_status='absent', error_body=err, cum_est_usd=total)
            say({'label': label, 'step': 'absent', 'http_status': status, 'error_body': err})
            return {'label': label, 'outcome': 'absent', 'http_status': status, 'error_body': err}
        if status >= 400:
            err = scrub(data[:4000].decode('utf-8', 'replace'))
            self.ledger.append(event='rejected', label=label, endpoint=endpoint, body_hash=bh, idempotency_key=idem,
                               http_status=status, final_status='rejected', error_body=err, cum_est_usd=total)
            say({'label': label, 'step': 'rejected', 'http_status': status, 'error_body': err})
            if status not in (400, 404, 422):  # auth, payment, rate limit, conflict: later calls would fail too
                raise Refuse(4, f'{label}: HTTP {status} is not a schema rejection; stopping the run')
            return {'label': label, 'outcome': 'rejected', 'http_status': status, 'error_body': err}
        request_id = doc.get('request_id') or doc.get('id')
        self.ledger.append(event='submitted', label=label, endpoint=endpoint, body_hash=bh, idempotency_key=idem,
                           http_status=status, request_id=request_id, status=doc.get('status'),
                           status_url=doc.get('status_url'))
        final = self._poll(label, endpoint, bh, idem, doc, t0)
        latency = round(self.clock() - t0, 1)
        fstatus = final.get('status')
        urls = find_images(final)
        if fstatus != 'completed' or not urls:
            self.ledger.append(event='result', label=label, endpoint=endpoint, body_hash=bh, idempotency_key=idem,
                               request_id=request_id, final_status=fstatus, images=len(urls), latency_s=latency,
                               cum_est_usd=total)
            say({'label': label, 'step': 'final', 'final_status': fstatus, 'images': len(urls)})
            return {'label': label, 'outcome': fstatus or 'unknown', 'request_id': request_id}
        files = []
        for i, u in enumerate(urls):
            files.append(self._download_and_inspect(label, endpoint, bh, idem, request_id, i, u, latency, total))
        return {'label': label, 'outcome': 'completed', 'request_id': request_id, 'files': files}

    def _stop(self, label, endpoint, bh, idem, message, **extra):
        msg = scrub(message)
        self.ledger.append(event='stopped', label=label, endpoint=endpoint, body_hash=bh, idempotency_key=idem,
                           final_status='ambiguous', error=msg, **extra)
        raise Refuse(4, f'{label}: ambiguous outcome, not retried; run stopped. {msg}. '
                        f'Check the Higgsfield console before any further paid call.')

    def _poll(self, label, endpoint, bh, idem, doc, t0):
        errors = 0
        while doc.get('status') not in TERMINAL:
            if self.clock() - t0 > POLL_DEADLINE_S:
                self._stop(label, endpoint, bh, idem, f'poll deadline {POLL_DEADLINE_S}s passed at status '
                                                      f'{doc.get("status")!r}')
            status_url = doc.get('status_url')
            if not status_url:
                self._stop(label, endpoint, bh, idem, 'non-terminal reply without status_url')
            su = urllib.parse.urlsplit(status_url)
            if su.scheme != 'https' or su.hostname != API_HOST:
                self._stop(label, endpoint, bh, idem, f'status_url host {su.hostname} is not {API_HOST}; '
                                                      'the key is not sent there')
            self.sleep(POLL_INTERVAL_S)
            try:
                status, _, data = self._authed('GET', status_url)
                nxt = parse_json(data)
                if status != 200 or not isinstance(nxt, dict):
                    raise Ambiguous(f'status poll HTTP {status}')
            except (Ambiguous, Offline) as e:
                errors += 1  # a status GET is not the paid call; tolerate a few transient misses
                if errors >= 3:
                    self._stop(label, endpoint, bh, idem, f'status polling failed three times: {e}')
                continue
            errors = 0
            nxt.setdefault('status_url', status_url)
            doc = nxt
        return doc

    def _download_and_inspect(self, label, endpoint, bh, idem, request_id, i, url, latency, total):
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        try:
            status, headers, data = self.http('GET', url, {}, None, HTTP_TIMEOUT_S)  # no key on result URLs
        except (Ambiguous, Offline) as e:
            status, headers, data = None, {}, b''
            err = scrub(str(e))
        else:
            err = None if status == 200 and len(data) <= MAX_DOWNLOAD_BYTES else f'download HTTP {status}'
        ctype = next((v for k, v in headers.items() if k.lower() == 'content-type'), None)
        row = dict(event='result', label=label, endpoint=endpoint, body_hash=bh, idempotency_key=idem,
                   request_id=request_id, final_status='completed', latency_s=latency, image_index=i,
                   image_url=url_noquery(url), url_ext=url_ext(url), content_type=ctype, cum_est_usd=total)
        if err:
            row.update(download_error=err)
            self.ledger.append(**row)
            say({'label': label, 'step': 'download_failed', 'error': err})
            return row
        safe_label = re.sub(r'[^A-Za-z0-9._-]+', '-', label)
        name = f'{safe_label}-{(request_id or "noid")[:12]}-{i}.{url_ext(url) or "bin"}'
        out = self.raw_dir / name
        out.write_bytes(data)
        row.update(file=name, bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        try:
            row['inspection'] = self.inspector(out)
        except Exception as e:
            row['inspection_error'] = scrub(str(e))
        self.ledger.append(**row)
        say({'label': label, 'step': 'inspected', 'file': name, 'content_type': ctype,
             'real_alpha': (row.get('inspection') or {}).get('real_alpha')})
        return row


def run_inspector(path):
    p = subprocess.run(['node', str(INSPECTOR), str(path)], capture_output=True, text=True, timeout=180)
    lines = [l for l in p.stdout.splitlines() if l.strip()]
    if not lines:
        raise RuntimeError(f'inspector exit {p.returncode}: {p.stderr.strip()[-500:]}')
    return json.loads(lines[-1])


# ---------------------------------------------------------------- matrix and discovery

def matrix_steps():
    steps = []
    for ep in MATRIX_ENDPOINTS:
        short = ep.rsplit('/', 1)[-1]
        base = {'prompt': P, 'resolution': '1k', 'quality': 'low'}
        steps.append((ep, f'{short}-a-background', {**base, 'background': 'transparent'}))
        steps.append((ep, f'{short}-b-output_format', {**base, 'output_format': 'png'}))
        steps.append((ep, f'{short}-c-both', {**base, 'background': 'transparent', 'output_format': 'png'}))
        for n in (1, 2, 3):
            steps.append((ep, f'{short}-d-prompt-{n}', {'prompt': P2, 'resolution': '1k', 'quality': 'low',
                                                        'aspect_ratio': '1:1', 'enhance_prompt': False}))
    return steps


def run_matrix(spike, dry_run=False):
    absent, projected = set(), 0.0
    for n, (ep, label, body) in enumerate(matrix_steps(), 1):
        say({'matrix_step': n, 'label': label, 'endpoint': ep, 'dry_run': dry_run})
        if ep in absent:
            spike.ledger.append(event='skipped', label=label, endpoint=ep,
                                reason='endpoint absent (the paid POST returned 404)')
            continue
        if dry_run:  # an estimate 404 is not evidence of absence, so a dry run never skips an endpoint
            est_body = {k: v for k, v in body.items() if k not in PROBE_FIELDS}
            status, credits, usd, err, source, note = spike.estimate(ep, est_body)
            spike.ledger.append(event='estimate', label=label, endpoint=ep, body_hash=body_hash(body),
                                http_status=status, est_credits=credits, est_usd=usd, est_source=source,
                                est_note=note, error_body=err, dry_run=True)
            projected = round(projected + (usd or 0), 6)
            say({'label': label, 'http_status': status, 'est_usd': usd, 'est_source': source,
                 'projected_usd': projected, 'reserved_so_far': spike.ledger.reserved_usd()})
            continue
        res = spike.submit(label, ep, body)
        if res.get('outcome') == 'absent':
            absent.add(ep)
    if dry_run:
        say({'dry_run_projected_usd': projected, 'reserved_so_far': spike.ledger.reserved_usd(), 'cap_usd': CAP_USD})
    return projected


def run_discover(spike):
    for ep in DISCOVER_ENDPOINTS:
        status, credits, usd, err, source, _ = spike.estimate(ep, {'prompt': P})
        # Estimate-only: a 404 here says nothing about the generation route, which is never called by discover.
        verdict = 'estimate-route-404 (generation endpoint unverified)' if status == 404 else 'estimate-route-present'
        spike.ledger.append(event='discover', label='discover', endpoint=ep, http_status=status, est_credits=credits,
                            est_usd=usd, est_source=source, error_body=err, verdict=verdict)
        say({'endpoint': ep, 'http_status': status, 'verdict': verdict, 'est_usd': usd, 'error_body': err})


# ---------------------------------------------------------------- secret scan

def scan_secrets(key_id, secret, paths, repo=REPO, include_git=True):
    """Returns a list of (source, which) hits. Never returns or prints the values themselves."""
    needles = {'key id': key_id.encode(), 'secret': secret.encode()}
    sources = []
    if include_git:
        diff = subprocess.run(['git', '-C', str(repo), 'diff', '--cached', '--no-color'], capture_output=True)
        if diff.returncode != 0:
            raise Refuse(1, 'git diff --cached failed')
        sources.append(('staged diff', diff.stdout))
        names = subprocess.run(['git', '-C', str(repo), 'diff', '--cached', '--name-only', '-z', '--diff-filter=d'],
                               capture_output=True).stdout.split(b'\0')
        for name in filter(None, names):  # staged blobs too, so binary files are searched by content
            blob = subprocess.run(['git', '-C', str(repo), 'show', b':' + name], capture_output=True).stdout
            sources.append(('staged ' + name.decode('utf-8', 'replace'), blob))
    for p in paths:
        p = Path(p)
        if p.exists():
            sources.append((str(p.name), p.read_bytes()))
    return [(src, which) for src, data in sources for which, n in needles.items() if n in data]


# ---------------------------------------------------------------- selftest

def selftest():
    """Offline controls. No network: the HTTP layer is a fake and the offline guard is on for every subprocess."""
    os.environ['HIGGSFIELD_SPIKE_OFFLINE'] = '1'
    results = []
    tmp = Path(tempfile.mkdtemp(prefix='higgsfield-selftest-'))
    dummy_id, dummy_secret = 'dummyid', 'dummysecret'

    def control(name, fn):
        try:
            detail = fn()
            results.append((name, True, detail))
        except Exception as e:
            results.append((name, False, scrub(f'{type(e).__name__}: {e}')))

    def dummy_key(mode, name='key.txt'):
        p = tmp / name
        p.write_text(f'{dummy_id}:{dummy_secret}\n')
        os.chmod(p, mode)
        return p

    class Fake:
        """Records calls and answers from a script; never touches the network."""
        def __init__(self, estimate_usd=0.094, submit=(200, {'status': 'queued', 'request_id': 'req-abc123',
                                                            'status_url': f'{API}/requests/req-abc123/status'}),
                     estimate_status=200):
            self.calls, self.estimate_usd, self.submit_reply, self.png = [], estimate_usd, submit, None
            self.estimate_status = estimate_status

        def __call__(self, method, url, headers, body, timeout):
            self.calls.append((method, url))
            if '/estimate/' in url:
                if isinstance(self.estimate_status, bytes):  # a raw 200 body, e.g. a malformed quote
                    return 200, {}, self.estimate_status
                if self.estimate_status == 'description':  # the live Flare/Sunburst shape: 200, no numeric usd
                    return 200, {}, json.dumps({'type': 'description', 'pricing_description':
                                                'Per 1M tokens: text input $5, image output $30. The initial charge '
                                                'is an estimate reconciled on completion.'}).encode()
                if self.estimate_status != 200:
                    return self.estimate_status, {}, b'{"detail":"Not Found"}'
                return 200, {}, json.dumps({'credits': 2, 'usd': self.estimate_usd}).encode()
            if method == 'POST':
                code, doc = self.submit_reply(url) if callable(self.submit_reply) else self.submit_reply
                return code, {}, (doc if isinstance(doc, bytes) else json.dumps(doc).encode())
            if url.endswith('/status'):
                assert headers.get('Authorization'), 'status poll must be authenticated'
                return 200, {}, json.dumps({'status': 'completed', 'request_id': 'req-abc123', 'images': [
                    {'url': 'https://cdn.example.invalid/out/abc.png?sig=xyz'}]}).encode()
            assert 'Authorization' not in headers, 'the key must not be sent to result URLs'
            return 200, {'Content-Type': 'image/png'}, self.png

    def c1():
        p = dummy_key(0o644, 'key644.txt')
        reads = []
        import builtins
        orig = builtins.open

        def guarded_open(f, *a, **k):
            if str(f) == str(p):
                reads.append(f)
                raise AssertionError('key file contents were opened')
            return orig(f, *a, **k)
        builtins.open = guarded_open
        try:
            try:
                load_key(str(p), reader=lambda path: reads.append(path) or '')
                raise AssertionError('mode 644 was accepted')
            except Refuse as e:
                assert e.code == 2 and 'chmod 600' in str(e), f'wrong refusal: {e.code}'
        finally:
            builtins.open = orig
        assert not reads, 'the key file was read before the mode check refused it'
        out = subprocess.run([sys.executable, __file__, 'estimate', '--endpoint', 'x', '--body', '{}'],
                             env={**os.environ, 'HIGGSFIELD_KEY_FILE': str(p)}, capture_output=True, text=True)
        assert out.returncode == 2 and 'chmod 600' in out.stderr, f'CLI exit {out.returncode}'
        return 'mode 644 refused with exit 2 and a chmod 600 hint; zero reads of the file (in-process and CLI)'

    def c2():
        key = load_key(str(dummy_key(0o600)))
        ledger = tmp / 'c2-ledger.jsonl'
        fake = Fake(submit=(422, f'{{"detail":"bad header Key {dummy_id}:{dummy_secret} for {dummy_id}"}}'.encode()))
        buf_out, buf_err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(buf_out), contextlib.redirect_stderr(buf_err):
            res = Spike(key, ledger, fake, raw_dir=tmp / 'raw').submit('c2', 'marketing-studio/image/flare',
                                                                       {'prompt': 'x', 'background': 'transparent'})
        text = ledger.read_text()
        assert res['outcome'] == 'rejected' and '***' in res['error_body'], 'rejection not recorded scrubbed'
        assert 'Key ***' in text, 'ledger row lacks the scrubbed body'
        for blob in (text, buf_out.getvalue(), buf_err.getvalue()):
            assert dummy_id not in blob and dummy_secret not in blob, 'secret leaked'
        hits = scan_secrets(dummy_id, dummy_secret, [ledger], include_git=False)
        assert not hits, f'scan found {hits}'
        est_body = [c for c in fake.calls if '/estimate/' in c[1]]
        assert len(est_body) == 1, 'estimate must run once per logical call'
        return 'mock 422 echoing the key recorded as "Key ***"; stdout/ledger clean; secret scan passes'

    def c3():
        key = load_key(str(dummy_key(0o600)))
        ledger = tmp / 'c3-ledger.jsonl'
        Ledger(ledger).append(event='reserve', label='selftest-seed', est_usd=1.80, cum_est_usd=1.80)
        fake = Fake()
        fake.png = (ROOT.parent / '2026-10-08-solar-system/assets/web/mercury.png').read_bytes()
        spike = Spike(key, ledger, fake, raw_dir=tmp / 'raw', sleep=lambda s: None)
        with contextlib.redirect_stdout(io.StringIO()):
            first = spike.submit('c3-first', 'marketing-studio/image/flare', {'prompt': 'x', 'output_format': 'png'})
        assert first['outcome'] == 'completed', f'first call not accepted: {first}'
        assert abs(spike.ledger.reserved_usd() - 1.894) < 1e-9, 'reserved total should be 1.894'
        posts = sum(1 for m, u in fake.calls if m == 'POST' and '/estimate/' not in u)
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                spike.submit('c3-second', 'marketing-studio/image/flare', {'prompt': 'x'})
            raise AssertionError('second call was not refused')
        except Refuse as e:
            assert e.code == 3 and '1.9880' in str(e), f'wrong refusal {e.code}: {e}'
        posts_after = sum(1 for m, u in fake.calls if m == 'POST' and '/estimate/' not in u)
        assert posts_after == posts, 'a refused call reached the submit endpoint'
        rows = spike.ledger.rows()
        reserve = [r for r in rows if r['event'] == 'reserve' and r['label'] == 'c3-first'][0]
        assert reserve['estimate_body_stripped'] == ['output_format'], 'probe field not stripped for the estimate'
        assert reserve['idempotency_key'], 'idempotency key not persisted before the request'
        insp = [r for r in rows if r['event'] == 'result'][0]['inspection']
        assert insp['real_alpha'] is True, 'pipeline inspection of a transparent PNG failed'
        assert [r['event'] for r in rows if r['label'] == 'c3-second'] == ['refused']
        return '$1.80 seed: first $0.094 accepted (1.894, polled, downloaded, inspected); second refused at 1.988, exit 3, no submit'

    def c4():
        key_file = dummy_key(0o600)
        ledger = tmp / 'c4-ledger.jsonl'
        with exclusive_lock(ledger):
            out = subprocess.run([sys.executable, __file__, '--ledger', str(ledger), 'estimate', '--endpoint',
                                  'marketing-studio/image/flare', '--body', '{"prompt":"x"}'],
                                 env={**os.environ, 'HIGGSFIELD_KEY_FILE': str(key_file)}, capture_output=True,
                                 text=True)
        assert out.returncode == 5 and 'another spike process' in out.stderr, f'second process exit {out.returncode}'
        assert dummy_secret not in out.stdout + out.stderr
        with exclusive_lock(ledger):
            pass
        return 'second process refused with exit 5 while the lock was held; lock reacquired after release'

    def c5():
        throwaway = tmp / 'throwaway.txt'
        throwaway.write_text(f'note: {dummy_id} should never be here\n')
        hits = scan_secrets(dummy_id, dummy_secret, [throwaway], include_git=False)
        assert hits == [('throwaway.txt', 'key id')], f'file scan did not fire: {hits}'
        throwaway.unlink()
        assert not scan_secrets(dummy_id, dummy_secret, [throwaway], include_git=False)
        repo = tmp / 'scanrepo'
        subprocess.run(['git', 'init', '-q', str(repo)], check=True)
        (repo / 'leak.txt').write_text(f'{dummy_id}\n')
        subprocess.run(['git', '-C', str(repo), 'add', 'leak.txt'], check=True)
        hits = scan_secrets(dummy_id, dummy_secret, [], repo=repo)
        assert ('staged diff', 'key id') in hits, f'staged diff scan did not fire: {hits}'
        subprocess.run(['git', '-C', str(repo), 'rm', '-q', '--cached', 'leak.txt'], check=True)
        assert not scan_secrets(dummy_id, dummy_secret, [], repo=repo), 'scan still fails after unstaging'
        return 'scan fails on a throwaway file and on a staged file holding the key ID; passes after removal'

    def c6():
        transparent = ROOT.parent / '2026-10-08-solar-system/assets/web/earth.png'
        opaque = ROOT.parent / '2026-10-08-solar-system/solar-system.png'
        a, b = run_inspector(transparent), run_inspector(opaque)
        assert a['real_alpha'] is True and a['hasAlphaChannel'] and a['minAlpha'] == 0, f'transparent: {a}'
        assert b['real_alpha'] is False and b['minAlpha'] == 255 and b['opaqueCornerCount'] == 4, f'opaque: {b}'
        return (f"earth.png real_alpha true (colorType {a['png']['colorType']}, transparent {a['transparentPixelRatio']}); "
                f"solar-system.png real_alpha false (colorType {b['png']['colorType']}, minAlpha 255, 4 opaque corners)")

    def c7():
        key = load_key(str(dummy_key(0o600)))
        posts = lambda f: [u for m, u in f.calls if m == 'POST' and '/estimate/' not in u]
        failed = (200, {'status': 'failed', 'request_id': 'req-c7'})  # terminal and uncharged: no download needed
        # No quote from the estimate route (404, or the live 200 description-only reply): a 1k/low body is reserved
        # at the assumed price with the matching note and submitted; a 2k body is refused (exit 3), never submitted.
        for n, (reply, note_word) in enumerate(((404, '404'), ('description', 'pricing description'))):
            fake = Fake(estimate_status=reply, submit=failed)
            spike = Spike(key, tmp / f'c7a{n}-ledger.jsonl', fake, raw_dir=tmp / 'raw', sleep=lambda s: None)
            with contextlib.redirect_stdout(io.StringIO()):
                res = spike.submit(f'c7-assumed-{reply}', 'marketing-studio/image/flare',
                                   {'prompt': 'x', 'resolution': '1k', 'quality': 'low', 'background': 'transparent'})
            assert res['outcome'] == 'failed' and len(posts(fake)) == 1, f'{reply}: 1k/low call not submitted: {res}'
            reserve = [r for r in spike.ledger.rows() if r['event'] == 'reserve'][0]
            assert reserve['est_source'] == 'assumed' and reserve['est_usd'] == ASSUMED_USD == 0.10, \
                f'{reply}: not reserved as assumed $0.10'
            assert note_word in reserve.get('est_note', '') and 'assumed $0.10 for 1k/low' in reserve['est_note'], \
                f'{reply}: assumed reserve lacks its note'
            fake2 = Fake(estimate_status=reply, submit=failed)
            spike2 = Spike(key, tmp / f'c7b{n}-ledger.jsonl', fake2, raw_dir=tmp / 'raw', sleep=lambda s: None)
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    spike2.submit('c7-2k', 'marketing-studio/image/flare',
                                  {'prompt': 'x', 'resolution': '2k', 'quality': 'low'})
                raise AssertionError(f'{reply}: 2k body without a quote was not refused')
            except Refuse as e:
                assert e.code == 3 and 'cannot be priced' in str(e), f'{reply}: wrong refusal {e.code}: {e}'
            assert not posts(fake2), f'{reply}: an unpriced call reached the submit endpoint'
            assert not [r for r in spike2.ledger.rows() if r['event'] == 'reserve'], f'{reply}: unpriced call reserved'
        # Dry run against description-only replies projects 12 x $0.10 and reports est_source per step.
        fake_d = Fake(estimate_status='description')
        spike_d = Spike(key, tmp / 'c7d-ledger.jsonl', fake_d, raw_dir=tmp / 'raw', sleep=lambda s: None)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            projected = run_matrix(spike_d, dry_run=True)
        steps = [json.loads(l) for l in out.getvalue().splitlines() if '"est_source"' in l]
        assert abs(projected - 1.20) < 1e-9, f'dry run projected {projected}, expected 1.20'
        assert len(steps) == 12 and all(s['est_source'] == 'assumed' for s in steps), 'est_source missing per step'
        assert not posts(fake_d) and spike_d.ledger.reserved_usd() == 0, 'dry run submitted or reserved'
        # A paid POST 404 on Flare is 'absent': the matrix skips Flare's later steps and still runs Sunburst.
        fake3 = Fake(submit=lambda url: (404, {'detail': 'Not Found'}) if url.endswith('/flare') else failed)
        spike3 = Spike(key, tmp / 'c7c-ledger.jsonl', fake3, raw_dir=tmp / 'raw', sleep=lambda s: None)
        with contextlib.redirect_stdout(io.StringIO()):
            run_matrix(spike3)
        flare_posts = [u for u in posts(fake3) if u.endswith('/flare')]
        sun_posts = [u for u in posts(fake3) if u.endswith('/sunburst')]
        rows = spike3.ledger.rows()
        skipped = [r['label'] for r in rows if r['event'] == 'skipped']
        assert len(flare_posts) == 1 and len(sun_posts) == 6, f'posts flare {len(flare_posts)} sunburst {len(sun_posts)}'
        assert [r['label'] for r in rows if r['event'] == 'absent'] == ['flare-a-background']
        assert len(skipped) == 5 and all(s.startswith('flare-') for s in skipped), f'skipped {skipped}'
        return ('no quote (404 or 200 description-only) on 1k/low reserved as assumed $0.10 with note and submitted; '
                'on 2k refused, exit 3, no submit; dry run projects 12 x $0.10 = $1.20 with est_source per step; '
                'paid POST 404 -> absent, matrix skipped 5 later Flare steps and ran 6 Sunburst steps')

    def c8():
        key = load_key(str(dummy_key(0o600)))
        failed = (200, {'status': 'failed', 'request_id': 'req-c8'})
        body = {'prompt': 'x', 'resolution': '1k', 'quality': 'low'}

        def attempt(raw, n):
            fake = Fake(estimate_status=raw, submit=failed)
            spike = Spike(key, tmp / f'c8-{n}-ledger.jsonl', fake, raw_dir=tmp / 'raw', sleep=lambda s: None)
            with contextlib.redirect_stdout(io.StringIO()):
                try:
                    return spike.submit(f'c8-{n}', 'marketing-studio/image/flare', body), spike, fake
                except Ambiguous as e:
                    return e, spike, fake

        paid = lambda f: [u for m, u in f.calls if m == 'POST' and '/estimate/' not in u]
        malformed = [b'{"usd":"$5.00"}', b'{"usd":["5.00"]}', b'{"usd":"NaN"}', b'{"usd":NaN}',
                     b'{"usd":"Infinity"}', b'{"usd":true}']
        for n, raw in enumerate(malformed):
            res, spike, fake = attempt(raw, n)
            assert isinstance(res, Ambiguous), f'{raw!r} did not stop the run: {res}'
            assert spike.ledger.reserved_usd() == 0 and not spike.ledger.rows(), f'{raw!r} reserved or logged a price'
            assert not paid(fake), f'{raw!r} reached the paid endpoint'
        for n, raw in enumerate((b'{"usd":null}', b'{"type":"description"}'), 10):
            res, spike, fake = attempt(raw, n)
            reserve = [r for r in spike.ledger.rows() if r['event'] == 'reserve']
            assert isinstance(res, dict) and len(paid(fake)) == 1, f'{raw!r} was not submitted: {res}'
            assert reserve and reserve[0]['est_source'] == 'assumed' and reserve[0]['est_usd'] == 0.10, f'{raw!r}'
        res, spike, fake = attempt(b'{"usd":"0.094","credits":1.5}', 20)
        reserve = [r for r in spike.ledger.rows() if r['event'] == 'reserve']
        assert reserve and reserve[0]['est_source'] == 'api' and reserve[0]['est_usd'] == 0.094, 'numeric string not api'
        # The gate on its own (fix B only): NaN or infinity can never pass, whatever the quote parser does.
        assert gate_allows(1.894) and not gate_allows(1.988), 'gate boundary wrong'
        for bad in (float('nan'), float('inf'), float('-inf')):
            assert gate_allows(bad) is False, f'gate let {bad} through'
        return ('$5.00, ["5.00"], "NaN", NaN, "Infinity", true -> stopped (Ambiguous), nothing reserved or POSTed; '
                'null and absent usd -> assumed $0.10; "0.094" -> api 0.094; gate refuses nan/inf/-inf')

    for name, fn in (('(i) mode-644 key refused before read', c1), ('(ii) mock 4xx scrubbed', c2),
                     ('(iii) spend gate 1.894 / 1.988', c3), ('(iv) second process refused', c4),
                     ('(v) secret scan red/green', c5), ('(vi) inspector controls', c6),
                     ('(vii) estimate-404 fallback and absent', c7),
                     ('(viii) malformed quotes stop the run', c8)):
        control(name, fn)
    shutil.rmtree(tmp, ignore_errors=True)  # dummy keys, temp ledgers, the throwaway repo
    for name, ok, detail in results:
        say(f"{'PASS' if ok else 'FAIL'} {name}: {detail}")
    failed = [r for r in results if not r[1]]
    say(f'selftest: {len(results) - len(failed)}/{len(results)} controls passed')
    return 1 if failed else 0


# ---------------------------------------------------------------- CLI

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--ledger', default=str(LEDGER), help='ledger path (default: spike-ledger.jsonl here)')
    ap.add_argument('--raw-dir', default=None, help='download dir, outside the repo (default $TMPDIR/higgsfield-spike-raw)')
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('selftest')
    e = sub.add_parser('estimate')
    e.add_argument('--endpoint', required=True)
    e.add_argument('--body', required=True)
    s = sub.add_parser('submit')
    s.add_argument('--label', required=True)
    s.add_argument('--endpoint', required=True)
    s.add_argument('--body', required=True)
    m = sub.add_parser('matrix')
    m.add_argument('--dry-run', action='store_true', help='estimates only; nothing reserved or submitted')
    sub.add_parser('discover')
    sc = sub.add_parser('scan-secrets')
    sc.add_argument('--paths', nargs='*', default=None, help='files to scan besides the staged diff')
    args = ap.parse_args(argv)
    try:
        if args.cmd == 'selftest':
            return selftest()
        key = load_key()
        if args.cmd == 'scan-secrets':
            paths = args.paths if args.paths is not None else [args.ledger, ROOT / 'FINDINGS.md']
            hits = scan_secrets(*key, paths)
            for src, which in hits:
                say(f'SECRET FOUND: {which} in {src}', sys.stderr)
            say('secret scan: ' + ('FAIL' if hits else 'clean (staged diff, ' + ', '.join(Path(p).name for p in paths) + ')'))
            return 1 if hits else 0
        with exclusive_lock(args.ledger):
            spike = Spike(key, args.ledger, raw_dir=args.raw_dir)
            if args.cmd == 'estimate':
                body = json.loads(args.body)
                status, credits, usd, err, source, note = spike.estimate(args.endpoint, body)
                spike.ledger.append(event='estimate', label='cli', endpoint=args.endpoint, body_hash=body_hash(body),
                                    http_status=status, est_credits=credits, est_usd=usd, est_source=source,
                                    est_note=note, error_body=err)
                say({'endpoint': args.endpoint, 'http_status': status, 'credits': credits, 'usd': usd,
                     'est_source': source, 'est_note': note, 'error_body': err})
                return 0 if usd is not None else 1
            if args.cmd == 'submit':
                say(spike.submit(args.label, args.endpoint, json.loads(args.body)))
                return 0
            if args.cmd == 'matrix':
                run_matrix(spike, args.dry_run)
                return 0
            if args.cmd == 'discover':
                run_discover(spike)
                return 0
    except Refuse as e:
        say(f'REFUSED (exit {e.code}): {e}', sys.stderr)
        return e.code
    except (Ambiguous, Offline) as e:
        say(f'STOPPED (exit 4): ambiguous failure, nothing retried: {e}', sys.stderr)
        return 4
    except Exception:
        say(traceback.format_exc(), sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
