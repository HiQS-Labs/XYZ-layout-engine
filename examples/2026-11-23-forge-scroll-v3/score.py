"""Read operator-adjudicated ballots and provider measurements, report scores out of three."""
import json
import sys
from pathlib import Path
from statistics import mean

root = Path(sys.argv[1])
entries = json.loads((root / "entries.json").read_text())
eligible = sorted((k for k,v in entries.items() if v["eligible"]), key=lambda k: entries[k]["seconds"])
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
    if len(ballots) != 2:
        print(key, "provisional")
        continue
    readings, craft, appeal = [], [], []
    for b in ballots:
        if len(b["facts"]) != 3 or any(type(f["correct"]) != bool for f in b["facts"]):
            raise ValueError("Expected three adjudicated facts")
        if b["craft"] not in (1,2,3) or b["appeal"] not in (1,2,3):
            raise ValueError("Quality grades must be 1–3")
        readings.append(max(1,sum(f["correct"] and bool(f["location"].strip()) for f in b["facts"])))
        craft.append(b["craft"])
        appeal.append(b["appeal"])
    values = mean(readings), mean(craft), mean(appeal), speeds[key]
    total = sum(v*w for v,w in zip(values,(.4,.3,.2,.1)))
    print(f"{key} · {entry['seconds']:.3f}s · comprehension/craft/appeal/speed {values} · {total:.2f}/3")
