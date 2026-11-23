#!/bin/sh
set -ex
git rev-parse HEAD
d=examples/2026-11-23-forge-scroll-v3
python3 "$d/score.py" "$d"
python3 - "$d" <<'PY'
from pathlib import Path
import json,tempfile,sys,subprocess
p=Path(sys.argv[1]); data=json.loads((p/'entries.json').read_text())
with tempfile.TemporaryDirectory() as tmp:
 def run():
  (Path(tmp)/'entries.json').write_text(json.dumps(data))
  s=subprocess.check_output([sys.executable,p/'score.py',tmp],text=True); print(s);return s
 data['neon']['seconds']=100;data['sol']['seconds']=109
 s=run();assert '(3, 2, 2.5, 3)' in s and '(3, 3, 3, 3)' in s and 'opus ineligible' in s
 data['sol']['ballots'][0]['facts'][2].update(answer='Forge automatically deploys to production',location='hero',correct=False)
 assert '(2.5, 3, 3, 3)' in run()
 data['sol']['ballots']=[];assert 'sol provisional' in run()
PY
node "$d/publish.mjs"
python3 - <<'PY'
from pathlib import Path
import re
p=Path('REVIEW/forge-scroll-v3/results.md');targets=re.findall(r'\]\(([^)]+)\)',p.read_text())
assert len(targets)==3 and all((p.parent/t).is_file() for t in targets)
assert 'forge-scroll-v3/sol.html' in Path('REVIEW/index.html').read_text()
print('Verified bundle:',sorted(f.name for f in p.parent.iterdir()))
PY
