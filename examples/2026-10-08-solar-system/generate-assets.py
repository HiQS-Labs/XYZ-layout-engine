from pathlib import Path
import subprocess, json, concurrent.futures, os
ROOT=Path(__file__).resolve().parent
# Path to the deployed hiqs-chain caller (see HiQS AI Resolve skills/hiqs-chain/scripts/chain.mjs).
CALLER=Path(os.environ['HIQS_CHAIN_CALLER']).expanduser().resolve()
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
 'neptune':'Neptune alone, nearly full round disk, natural moderately saturated azure blue ice-giant globe with subtle bands and small wispy white clouds, no exaggerated giant storm, no rings or moons.',
 'asteroid-belt':'A standalone schematic asteroid belt: a complete thin horizontal elliptical annulus of many tiny individually separated irregular grey and warm-brown rocky asteroids, viewed obliquely. Ring is wide, about 85 percent canvas width and 30 percent canvas height, large empty transparent center. Rocks small, sparse and fine, not a continuous solid ring, avoid boulders filling entire center. No Sun or planets. This is an exaggerated-density illustration of the main asteroid belt, not a dense physical barrier. Genuine transparency between rocks and inside the ellipse.',
 'milky-way':'The Milky Way alone as an artist impression schematic face-on barred spiral galaxy, centered round-ish disk, luminous pale gold central bar, sweeping elegant blue-white spiral arms and subtle warm dust lanes. Entire galaxy fits at 85 percent canvas width. No labels, no location marker, no foreground planets, no black rectangle, no background starfield beyond the galaxy; galaxy fades smoothly to transparent space outside its disk. Educational astronomical illustration, not a claimed photograph.'
}
jobs=[{'id':k,'prompt':style+v,'model':'gpt-image-2.5-flare','size':'1024x1024','quality':'medium','background':'transparent'} for k,v in subjects.items()]
(ROOT/'assets/prompts.json').write_text(json.dumps(jobs,indent=2)+'\n')
def run(job):
    out=ROOT/'assets'/f"{job['id']}.png"
    receipt=out.with_suffix('.result.json')
    if out.exists():
        raise RuntimeError('Refusing to overwrite or redispatch existing '+str(out))
    args=['node',str(CALLER),'image','--prompt',job['prompt'],'--out',str(out),'--model',job['model'],'--size',job['size'],'--quality',job['quality'],'--background',job['background']]
    p=subprocess.run(args,capture_output=True,text=True,timeout=220)
    receipt.write_text(p.stdout)
    try:
        result=json.loads(p.stdout)
    except Exception:
        print(job['id']+': invalid runtime result; inspect receipt',flush=True)
        return False
    print(json.dumps({'asset':job['id'],'exit':p.returncode,'status':result.get('status'),'image':result.get('image'),'alpha':result.get('alpha'),'recipeRef':result.get('recipeRef'),'publication':result.get('publication'),'attempts':result.get('attempts') if p.returncode else None}),flush=True)
    return p.returncode==0
# One first call establishes that the exact recipe is currently admitted before the batch.
if not run(jobs[0]):
    raise SystemExit(4)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    outcomes=list(pool.map(run,jobs[1:]))
raise SystemExit(0 if all(outcomes) else 4)
