from __future__ import annotations

import subprocess
import unittest
from pathlib import Path

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


if __name__ == "__main__":
    unittest.main()
