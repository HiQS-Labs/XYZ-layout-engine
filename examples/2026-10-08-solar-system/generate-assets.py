import argparse
import concurrent.futures
import fcntl
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent

style='Create ONE isolated astronomy illustration asset for a sophisticated museum-quality solar-system infographic. Photorealistic scientific illustration with beautiful restrained detail, clean silhouette and consistent studio illumination from upper left. Entire subject fully visible centered, generous 12 percent transparent padding. Transparent background, genuinely clear alpha outside the subject. No black rectangle, no stars in the background, no ground, no cast shadow, no caption, no typography, no diagram, no other planets. '
subjects = {
 'sun':'A standalone schematic illustration of the Sun, complete full circle, extremely bright center fading out to an intricate active corona of solar flares and magnetic loops, face-on. Warm yellow and bright orange tones. No planets, no background starfield, no black rectangle; flares must fade smoothly to transparent space. Educational astronomical illustration.',
 'mercury':'A standalone schematic illustration of Mercury, complete full circle, face-on. Grey, heavily cratered rocky surface similar to the Moon but with distinct thrust faults and ridges. Sharp terminator, no atmosphere. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'venus':'A standalone schematic illustration of Venus, complete full circle, face-on. Featureless thick opaque pale-yellow/white cloud cover with subtle chevron or V-shaped atmospheric bands. No surface details visible. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'earth':'A standalone schematic illustration of Earth, complete full circle, face-on. Vibrant deep blue oceans, varied green/brown continents, swirling white dynamic cloud patterns. Thin blue atmospheric haze at the limb. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'moon':'A standalone schematic illustration of Earth\'s Moon, complete full circle, face-on. Bright grey heavily cratered highlands and dark smooth basaltic maria (seas). Sharp terminator, no atmosphere. No Earth, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'mars':'A standalone schematic illustration of Mars, complete full circle, face-on. Rusty red and orange dusty surface, distinct dark albedo features (like Syrtis Major), subtle white polar ice cap. Thin wispy atmosphere at the limb. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'jupiter':'A standalone schematic illustration of Jupiter, complete full circle, face-on. Distinct horizontal bands of turbulent clouds in cream, brown, orange, and white. Prominent Great Red Spot visible. Complex swirling storms at band boundaries. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'saturn':'A standalone schematic illustration of Saturn with its rings, oblique view. Pale gold and muted yellow-brown banded atmosphere. Spectacular, expansive, complex ring system (A, B, C rings with Cassini division) encircling the planet, correctly casting a shadow on the globe and the globe casting a shadow on the rings behind. Rings fade to transparent. No Sun, no background starfield; educational astronomical illustration.',
 'uranus':'A standalone schematic illustration of Uranus, complete full circle, face-on. Featureless smooth pale cyan/light-blue atmosphere. Very subtle, almost invisible vertical banding. Faint, dark, extremely thin vertical ring system just visible. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'neptune':'A standalone schematic illustration of Neptune, complete full circle, face-on. Deep vivid azure blue atmosphere. Subtle high-altitude white cirrus clouds and a dark blue oval storm feature. No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'pluto':'A standalone schematic illustration of Pluto, complete full circle, face-on. High contrast surface with pale tan, reddish-brown, and dark charcoal areas. Prominent bright heart-shaped nitrogen ice feature (Tombaugh Regio). No Sun, no background starfield, no black rectangle; edges fade cleanly to transparent space. Educational astronomical illustration.',
 'asteroid-belt':'A standalone schematic asteroid belt: a complete thin horizontal elliptical annulus of many tiny individually separated irregular grey and warm-brown rocky asteroids, viewed obliquely. Ring is wide, about 85 percent canvas width and 30 percent canvas height, large empty transparent center. Rocks small, sparse and fine, not a continuous solid ring, avoid boulders filling entire center. No Sun or planets. This is an exaggerated-density illustration of the main asteroid belt, not a dense physical barrier. Genuine transparency between rocks and inside the ellipse.',
 'milky-way':'The Milky Way alone as an artist impression schematic face-on barred spiral galaxy, centered round-ish disk, luminous pale gold central bar, sweeping elegant blue-white spiral arms and subtle warm dust lanes. Entire galaxy fits at 85 percent canvas width. No labels, no location marker, no foreground planets, no black rectangle, no background starfield beyond the galaxy; galaxy fades smoothly to transparent space outside its disk. Educational astronomical illustration, not a claimed photograph.'
}
jobs=[{'id':k,'prompt':style+v,'model':'gpt-image-2.5-flare','size':'1024x1024','quality':'medium','background':'transparent'} for k,v in subjects.items()]

def job_digest(job):
    core = dict(job)
    core['reference_digests'] = [hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in job.get('references', [])]
    return hashlib.sha256(json.dumps(core, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def read_manifest_internal(path):
    if path.is_symlink():
        raise ValueError('unsafe manifest symlink; reconcile before dispatch')
    if not path.exists():
        return {}
    if path.stat().st_size > 8 * 1024 * 1024:
        raise ValueError('unsafe manifest or manifest byte budget exceeded')
    data = json.loads(path.read_text())
    if not isinstance(data, dict) or any(not isinstance(v, dict) or v.get('status') not in ('pending', 'in-flight', 'complete', 'unknown', 'failed') for v in data.values()):
        raise ValueError('invalid manifest; reconcile before dispatch')
    return data


def read_manifest(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path.parent / 'manifest.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_SH)
        return read_manifest_internal(path)


def update_manifest(path, digest, updates):
    import tempfile
    with open(path.parent / 'manifest.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        manifest = read_manifest_internal(path)
        manifest.setdefault(digest, {}).update(updates)
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, delete=False) as output:
                temporary = Path(output.name)
                json.dump(manifest, output, indent=2, ensure_ascii=False, allow_nan=False)
                output.flush()
                os.fsync(output.fileno())
            os.replace(temporary, path)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
        return manifest[digest]


def validate_output(out, receipt, state=None, background='transparent', expected_recipe=None, max_attempts=1, deadline=None):
    try:
        if any(p.is_symlink() or not p.is_file() or p.stat().st_size > 35 * 1024 * 1024 for p in (out, receipt)):
            return False
        result = json.loads(receipt.read_text())
        if not isinstance(result, dict):
            return False
        attempts = result.get('attempts')
        count = len(attempts) if isinstance(attempts, list) else attempts
        if expected_recipe is not None and result.get('recipeRef') != expected_recipe or not isinstance(count, int) or isinstance(count, bool) or not 1 <= count <= max_attempts:
            return False
        image = result.get('image', {})
        digest = hashlib.sha256(out.read_bytes()).hexdigest()
        if result.get('status') not in ('success', 'ok') or image.get('sha256') != digest or image.get('bytes') != out.stat().st_size:
            return False
        if state and (state.get('image_sha256') != digest or state.get('receipt_sha256') != hashlib.sha256(receipt.read_bytes()).hexdigest()):
            return False
        if background == 'transparent':
            alpha = result.get('alpha', {})
            if not isinstance(alpha, dict) or alpha.get('verified') is not True or alpha.get('hasAlphaChannel') is not True or not 0 < alpha.get('transparentPixelRatio', 0) <= 1:
                return False
        # Reuse the existing bounded CRC/inflate PNG admission owner, rather than add a decoder.
        inspector = ROOT.parent.parent / 'tools/spike/assets.mjs'
        script = "import {readFileSync} from 'node:fs'; import {Resvg} from '@resvg/resvg-js'; const {inspectPng}=await import(process.argv[2]); const bytes=readFileSync(process.argv[1]); const {width,height}=inspectPng(bytes); if(process.argv[3]==='transparent'){ const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><image width='${width}' height='${height}' href='data:image/png;base64,${bytes.toString('base64')}'/></svg>`; const pixels=new Resvg(svg).render().pixels; let transparent=false; for(let i=3;i<pixels.length;i+=4) if(pixels[i]<255){transparent=true;break;} if(!transparent) process.exit(1); }"
        remaining = min(10, deadline - time.monotonic()) if deadline else 10
        if remaining <= 0:
            return False
        probe = subprocess.run(['node', '--input-type=module', '-e', script, str(out), inspector.as_uri(), background], capture_output=True, timeout=remaining, cwd=ROOT.parent.parent)
        return probe.returncode == 0 and (deadline is None or time.monotonic() < deadline)
    except (OSError, ValueError, TypeError, subprocess.SubprocessError):
        return False


def admit_jobs(job_list, caller):
    import math
    import re
    if not caller.is_file() or caller.is_symlink():
        raise ValueError('configured caller must be a regular file')
    manifest_path = caller.parent.parent / 'assets/image-manifest.json'
    manifest_bytes = manifest_path.read_bytes() if manifest_path.exists() else b''
    recipe = json.loads(manifest_bytes)['recipes']['image_generation'] if manifest_bytes else 'configured-caller:' + hashlib.sha256(caller.read_bytes()).hexdigest()
    caller_digest = hashlib.sha256(caller.read_bytes()).hexdigest()
    if not isinstance(job_list, list) or len(job_list) > 32:
        raise ValueError('jobs must be a list of at most 32 exact inputs')
    seen, admitted = set(), []
    required = {'id', 'prompt', 'model', 'size', 'quality', 'background'}
    optional = {'references', 'parameters', 'recipe_version', 'refinement_id'}
    reserved = {'model', 'prompt', 'n', 'size', 'quality', 'output_format', 'stream', 'partial_images', 'response_format', 'images', 'image', 'mask'}
    for original in job_list:
        if not isinstance(original, dict) or not required <= original.keys() or original.keys() - required - optional:
            raise ValueError('unknown or missing job fields')
        job = dict(original)
        if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}', job['id']) or job['id'] in seen:
            raise ValueError('unsafe or duplicate asset ID')
        seen.add(job['id'])
        for field in required:
            if not isinstance(job[field], str) or not job[field] or len(job[field]) > (12000 if field == 'prompt' else 100) or job[field].startswith('--'):
                raise ValueError('invalid job ' + field)
        if job['background'] not in ('transparent', 'opaque', 'auto'):
            raise ValueError('invalid background')
        if 'recipe_version' in job and job['recipe_version'] != recipe:
            raise ValueError('recipe_version must match the configured caller manifest recipe')
        refs = job.get('references', [])
        if not isinstance(refs, list) or len(refs) > 16:
            raise ValueError('invalid references')
        total = 0
        for ref in refs:
            if not isinstance(ref, str) or not Path(ref).is_absolute() or not Path(ref).is_file() or Path(ref).is_symlink():
                raise ValueError('references must be absolute regular image files')
            total += Path(ref).stat().st_size
        if total > 35 * 1024 * 1024:
            raise ValueError('reference byte budget exceeded')
        params = job.get('parameters', {})
        if not isinstance(params, dict) or len(params) > 32:
            raise ValueError('invalid parameters')
        for name, value in params.items():
            if not re.fullmatch(r'[a-zA-Z][a-zA-Z0-9_]{0,63}', name) or name in reserved or not isinstance(value, (str, bool, int, float)) or isinstance(value, float) and not math.isfinite(value):
                raise ValueError('unsupported parameter')
            if isinstance(value, (int, float)) and not isinstance(value, bool) and (abs(value) > 9007199254740991 or 'e' in json.dumps(value).lower()):
                raise ValueError('numeric parameter cannot round-trip through caller; use supported decimal/safe integer')
            if isinstance(value, str) and (len(value) > 1000 or value in ('true', 'false') or re.fullmatch(r'-?\d+(\.\d+)?', value)):
                raise ValueError('ambiguous or oversized parameter string')
        if 'refinement_id' in job and (not isinstance(job['refinement_id'], str) or len(job['refinement_id']) > 128):
            raise ValueError('invalid refinement_id')
        job['_caller_sha256'] = caller_digest
        job['_manifest_sha256'] = hashlib.sha256(manifest_bytes).hexdigest()
        job['_recipe_ref'] = recipe
        admitted.append(job)
    if any(j['id'] in subjects and j['id'] != 'sun' for j in admitted) and 'sun' not in seen:
        raise ValueError('Solar System generation requires Sun admission in the requested batch')
    return admitted, manifest_path if manifest_bytes else None


def run_job(job, digest, manifest_path, assets_dir, caller, timeout, max_budget=None, deadline=None, max_attempts=1, caller_manifest=None):
    import signal
    import uuid
    state = read_manifest(manifest_path).get(digest, {})
    if state.get('status') == 'complete':
        return validate_output(assets_dir / state['output'], assets_dir / state['receipt'], state, job['background'], job['_recipe_ref'], max_attempts, deadline)
    if state.get('status') not in ('pending', None):
        print(f"{job['id']}: unresolved state requires explicit retry", flush=True)
        return False
    remaining = min(timeout, deadline - time.monotonic()) if deadline else timeout
    if remaining <= 0:
        print('whole-run deadline exceeded before dispatch', flush=True)
        return False
    if max_budget is not None:
        records = list(read_manifest(manifest_path).values())
        costs = [r.get('cost') for v in records for r in [v, *v.get('history', [])]]
        spent = sum(c.get('usd', 0) for c in costs if isinstance(c, dict) and isinstance(c.get('usd'), (int, float)))
        if spent >= max_budget:
            print('observable cost budget exceeded before dispatch', flush=True)
            return False
    attempt = assets_dir / f"{job['id']}_{digest}_{uuid.uuid4().hex}"
    attempt.mkdir()
    out, receipt = attempt / 'image.png', attempt / 'receipt.json'
    args = ['node', str(caller), 'image', '--prompt', job['prompt'], '--out', str(out)]
    for field in ('model', 'size', 'quality', 'background'):
        args.extend(['--' + field, job[field]])
    if caller_manifest:
        if hashlib.sha256(caller_manifest.read_bytes()).hexdigest() != job['_manifest_sha256']:
            raise ValueError('caller manifest changed after admission')
        args.extend(['--manifest', str(caller_manifest)])
    if hashlib.sha256(caller.read_bytes()).hexdigest() != job['_caller_sha256']:
        raise ValueError('caller changed after admission')
    for i, ref in enumerate(job.get('references', [])):
        snapshot = attempt / f'reference-{i}{Path(ref).suffix}'
        if Path(ref).stat().st_size > 35 * 1024 * 1024:
            raise ValueError('reference grew after admission')
        snapshot.write_bytes(Path(ref).read_bytes())
        if hashlib.sha256(snapshot.read_bytes()).hexdigest() != job['reference_digests'][i]:
            raise ValueError('reference changed after admission')
        args.extend(['--reference', str(snapshot)])
    for key, value in sorted(job.get('parameters', {}).items()):
        text = json.dumps(value, separators=(',', ':')) if not isinstance(value, str) else value
        args.extend(['--param', f'{key}={text}'])
    update_manifest(manifest_path, digest, {'status': 'in-flight', 'output': str(out.relative_to(assets_dir)), 'receipt': str(receipt.relative_to(assets_dir))})
    start = time.monotonic()
    try:
        remaining = min(timeout, deadline - time.monotonic()) if deadline else timeout
        if remaining <= 0:
            update_manifest(manifest_path, digest, {'status': 'pending', 'reason': 'deadline exceeded before launch; no dispatch'})
            return False
        process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, start_new_session=True)
        try:
            stdout, stderr = process.communicate(timeout=remaining)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            stdout, stderr = process.communicate()
            receipt.write_text(stdout)
            update_manifest(manifest_path, digest, {'status': 'unknown', 'reason': 'timeout; reconcile saved output before explicit retry'})
            return False
        receipt.write_text(stdout)
        result = json.loads(stdout)
        if not isinstance(result, dict):
            raise ValueError('invalid receipt')
        attempts = result.get('attempts')
        count = len(attempts) if isinstance(attempts, list) else attempts
        valid = process.returncode == 0 and isinstance(count, int) and not isinstance(count, bool) and 1 <= count <= max_attempts and validate_output(out, receipt, background=job['background'], expected_recipe=job['_recipe_ref'], max_attempts=max_attempts, deadline=deadline)
        valid = valid and result.get('recipeRef') == job['_recipe_ref']
        status = 'complete' if valid else ('failed' if result.get('dispatched') is False else 'unknown')
        update_manifest(manifest_path, digest, {'status': status, 'exit': process.returncode, 'latency_seconds': time.monotonic() - start, 'attempts': attempts, 'usage': result.get('usage'), 'cost': result.get('cost'), 'image_sha256': hashlib.sha256(out.read_bytes()).hexdigest() if out.exists() else None, 'receipt_sha256': hashlib.sha256(receipt.read_bytes()).hexdigest(), 'stage_metrics': 'unavailable from configured caller'})
        if not valid:
            print(f"{job['id']}: corrupt output or unresolved caller result; inspect immutable receipt", flush=True)
        return valid
    except (OSError, ValueError, TypeError, subprocess.SubprocessError):
        update_manifest(manifest_path, digest, {'status': 'unknown', 'reason': 'caller or receipt interrupted; explicit reconciliation required'})
        return False


def generate(job_list, assets_dir, caller, max_calls=11, force_retry=False, timeout=220, max_budget=None, max_workers=3, run_timeout=900, max_attempts=1, dry_run=False):
    import math
    deadline = time.monotonic() + run_timeout
    assets_dir = assets_dir.resolve()
    assets_dir.mkdir(parents=True, exist_ok=True)
    if not isinstance(max_calls, int) or not 0 <= max_calls <= 32 or not isinstance(max_workers, int) or not 1 <= max_workers <= 3 or max_attempts != 1 or not 0 < timeout <= 900 or not 0 < run_timeout <= 3600 or max_budget is not None and (not math.isfinite(max_budget) or max_budget < 0):
        raise ValueError('invalid call/worker/attempt/deadline/budget bounds')
    with open(assets_dir / 'generation.lock', 'a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print('concurrent manifest ownership; safely refusing', flush=True)
            return False
        admitted, caller_manifest = admit_jobs(job_list, caller)
        if time.monotonic() >= deadline:
            print('whole-run deadline exceeded during admission', flush=True)
            return False
        manifest_path = assets_dir / 'manifest.json'
        manifest = read_manifest(manifest_path)
        planned = []
        for job in admitted:
            job['reference_digests'] = [hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in job.get('references', [])]
            digest = job_digest(job)
            state = manifest.get(digest, {})
            status = state.get('status')
            if status not in (None, 'pending', 'in-flight', 'complete', 'unknown', 'failed'):
                raise ValueError('unknown manifest state; reconcile before dispatch')
            if status == 'complete':
                paths = [state.get('output', ''), state.get('receipt', '')]
                if not all(p and not Path(p).is_absolute() and '..' not in Path(p).parts and (assets_dir / p).resolve().is_relative_to(assets_dir) for p in paths):
                    raise ValueError('unsafe manifest artifact path')
                if validate_output(assets_dir / paths[0], assets_dir / paths[1], state, job['background'], job['_recipe_ref'], max_attempts, deadline):
                    continue
                if not force_retry:
                    print(f"{job['id']}: corrupt output requires explicit replacement", flush=True)
                    return False
            elif status in ('in-flight', 'unknown') and not force_retry:
                print(f"{job['id']}: {status} requires explicit retry", flush=True)
                return False
            elif status == 'failed':
                receipt = assets_dir / state.get('receipt', '')
                if not receipt.is_file() or hashlib.sha256(receipt.read_bytes()).hexdigest() != state.get('receipt_sha256') or json.loads(receipt.read_text()).get('dispatched') is not False:
                    raise ValueError('failed state lacks authoritative non-dispatch receipt')
            planned.append((job, digest))
        print(f'Planned calls: {len(planned)}' if planned else '0 planned calls.', flush=True)
        if len(planned) > max_calls:
            print('Cap exceeded; zero dispatches', flush=True)
            return False
        print('Provider price/stage metrics unavailable before dispatch; call cap is hard, dollar cap observes recorded cost only.', flush=True)
        if time.monotonic() >= deadline:
            print('whole-run deadline exceeded before dispatch', flush=True)
            return False
        if dry_run or not planned:
            return True
        for job, digest in planned:
            prior = manifest.get(digest, {})
            history = prior.get('history', []) + ([{k: v for k, v in prior.items() if k != 'history'}] if prior else [])
            update_manifest(manifest_path, digest, {'status': 'pending', 'job_id': job['id'], 'input': job, 'history': history, 'cost': None})
        def execute(item):
            return run_job(*item, manifest_path, assets_dir, caller, timeout, max_budget, deadline, max_attempts, caller_manifest)
        sun = next((item for item in planned if item[0]['id'] == 'sun'), None)
        if sun:
            if not execute(sun):
                print('Sun validation failed. Halting batch.', flush=True)
                return False
            planned.remove(sun)
        # Observable budget updates cannot race; when specified, serialize within the <=3 ceiling.
        with concurrent.futures.ThreadPoolExecutor(max_workers=1 if max_budget is not None else max_workers) as pool:
            outcomes = list(pool.map(execute, planned))
        return all(outcomes)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--max-calls', type=int, default=11)
    parser.add_argument('--max-budget', type=float)
    parser.add_argument('--timeout', type=float, default=220)
    parser.add_argument('--run-timeout', type=float, default=900)
    parser.add_argument('--max-attempts', type=int, default=1, help='the installed caller makes exactly one provider attempt; only 1 supported')
    parser.add_argument('--max-workers', type=int, default=3)
    parser.add_argument('--force-retry', action='store_true', help='explicitly replace corrupt outputs or retry unresolved paid outcomes; preserves prior receipts')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--caller')
    parser.add_argument('--assets-dir')
    parser.add_argument('--jobs')
    args = parser.parse_args()
    try:
        configured = args.caller or os.environ.get('HIQS_CHAIN_CALLER')
        if not configured:
            raise ValueError('HIQS_CHAIN_CALLER not set')
        caller = Path(configured).expanduser().resolve()
        destination = Path(args.assets_dir).resolve() if args.assets_dir else ROOT / 'assets'
        job_list = json.loads(Path(args.jobs).read_text()) if args.jobs else jobs
        success = generate(job_list, destination, caller, args.max_calls, args.force_retry, args.timeout, args.max_budget, args.max_workers, args.run_timeout, args.max_attempts, args.dry_run)
        sys.exit(0 if success else 4)
    except (OSError, ValueError, TypeError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(4)
