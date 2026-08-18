# 简历设计规范

## Page and hierarchy

- Page: A4 portrait, `210mm × 297mm`, white, with 10–12 mm horizontal padding and 8–10 mm vertical padding by default. Compact mode may reduce these to 9 mm horizontal and 7 mm vertical only when needed to keep substantiated content on one page.
- Screen canvas: pale neutral gray around the page; print canvas: white with no shadow.
- Header: name and contact information on the left, uncropped portrait on the right. Avoid excessive whitespace below it.
- Section order: education, internships/work, selected projects, personal honors and skills.
- Section headings: 16–18 pt-equivalent, bold, blue; semantic 20–22 px line icon; 1 px blue divider below.
- Entry heading: organization/project and role on the left, date on the right. Keep each heading on one line where practical.
- Page fill: the lowest meaningful text edge should fall within 94%–98.5% of full A4 sheet height. Tune each resume independently; equal CSS values are not required across different content lengths.

## Color

| Token | Default | Use |
| --- | --- | --- |
| Primary blue | `#0784C1` | Section headings, icons, dividers |
| Dark text | `#1F2933` | Name, headings, body |
| Muted text | `#52606D` | Secondary metadata |
| Screen background | `#EEF2F5` | Outside A4 only |
| Editing highlight | `#FFF7D6` | Editable regions while editing |

Do not add top/bottom blue bars, gradients, colored cards, or multiple accent colors unless explicitly requested.

## Typography and spacing

- Prefer PingFang SC, Microsoft YaHei, Noto Sans CJK SC, Source Han Sans SC, then system sans-serif.
- Name: 25–30 pt-equivalent, 700 weight.
- Body: 10–11 pt-equivalent; never below 9.5 pt-equivalent for default output.
- Default body line-height: 1.5. Provide a continuous 1.25–1.8 spacing control.
- Bullets: visible filled discs with consistent 1.1–1.35 em indentation.
- Keep 3–4 bullets for a major role and 2–3 for a project. In the combined honors/skills section, use exactly one skills bullet; add one honors bullet and one awards bullet when corresponding facts exist.

## Icons

Use simple inline SVG line icons with `currentColor`, rounded caps, and matching stroke widths. Map icons semantically:

- Education: graduation cap/book.
- Work/internship: briefcase.
- Projects: folder, clipboard, or connected nodes.
- Honors and skills: medal or award badge.

Do not use arbitrary Unicode symbols, emoji, mismatched filled icons, or external icon CDNs.

## Editing and export

- Toggle `contenteditable` only in edit mode.
- Save DOM content and spacing in `localStorage`.
- Provide reset, JSON backup, JSON restore, and browser print/PDF.
- Do not include private resume content in the template asset; insert user data only in the generated copy.
- Hide the toolbar, edit outlines, and helper labels with `@media print`.

## Acceptance checklist

- No clipped text, icons, portrait, or bottom content.
- No multiple skill rows and no unintended two-line skill row; use exactly one concise `主要技能` bullet in the combined section.
- Dates align consistently.
- All body details use real bullet lists.
- Portrait keeps original aspect ratio.
- Exported PDF has no browser controls, gray canvas, or shadow.
- Editing persists after reload and can be restored from an exported JSON backup.
- The lowest meaningful text edge ends at 94%–98.5% of full A4 sheet height; there is neither a large empty lower third nor text pressed against/cut by the bottom edge.
- Underfilled pages are corrected first with relevant factual content, then larger type/line-height/spacing; overfilled pages are corrected first by removing low-value wording, then compacting spacing, never by reducing body text below 9.5 pt.
