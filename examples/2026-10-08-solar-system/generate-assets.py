import argparse
import concurrent.futures
import contextlib
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
    core = {k: v for k, v in job.items() if k != 'id'}
    if 'references' in core:
        ref_digests = []
        for ref in core['references']:
            p = Path(ref)
            if p.exists():
                ref_digests.append(hashlib.sha256(p.read_bytes()).hexdigest())
            else:
                ref_digests.append('missing')
        core['references_hash'] = ref_digests
    return hashlib.sha256(json.dumps(core, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def update_manifest(manifest_path, d, updates):
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    lock_path = manifest_path.parent / 'manifest.lock'
    with open(lock_path, 'w') as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        try:
            manifest = read_manifest_internal(manifest_path)
            if d not in manifest:
                manifest[d] = {}
            manifest[d].update(updates)
            
            tmp = manifest_path.with_name(manifest_path.name + f".{os.getpid()}.tmp")
            with open(tmp, 'w') as f:
                json.dump(manifest, f, indent=2, separators=(',', ': '))
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, manifest_path)
        finally:
            fcntl.flock(lf, fcntl.LOCK_UN)
    return manifest[d]

def read_manifest_internal(manifest_path):
    if not manifest_path.exists():
        return {}
    with open(manifest_path, 'r') as f:
        try:
            return json.load(f)
        except Exception:
            return {}

def read_manifest(manifest_path):
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    lock_path = manifest_path.parent / 'manifest.lock'
    with open(lock_path, 'w') as lf:
        fcntl.flock(lf, fcntl.LOCK_SH)
        try:
            return read_manifest_internal(manifest_path)
        finally:
            fcntl.flock(lf, fcntl.LOCK_UN)

def validate_output(out_png, receipt_path):
    if not out_png.exists() or not receipt_path.exists():
        return False
    if out_png.stat().st_size == 0:
        return False
    try:
        content = out_png.read_bytes()
        if not content.startswith(b'\x89PNG\r\n\x1a\n'):
            return False
            
        receipt = json.loads(receipt_path.read_text())
        img_hash = hashlib.sha256(content).hexdigest()
        
        rec_image = receipt.get('image')
        if isinstance(rec_image, dict):
            rec_hash = rec_image.get('sha256')
            if rec_hash and img_hash != rec_hash:
                return False
                
        alpha_info = receipt.get('alpha')
        if isinstance(alpha_info, dict):
            if not alpha_info.get('hasAlphaChannel'):
                return False
        elif not alpha_info:
            return False
            
        return True
    except Exception:
        return False

def run_job(job, digest, manifest_path, assets_dir, caller, timeout, max_budget=None):
    job_id = job['id']
    short_digest = digest[:8]
    out = assets_dir / f"{job_id}_{short_digest}.png"
    receipt = assets_dir / f"{job_id}_{short_digest}.result.json"
    
    lock_file = assets_dir / f"{job_id}_{short_digest}.lock"
    try:
        lf = open(lock_file, 'w')
        fcntl.flock(lf, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print(f"{job_id}: concurrent manifest ownership (lock busy); safely refusing", flush=True)
        return False
        
    try:
        manifest = read_manifest(manifest_path)
        state = manifest.get(digest, {})
        
        if state.get('status') == 'complete':
            if validate_output(out, receipt):
                return True
        elif state.get('status') in ('in-flight', 'unknown'):
            print(f"{job_id}: {state.get('status')} requires explicit retry", flush=True)
            return False
            
        if max_budget is not None:
            spent = 0.0
            for k, v in manifest.items():
                if isinstance(v.get('cost'), dict):
                    spent += v['cost'].get('usd', 0.0)
                elif isinstance(v.get('cost'), (int, float)):
                    spent += v['cost']
            if spent >= max_budget:
                print(f"{job_id}: limitation: observable cost budget exceeded ({spent} >= {max_budget}), refusing dispatch", flush=True)
                return False

        update_manifest(manifest_path, digest, {'status': 'in-flight', 'job_id': job_id})
        
        start_time = time.time()
        args = ['node', str(caller), 'image', '--prompt', job['prompt']]
        if 'references' in job:
            for ref in job['references']:
                args.extend(['--reference', ref])
        if 'recipe_version' in job:
            args.extend(['--recipe-version', job['recipe_version']])
        if 'parameters' in job:
            args.extend(['--parameters', json.dumps(job['parameters'], separators=(',', ':'))])
        
        args.extend(['--out', str(out), '--model', job['model'], '--size', job['size'], '--quality', job['quality'], '--background', job['background']])
        
        try:
            p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
        except subprocess.TimeoutExpired:
            update_manifest(manifest_path, digest, {'status': 'unknown', 'reason': 'timeout'})
            print(f"{job_id}: timeout while in-flight remains unknown", flush=True)
            return False
            
        latency = time.time() - start_time
        receipt.write_text(p.stdout)
        
        try:
            result = json.loads(p.stdout)
        except Exception:
            update_manifest(manifest_path, digest, {'status': 'unknown', 'reason': 'invalid_json'})
            print(f"{job_id}: corrupt output (invalid runtime result); inspect receipt", flush=True)
            return False
            
        attempts = result.get('attempts')
        if attempts is None and p.returncode != 0:
            attempts = 1
            
        cost_info = result.get('cost')
        if cost_info is None:
            print(f"{job_id}: limitation: observable cost unavailable, relying on call cap", flush=True)
            
        status = 'unknown' if p.returncode != 0 else 'complete'
        
        update_manifest(manifest_path, digest, {
            'status': status,
            'exit': p.returncode,
            'latency': latency,
            'cost': cost_info,
            'attempts': attempts,
            'usage': result.get('usage')
        })
        
        print(json.dumps({'asset': job_id, 'exit': p.returncode, 'status': result.get('status'), 'image': result.get('image'), 'alpha': result.get('alpha'), 'recipeRef': result.get('recipeRef'), 'publication': result.get('publication'), 'attempts': attempts, 'latency': latency, 'usage': result.get('usage')}), flush=True)
        return p.returncode == 0
    finally:
        fcntl.flock(lf, fcntl.LOCK_UN)
        lf.close()

def generate(job_list, assets_dir, caller, max_calls=11, force_retry=False, timeout=220, max_budget=None, max_workers=3):
    manifest_path = assets_dir / 'manifest.json'
    manifest = read_manifest(manifest_path)
    
    planned = []
    
    # Priority: if 'sun' is present, it must be validated/admitted first
    sun_job = next((j for j in job_list if j['id'] == 'sun'), None)
    
    for job in job_list:
        d = job_digest(job)
        state = manifest.get(d, {})
        job_id = job['id']
        short_digest = d[:8]
        out_png = assets_dir / f"{job_id}_{short_digest}.png"
        receipt_path = assets_dir / f"{job_id}_{short_digest}.result.json"
        
        if state.get('status') == 'complete' and validate_output(out_png, receipt_path):
            continue
                
        if state.get('status') in ('in-flight', 'unknown') and not force_retry:
            print(f"{job_id}: {state.get('status')} requires explicit retry", flush=True)
            continue
            
        planned.append((job, d))
        
    if not planned:
        print("0 planned calls.", flush=True)
        return True
        
    print(f"Planned calls: {len(planned)}")
    if len(planned) > max_calls:
        print(f"Cap exceeded (planned {len(planned)} > max {max_calls})", flush=True)
        return False
        
    # Check if 'sun' is in planned. If so, run it synchronously first.
    sun_planned = next((item for item in planned if item[0]['id'] == 'sun'), None)
    if sun_planned:
        job, d = sun_planned
        update_manifest(manifest_path, d, {'status': 'pending', 'job_id': job['id']})
        sun_ok = run_job(job, d, manifest_path, assets_dir, caller, timeout, max_budget)
        if not sun_ok:
            print("Sun validation failed. Halting batch.", flush=True)
            return False
        planned.remove(sun_planned)
        
    for job, d in planned:
        update_manifest(manifest_path, d, {'status': 'pending', 'job_id': job['id']})
        
    outcomes = []
    if sun_planned:
        outcomes.append(True)
        
    if planned:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = {pool.submit(run_job, job, d, manifest_path, assets_dir, caller, timeout, max_budget): job for job, d in planned}
            for fut in concurrent.futures.as_completed(futures):
                outcomes.append(fut.result())
            
    return all(outcomes)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--max-calls', type=int, default=11)
    parser.add_argument('--max-budget', type=float, default=None)
    parser.add_argument('--timeout', type=int, default=220)
    parser.add_argument('--max-workers', type=int, default=3)
    parser.add_argument('--force-retry', action='store_true')
    parser.add_argument('--caller', help='Path to caller (overrides env HIQS_CHAIN_CALLER)')
    parser.add_argument('--assets-dir', help='Output directory (default: assets)')
    parser.add_argument('--jobs', help='Path to external jobs JSON')
    args = parser.parse_args()
    
    caller_env = args.caller or os.environ.get('HIQS_CHAIN_CALLER')
    if not caller_env:
        print("HIQS_CHAIN_CALLER not set", file=sys.stderr)
        sys.exit(1)
        
    caller = Path(caller_env).expanduser().resolve()
    assets_dir = Path(args.assets_dir).resolve() if args.assets_dir else ROOT / 'assets'
    assets_dir.mkdir(parents=True, exist_ok=True)
    
    job_list = jobs
    if args.jobs:
        job_list = json.loads(Path(args.jobs).read_text())
    
    # R5: planning/dry-run/cap refusal must not rewrite published inputs
    # If we are proceeding (and not zero cap), then we can optionally write prompts.json, but the prompt says 
    # "cap-zero/dry-run preserves all existing prompts/receipts."
    # The requirement is that we don't blindly rewrite published prompts if it's a dry run. 
    # Wait, if max_calls > 0, we can write it? Let's just write it after successful dispatch or at all? 
    # Let's write it only if we're actually going to run something, but wait, the tests check "published prompts preserved: False" when it fails out early.
    # We will write it after verifying cap.
    
    manifest_path = assets_dir / 'manifest.json'
    manifest = read_manifest(manifest_path)
    
    planned = []
    for job in job_list:
        d = job_digest(job)
        state = manifest.get(d, {})
        job_id = job['id']
        short_digest = d[:8]
        out_png = assets_dir / f"{job_id}_{short_digest}.png"
        receipt_path = assets_dir / f"{job_id}_{short_digest}.result.json"
        
        if state.get('status') == 'complete' and validate_output(out_png, receipt_path):
            continue
        if state.get('status') in ('in-flight', 'unknown') and not args.force_retry:
            continue
        planned.append((job, d))
        
    if len(planned) > args.max_calls:
        # Cap exceeded, don't mutate prompts
        pass
    else:
        (assets_dir / 'prompts.json').write_text(json.dumps(job_list, indent=2) + '\n')
    
    success = generate(job_list, assets_dir, caller, max_calls=args.max_calls, force_retry=args.force_retry, timeout=args.timeout, max_budget=args.max_budget, max_workers=args.max_workers)
    sys.exit(0 if success else 4)
