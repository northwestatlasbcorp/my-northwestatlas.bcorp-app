#!/usr/bin/env python3
"""Tests for scripts/verify.py - the release gate itself.

The gate decides whether a pull request can reach production, so it is covered
like production code: every rule gets a fixture that must fail and a fixture
that must pass. Stdlib only, matching the script under test.

    python3 -m unittest discover -s scripts -p 'test_*.py'
"""
from __future__ import annotations

import importlib.util
import shutil
import struct
import sys
import tempfile
import unittest
import zlib
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
REPO = SCRIPTS.parent


def load_verify():
    spec = importlib.util.spec_from_file_location("nwa_verify", SCRIPTS / "verify.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def png_bytes(width: int = 1, height: int = 1) -> bytes:
    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    rows = b"".join(b"\x00" + b"\x00\x00\x00" * width for _ in range(height))
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(rows)) + chunk(b"IEND", b"")


PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fixture</title>
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://northwestatlas.com/{page}">
  <meta property="og:image" content="https://northwestatlas.com/og-image-enhanced.png">
  <meta property="og:image:width" content="1">
  <meta property="og:image:height" content="1">
  <link rel="stylesheet" href="fonts/nwa-fonts.css">
</head>
<body>{body}</body>
</html>
"""


class VerifyTestCase(unittest.TestCase):
    """Builds a minimal repository that must pass, then breaks it on purpose."""

    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="nwa-verify-"))
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.verify = load_verify()
        self.build_clean_fixture()
        self.verify.ROOT = self.tmp

    # -- fixture ---------------------------------------------------------------
    def page(self, name: str, body: str = "") -> str:
        return PAGE_TEMPLATE.format(page=name, body=body)

    def build_clean_fixture(self, body: str = "") -> None:
        for name in self.verify.REQUIRED:
            path = self.tmp / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(b"")
        (self.tmp / "fonts").mkdir(exist_ok=True)
        (self.tmp / "fonts" / "nwa-fonts.css").write_text("@font-face{font-family:'EB Garamond'}")
        (self.tmp / "og-image-enhanced.png").write_bytes(png_bytes())
        (self.tmp / "favicon.png").write_bytes(png_bytes())
        for name in self.verify.REQUIRED:
            if name.endswith((".html", ".htm")):
                self.write(name, self.page(name))
        (self.tmp / "index.html").write_text(self.page("index.html", body))
        (self.tmp / "sitemap.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            "  <url><loc>https://northwestatlas.com/index.html</loc></url>\n</urlset>\n"
        )
        (self.tmp / "robots.txt").write_text("User-agent: *\nAllow: /\n\nSitemap: https://northwestatlas.com/sitemap.xml\n")
        (self.tmp / "manifest.json").write_text('{"icons":[{"src":"/favicon.png","sizes":"1x1","type":"image/png"}]}')
        (self.tmp / "CNAME").write_text("northwestatlas.com")

    def write(self, name: str, text: str) -> None:
        path = self.tmp / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def read_page(self) -> str:
        return (self.tmp / "index.html").read_text()

    # -- the fixture must be green --------------------------------------------
    def test_clean_tree_passes_every_check(self) -> None:
        self.assertEqual(self.verify.run(), [], "a correct fixture must produce no findings")

    def test_main_exit_codes(self) -> None:
        self.assertEqual(self.verify.main(["--quiet"]), 0)
        self.write("index.html", self.read_page() + '<a href="/gone.png">x</a>')
        self.assertEqual(self.verify.main(["--quiet"]), 1)

    # -- required files --------------------------------------------------------
    def test_missing_required_file_is_reported(self) -> None:
        (self.tmp / "toolkit.html").unlink()
        self.assertIn("toolkit.html", " ".join(self.verify.check_required_files()))

    # -- local references ------------------------------------------------------
    def test_broken_local_link_is_reported(self) -> None:
        self.write("index.html", self.read_page() + '<img src="/does-not-exist.png">')
        findings = self.verify.check_local_references()
        self.assertEqual(len(findings), 1)
        self.assertIn("does-not-exist.png", findings[0])

    def test_broken_og_image_is_reported(self) -> None:
        self.write(
            "index.html",
            self.read_page().replace("og-image-enhanced.png", "missing-preview.png", 1),
        )
        self.assertTrue(any("missing-preview.png" in f for f in self.verify.check_local_references()))

    def test_external_links_are_not_resolved_locally(self) -> None:
        self.write("index.html", self.read_page() + '<a href="https://example.com/report.pdf">r</a>')
        self.assertEqual(self.verify.check_local_references(), [])

    # -- page metadata ---------------------------------------------------------
    def test_missing_lang_and_viewport_are_reported(self) -> None:
        page = self.read_page().replace('<html lang="en">', "<html>").replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">', ""
        )
        self.write("index.html", page)
        findings = self.verify.check_page_metadata()
        self.assertEqual(len(findings), 2)

    # -- duplicate ids ---------------------------------------------------------
    def test_duplicate_id_is_reported(self) -> None:
        self.write("index.html", self.read_page() + '<p id="chart"></p><p id="chart"></p>')
        self.assertIn("chart", " ".join(self.verify.check_duplicate_ids()))

    def test_ids_inside_css_data_uris_are_not_duplicate_ids(self) -> None:
        # Regression guard: a regex-based rule used to see id='n' inside an encoded
        # SVG background and report a defect that did not exist.
        style = "<style>.x{background:url(\"data:image/svg+xml,%3Csvg%20id='n'%3E%3C/svg%3E\")}</style>"
        self.write("index.html", self.read_page().replace("</head>", style + "</head>"))
        self.assertEqual(self.verify.check_duplicate_ids(), [])

    # -- indexability ----------------------------------------------------------
    def test_sitemap_entry_declaring_noindex_is_reported(self) -> None:
        self.write("index.html", self.read_page().replace('content="index, follow"', 'content="noindex, nofollow"'))
        self.assertIn("index.html", " ".join(self.verify.check_indexability_consistency()))

    def test_missing_robots_directive_is_reported(self) -> None:
        self.write("index.html", self.read_page().replace('<meta name="robots" content="index, follow">', ""))
        self.assertTrue(any("no explicit robots directive" in f for f in self.verify.check_indexability_consistency()))

    def test_disallow_without_noindex_is_reported(self) -> None:
        self.write("robots.txt", "User-agent: *\nDisallow: /index.html\n")
        self.assertTrue(any("can still be indexed" in f for f in self.verify.check_indexability_consistency()))

    def test_canonical_must_point_at_itself(self) -> None:
        self.write("index.html", self.read_page().replace("/index.html\"", "/toolkit.html\""))
        findings = self.verify.check_canonicals()
        self.assertTrue(any("does not point at itself" in f for f in findings))

    # -- open graph ------------------------------------------------------------
    def test_wrong_og_image_dimensions_are_reported(self) -> None:
        self.write("index.html", self.read_page().replace('og:image:width" content="1"', 'og:image:width" content="1200"'))
        self.assertTrue(any("1200x1" in f for f in self.verify.check_open_graph_images()))

    def test_absent_dimensions_are_tolerated(self) -> None:
        page = self.read_page().replace('<meta property="og:image:width" content="1">\n', "").replace(
            '<meta property="og:image:height" content="1">\n', ""
        )
        self.write("index.html", page)
        self.assertEqual(self.verify.check_open_graph_images(), [])

    # -- third-party resources -------------------------------------------------
    def test_unlisted_cdn_host_is_reported(self) -> None:
        self.write(
            "index.html",
            self.read_page() + '<script src="https://unpkg.com/some-lib@1/dist/lib.js"></script>',
        )
        self.assertTrue(any("unpkg.com" in f for f in self.verify.check_third_party_resources()))

    def test_third_party_script_without_sri_is_reported(self) -> None:
        self.write(
            "index.html",
            self.read_page() + '<script src="https://cdn.jsdelivr.net/npm/lib@1/dist/lib.js"></script>',
        )
        self.assertTrue(any("SRI integrity" in f for f in self.verify.check_third_party_resources()))

    def test_pinned_and_integrity_protected_script_passes(self) -> None:
        self.write(
            "index.html",
            self.read_page()
            + '<script crossorigin="anonymous" integrity="sha384-abc" '
            'src="https://cdn.jsdelivr.net/npm/lib@1/dist/lib.js"></script>',
        )
        self.assertEqual(self.verify.check_third_party_resources(), [])

    def test_preconnect_to_first_party_infrastructure_is_not_a_resource(self) -> None:
        self.write(
            "index.html",
            self.read_page() + '<link rel="preconnect" href="https://nwabcorp-cors-proxy.example.workers.dev">',
        )
        self.assertEqual(self.verify.check_third_party_resources(), [])

    # -- repository shape ------------------------------------------------------
    def test_font_source_binary_is_reported(self) -> None:
        self.write("fonts/EBGaramond-Regular.ttf", "binary")
        findings = self.verify.check_font_source_binaries()
        self.assertEqual(len(findings), 1)
        self.assertIn("EBGaramond-Regular.ttf", findings[0])

    def test_woff2_subsets_are_allowed(self) -> None:
        (self.tmp / "fonts" / "NWA-Test-400.woff2").write_bytes(b"wOF2")
        self.assertEqual(self.verify.check_font_source_binaries(), [])

    def test_banned_claim_is_reported(self) -> None:
        self.write("index.html", self.read_page().replace("<p></p>", "") + "<p>B Corp Certified</p>")
        self.assertTrue(any("B Corp Certified" in f for f in self.verify.check_banned_phrases()))

    def test_private_key_material_is_reported(self) -> None:
        key_line = "-----BEGIN RSA PRIVATE KEY-----"  # verify:allow-secret (fixture)
        self.write("nwa-data-proxy-worker.js", f"const KEY = `\n{key_line}\nAAAA`;\n")
        self.assertTrue(any("private key block" in f for f in self.verify.check_secrets()))

    def test_hardcoded_credential_is_reported(self) -> None:
        credential = "AKIA" + "IOSFODNN7EXAMPLEabc"  # verify:allow-secret (fixture)
        self.write("toolkit.html", f"<script>const api_key = \"{credential}\";</script>")
        self.assertTrue(self.verify.check_secrets())

    def test_clean_tree_has_no_secret_findings(self) -> None:
        self.assertEqual(self.verify.check_secrets(), [])

    # -- manifest and sitemap --------------------------------------------------
    def test_manifest_icon_must_exist(self) -> None:
        self.write("manifest.json", '{"icons":[{"src":"/gone.png","sizes":"1x1"}]}')
        self.assertTrue(any("icon target is missing" in f for f in self.verify.check_manifest_and_sitemap()))

    def test_sitemap_url_must_exist_and_use_https(self) -> None:
        self.write(
            "sitemap.xml",
            '<?xml version="1.0"?><urlset><url><loc>http://northwestatlas.com/index.html</loc></url>'
            "<url><loc>https://northwestatlas.com/ghost.html</loc></url></urlset>",
        )
        findings = self.verify.check_manifest_and_sitemap()
        self.assertEqual(len(findings), 2, findings)

    def test_checker_reports_a_clean_repository_summary(self) -> None:
        self.assertEqual(self.verify.run(), [])
        self.assertEqual(len(self.verify.CHECKS), 12)


if __name__ == "__main__":
    unittest.main(verbosity=2)
