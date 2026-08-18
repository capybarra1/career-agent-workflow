---
name: resume-layout
description: Use when a user asks to format, beautify, restyle, edit, print, or export a confirmed Chinese or bilingual resume as an editable A4 web page or PDF.
---

# 简历排版

Build the deliverable from the bundled webpage template. Preserve the user's factual content while improving hierarchy and scanability.

## Inputs and outputs

- Accept the confirmed `resume.md` or `resume.json` produced by `resume-writing`.
- Accept an optional portrait, target visual reference, and density preference.
- Write each version to `output/<company>-<role>/` unless the user chooses another local directory.
- Return an editable webpage, a content-backup JSON, a printable/PDF result, and validation status.
- Treat `output/` as private local data excluded from Git.

## Workflow

1. Resolve the source material.
   - Read every supplied resume, screenshot, database, or updated text source.
   - Treat the latest user-approved wording as authoritative.
   - Ask only for genuinely missing essentials such as name, contact details, or photo.
   - Do not start final layout until the user has approved the resume wording.
2. Copy `assets/editable-resume-template/` into the working site or deliverable directory.
3. Replace placeholder content without removing requested detail.
   - Keep experiences as real `<ul><li>` bullets.
   - Put the strongest, most relevant accomplishment first in each role.
   - Keep dates and organization names aligned and use one date format.
   - Merge skills and honors as “个人荣誉与技能” when using the default house style.
   - Put every skill category into exactly one concise `主要技能` bullet. Never split skills into separate product, research, software, or technical rows.
   - Follow it with one `荣誉称号` bullet and one `竞赛获奖` bullet when those facts exist. Do not invent a missing row.
4. Adapt content ordering to the target job, but never invent numbers, outcomes, accuracy, or launch status.
5. Apply the visual specification in `references/design-system.md`.
6. Keep the built-in editing and export controls from the template.
7. Validate before delivery:
   - Run `python3 scripts/validate_resume.py <site-directory>`.
   - Run `node scripts/validate_page_fill.cjs <site-directory>` in a browser-capable environment. The lowest meaningful text edge must end within 94%–98.5% of the full A4 sheet height, with no vertical or horizontal overflow.
   - Open the page at desktop width and inspect the A4 sheet.
   - Test edit mode, spacing control, save persistence, content export/import, and print/PDF.
   - Confirm the default print is one A4 page and visually fills the sheet. “One page” alone is not sufficient when a large blank area remains below the final section.
   - Tune each resume independently; do not reuse one density setting across versions with different content lengths.
   - Confirm the photo is fully visible with its original aspect ratio.
8. If publishing as a website, follow the available Sites building and hosting skills. Return both the editable webpage and a printable/exportable result when requested.

## Non-negotiable style rules

- Use a white A4 page with no top or bottom color banners.
- Use restrained blue only for section headings, icons, and fine dividers.
- Use semantic line icons: education, work, projects, and award/skill icons must match their section.
- Use a compact header without a written “求职方向” line unless the user asks for one.
- Use `object-fit: contain` for the portrait; never crop it.
- Use actual list markers, not decorative text characters or pseudo-bullets that disappear in print.
- Keep skills on one list item and one visual line at the default width whenever possible; shorten the skill list before allowing it to wrap.
- Keep line spacing adjustable and persist the chosen setting locally.
- Keep all principal text editable in the browser and preserve edits across reloads.
- Hide controls in print and export cleanly to A4 PDF.
- Keep the lowest meaningful text edge within 94%–98.5% of full A4 sheet height. Below 94% is underfilled; above 98.5% risks clipping and is overfilled even when the browser still reports one page.

## A4 fill tuning

Fit the content to the page; do not merely fit the page around the content.

### Underfilled page

1. Restore relevant, factual detail before stretching the layout: strengthen thin project entries, retain concrete methods/data/outputs, and keep 2–3 evidence-bearing bullets for a selected project when facts support them.
2. Then expand typography and rhythm within the design system: prefer 10–11 pt body text, 1.45–1.65 line-height, and slightly larger section/entry gaps.
3. If larger type causes excessive wrapping, reduce horizontal padding gradually, but keep at least 9 mm horizontal and 8 mm vertical safe padding.
4. Do not fill space with empty blocks, decorative banners, an unrequested job-objective line, generic self-evaluation, or invented content.

### Overfilled page

1. Remove duplicated or weakly relevant wording and tighten sentences before shrinking type.
2. Reduce line-height, section gaps, entry gaps, and header height gradually; use a compact density preset when needed.
3. Body text must remain at least 9.5 pt, actual bullets must remain visible, and safe padding must not fall below 9 mm horizontal or 7 mm vertical. The 7 mm vertical value is a compact-mode exception to the default 8–10 mm design-system range and must still pass visual/PDF inspection.
4. Re-render after every meaningful adjustment. The PDF must remain exactly one A4 page with no clipping, overlap, or content pressed against the bottom edge.

Judge fill using the lowest visible edge among meaningful text elements (`h1`, section headings, contact text, entry headings, and list items), not the A4 element's `min-height`, blank containers, or decorative elements.

## Bundled resources

- `assets/editable-resume-template/`: reusable HTML/CSS/JS template.
- `references/design-system.md`: exact layout, typography, color, icon, and QA rules.
- `scripts/validate_resume.py`: deterministic structural checks.
- `scripts/validate_page_fill.cjs`: browser-based A4 fill and overflow check.
