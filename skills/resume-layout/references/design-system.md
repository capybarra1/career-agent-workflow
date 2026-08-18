# 简历设计规范

## Page and hierarchy

- Page: A4 portrait, `210mm × 297mm`, white, with 10–12 mm horizontal padding and 8–10 mm vertical padding by default. Compact mode may reduce these to 9 mm horizontal and 7 mm vertical only when needed to keep substantiated content on one page.
- Screen canvas: pale neutral gray around the page; print canvas: white with no shadow.
- Header: name/contact information on the left and portrait on the right in the 同一行 and 垂直居中. Their centerlines should differ by no more than 3 mm, and the header must not create a large gap before education.
- Section order: education, internships/work, selected projects, personal honors and skills.
- Section headings: 16–18 pt-equivalent, bold, blue; semantic 20–22 px line icon; 1 px blue divider below.
- Entry heading: organization/project and role on the left, date on the right. Keep each heading on one line where practical; use at least 1.12× body size, at least +1 pt, and weight 600–700.
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
- Provide an independent overall font-scale control from 92% to 108%. It must scale textual hierarchy consistently, persist automatically, and never change the line-height value.
- Bullets: visible filled discs with consistent 1.1–1.35 em indentation.
- Detail text: deep gray (`#3F4B57` or equivalent); titles and bullet labels use the darker text token. Adjacent entries need at least 1.4 mm and visibly more space than adjacent bullet lines.
- Section divider spacing: 分隔线与下方第一行内容保持 1.4–3.5 mm; do not simulate this with empty text nodes.
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
- Save editable DOM content, line-height, and overall font scale in `localStorage` and JSON backup.
- Mark protected template assets with stable `data-static-asset` identifiers. On reload/import, run a static-asset migration: restore user edits and layout values, then reapply current portrait attributes so an old backup cannot replace a newer photo.
- Provide reset, JSON backup, JSON restore, and browser print/PDF.
- Do not include private resume content in the template asset; insert user data only in the generated copy.
- Hide the toolbar, edit outlines, and helper labels with `@media print`.

## Acceptance checklist

- No clipped text, icons, portrait, or bottom content.
- No multiple skill rows and no unintended two-line skill row; use exactly one concise `主要技能` bullet in the combined section.
- Dates align consistently.
- All body details use real bullet lists.
- Portrait keeps original aspect ratio, uses `object-fit: contain` and `overflow: visible`, and contains no crop/mask/cover transform.
- Use the latest complete user-provided portrait. Deterministically remove only screenshot border/shadow when needed; do not alter the person. 不得使用 AI 补全, outpaint, beautify, or redraw identity details without explicit user instruction.
- Name/contact and portrait share one row and are vertically centered; education follows without excessive header whitespace.
- Internship/project entry titles are at least 1.12× body size; lowest-level details are deep gray; entry gaps and divider-to-content gaps remain clearly readable.
- Line-height and 92%–108% overall font scale are separate controls and both survive reload and JSON round-trip.
- Restoring stale saved content preserves text edits but cannot downgrade the current portrait or another protected static asset.
- Manually audit the source-project inventory against rendered project entries: one source project maps to one entry, phases stay inside its bullets, and peer entries have comparable granularity. Record this check in delivery QA because semantic equivalence cannot be proven by CSS alone.
- Exported PDF has no browser controls, gray canvas, or shadow.
- Editing persists after reload and can be restored from an exported JSON backup.
- The lowest meaningful text edge ends at 94%–98.5% of full A4 sheet height; there is neither a large empty lower third nor text pressed against/cut by the bottom edge.
- Underfilled pages are corrected first with relevant factual content, then larger type/line-height/spacing; overfilled pages are corrected first by removing low-value wording, then compacting spacing, never by reducing body text below 9.5 pt.
