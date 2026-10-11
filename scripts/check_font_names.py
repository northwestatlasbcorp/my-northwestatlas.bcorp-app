#!/usr/bin/env python3
"""Deep licence control for the shipped webfonts: reads the binaries, not the notes about them.

`verify.py` is the release gate and must stay dependency-free, so it checks the audit record
(`fonts/LICENSES.md`) and the CSS families. This script is the companion that parses the WOFF2 files
themselves and answers the two questions the record cannot answer on its own:

    does a file we built still present an upstream Reserved Font Name as its family name?
    does the record of which `name` records survived actually match the binary?

    scripts/check_font_names.py                    # over fonts/
    scripts/check_font_names.py --fonts /tmp/old   # over any directory of WOFF2 files
    scripts/check_font_names.py --quiet

Exit codes
    0  clean
    1  a violation was found
    2  fontTools is not installed, or the inputs are missing - the check did not run

Needs: python3 -m pip install fonttools brotli   (not a CI dependency by design)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

# The `name` records through which a font is presented to a user: family, subfamily, unique id, full
# name, PostScript name, preferred family/subfamily, licensed family. OFL condition 3 speaks about the
# name a Modified Version is "still displayed to users as part of the software", which is these.
USER_FACING = (1, 2, 3, 4, 6, 16, 17, 25)

# Condition 2 accepts the notice in the licence file instead of the binary, so an absent ID 7 or 13 is
# recorded, not failed. ID 0 is not optional: it is the copyright line, and a subset that lost it lost
# the only record of who the font belongs to.
REQUIRED_RECORDS = (0,)

# A renamed Modified Version has to say what it came from, otherwise the rename reads like a claim of
# authorship. The OFL-FAQ recommends recording the provenance in the font itself.
PROVENANCE_ID = 10
PROVENANCE_MARKS = ("subset",)

LICENCE_NOTICE = "fonts/OFL.txt"
LICENCE_INDEX = "fonts/LICENSES.md"
SHIP_SECTION = "## What is shipped"


def name_records(font) -> dict[int, str]:
    table = font["name"]
    found: dict[int, str] = {}
    for name_id in sorted(set(USER_FACING) | set(REQUIRED_RECORDS) | {PROVENANCE_ID}):
        for plat, enc, lang in ((3, 1, 0x409), (1, 0, 0), (3, 0, 3)):
            value = table.getName(name_id, plat, enc, lang)
            if value:
                found[name_id] = str(value)
                break
    return found


def present_ids(font) -> set[int]:
    return {rec.nameID for rec in font["name"].names}


def reserved_from_notice(root: Path) -> set[str]:
    """Names the shipped notice declares as reserved, tolerating wrapped lines.

    Matched only in the two shapes an upstream notice uses; the licence body quotes the phrase
    "Reserved Font Name" in its own definitions and that is not a declaration.
    """
    text = " ".join((root / LICENCE_NOTICE).read_text(encoding="utf-8", errors="replace").split())
    return {
        name
        for pair in re.findall(r'Reserved Font Names?:\s*"([^"]+)"|with Reserved Font Name\s+"([^"]+)"', text)
        for name in pair
        if name
    }


def recorded_rows(root: Path) -> dict[str, dict[str, str]]:
    """`fonts/LICENSES.md` -> {filename: {column header: cell}}, one entry per shipped file."""
    text = (root / LICENCE_INDEX).read_text(encoding="utf-8", errors="replace")
    start = text.find(SHIP_SECTION)
    if start == -1:
        return {}
    rest = text[start + len(SHIP_SECTION):]
    end = rest.find("\n## ")
    rows: dict[str, dict[str, str]] = {}
    lines = [line for line in rest.splitlines() if line.strip().startswith("|")]
    if len(lines) < 2:
        return rows
    header = [cell.strip() for cell in lines[0].strip().strip("|").split("|")]
    for line in lines[1:]:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) != len(header) or set("".join(cells)) <= set("-: "):
            continue
        match = re.search(r"`([^`]+\.woff2)`", cells[0])
        if match:
            rows[match.group(1)] = dict(zip(header, cells))
    return rows


def check(fonts_dir: Path, root: Path, quiet: bool = False) -> list[str]:
    from fontTools.ttLib import TTFont  # imported by the caller, which reports a missing dependency

    reserved = reserved_from_notice(root)
    rows = recorded_rows(root)
    problems: list[str] = []
    if not reserved:
        problems.append(f"{LICENCE_NOTICE}: no Reserved Font Name declared, so this check has nothing to enforce")
    if not rows:
        problems.append(f"{LICENCE_INDEX}: no {SHIP_SECTION!r} table to cross-check against")

    for path in sorted(fonts_dir.glob("*.woff2")):
        try:
            font = TTFont(path)
        except Exception as exc:  # unreadable font means unreadable records, not a clean licence
            problems.append(f"{path.name}: cannot be parsed ({type(exc).__name__}: {exc})")
            continue
        records = name_records(font)
        row = rows.get(path.name, {})
        upstream = row.get("Upstream face", "")
        # A file whose own record says its upstream reserves a name must not be called by it. Names are
        # compared against the reservation list from the notice, so an unrecorded file is still covered.
        # ID 0 (copyright) and ID 10 (our provenance note) name the upstream family on purpose - that
        # is the attribution condition 3 tells us to keep - so only the presented names are compared.
        presented = {key: value for key, value in records.items() if key in USER_FACING}
        offenders = {name for name in reserved if any(name in value for value in presented.values())}
        for name in sorted(offenders):
            where = ", ".join(f"id{key}={value!r}" for key, value in presented.items() if name in value)
            problems.append(
                f"{path.name}: presents the Reserved Font Name {name!r} as its own name ({where}) - "
                "a subset is a Modified Version, so rename it (OFL condition 3)"
            )
        for name_id in REQUIRED_RECORDS:
            if not records.get(name_id):
                problems.append(f"{path.name}: name ID {name_id} (copyright) is absent - condition 2 needs it here or in the notice")

        family = records.get(1, "")
        upstream_family = re.split(r",\s*RFN|,", upstream)[0].strip() if upstream else ""
        if upstream_family and family and upstream_family not in family:
            provenance = records.get(PROVENANCE_ID, "")
            if not provenance or not all(mark in provenance.lower() for mark in PROVENANCE_MARKS):
                problems.append(
                    f"{path.name}: renamed to {family!r} but records no provenance in name ID {PROVENANCE_ID} "
                    f"(expected a note saying it is a subset of {upstream_family!r})"
                )

        if row:
            claimed = {int(n) for n in re.findall(r"ID (\d+)", row.get("Records kept in file", ""))}
            actual = present_ids(font)
            missing = sorted(claimed - actual)
            if missing:
                problems.append(
                    f"{path.name}: {LICENCE_INDEX} records name ID "
                    f"{', '.join(map(str, missing))} as kept, but the binary does not contain them - the audit record drifts"
                )
            if not quiet:
                ids = sorted(actual & (set(USER_FACING) | set(REQUIRED_RECORDS) | {PROVENANCE_ID}))
                marks = "yes" if any(name in upstream for name in reserved) else "no"
                print(f"  {path.name:<34} family={family!r:<24} ids={ids} upstream name reserved: {marks}")

    return problems


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--fonts", default=None, help="directory of WOFF2 files to inspect (default: fonts/)")
    parser.add_argument("--quiet", action="store_true", help="print problems only")
    args = parser.parse_args(argv)

    fonts_dir = Path(args.fonts) if args.fonts else REPO / "fonts"
    if not fonts_dir.is_dir():
        print(f"FAIL - {fonts_dir} is not a directory", file=sys.stderr)
        return 2
    try:
        problems = check(fonts_dir, REPO, quiet=args.quiet)
    except ImportError:
        # An unrunnable check is not a passed check: the deep control needs fontTools, and CI has no
        # dependency on it by design. Report loudly instead of printing a clean result.
        print("FAIL - fontTools is not installed, so the binaries were not read: python3 -m pip install fonttools brotli", file=sys.stderr)
        return 2
    if not args.quiet:
        print(f"inspected {fonts_dir}")
    if problems:
        print(f"FAIL - {len(problems)} font licence problem(s):")
        for problem in problems:
            print(f"  - {problem}")
        return 1
    print("PASS - no Modified Version in the bundle presents a Reserved Font Name as its own family")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
