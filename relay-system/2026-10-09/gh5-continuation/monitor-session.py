#!/usr/bin/env python3
"""Session-local observer. Uses the existing marathon executor; never mutates its state."""
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import sys
import time

root = Path.cwd().resolve()
interval, count = 600, 6
receipt_dir = root / '.workhorse' / 'monitor-gh5'
receipt_dir.mkdir(parents=True, exist_ok=True)
log = root / '.xyz' / 'gh5-continuation-live.log'
command = [str(root / '.xyz/relay-automation/marathon.sh'), '--plan', 'PROJECT/2-WORKING/mvp-foundation/MARATHON.yaml', '--builder', 'agy', '--pre-advance-cmd', 'pnpm test']
started = time.monotonic()
started_wall = dt.datetime.now(dt.timezone.utc)
index = 0

def report(kind, process=None):
    now = dt.datetime.now(dt.timezone.utc)
    events = []
    for file in (root / '.tick/events').glob('*.jsonl'):
        try:
            for line in file.read_text().splitlines():
                event = json.loads(line)
                if 'MARATHON-GH5-P' in event.get('task', '') and event.get('ts', '') >= started_wall.isoformat(timespec='milliseconds').replace('+00:00', 'Z'):
                    events.append(event)
        except (OSError, ValueError):
            continue
    events.sort(key=lambda e: e.get('ts', ''))
    qualified = [e for e in events if e.get('type') in {'marathon.phase.start', 'marathon.phase.approved', 'marathon.phase.revision', 'marathon.phase.escalated', 'task.done'}]
    approvals = {e['task'] for e in events if e.get('type') == 'marathon.phase.approved'}
    try:
        heartbeat = json.loads((root / '.tick/driver-heartbeat.json').read_text())
    except (OSError, ValueError):
        heartbeat = None
    heartbeat_age = None
    if heartbeat and heartbeat.get('updated_utc'):
        try: heartbeat_age = round((now-dt.datetime.fromisoformat(heartbeat['updated_utc'].replace('Z', '+00:00'))).total_seconds(), 1)
        except ValueError: pass
    claims_run = subprocess.run([str(root / '.xyz/bin/tick'), 'claims', '--json'], cwd=root, env={**os.environ, 'TICK_REPO_ROOT': str(root)}, capture_output=True, text=True, timeout=15)
    try: claims = json.loads(claims_run.stdout)
    except ValueError: claims = {'unavailable': claims_run.returncode}
    relays = sorted((root / 'marathon-system').glob('*/RELAY.md'), key=lambda p: p.stat().st_mtime, reverse=True)
    active = None
    if relays:
        active = {'path': str(relays[0].relative_to(root)), 'headers': [line for line in relays[0].read_text().splitlines() if line.startswith(('STATUS:', 'NEXT:', 'ROUND:'))]}
    payload = {'kind': kind, 'observed_at': now.isoformat(), 'elapsed_seconds': round(time.monotonic()-started, 1), 'interval_seconds': interval, 'check': index, 'max_checks': count, 'clone': str(root), 'pid': process.pid if process else None, 'exit': process.poll() if process else None, 'approved_remaining_phases': len(approvals), 'total_remaining_phases': 4, 'last_qualified_progress': qualified[-1] if qualified else None, 'heartbeat': heartbeat, 'heartbeat_age_seconds': heartbeat_age, 'claims': claims, 'active_relay': active, 'log_tail': log.read_text(errors='replace').splitlines()[-14:] if log.exists() else [], 'observer_only': True}
    (receipt_dir / f'{kind}-{index:02d}.json').write_text(json.dumps(payload, indent=2)+'\n')
    print(json.dumps(payload), flush=True)

# Native tool session owns this foreground wrapper and child; no nohup/disown/detached executor.
with log.open('w') as output:
    process = subprocess.Popen(command, cwd=root, env=os.environ.copy(), stdout=output, stderr=subprocess.STDOUT)
    report('started', process)
    next_due = started + interval
    while process.poll() is None:
        remaining = next_due-time.monotonic() if index < count else 5
        time.sleep(max(0.05, min(5, remaining)))
        if process.poll() is not None:
            break
        if index < count and time.monotonic() >= next_due:
            index += 1
            report('interval', process)
            next_due = started + (index+1)*interval
            if index == count:
                report('monitoring-window-ended', process)
                print('Six scheduled checks complete; executor remains authorized. Continue live observation without an unbounded interval timer.', flush=True)
    report('completed' if process.returncode == 0 else 'halted', process)
    print('Terminal state observed immediately; outstanding interval checks cancelled.', flush=True)
    sys.exit(process.returncode)
