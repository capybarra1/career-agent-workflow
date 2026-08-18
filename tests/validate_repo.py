from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = (
    "career-workflow",
    "career-profile",
    "job-screening",
    "resume-writing",
    "resume-layout",
)
REQUIRED_README_PHRASES = (
    "2 分钟快速开始",
    "career-workflow",
    "career-profile",
    "job-screening",
    "resume-writing",
    "resume-layout",
    "输入",
    "Prompt",
    "输出",
    "飞书授权",
)
SENSITIVE_PATTERNS = (
    re.compile(r"cli_[a-z0-9]{12,}"),
    re.compile(r"(?:bascn|tbl|fld)[A-Za-z0-9]{8,}"),
    re.compile(r"1[3-9]\d{9}"),
)
PROFILE_FIELDS = (
    "姓名",
    "手机号",
    "邮箱",
    "所在城市",
    "主要求职方向",
    "候补方向",
    "核心定位",
    "差异化优势",
    "预计毕业时间",
    "应届届别",
)
SCREENING_DIMENSIONS = (
    "核心任务",
    "经历证据",
    "技能工具",
    "行业场景",
    "硬性门槛",
    "申请时效",
)
EXAMPLE_FILES = (
    "examples/anonymized-oppo/README.md",
    "examples/anonymized-oppo/profile-summary.json",
    "examples/anonymized-oppo/jobs.json",
    "examples/anonymized-oppo/resume.md",
)


def fail(message: str) -> None:
    raise SystemExit(f"FAIL: {message}")


def read_required(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        fail(f"missing {relative}")
    return path.read_text(encoding="utf-8")


def validate_skill(skill: str) -> None:
    relative = f"skills/{skill}/SKILL.md"
    text = read_required(relative)
    if not text.startswith("---\n"):
        fail(f"missing frontmatter in {relative}")
    if f"name: {skill}" not in text:
        fail(f"wrong name in {relative}")
    if "description: Use when" not in text:
        fail(f"description must start with 'Use when' in {relative}")


def validate_readme() -> None:
    text = read_required("README.md")
    for phrase in REQUIRED_README_PHRASES:
        if phrase not in text:
            fail(f"README missing: {phrase}")


def validate_profile_schema() -> None:
    text = read_required("skills/career-profile/references/feishu-schema.md")
    for field in PROFILE_FIELDS:
        if field not in text:
            fail(f"profile schema missing: {field}")
    if "成果证据" in text or "证据来源" in text:
        fail("profile schema contains a removed table or field")


def validate_screening_rubric() -> None:
    text = read_required("skills/job-screening/references/scoring-rubric.md")
    for dimension in SCREENING_DIMENSIONS:
        if dimension not in text:
            fail(f"screening rubric missing: {dimension}")


def validate_resume_writing() -> None:
    text = read_required("skills/resume-writing/SKILL.md")
    for phrase in ("事实台账", "信息充足度门槛", "个人信息库", "Markdown", "JSON"):
        if phrase not in text:
            fail(f"resume-writing missing: {phrase}")
    read_required("skills/resume-writing/references/writing-patterns.md")
    read_required("skills/resume-writing/references/scoring-rubric.md")


def validate_handoffs() -> None:
    text = read_required("skills/career-workflow/references/handoffs.md")
    for key in (
        "profile_base_url",
        "jobs_base_url",
        "selected_job",
        "resume_markdown",
        "resume_json",
        "output_directory",
    ):
        if key not in text:
            fail(f"handoff contract missing: {key}")


def validate_example() -> None:
    for relative in EXAMPLE_FILES:
        text = read_required(relative)
        if "合成示例数据" not in text:
            fail(f"example must declare synthetic data: {relative}")


def validate_privacy() -> None:
    public_paths = (ROOT / "README.md", ROOT / "skills", ROOT / "docs", ROOT / "examples")
    for base in public_paths:
        if not base.exists():
            continue
        files = [base] if base.is_file() else list(base.rglob("*"))
        for path in files:
            if not path.is_file() or path.suffix not in {".md", ".json", ".yaml", ".yml"}:
                continue
            text = path.read_text(encoding="utf-8")
            for pattern in SENSITIVE_PATTERNS:
                if pattern.search(text):
                    fail(f"possible sensitive value in {path.relative_to(ROOT)}")


def main() -> None:
    validate_profile_schema()
    validate_screening_rubric()
    validate_resume_writing()
    validate_handoffs()
    validate_example()
    for skill in SKILLS:
        validate_skill(skill)
    validate_readme()
    validate_privacy()
    print("PASS: repository structure, README coverage, and privacy scan")


if __name__ == "__main__":
    main()
