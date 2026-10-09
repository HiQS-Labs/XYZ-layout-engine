import json, hashlib, os, subprocess, time, concurrent.futures, fcntl, sys, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent

style='Create ONE isolated astronomy illustration asset for a sophisticated museum-quality solar-system infographic. Photorealistic scientific illustration with beautiful restrained detail, clean silhouette and consistent studio illumination from upper left. Entire subject fully visible centered, generous 12 percent transparent padding. Transparent background, genuinely clear alpha outside the subject. No black rectangle, no stars in the background, no ground, no cast shadow, no caption, no typography, no diagram, no other planets. '
subjects={
 'sun':'The Sun alone: a luminous warm golden yellow-orange sphere with richly textured photosphere, subtle small prominences and soft short corona. Do not make it red or show exaggerated enormous flares. Disc occupies about 70 percent of canvas; glow fades fully to transparency.',
 'mercury':'Mercury alone, nearly full round disk, grey rocky heavily cratered surface, warm grey and charcoal texture, no rings, no atmosphere.',
 'venus':'Venus alone, nearly full round disk, pale warm cream and yellow cloud-covered globe, subtle swirling opaque clouds, no visible rocky continents, no rings.',
 'earth':'Earth alone, nearly full round disk with rich blue oceans, recognizable Africa and Europe, natural green-brown land and delicate white cloud systems, subtle blue atmospheric rim, no Moon, no rings.',
 'mars':'Mars alone, nearly full round disk, rust-red rocky dusty terrain, subtle craters and dark surface regions, small white polar ice cap, no rings.',
 'jupiter':'Jupiter alone, nearly full round disk, realistically broad cream ochre brown zonal cloud bands and visible Great Red Spot, no rings, no moons.',
 'saturn':'Saturn alone with its full complete broad thin ring system. Pale gold banded gas-giant globe and elegant tilted beige icy concentric rings, recognisable Cassini division. Front portion of ring crosses IN FRONT of the globe and rear portion is occluded by globe. Ring disk tilted about 25 degrees, full silhouette fits comfortably within canvas, no moons.',
 'uranus':'Uranus alone, nearly full round disk, pale cyan blue-green ice-giant globe, smooth subtle atmospheric texture, restrained narrow dim tilted rings nearly edge on, entire ring system visible without clipping, no moons.',
 'neptune':'Neptune alone, nearly full round disk, natural moderately saturated azure blue ice-giant globe, smooth subtle atmospheric texture, restrained narrow dim tilted rings nearly edge on, entire ring system visible without clipping, no moons.',
 'asteroid-belt':'A standalone schematic asteroid belt: a complete thin horizontal elliptical annulus of many tiny individually separated irregular grey and warm-brown rocky asteroids, viewed obliquely. Ring is wide, about 85 percent canvas width and 30 percent canvas height, large empty transparent center. Rocks small, sparse and fine, not a continuous solid ring, avoid boulders filling entire center. No Sun or planets. This is an exaggerated-density illustration of the main asteroid belt, not a dense physical barrier. Genuine transparency between rocks and inside the ellipse.',
 'milky-way':'The Milky Way alone as an artist impression schematic face-on barred spiral galaxy, centered round-ish disk, luminous pale gold central bar, sweeping elegant blue-white spiral arms and subtle warm dust lanes. Entire galaxy fits at 85 percent canvas width. No labels, no location marker, no foreground planets, no black rectangle, no background starfield beyond the galaxy; galaxy fades smoothly to transparent space outside its disk. Educational astronomical illustration, not a claimed photograph.'
}
jobs=[{'id':k,'prompt':style+v,'model':'gpt-image-2.5-flare','size':'1024x1024','quality':'medium','background':'transparent'} for k,v in subjects.items()]

def job_digest(job):
    core = {k: v for k, v in job.items() if k != 'id'}
    return hashlib.sha256(json.dumps(core, sort_keys=True).encode()).hexdigest()

def update_manifest(manifest_path, d, updates):
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, 'a+') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        f.seek(0)
        try:
            content = f.read()
            manifest = json.loads(content) if content else {}
        except Exception:
            manifest = {}
        if d not in manifest:
            manifest[d] = {}
        manifest[d].update(updates)
        f.seek(0)
        f.truncate()
        json.dump(manifest, f, indent=2)
        fcntl.flock(f, fcntl.LOCK_UN)
    return manifest[d]

def read_manifest(manifest_path):
    if not manifest_path.exists():
        return {}
    with open(manifest_path, 'r') as f:
        try:
            fcntl.flock(f, fcntl.LOCK_SH)
            return json.load(f)
        except Exception:
            return {}
        finally:
            fcntl.flock(f, fcntl.LOCK_UN)

def run_job(job, digest, manifest_path, assets_dir, caller, timeout=220):
    job_id = job['id']
    out = assets_dir / f"{job_id}.png"
    receipt = assets_dir / f"{job_id}.result.json"
    
    lock_file = assets_dir / f"{job_id}.lock"
    try:
        lf = open(lock_file, 'w')
        fcntl.flock(lf, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print(f"{job_id}: concurrent manifest ownership (lock busy); safely refusing", flush=True)
        return False
        
    try:
        update_manifest(manifest_path, digest, {'status': 'in-flight', 'job_id': job_id})
        
        start_time = time.time()
        args = ['node', str(caller), 'image', '--prompt', job['prompt'], '--out', str(out), '--model', job['model'], '--size', job['size'], '--quality', job['quality'], '--background', job['background']]
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
            update_manifest(manifest_path, digest, {'status': 'failed', 'reason': 'invalid_json'})
            print(f"{job_id}: corrupt output (invalid runtime result); inspect receipt", flush=True)
            return False
            
        status = 'complete' if p.returncode == 0 else 'failed'
        attempts = result.get('attempts')
        if attempts is None and p.returncode != 0:
            attempts = 1
            
        cost_info = result.get('cost')
        if cost_info is None:
            print(f"{job_id}: limitation: observable cost unavailable, relying on call cap", flush=True)
            
        update_manifest(manifest_path, digest, {
            'status': status,
            'exit': p.returncode,
            'latency': latency,
            'cost': cost_info,
            'attempts': attempts
        })
        
        print(json.dumps({'asset': job_id, 'exit': p.returncode, 'status': result.get('status'), 'image': result.get('image'), 'alpha': result.get('alpha'), 'recipeRef': result.get('recipeRef'), 'publication': result.get('publication'), 'attempts': attempts, 'latency': latency}), flush=True)
        return p.returncode == 0
    finally:
        fcntl.flock(lf, fcntl.LOCK_UN)
        lf.close()

def generate(job_list, assets_dir, caller, max_calls=11, force_retry=False):
    manifest_path = assets_dir / 'manifest.json'
    manifest = read_manifest(manifest_path)
    
    planned = []
    for job in job_list:
        d = job_digest(job)
        state = manifest.get(d, {})
        job_id = job['id']
        out_png = assets_dir / f"{job_id}.png"
        receipt_path = assets_dir / f"{job_id}.result.json"
        
        if state.get('status') == 'complete' and out_png.exists() and receipt_path.exists():
            try:
                receipt = json.loads(receipt_path.read_text())
                if receipt.get('alpha'):
                    continue
            except Exception:
                pass
                
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
        
    for job, d in planned:
        update_manifest(manifest_path, d, {'status': 'pending', 'job_id': job['id']})
        
    outcomes = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(run_job, job, d, manifest_path, assets_dir, caller): job for job, d in planned}
        for fut in concurrent.futures.as_completed(futures):
            outcomes.append(fut.result())
            
    return all(outcomes)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--max-calls', type=int, default=11)
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
    
    (assets_dir / 'prompts.json').write_text(json.dumps(job_list, indent=2) + '\n')
    
    success = generate(job_list, assets_dir, caller, max_calls=args.max_calls, force_retry=args.force_retry)
    sys.exit(0 if success else 4)
