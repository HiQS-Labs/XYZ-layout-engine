import json,pathlib,subprocess,tempfile,sys
p=pathlib.Path('examples/2026-11-23-forge-scroll-v3')
with tempfile.TemporaryDirectory() as tmp:
 for label,value in [('empty',''),('whitespace',' \t'),('missing',None),('number',3)]:
  entries=json.loads((p/'entries.json').read_text())
  for ballot in entries['sol']['ballots']:
   for fact in ballot['facts']:
    if value is None: del fact['answer']
    else: fact['answer']=value
  pathlib.Path(tmp,'entries.json').write_text(json.dumps(entries))
  r=subprocess.run([sys.executable,p/'score.py',tmp],capture_output=True,text=True)
  print(label,r.returncode,(r.stderr or r.stdout).strip().splitlines()[-1])
  assert (r.returncode==0 and '3.00/3' in r.stdout) if sys.argv[1]=='before' else (r.returncode!=0 and 'nonblank' in r.stderr)
