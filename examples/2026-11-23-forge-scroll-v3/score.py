"""Read operator-adjudicated ballots and provider measurements, report scores out of three."""
import json
import sys
from datetime import datetime
from pathlib import Path
from statistics import mean

root = Path(sys.argv[1])
entries = json.loads((root / "entries.json").read_text())
eligible = sorted((k for k,v in entries.items() if v["eligible"]), key=lambda k: entries[k]["seconds"])
for name, entry in entries.items():
    elapsed = datetime.fromisoformat(entry["completedAt"]) - datetime.fromisoformat(entry["startedAt"])
    if entry["seconds"] <= 0 or abs(elapsed.total_seconds() - entry["seconds"]) > 0.0005:
        raise ValueError(f"{name}: elapsed seconds must match provider timestamps")
complete_panel = all(len(entries[k]["ballots"]) == 2 and
                     len({b["judge"] for b in entries[k]["ballots"]}) == 2 for k in eligible)
speeds = {}
for place, key in enumerate(eligible):
    seconds = entries[key]["seconds"]
    if seconds <= 0:
        raise ValueError("Expected positive elapsed time")
    if place == 0 or seconds > leader * 1.1:
        speed, leader = 3 - place, seconds
    speeds[key] = speed
for key, entry in entries.items():
    if key not in speeds:
        print(key, "ineligible")
        continue
    ballots = entry["ballots"]
    if not complete_panel:
        print(key, "provisional")
        continue
    readings, craft, appeal = [], [], []
    for b in ballots:
        if len(b["facts"]) != 3 or any(type(f["correct"]) != bool for f in b["facts"]):
            raise ValueError("Expected three adjudicated facts")
        if any(type(b[k]) is not int or not 1 <= b[k] <= 3 for k in ("craft", "appeal")):
            raise ValueError("Quality grades must be 1–3")
        readings.append(max(1,sum(f["correct"] and bool(f["location"].strip()) for f in b["facts"])))
        craft.append(b["craft"])
        appeal.append(b["appeal"])
    values = mean(readings), mean(craft), mean(appeal), speeds[key]
    total = sum(v*w for v,w in zip(values,(.4,.3,.2,.1)))
    print(f"{key} · {entry['seconds']:.3f}s · comprehension/craft/appeal/speed {values} · {total:.2f}/3" + (" · limited comparison: one eligible entry" if len(eligible) == 1 else ""))
