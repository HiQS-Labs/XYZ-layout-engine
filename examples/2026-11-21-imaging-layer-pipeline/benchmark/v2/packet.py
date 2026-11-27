"""Build the editorial handout from the frozen v1 inputs."""
import sys
from pathlib import Path
from zipfile import ZipFile

here = Path(__file__).resolve().parent
with ZipFile(here.parent / "creative-handout.zip") as source, ZipFile(sys.argv[1], "x") as dest:
    for entry in source.infolist():
        data = ((here / entry.filename).read_bytes() if entry.filename in {"PROMPT.md", "GOALS.md"}
                else source.read(entry))
        dest.writestr(entry, data)
