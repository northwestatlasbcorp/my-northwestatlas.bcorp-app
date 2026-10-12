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

# A non-visible overflow on html or body is never a local decision. Chrome propagates the
# declared value to the viewport; an engine that does not propagate - the Android WebView
# behind the Instagram and Facebook in-app browsers - instead turns the element itself into
# a scroll container, with the sibling axis coerced from visible to auto. Either way the
# phone renders the page and then refuses to pan it vertically, while the same page scrolls
# normally in Chrome. `clip` clips exactly like `hidden` without creating a scroll
# container, so it is the only value allowed on these two selectors.
# :root is html spelled differently, and html.dark / body.dark are the same element as
# html / body. A selector that only mentions them as an ancestor (".x body") still applies
# to body, so it is flagged too; a class that merely starts with those letters is not.
ROOT_OVERFLOW_SELECTOR = r"(?:html|body|:root)(?:[.#\[][^,{}\s]*)*"
ROOT_OVERFLOW_BLOCK = re.compile(
    rf"(?<![\w.#-])({ROOT_OVERFLOW_SELECTOR})(?![\w-])\s*(?:,[^{{}}]*)?\{{([^{{}}]*)\}}"
)
SCROLL_CONTAINER_OVERFLOW = re.compile(
    r"overflow(?:-[xy])?\s*:\s*(hidden|scroll|auto)\b", re.IGNORECASE
)

# The root is stricter: it has no safe non-default value here. `clip` on html stops the
# viewport from being the plain scroll container, and Chromium then keeps body as its own
# scroller - scrolling still happens, but on the main thread, which is exactly the jank
# that `hidden` -> `clip` introduced. The keywords are explicit so that prose in a comment
# ("carries no overflow: it applies to the viewport") can never read as a declaration.
ROOT_OVERFLOW_SELECTOR_RE = re.compile(r"^(?:html|:root)\b", re.IGNORECASE)
ROOT_FORBIDDEN_OVERFLOW = re.compile(
    r"overflow(?:-[xy])?\s*:\s*(hidden|scroll|auto|clip|overlay)\b", re.IGNORECASE
)
CSS_COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)


def without_comments(css: str) -> str:
    """Blank out comments while keeping every offset, so line numbers stay true."""
    return CSS_COMMENT.sub(lambda m: re.sub(r"[^\n]", " ", m.group(0)), css)

# Inline CSS and the shared stylesheet both reach the pages, so the rule covers both.
STYLE_FILE_GLOB = "styles/*.css"

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

# The only lawful reasons a bundled file may keep a reserved name - the full phrase or any word of it:
# it is the upstream file, unmodified, or the copyright holder granted explicit written permission
# (OFL condition 3, OFL-FAQ 5.4). Map filename to that evidence - and do not add an entry to make a
# build pass; rename the font instead.
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


def check_root_scroll_containers() -> list[str]:
    """Forbid overflow values that turn the document root or body into a scroll container.

    Regression guard for the scrolling failure in the Instagram in-app browser on Android:
    the page rendered, but the gesture did nothing. Both the inline CSS of every page and
    the shared stylesheet are scanned, because a mobile-only block is exactly where the
    anti-pattern would come back unnoticed.
    """
    errors: list[str] = []
    for path in [*page_files(), *sorted(ROOT.glob(STYLE_FILE_GLOB))]:
        text = without_comments(path.read_text(encoding="utf-8", errors="replace"))
        for block in ROOT_OVERFLOW_BLOCK.finditer(text):
            selector, declarations = block.group(1), block.group(2)
            lineno = text.count("\n", 0, block.start(1)) + 1
            if ROOT_OVERFLOW_SELECTOR_RE.match(selector):
                root_hit = ROOT_FORBIDDEN_OVERFLOW.search(declarations)
                if root_hit:
                    errors.append(
                        f"{path.relative_to(ROOT)}:{lineno}: {selector} sets overflow "
                        f"'{root_hit.group(1)}' - the root's overflow applies to the viewport: "
                        "'hidden' stopped vertical panning in Android in-app WebViews and 'clip' "
                        "moved scrolling off the compositor; keep the root default and clip on body"
                    )
                continue
            found = SCROLL_CONTAINER_OVERFLOW.search(declarations)
            if found:
                errors.append(
                    f"{path.relative_to(ROOT)}:{lineno}: {selector} uses overflow "
                    f"'{found.group(1)}', which stops vertical panning in Android in-app "
                    "WebViews - use 'clip'"
                )
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


def rfn_findings(value: str, reserved) -> list[tuple[str, str, str]]:
    """Every way a presented name collides with a Reserved Font Name: (kind, matched, reserved name).

    `whole` - the declared name itself appears in `value`. `word` - an individual *word* of a multi-word
    declaration appears as a word of `value`, which OFL-FAQ 5.4 also forbids: *"You may not use individual
    words from the Reserved Font Names, but you would be allowed to use parts of words, as long as you do
    not use any word from the Reserved Font Names entirely."* At most one finding per reserved name, and
    the whole-phrase hit wins, so a rename report does not double-count.

    A third kind, `packed`, catches the rename-that-is-not-a-rename: `PlayfairDisplay` or
    `Playfair-Display` compared with punctuation stripped. And a `word` hit is required to be a whole word,
    so `Displayport` is not a collision while `NWA-Display` is.

    Two limits are deliberate. Fragments of a single reserved word are not reported, because 5.4 allows
    them - catching `Playfard` is a reviewer's judgement call, not a machine rule. And the whole rule is
    scoped to what the licences in this bundle actually declare: `Serif`, `Sans` and `Text` are
    unrestricted, while `Display` is restricted only because `"Playfair Display"` is the reservation
    these files ship with.
    """
    lowered = value.casefold()
    packed = re.sub(r"[^a-z0-9]", "", lowered)
    findings: list[tuple[str, str, str]] = []
    for name in sorted(reserved):
        target = name.casefold()
        if target in lowered:
            findings.append(("whole", name, name))
            continue
        for word in sorted(target.split()):
            if re.search(rf"\b{re.escape(word)}\b", lowered):
                findings.append(("word", word, name))
                break
        else:
            squashed = re.sub(r"[^a-z0-9]", "", target)
            if len(squashed) > 4 and squashed in packed:
                findings.append(("packed", name, name))
    return findings


def _rfn_description(kind: str, matched: str, name: str, attribution: str) -> str:
    """One sentence naming the collision and the clause that prohibits it."""
    if kind == "whole":
        return f"uses the Reserved Font Name {name!r} of {attribution}"
    if kind == "packed":
        return (
            f"uses the Reserved Font Name {name!r} of {attribution} with the words run together - "
            "removing a space is not a rename (condition 3 is about the name, not its formatting)"
        )
    return (
        f"uses the word {matched!r} of the Reserved Font Name {name!r} of {attribution} - a renamed "
        "Modified Version may not reuse an individual word of a reserved name (OFL-FAQ 5.4)"
    )


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
    """No file we built may present a Reserved Font Name - or a word of one - as its own name.

    OFL condition 3 restricts the primary font name as presented to the users, and OFL-FAQ 5.4 extends
    that to individual words of the reservation, so a subset of `"Playfair Display"` may be called
    neither `Playfair Display` nor `NWA Display`. Three places a name is presented are checked: the
    `@font-face` families in fonts/nwa-fonts.css, the internal family recorded per binary in
    fonts/LICENSES.md, and the shipped file names. The gate reads the audit record rather than the WOFF2
    - it has to stay dependency-free - so scripts/check_font_names.py is the companion that reads the
    files themselves with the same matcher.
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

    def report(where: str, value: str, remedy: str, subject: str = "") -> list[str]:
        out = []
        for kind, matched, name in rfn_findings(value, reserved):
            attribution = OFL_RESERVED_FONT_NAMES.get(name, "an upstream licence")
            out.append(
                f"{where}: {subject}{value!r} {_rfn_description(kind, matched, name, attribution)} - {remedy}"
            )
        return out

    errors: list[str] = []

    css = ROOT / "fonts" / "nwa-fonts.css"
    if css.is_file():
        sheet = css.read_text(encoding="utf-8", errors="replace")
        families = dict.fromkeys(
            found.strip().strip("\"'") for found in re.findall(r"font-family\s*:\s*([^;}]+)", sheet)
        )
        for family in families:
            errors += report(
                "fonts/nwa-fonts.css",
                family,
                "a subset is a Modified Version, so the face has to be named as ours",
            )

    fonts_dir = ROOT / "fonts"
    if fonts_dir.is_dir():
        for path in sorted(fonts_dir.glob("*.woff2")):
            if path.name in RESERVED_NAME_EXCEPTIONS:
                continue
            errors += report(
                f"fonts/{path.name}",
                path.name,
                "the licence restricts the name a font is presented by, and this bundle keeps the file "
                "name aligned with it so a renamed face cannot be served under the old one",
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
            errors += report(
                FONT_LICENCE_INDEX,
                row[family_at],
                "rename the face in the binary and in the CSS, or record the evidence that permits it in "
                "RESERVED_NAME_EXCEPTIONS",
                subject=f"the {header[family_at]} recorded for "
                f"{filename.group(1) if filename else row[file_at]!r} is ",
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
    check_root_scroll_containers,
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
