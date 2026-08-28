#!/usr/bin/env python3
"""Dependency-free release checks for the static NWA site."""
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {"northwestatlas.com", "www.northwestatlas.com"}
IGNORE_PREFIXES = ("#", "mailto:", "tel:", "javascript:", "data:")
REQUIRED = [
    "index.html", "toolkit.html", "contagion.html", "enforcement.html", "research.html",
    "disclosures.html", "privacy.html", "terms.html", "404.html", "robots.txt", "sitemap.xml",
    "manifest.json", "favicon.ico", "_headers", "og-image-enhanced.png", "og-toolkit.png",
]

class Links(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str]] = []
    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        for attr in ("href", "src"):
            value = data.get(attr)
            if value:
                self.refs.append((attr, value))

errors: list[str] = []
for name in REQUIRED:
    if not (ROOT / name).is_file():
        errors.append(f"Missing required file: {name}")

for page in sorted(ROOT.glob("*.htm*")):
    content = page.read_text(encoding="utf-8", errors="replace")
    parser = Links()
    parser.feed(content)
    for attr, ref in parser.refs:
        ref = unquote(ref.strip())
        if ref.startswith(IGNORE_PREFIXES):
            continue
        parts = urlsplit(ref)
        if parts.scheme in {"http", "https"}:
            if parts.netloc not in SITE_HOSTS:
                continue
            target = parts.path.lstrip("/") or "index.html"
        elif parts.scheme or parts.netloc:
            continue
        else:
            target = parts.path
            if not target:
                continue
            if target == "/":
                target = "index.html"
            else:
                target = target.lstrip("/") if ref.startswith("/") else str((page.parent / target).relative_to(ROOT))
        candidate = ROOT / target
        if not candidate.is_file():
            errors.append(f"{page.name}: {attr} target is missing: {ref}")

for page in sorted(ROOT.glob("*.htm*")):
    text = page.read_text(encoding="utf-8", errors="replace")
    if page.name not in {"404.html", "index-en.html", "index-en.htm"} and "<title>" not in text:
        errors.append(f"{page.name}: missing title")
    if "B Corp Certified" in text:
        errors.append(f"{page.name}: unsupported certification phrase remains")

if errors:
    print("FAIL — static release checks found issues:")
    for error in errors:
        print(f"  - {error}")
    sys.exit(1)
print(f"PASS — {len(list(ROOT.glob('*.htm*')))} HTML files and required release assets verified.")
