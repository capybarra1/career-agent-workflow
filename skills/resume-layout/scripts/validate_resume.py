#!/usr/bin/env python3
"""Check that a generated resume keeps the editable A4 house-style features."""
from pathlib import Path
import sys
import re

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
required = [root / "index.html", root / "styles.css", root / "app.js"]
errors = [f"missing {path.name}" for path in required if not path.is_file()]
if errors:
    print("\n".join(errors))
    raise SystemExit(1)

html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
js = (root / "app.js").read_text(encoding="utf-8")

checks = {
    "semantic inline SVG icons": html.count("<svg") >= 4,
    "real bullet lists": html.count("<ul") >= 4 and html.count("<li") >= 8,
    "combined honors and skills": "个人荣誉与技能" in html,
    "A4 page rule": "size: A4" in css and "210mm" in css and "297mm" in css,
    "uncropped portrait": "object-fit: contain" in css,
    "print controls hidden": "@media print" in css and ".toolbar" in css,
    "editable mode": "contentEditable" in js,
    "persistent edits": "localStorage" in js,
    "spacing control": "--line-height" in css and "lineHeight" in js,
    "PDF/print export": "window.print" in js,
    "content backup": "application/json" in js,
}
combined = re.search(r'<section[^>]*combined-section[^>]*>(.*?)</section>', html, re.S)
if combined:
    combined_html = combined.group(1)
    checks["single combined skills row"] = combined_html.count("主要技能") == 1
    checks["skills not split into categories"] = not any(
        label in combined_html for label in ("产品能力：", "技术与工具：", "研究能力：", "软件工具：")
    )
else:
    checks["single combined skills row"] = False
errors.extend(f"failed: {name}" for name, ok in checks.items() if not ok)
if errors:
    print("\n".join(errors))
    raise SystemExit(1)
print(f"OK: editable A4 resume structure validated at {root}")
