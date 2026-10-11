#!/usr/bin/env python3
"""Release checks for the North West Atlas static site.

Dependency-free on purpose: the repository has no JS build step, and this gate
must stay runnable with nothing but a supported Python interpreter.

    python3 scripts/verify.py            # human readable
    python3 scripts/verify.py --quiet    # exit status only

Exit codes
    0  all checks passed
    1  a check failed (see stdout)
    2  the checker itself could not run

Checks are grouped in CHECKS below. Each returns a list of problem strings, so
a new rule is one function and one line in CHECKS - no shared state.
"""
from __future__ import annotations

import re
import struct
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

SITE_HOSTS = frozenset({"northwestatlas.com", "www.northwestatlas.com"})

# Hosts we are willing to *load a resource from* (script/style/img/preload).
# Plain hyperlinks in <a href> are not restricted - the site links out on purpose.
ALLOWED_RESOURCE_HOSTS = frozenset(
    {
        "cdn.jsdelivr.net",  # chart.js, luxon, chartjs adapters (toolkit)
        "cdnjs.cloudflare.com",  # html2canvas, jspdf (toolkit, contagion)
    }
    | SITE_HOSTS
)

# Files whose absence breaks the deployment rather than one page.
REQUIRED = [
    "index.html",
    "index-en.htm",
    "toolkit.html",
    "contagion.html",
    "enforcement.html",
    "research.html",
    "disclosures.html",
    "privacy.html",
    "terms.html",
    "404.html",
    "robots.txt",
    "sitemap.xml",
    "manifest.json",
    "CNAME",
    "favicon.ico",
    "_headers",
    "og-image-enhanced.png",
    "fonts/nwa-fonts.css",
    "styles/nwa-mobile-2026.css",
    "nwa-data-proxy-worker.js",
    "wrangler.jsonc",
]

# Redirect stubs and the operator-facing smoke test: exempt from title/lang/OG rules.
NON_CONTENT_PAGES = frozenset({"404.html", "index-en.html", "index-en.htm", "nwa-smoke-test.html"})

# Credential-shaped text that must never reach a commit.
SECRET_PATTERNS = (
    ("private key block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("AWS access key id", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("Slack token", re.compile(r"\bxox[baprs]-[0-9A-Za-z-]{10,}\b")),
    ("bearer JWT", re.compile(r"\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}")),
    (
        "hard-coded credential",
        re.compile(r"(?i)\b(api[_-]?key|secret|password|passwd|token)\b\s*[:=]\s*['\"][^'\"]{20,}['\"]"),
    ),
)

# Intentional test fixtures need an escape hatch: a marker on the offending line is
# visible in review, whereas excluding whole files would blind the scanner.
SECRET_ALLOW_MARKER = "verify:allow-secret"
SECRET_SCAN_EXEMPT = frozenset({Path("scripts/verify.py")})

# Claims that must never appear without documentary evidence (see Linear NOR-10).
BANNED_PHRASES = ("B Corp Certified",)

# Webfonts ship as subset WOFF2 only; source binaries do not belong in a public bundle.
FONT_SOURCE_SUFFIXES = frozenset({".ttf", ".otf", ".eot"})

# A font may only be published with its licence attached: fonts/LICENSES.md is the record,
# fonts/OFL.txt the text. This gate exists because a commercial face sat in the public bundle
# behind nothing but a note saying its licence still had to be confirmed (Linear NOR-13).
FONT_SHIP_SECTION = "## What is shipped"
FONT_LICENCE_INDEX = "fonts/LICENSES.md"
FONT_LICENCE_TEXT = "fonts/OFL.txt"
OPEN_FONT_LICENCE_MARK = "Open Font License"
# OFL condition 3: a Modified Version may not carry a Reserved Font Name as the name it is presented
# under, and under the licence's own definition a subset re-encoded to WOFF2 *is* a Modified Version
# (glyphs deleted, format changed). These are the names the upstream licences of the faces we ship
# reserve, so a build cannot quietly put them back into a family name - the names in the binaries and
# in fonts/nwa-fonts.css must be ours. fonts/LICENSES.md records why each file is named as it is, and
# scripts/check_font_names.py runs the same rule against the binaries themselves (this gate is
# dependency-free, so it reads the audit record and the CSS rather than parsing WOFF2).
OFL_RESERVED_FONT_NAMES = {
    "Plex": "IBM Plex Mono, Copyright 2017 IBM Corp.",
    "Playfair Display": "Playfair Display, Copyright 2017 The Playfair Display Project Authors",
}

# The only lawful reasons a bundled file may keep a reserved name: it is the upstream file, unmodified,
# or the copyright holder granted explicit written permission (OFL condition 3). Map filename to that
# evidence - and do not add an entry to make a build pass; rename the font instead.
RESERVED_NAME_EXCEPTIONS: dict[str, str] = {}

LICENCE_UNRESOLVED_PHRASES = (
    "not in this repository",
    "unconfirmed",
    "needs confirmation",
    "to be confirmed",
    "review required",
)

IGNORED_REF_PREFIXES = ("#", "mailto:", "tel:", "javascript:", "data:", "blob:")

SKIP_DIRS = frozenset({".git", "node_modules", "__pycache__", ".wrangler", ".venv", "dist"})


class ResourceRef(HTMLParser):
    """Collects every href/src plus metadata that points at a repository file."""

    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {k: v for k, v in attrs if v is not None}
        for attr in ("href", "src"):
            if attr in data:
                self.refs.append((attr, data[attr]))
        if tag == "meta" and data.get("property") in {"og:image", "og:image:url"}:
            self.refs.append(("og:image", data.get("content", "")))
        if tag == "meta" and data.get("name") in {"twitter:image", "twitter:image:src"}:
            self.refs.append(("twitter:image", data.get("content", "")))


def page_files() -> list[Path]:
    return sorted(p for p in ROOT.glob("*.htm*") if p.is_file())


def resolve_ref(ref: str, page: Path) -> str | None:
    """Repository-relative path a reference points at, or None if not local."""
    ref = unquote(ref.strip())
    if not ref or ref.startswith(IGNORED_REF_PREFIXES):
        return None
    parts = urlsplit(ref)
    if parts.scheme in {"http", "https"}:
        if parts.netloc not in SITE_HOSTS:
            return None
        return (parts.path.lstrip("/") or "index.html")
    if parts.scheme or parts.netloc:
        return None
    if not parts.path:
        return None
    if parts.path == "/":
        return "index.html"
    if ref.startswith("/"):
        return parts.path.lstrip("/")
    return (page.parent / parts.path).relative_to(ROOT).as_posix()


def check_required_files() -> list[str]:
    return [f"missing required file: {name}" for name in REQUIRED if not (ROOT / name).is_file()]


def check_local_references() -> list[str]:
    errors: list[str] = []
    for page in page_files():
        parser = ResourceRef()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))
        for attr, ref in parser.refs:
            target = resolve_ref(ref, page)
            if target and not (ROOT / target).is_file():
                errors.append(f"{page.name}: {attr} target is missing: {ref}")
    return errors


def check_manifest_and_sitemap() -> list[str]:
    errors: list[str] = []
    manifest = ROOT / "manifest.json"
    if manifest.is_file():
        for src in re.findall(r'"src"\s*:\s*"([^"]+)"', manifest.read_text(encoding="utf-8")):
            target = resolve_ref(src, manifest)
            if target and not (ROOT / target).is_file():
                errors.append(f"manifest.json: icon target is missing: {src}")
    sitemap = ROOT / "sitemap.xml"
    if sitemap.is_file():
        for loc in re.findall(r"<loc>(.*?)</loc>", sitemap.read_text(encoding="utf-8")):
            value = loc.strip()
            if not value.startswith("https://"):
                errors.append(f"sitemap.xml: <loc> must be an https URL on the production host: {value}")
                continue
            target = resolve_ref(value, ROOT / "index.html")
            if target is None:
                errors.append(f"sitemap.xml: {value} is not a URL on the production host")
            elif not (ROOT / target).is_file():
                errors.append(f"sitemap.xml: {value} maps to a missing file: {target}")
    return errors


def check_page_metadata() -> list[str]:
    errors: list[str] = []
    for page in page_files():
        if page.name in NON_CONTENT_PAGES:
            continue
        text = page.read_text(encoding="utf-8", errors="replace")
        if "<title>" not in text:
            errors.append(f"{page.name}: missing <title>")
        if not re.search(r"<html[^>]*\slang=", text):
            errors.append(f"{page.name}: <html> has no lang attribute")
        if 'name="viewport"' not in text:
            errors.append(f"{page.name}: missing viewport meta")
    return errors


class IdCollector(HTMLParser):
    """Real tag ids only - a regex would also hit ids inside data: URIs in CSS."""

    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name == "id" and value:
                self.ids.append(value)


def check_duplicate_ids() -> list[str]:
    errors: list[str] = []
    for page in page_files():
        collector = IdCollector()
        collector.feed(page.read_text(encoding="utf-8", errors="replace"))
        seen, dup = set(), set()
        for value in collector.ids:
            (dup if value in seen else seen).add(value)
        for value in sorted(dup):
            errors.append(f"{page.name}: duplicate id breaks anchors and getElementById: {value}")
    return errors


def sitemap_pages() -> set[str]:
    """File names the site asks search engines to index."""
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.is_file():
        return set()
    urls = re.findall(r"<loc>(.*?)</loc>", sitemap.read_text(encoding="utf-8"))
    return {resolve_ref(u.strip(), ROOT / "index.html") or "" for u in urls}


def check_canonicals() -> list[str]:
    """Every indexed page listed in the sitemap must carry a self-referencing canonical."""
    errors: list[str] = []
    listed = sitemap_pages()
    for page in page_files():
        if page.name not in listed:
            continue
        text = page.read_text(encoding="utf-8", errors="replace")
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', text)
        if canonical is None:
            errors.append(f"{page.name}: in sitemap.xml but has no canonical link")
            continue
        target = resolve_ref(canonical.group(1), page)
        if target != page.name:
            errors.append(f"{page.name}: canonical {canonical.group(1)} does not point at itself")
    return errors


def check_open_graph_images() -> list[str]:
    """Declared og:image dimensions must match the bytes on disk."""
    errors: list[str] = []
    indexed = sitemap_pages()
    for page in page_files():
        if page.name in NON_CONTENT_PAGES:
            continue
        text = page.read_text(encoding="utf-8", errors="replace")
        image = re.search(r'<meta property="og:image" content="([^"]+)"', text)
        if image is None:
            if page.name in indexed:
                errors.append(f"{page.name}: indexed page has no og:image")
            continue
        width = re.search(r'<meta property="og:image:width" content="(\d+)"', text)
        height = re.search(r'<meta property="og:image:height" content="(\d+)"', text)
        if not (width and height):
            continue  # dimensions are optional metadata; only lying about them is a defect
        target = resolve_ref(image.group(1), page)
        if not target:
            continue
        path = ROOT / target
        actual = png_size(path)
        if actual is None:
            continue
        declared = (int(width.group(1)), int(height.group(1)))
        if declared != actual:
            errors.append(
                f"{page.name}: og:image:width/height declares {declared[0]}x{declared[1]} "
                f"but {target} is {actual[0]}x{actual[1]}"
            )
    return errors


def png_size(path: Path) -> tuple[int, int] | None:
    try:
        head = path.read_bytes()[:33]
    except OSError:
        return None
    if len(head) < 33 or head[:8] != b"\x89PNG\r\n\x1a\n" or head[12:16] != b"IHDR":
        return None
    width, height = struct.unpack(">II", head[16:24])
    return int(width), int(height)


class ResourceLoader(HTMLParser):
    """Third-party load surface: script/style/img/iframe with an absolute URL.

    preconnect/dns-prefetch/manifest/canonical are deliberately not resources here -
    they fetch nothing executable and are governed by CSP connect-src instead.
    """

    def __init__(self) -> None:
        super().__init__()
        self.loaded: list[tuple[str, str, bool]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {k: v for k, v in attrs if v is not None}
        rel = {part.lower() for part in data.get("rel", "").split()}
        url = data.get("src") or (data.get("href") if rel & {"stylesheet", "modulepreload"} else "")
        if not url or not url.lower().startswith(("http://", "https://")):
            return
        kind = {
            "script": "script",
            "img": "img",
            "iframe": "iframe",
            "link": "stylesheet" if "stylesheet" in rel else None,
        }.get(tag)
        if kind:
            self.loaded.append((kind, url, "integrity" in data))


def check_third_party_resources() -> list[str]:
    errors: list[str] = []
    for page in page_files():
        loader = ResourceLoader()
        loader.feed(page.read_text(encoding="utf-8", errors="replace"))
        for kind, url, has_integrity in loader.loaded:
            host = urlsplit(url).netloc
            if host not in SITE_HOSTS and host not in ALLOWED_RESOURCE_HOSTS:
                errors.append(f"{page.name}: {kind} loaded from an unlisted host: {host}")
            elif kind == "script" and host not in SITE_HOSTS and not has_integrity:
                errors.append(
                    f"{page.name}: third-party script has no SRI integrity attribute: {url}"
                )
    return errors


def check_font_source_binaries() -> list[str]:
    errors: list[str] = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in FONT_SOURCE_SUFFIXES:
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        errors.append(
            f"{path.relative_to(ROOT)}: webfont source binary in the public bundle - "
            "subset to WOFF2 under fonts/ instead (see fonts/LICENSES.md)"
        )
    return errors


def font_licence_section(text: str) -> str:
    """The block of fonts/LICENSES.md that makes claims about files in the bundle.

    The removal log below it deliberately names files that no longer exist, so it must not be
    read as an inventory.
    """
    start = text.find(FONT_SHIP_SECTION)
    if start == -1:
        return ""
    rest = text[start + len(FONT_SHIP_SECTION):]
    end = rest.find("\n## ")
    return rest if end == -1 else rest[:end]


def check_font_licences() -> list[str]:
    """Every WOFF2 in the public bundle needs a resolved licence record next to it."""
    fonts_dir = ROOT / "fonts"
    bundled = sorted(path.name for path in fonts_dir.glob("*.woff2")) if fonts_dir.is_dir() else []
    if not bundled:
        return []
    index = ROOT / FONT_LICENCE_INDEX
    if not index.is_file():
        return [
            f"{FONT_LICENCE_INDEX}: {len(bundled)} webfont(s) in the bundle and no licence record at all"
        ]

    text = index.read_text(encoding="utf-8", errors="replace")
    section = font_licence_section(text)
    if not section:
        return [f"{FONT_LICENCE_INDEX}: no {FONT_SHIP_SECTION!r} section to record fonts against"]

    errors: list[str] = []
    recorded = set(re.findall(r"`([^`]+\.woff2)`", section))
    for name in bundled:
        if name not in recorded:
            errors.append(f"fonts/{name}: bundled webfont is not recorded in {FONT_LICENCE_INDEX}")
    for name in sorted(recorded - set(bundled)):
        errors.append(f"{FONT_LICENCE_INDEX}: records {name}, which is not in the bundle")
    lowered = section.lower()
    for phrase in LICENCE_UNRESOLVED_PHRASES:
        if phrase in lowered:
            errors.append(
                f"{FONT_LICENCE_INDEX}: a shipped row records an unresolved licence ({phrase!r}) - "
                "publish the font only once its rights are settled"
            )
    if OPEN_FONT_LICENCE_MARK in section and not (ROOT / FONT_LICENCE_TEXT).is_file():
        errors.append(
            f"{FONT_LICENCE_TEXT}: faces ship under the OFL, which requires the licence text to "
            "accompany them"
        )
    return errors


def _notice_reserved_names(notice: str) -> set[str]:
    """Reserved Font Names declared in a licence notice, tolerating wrapped lines.

    Only the two shapes an upstream notice actually uses are matched - `Reserved Font Name: "X"` and
    `with Reserved Font Name "X"` - because the OFL body itself quotes the phrase "Reserved Font Name"
    in its definitions, and that is a term being defined, not a name being reserved.
    """
    flat = " ".join(notice.split())
    found = re.findall(r'Reserved Font Names?:\s*"([^"]+)"|with Reserved Font Name\s+"([^"]+)"', flat)
    return {first or second for first, second in found if first or second}


def _markdown_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def _markdown_column(cells: list[str], startswith: str) -> int | None:
    for index, cell in enumerate(cells):
        if cell.lower().startswith(startswith):
            return index
    return None


def _shipped_font_rows(section: str) -> tuple[list[str], list[list[str]]]:
    """Header cells and body rows of the first markdown table in a LICENSES.md section."""
    lines = [line for line in section.splitlines() if line.strip().startswith("|")]
    if len(lines) < 2:
        return [], []
    header = _markdown_row(lines[0])
    rows = [_markdown_row(line) for line in lines[1:]]
    return header, [row for row in rows if len(row) == len(header) and set("".join(row)) - set("-: ")]


def check_font_reserved_names() -> list[str]:
    """No file we built may present itself under a Reserved Font Name (OFL condition 3).

    Two places a name is "presented": the `@font-face` families in fonts/nwa-fonts.css, and the
    internal family name recorded in fonts/LICENSES.md's table for each binary. The gate reads the
    record rather than the WOFF2 - it has to stay dependency-free - so scripts/check_font_names.py
    is the companion that reads the files themselves.
    """
    notice = ROOT / FONT_LICENCE_TEXT
    reserved = set(OFL_RESERVED_FONT_NAMES)
    if notice.is_file():
        declared = _notice_reserved_names(notice.read_text(encoding="utf-8", errors="replace"))
        for name in sorted(declared):
            if name not in OFL_RESERVED_FONT_NAMES:
                return [
                    f"{FONT_LICENCE_TEXT}: declares a Reserved Font Name {name!r} that this map has no "
                    "rule for - add the name to OFL_RESERVED_FONT_NAMES, or rename the font"
                ]
        reserved |= declared

    def offending(value: str) -> list[str]:
        return sorted(name for name in reserved if name in value)

    errors: list[str] = []

    css = ROOT / "fonts" / "nwa-fonts.css"
    if css.is_file():
        sheet = css.read_text(encoding="utf-8", errors="replace")
        families = dict.fromkeys(
            found.strip().strip("\'\"") for found in re.findall(r"font-family\s*:\s*([^;}]+)", sheet)
        )
        for family in families:
            for name in offending(family):
                errors.append(
                    f"fonts/nwa-fonts.css: @font-face family {family!r} uses the Reserved Font Name "
                    f"{name!r} of {OFL_RESERVED_FONT_NAMES.get(name, 'an upstream licence')} - a subset "
                    "is a Modified Version, so the face has to be named as ours"
                )

    index = ROOT / FONT_LICENCE_INDEX
    if index.is_file():
        section = font_licence_section(index.read_text(encoding="utf-8", errors="replace"))
        header, rows = _shipped_font_rows(section)
        family_at, file_at = _markdown_column(header, "family"), _markdown_column(header, "file")
        if family_at is None:
            return errors
        for row in rows:
            filename = re.search(r"`([^`]+\.woff2)`", row[file_at] if file_at is not None else "")
            if filename and filename.group(1) in RESERVED_NAME_EXCEPTIONS:
                continue
            for name in offending(row[family_at]):
                errors.append(
                    f"{FONT_LICENCE_INDEX}: the {header[family_at]} recorded for "
                    f"{filename.group(1) if filename else row[file_at]!r} is a Reserved Font Name "
                    f"({name!r}, {OFL_RESERVED_FONT_NAMES.get(name, 'an upstream licence')}) - rename "
                    "the face in the binary and in the CSS, or record the evidence that permits it in "
                    "RESERVED_NAME_EXCEPTIONS"
                )
    return errors


def check_indexability_consistency() -> list[str]:
    """The three indexing signals must agree: robots.txt, sitemap.xml, page meta.

    Silence is not a strategy here - an unlisted directive defaults to "index",
    which is exactly how a page that someone meant to hide ends up in search.
    """
    errors: list[str] = []
    robots = (ROOT / "robots.txt").read_text(encoding="utf-8") if (ROOT / "robots.txt").is_file() else ""
    disallowed = {
        line.split(":", 1)[1].strip().lstrip("/")
        for line in robots.splitlines()
        if line.strip().lower().startswith("disallow:") and line.split(":", 1)[1].strip()
    }
    in_sitemap = sitemap_pages()
    for page in page_files():
        text = page.read_text(encoding="utf-8", errors="replace")
        declared = re.search(r'<meta name="robots" content="([^"]+)"', text)
        noindex = declared is not None and "noindex" in declared.group(1).lower()
        if page.name in NON_CONTENT_PAGES:
            continue
        if declared is None:
            errors.append(f"{page.name}: no explicit robots directive - crawlers default to indexing it")
        if page.name in in_sitemap and noindex:
            errors.append(
                f"{page.name}: listed in sitemap.xml but declares noindex - "
                "pick one: publish it or hide it"
            )
        if page.name in disallowed and not noindex:
            errors.append(f"{page.name}: Disallow in robots.txt without noindex - the URL can still be indexed")
    return errors


def check_banned_phrases() -> list[str]:
    errors: list[str] = []
    for page in page_files():
        text = page.read_text(encoding="utf-8", errors="replace")
        for phrase in BANNED_PHRASES:
            if phrase in text:
                errors.append(f"{page.name}: unsupported claim remains: {phrase!r}")
    return errors


def check_secrets() -> list[str]:
    """Catch credential-shaped strings before they become permanent history.

    Every pattern is reported per line so a file with several problems does not
    hide the rest behind its first match. This is a tripwire, not a replacement
    for rotating anything that was ever committed.
    """
    errors: list[str] = []
    for path in tracked_text_files():
        rel = path.relative_to(ROOT)
        if rel in SECRET_SCAN_EXEMPT:
            continue  # this file necessarily contains the patterns it looks for
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        for lineno, line in enumerate(lines, start=1):
            if SECRET_ALLOW_MARKER in line:
                continue
            for label, pattern in SECRET_PATTERNS:
                if pattern.search(line):
                    errors.append(f"{rel}:{lineno}: possible {label}")
    return errors


def tracked_text_files():
    """Files the release actually ships: repository text files, no tooling caches."""
    suffixes = {
        ".html",
        ".htm",
        ".css",
        ".js",
        ".mjs",
        ".json",
        ".jsonc",
        ".xml",
        ".txt",
        ".md",
        ".yml",
        ".yaml",
        ".py",
    }
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel_parts = path.relative_to(ROOT).parts
        if any(part in SKIP_DIRS for part in rel_parts):
            continue
        if path.suffix.lower() in suffixes:
            yield path


CHECKS = (
    check_required_files,
    check_local_references,
    check_manifest_and_sitemap,
    check_page_metadata,
    check_duplicate_ids,
    check_canonicals,
    check_open_graph_images,
    check_third_party_resources,
    check_indexability_consistency,
    check_font_source_binaries,
    check_font_licences,
    check_font_reserved_names,
    check_banned_phrases,
    check_secrets,
)


def run() -> list[str]:
    problems: list[str] = []
    for check in CHECKS:
        problems.extend(check())
    return problems


def main(argv: list[str]) -> int:
    quiet = "--quiet" in argv
    try:
        problems = run()
    except Exception as exc:  # a broken checker must not look like a clean release
        print(f"FAIL - the checker itself crashed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 2
    if problems:
        if not quiet:
            print(f"FAIL - {len(problems)} release check problem(s):")
            for problem in problems:
                print(f"  - {problem}")
        return 1
    if not quiet:
        pages = len(page_files())
        print(f"PASS - {pages} HTML files, {len(REQUIRED)} required assets, {len(CHECKS)} checks verified.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
