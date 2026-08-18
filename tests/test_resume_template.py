from __future__ import annotations

import subprocess
import unittest
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "resume-layout"


class ResumeTemplateTest(unittest.TestCase):
    def test_template_structure(self) -> None:
        result = subprocess.run(
            [
                "python3",
                str(SKILL / "scripts/validate_resume.py"),
                str(SKILL / "assets/editable-resume-template"),
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_font_scale_and_static_assets_work_in_every_page(self) -> None:
        sites = (
            SKILL / "assets/editable-resume-template",
            ROOT / "examples/anonymized-oppo/resume-page",
        )
        for site in sites:
            with self.subTest(site=site):
                html = (site / "index.html").read_text(encoding="utf-8")
                css = (site / "styles.css").read_text(encoding="utf-8")
                js = (site / "app.js").read_text(encoding="utf-8")
                self.assertRegex(
                    html,
                    r'id="fontScale"[^>]+min="0\.92"[^>]+max="1\.08"',
                )
                self.assertIn('data-static-asset="portrait"', html)
                self.assertIn("--font-scale", css)
                self.assertIn("fontScale", js)
                self.assertIn("refreshStaticAssets", js)
                self.assertIn("fontScale: fontScale.value", js)

    def test_each_project_has_one_unique_source_id(self) -> None:
        sites = (
            SKILL / "assets/editable-resume-template",
            ROOT / "examples/anonymized-oppo/resume-page",
        )
        for site in sites:
            with self.subTest(site=site):
                html = (site / "index.html").read_text(encoding="utf-8")
                project_section = re.search(
                    r'<section[^>]*>\s*<h2>.*?项目经历.*?</h2>(.*?)</section>',
                    html,
                    re.S,
                )
                self.assertIsNotNone(project_section)
                section = project_section.group(1)
                project_ids = re.findall(
                    r'<article[^>]*data-source-project-id="([^"]+)"', section
                )
                self.assertEqual(section.count("<article"), len(project_ids))
                self.assertEqual(len(project_ids), len(set(project_ids)))


if __name__ == "__main__":
    unittest.main()
