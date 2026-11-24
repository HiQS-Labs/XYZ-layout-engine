#!/bin/sh
set -ex
trap 'echo Exit status: $?' EXIT
git rev-parse HEAD
d=examples/2026-11-23-forge-scroll-v3
python3 "$d/score.py" "$d"
python3 - "$d" <<'PY'
from pathlib import Path
import json,tempfile,sys,subprocess,re
from datetime import datetime,timedelta
p=Path(sys.argv[1]); data=json.loads((p/'entries.json').read_text())
with tempfile.TemporaryDirectory() as tmp:
 def run():
  (Path(tmp)/'entries.json').write_text(json.dumps(data))
  s=subprocess.check_output([sys.executable,p/'score.py',tmp],text=True); print(s);return s
 recorded=run()
 for key, entry in data.items():
  row=next(line for line in (p/'results.md').read_text().splitlines() if f'(runs/{key}/index.html)' in line)
  cells=[cell.strip().strip('*') for cell in row.strip('|').split('|')]
  assert float(cells[1]) == entry['seconds']
  if entry['eligible']:
   actual=next(line for line in recorded.splitlines() if line.startswith(key+' ·'))
   grades=re.search(r'\(([^)]+)\) · ([0-9.]+)/3',actual)
   assert list(map(float,grades[1].split(', ')))==list(map(float,cells[2:6]))
   assert float(grades[2])==float(cells[6])
  else:
   assert 'Ineligible' in cells[-1] and key+' ineligible' in recorded
 for key,seconds in [('neon',100),('sol',109)]:
  data[key]['seconds']=seconds
  data[key]['completedAt']=(datetime.fromisoformat(data[key]['startedAt'])+timedelta(seconds=seconds)).isoformat()
 s=run();assert '(3, 2, 2.5, 3)' in s and '(3, 3, 3, 3)' in s and 'opus ineligible' in s
 data['sol']['ballots'][0]['facts'][2].update(answer='Forge automatically deploys to production',location='hero',correct=False)
 assert '(2.5, 3, 3, 3)' in run()
 fact=data['sol']['ballots'][0]['facts'][2]
 fact.update(correct=True,location='')
 assert '(2.5, 3, 3, 3)' in run()
 # Deliberately unequal scores exercise all four weights independently.
 import copy
 standard=copy.deepcopy(data)
 for axis,expected in [('comprehension','2.20'),('craft','2.40'),('appeal','2.60')]:
  data=copy.deepcopy(standard)
  for ballot in data['sol']['ballots']:
   for f in ballot['facts']: f.update(correct=axis!='comprehension',location='section 2')
   if axis!='comprehension': ballot[axis]=1
  assert f' · {expected}/3' in next(line for line in run().splitlines() if line.startswith('sol ·'))
 data=copy.deepcopy(standard)
 data['sol']['ballots']=[]
 s=run();assert 'sol provisional' in s and 'neon provisional' in s and '/3' not in s
 data['sol']['eligible']=False
 assert 'limited comparison' in run()
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
