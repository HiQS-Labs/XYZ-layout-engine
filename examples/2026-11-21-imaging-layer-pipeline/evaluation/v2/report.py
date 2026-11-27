"""Summarize a blind pair. Ballots use displayed sides; normalize reversed rooms here."""
import json
import sys
from pathlib import Path

session = Path(sys.argv[1])
if not session.is_dir() or not (all((session / r).is_dir() for r in ("forward", "reverse"))
                                 or any(session.glob("*.grade.json"))
                                 or any(session.glob("*-forward.json")) or any(session.glob("*-reverse.json"))):
    sys.exit("Expected a session created by pair.mjs")

def read(name):
    return json.loads((session / name).read_text())

def short(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("Missing ballot evidence")
    text = " ".join(value.split())
    return text if len(text) <= 150 else text[:147] + "…"

for candidate in ("first", "second"):
    filename = candidate + ".grade.json"
    if (session / filename).exists():
        rows = {r["id"]: r for r in read(filename)["criteria"]}
        operator_file = session / (candidate + ".operator.json")
        operator = read(operator_file.name) if operator_file.exists() else {}
        summary = []
        for key in ("png", "html", "sameDesign", "rebuild", "edit"):
            row = rows[key]
            result = "pending" if row["earned"] is None else ("pass" if row["earned"] == row["possible"] else "fail")
            if key in ("rebuild", "edit") and key in operator:
                observation = operator[key]
                short(observation["evidence"])
                if type(observation["pass"]) is not bool:
                    sys.exit(f"{operator_file}: expected true or false for {key}")
                result = "pass" if observation["pass"] else "fail"
            summary.append(f"{key} {result}")
        print(candidate, "·", ", ".join(summary))
    else:
        print(candidate, "· delivery evidence pending")

votes = []
for judge in ("codex", "agy"):
    choices = []
    notes = []
    observation = None
    misses = set()
    for room, order in (("forward", ("first", "second")), ("reverse", ("second", "first"))):
        name = f"{judge}-{room}.json"
        if not (session / name).exists():
            continue
        ballot = read(name)
        short(ballot["thumbnail"])
        counts = {}
        for side, candidate in zip(("A", "B"), order):
            tasks = ballot["reading"][side]
            passed = 0
            for key in ("headline", "artwork", "export"):
                item = tasks[key]
                short(item["answer"])
                short(item["location"])
                if type(item["correct"]) is not bool:
                    sys.exit(f"{name}: mark each answer against the held-out key")
                passed += item["correct"]
                if not item["correct"]:
                    misses.add(f"{candidate} {key}")
            counts[candidate] = passed
        notes.append(f"{room} {counts['first']}/3 vs {counts['second']}/3")
        choice = ballot.get("choice")
        if choice is None:
            continue
        observation = short(ballot["reason"])
        choices.append({"A": order[0], "B": order[1], "tie": "tie", "abstain": "abstain"}[choice])
    if len(choices) < 2:
        verdict = "pending"
    elif choices[0] != choices[1]:
        verdict = "order-sensitive"
    else:
        verdict = choices[0]
    if misses:
        notes.append("missed " + ", ".join(sorted(misses)))
    votes.append(verdict)
    print(" · ".join([judge, verdict, *notes] + ([observation] if observation else [])))
winner = votes[0] if votes[0] == votes[1] and votes[0] in ("first", "second", "tie") else "inconclusive"
print(f"Panel preference · {winner}\nEvidence · {session}")
