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
        (self.tmp / "fonts" / "NWA-Fixture-400.woff2").write_bytes(b"wOF2")
        (self.tmp / "fonts" / "OFL.txt").write_text("SIL OPEN FONT LICENSE Version 1.1\n")
        (self.tmp / "fonts" / "LICENSES.md").write_text(
            "# Font licences\n\n## What is shipped\n\n"
            "| File | Licence |\n| --- | --- |\n"
            "| `NWA-Fixture-400.woff2` | SIL Open Font License 1.1 |\n\n"
            "## Removed from the bundle\n\nnothing yet\n"
        )
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

    # -- root scroll contract (vertical panning on mobile) ---------------------
    def root_css(self, css: str) -> list[str]:
        """Ship `css` in a fresh copy of index.html and return what the rule reports."""
        self.write("index.html", self.page("index.html", f"<style>\n{css}\n</style>"))
        return self.verify.check_root_scroll_contract()

    def test_any_overflow_on_a_root_selector_is_reported(self) -> None:
        # Regression guard: the page rendered in the Instagram in-app browser on Android
        # but refused to pan vertically, while the same page scrolled in Chrome. `hidden`
        # was replaced by `clip`, then `clip` was moved from html to body - and every one
        # of those configurations stayed unstable somewhere. The contract is now total:
        # no overflow value at all on these selectors.
        for css, selector in (
            ("html{overflow-x:hidden}", "html"),
            ("body { overflow-x: hidden }", "body"),
            (":root { overflow: hidden }", ":root"),
            ("html { overflow-x: clip }", "html"),
            ("body { overflow-x: clip }", "body"),
            ("html, body { overflow-x: clip }", "html"),
            ("body { overflow-y: auto }", "body"),
            (":root { overflow: scroll }", ":root"),
        ):
            with self.subTest(css=css):
                findings = self.root_css(css)
                self.assertEqual(len(findings), 1, findings)
                self.assertIn(selector, findings[0])
                self.assertIn("viewport", findings[0])

    def test_overflow_inside_a_media_query_is_reported(self) -> None:
        # The shared mobile stylesheet is where the anti-pattern could come back unseen.
        self.write(
            "styles/nwa-mobile-2026.css",
            "@media (max-width: 768px) {\n  body { overflow-x: hidden; }\n}\n",
        )
        findings = self.verify.check_root_scroll_contract()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("styles/nwa-mobile-2026.css:2", findings[0])

    def test_default_root_values_are_allowed(self) -> None:
        self.assertEqual(
            self.root_css(
                "html { overflow-y: visible }\nbody { overflow: visible }\n"
                ":root { overflow: initial }\nbody { overflow-x: unset }"
            ),
            [],
        )

    def test_logical_overflow_axes_are_covered(self) -> None:
        # overflow-block/inline are the logical names of the same properties.
        findings = self.root_css("body { overflow-block: hidden }")
        self.assertEqual(len(findings), 1, findings)

    def test_touch_action_on_a_root_selector_is_reported(self) -> None:
        # Regression guard: `touch-action: pan-y` on html intersected with every gesture in
        # the document; older Android WebViews then ignored vertical pans altogether, and
        # pinch zoom is lost everywhere. The root must leave gestures to the browser.
        findings = self.root_css("html { touch-action: pan-y }")
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("touch-action", findings[0])
        self.assertIn("auto", findings[0])

    def test_touch_action_auto_is_allowed(self) -> None:
        self.assertEqual(self.root_css("html { touch-action: auto }\nbody { touch-action: auto }"), [])

    def test_position_fixed_on_the_body_is_reported(self) -> None:
        # The scroll-lock pattern: if the unlock never runs, the page is dead to panning.
        findings = self.root_css("body { position: fixed; top: 0 }")
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("position", findings[0])

    def test_prose_in_a_comment_is_not_read_as_a_declaration(self) -> None:
        # The rule reads CSS, not English: "carries no overflow: it applies to the viewport"
        # in a comment used to be picked up as an overflow declaration.
        css = "/* the root carries no overflow: it applies to the viewport */\nhtml { width: 100% }"
        self.assertEqual(self.root_css(css), [])

    def test_a_class_that_only_starts_with_body_is_not_a_root_selector(self) -> None:
        css = ".body-copy { overflow: hidden }\nbody::before { overflow: hidden }\n.foo { content: \"body\"; overflow: hidden }"
        self.assertEqual(self.root_css(css), [])

    def test_clipping_on_an_inner_element_is_allowed(self) -> None:
        # The contract moves horizontal clipping here: wrappers and decorative boxes may
        # clip; the root never does.
        css = ".clip { overflow-x: clip }\n.hero { overflow: hidden }\n.ambient-bg { overflow: hidden }"
        self.assertEqual(self.root_css(css), [])

    # -- scroll and touch listeners --------------------------------------------
    def js_findings(self, script: str) -> list[str]:
        self.write("index.html", self.page("index.html", f"<script>\n{script}\n</script>"))
        return self.verify.check_scroll_handlers()

    def test_a_scroll_listener_without_passive_is_reported(self) -> None:
        findings = self.js_findings("window.addEventListener('scroll', function () {});")
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("passive", findings[0])

    def test_a_touchmove_listener_without_passive_is_reported(self) -> None:
        # Regression guard: a conditional preventDefault in a non-passive touchmove handler
        # freezes panning on Android while desktop QA sees nothing.
        findings = self.js_findings(
            "document.addEventListener('touchmove', function (e) { if (x) e.preventDefault(); });"
        )
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("touchmove", findings[0])

    def test_passive_listeners_are_allowed(self) -> None:
        self.assertEqual(
            self.js_findings(
                "window.addEventListener('scroll', onScroll, { passive: true });\n"
                "document.addEventListener('touchstart', onTouch, { passive: true });"
            ),
            [],
        )

    def test_a_listener_on_another_event_is_not_scanned(self) -> None:
        # wheel is exempt on purpose: the inertial-scroll module manages it deliberately.
        self.assertEqual(
            self.js_findings("window.addEventListener('wheel', onWheel, { passive: false });"),
            [],
        )

    def test_data_blocks_like_json_ld_are_not_scanned(self) -> None:
        # <script type="application/ld+json"> is data, not executable code; an
        # addEventListener-looking string inside it is not a listener registration.
        self.write(
            "index.html",
            self.read_page().replace(
                "</head>",
                '<script type="application/ld+json">'
                '{"x": "addEventListener(\'scroll\', f, {passive:false})"}'
                "</script></head>",
            ),
        )
        self.assertEqual(self.verify.check_scroll_handlers(), [])

    def test_passive_true_inside_the_handler_body_does_not_count(self) -> None:
        # Options must sit in the addEventListener call itself, not somewhere in the body.
        findings = self.js_findings(
            "window.addEventListener('scroll', function () { var o = { passive: true }; });"
        )
        self.assertEqual(len(findings), 1, findings)

    def test_a_marked_scroll_hijack_is_allowed(self) -> None:
        # The designed inertial scroller on index.html drives the page under the finger
        # and must cancel the native touch stream to do it. The marker is the
        # review-visible claim that the handler fail-safes to native scrolling.
        self.assertEqual(
            self.js_findings(
                "window.addEventListener('touchmove', function (e) { // verify:allow-scroll-hijack\n"
                "  if (!isTouching) return;\n"
                "  e.preventDefault();\n"
                "}, { passive: false });"
            ),
            [],
        )

    def test_the_marker_must_sit_on_the_listener_line(self) -> None:
        # A marker floating somewhere else in the file must not whitewash the listener.
        findings = self.js_findings(
            "// verify:allow-scroll-hijack\n"
            "window.addEventListener('touchmove', function (e) { e.preventDefault(); });"
        )
        self.assertEqual(len(findings), 1, findings)

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

    # -- font licences (see Linear NOR-13) ---------------------------------------------
    def licence_row(self, old: str, new: str) -> None:
        path = self.tmp / "fonts" / "LICENSES.md"
        text = path.read_text()
        self.assertIn(old, text)
        path.write_text(text.replace(old, new, 1))

    def test_bundled_font_without_licence_record_is_reported(self) -> None:
        (self.tmp / "fonts" / "NWA-Unlisted-400.woff2").write_bytes(b"wOF2")
        findings = self.verify.check_font_licences()
        self.assertEqual(len(findings), 1)
        self.assertIn("NWA-Unlisted-400.woff2", findings[0])

    def test_licence_record_for_a_font_that_is_gone_is_reported(self) -> None:
        self.licence_row(
            "| `NWA-Fixture-400.woff2` | SIL Open Font License 1.1 |",
            "| `NWA-Fixture-400.woff2` | SIL Open Font License 1.1 |\n| `NWA-Ghost-400.woff2` | SIL Open Font License 1.1 |",
        )
        findings = self.verify.check_font_licences()
        self.assertEqual(len(findings), 1)
        self.assertIn("NWA-Ghost-400.woff2", findings[0])

    def test_unresolved_licence_in_a_shipped_row_blocks_the_build(self) -> None:
        # the exact shape of the Suisse Int'l Mono row that sat in this repository for months
        self.licence_row("SIL Open Font License 1.1 |", "Commercial, terms not in this repository |")
        findings = self.verify.check_font_licences()
        self.assertTrue(any("unresolved licence" in f for f in findings), findings)

    def test_ofl_record_without_the_licence_text_is_reported(self) -> None:
        (self.tmp / "fonts" / "OFL.txt").unlink()
        findings = self.verify.check_font_licences()
        self.assertEqual(len(findings), 1)
        self.assertIn("fonts/OFL.txt", findings[0])

    def test_removal_log_is_not_read_as_an_inventory(self) -> None:
        path = self.tmp / "fonts" / "LICENSES.md"
        path.write_text(path.read_text().replace("nothing yet", "| `NWA-Deleted-400.woff2` | removed, no licence held |"))
        self.assertEqual(self.verify.check_font_licences(), [])

    def test_no_fonts_at_all_needs_no_record(self) -> None:
        for name in ("NWA-Fixture-400.woff2", "LICENSES.md", "OFL.txt"):
            (self.tmp / "fonts" / name).unlink()
        self.assertEqual(self.verify.check_font_licences(), [])

    # OFL condition 3: a subset is a Modified Version, so it must not be presented under a Reserved
    # Font Name. These fixtures cover both places the name can leak back in - the CSS family and the
    # internal `name` records - plus the one door that is allowed to open.

    RESERVED_TABLE = (
        "# Font licences\n\n## What is shipped\n\n"
        "| File | Family (`name` ID 1) | Licence |\n| --- | --- | --- |\n"
        "| `NWA-Fixture-400.woff2` | {family} | SIL Open Font License 1.1 |\n\n"
        "## Removed from the bundle\n\nnothing yet\n"
    )

    def test_css_family_may_not_use_a_reserved_font_name(self) -> None:
        (self.tmp / "fonts" / "nwa-fonts.css").write_text(
            "@font-face{font-family: 'IBM Plex Mono'; src: url('NWA-Fixture-400.woff2') format('woff2')}"
        )
        findings = self.verify.check_font_reserved_names()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("Reserved Font Name 'Plex'", findings[0])

    def test_recorded_internal_family_may_not_be_a_reserved_font_name(self) -> None:
        (self.tmp / "fonts" / "LICENSES.md").write_text(
            self.RESERVED_TABLE.format(family="Playfair Display"), encoding="utf-8"
        )
        findings = self.verify.check_font_reserved_names()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("NWA-Fixture-400.woff2", findings[0])

    def test_renamed_face_is_clean(self) -> None:
        (self.tmp / "fonts" / "LICENSES.md").write_text(
            self.RESERVED_TABLE.format(family="NWA Serif"), encoding="utf-8"
        )
        self.assertEqual(self.verify.check_font_reserved_names(), [])

    # OFL-FAQ 5.4: *"You may not use individual words from the Reserved Font Names, but you would be
    # allowed to use parts of words, as long as you do not use any word from the Reserved Font Names
    # entirely."* So `NWA Display` is a conflict against a reservation of `"Playfair Display"`, while a
    # generic term nobody reserved, or a fragment, is not. These fixtures pin both sides of that line,
    # because the first rename in this repository stopped at the full phrase.

    def test_a_word_of_a_reserved_name_is_a_conflict_too(self) -> None:
        (self.tmp / "fonts" / "LICENSES.md").write_text(
            self.RESERVED_TABLE.format(family="NWA Display"), encoding="utf-8"
        )
        findings = self.verify.check_font_reserved_names()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("the word 'display' of the Reserved Font Name 'Playfair Display'", findings[0])
        self.assertIn("NWA-Fixture-400.woff2", findings[0])

    def test_a_word_of_a_reserved_name_in_the_css_is_a_conflict_too(self) -> None:
        (self.tmp / "fonts" / "nwa-fonts.css").write_text(
            "@font-face{font-family: 'NWA Display'; src: url('NWA-Fixture-400.woff2') format('woff2')}"
        )
        findings = self.verify.check_font_reserved_names()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("fonts/nwa-fonts.css", findings[0])
        self.assertIn("individual word", findings[0])

    def test_a_shipped_file_name_may_not_carry_a_reserved_word(self) -> None:
        # CSS and the audit record stay clean: the leak is only in the file name being served.
        (self.tmp / "fonts" / "NWA-Display-300.woff2").write_bytes(b"wOF2")
        findings = self.verify.check_font_reserved_names()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("fonts/NWA-Display-300.woff2", findings[0])
        self.assertIn("the word 'display'", findings[0])

    def test_recorded_permission_clears_the_file_name_rule_as_well(self) -> None:
        (self.tmp / "fonts" / "NWA-Display-300.woff2").write_bytes(b"wOF2")
        saved = dict(self.verify.RESERVED_NAME_EXCEPTIONS)
        try:
            self.verify.RESERVED_NAME_EXCEPTIONS["NWA-Display-300.woff2"] = (
                "written permission from the copyright holder, on file"
            )
            self.assertEqual(self.verify.check_font_reserved_names(), [])
        finally:
            self.verify.RESERVED_NAME_EXCEPTIONS.clear()
            self.verify.RESERVED_NAME_EXCEPTIONS.update(saved)

    def test_terms_no_licence_in_this_bundle_reserves_stay_free(self) -> None:
        reserved = {"Playfair Display"}
        for name in ("NWA Serif", "Caption Sans", "Text Serif", "Serif Displayport"):
            self.assertEqual(self.verify.rfn_findings(name, reserved), [], name)

    def test_fragments_of_a_reserved_word_are_not_reported_but_packed_names_are(self) -> None:
        reserved = {"Playfair Display"}
        # 5.4 allows parts of words; a near-homophone is for a reviewer, not for this gate.
        self.assertEqual(self.verify.rfn_findings("Playfard", reserved), [])
        self.assertEqual(self.verify.rfn_findings("Displai Grotesk", reserved), [])
        # ...but dropping the space is not a rename, so the packed form is caught, and punctuation that
        # leaves the words separable is caught by the word rule instead.
        for value in ("PlayfairDisplay", "NWAPlayfairDisplay"):
            findings = self.verify.rfn_findings(value, reserved)
            self.assertEqual([kind for kind, _, _ in findings], ["packed"], value)
        self.assertEqual(
            self.verify.rfn_findings("Playfair-Display 200", reserved),
            [("word", "display", "Playfair Display")],
        )
        # and the whole phrase still outranks the other kinds, reported once
        self.assertEqual(
            self.verify.rfn_findings("Playfair Display", reserved),
            [("whole", "Playfair Display", "Playfair Display")],
        )

    def test_a_packed_upstream_name_in_the_css_fails_the_build(self) -> None:
        (self.tmp / "fonts" / "nwa-fonts.css").write_text("@font-face{font-family:'PlayfairDisplay'}")
        findings = self.verify.check_font_reserved_names()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("with the words run together", findings[0])

    def test_the_deep_control_shares_the_gates_matcher(self) -> None:
        # scripts/check_font_names.py must apply the same rule to the binaries, or the two drift apart.
        import importlib.util

        spec = importlib.util.spec_from_file_location("nwa_font_names", SCRIPTS / "check_font_names.py")
        assert spec is not None and spec.loader is not None
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        matcher = module.load_shared_matcher()
        reserved = {"Playfair Display", "Plex"}
        for value in ("NWA Display", "NWA Serif", "PlayfairDisplay", "IBM Plex Mono", "NWA-Display-300"):
            self.assertEqual(
                matcher(value, reserved), self.verify.rfn_findings(value, reserved), value
            )

    def test_reserved_name_needs_recorded_permission_or_an_unmodified_original(self) -> None:
        (self.tmp / "fonts" / "LICENSES.md").write_text(
            self.RESERVED_TABLE.format(family="Playfair Display"), encoding="utf-8"
        )
        self.assertTrue(self.verify.check_font_reserved_names())
        saved = dict(self.verify.RESERVED_NAME_EXCEPTIONS)
        try:
            self.verify.RESERVED_NAME_EXCEPTIONS["NWA-Fixture-400.woff2"] = (
                "unmodified upstream file, byte-identical to the author's release"
            )
            self.assertEqual(self.verify.check_font_reserved_names(), [])
        finally:
            self.verify.RESERVED_NAME_EXCEPTIONS.clear()
            self.verify.RESERVED_NAME_EXCEPTIONS.update(saved)

    def test_notice_may_not_reserve_a_name_the_checker_does_not_know(self) -> None:
        (self.tmp / "fonts" / "OFL.txt").write_text(
            "SIL OPEN FONT LICENSE Version 1.1\n"
            "Copyright 2012 Someone. with Reserved Font Name \"Fira Sans\".\n",
            encoding="utf-8",
        )
        findings = self.verify.check_font_reserved_names()
        self.assertEqual(len(findings), 1, findings)
        self.assertIn("OFL_RESERVED_FONT_NAMES", findings[0])

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
        # Bump deliberately: adding a rule means adding its pass/fail fixtures above.
        self.assertEqual(len(self.verify.CHECKS), 16)


if __name__ == "__main__":
    unittest.main(verbosity=2)
