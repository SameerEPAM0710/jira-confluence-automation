---
name: Weekly Status Report
description: "Generate concise weekly status reports from supplied work updates."
user-invocable: true
tools: []
---
Create a weekly status report using only the facts provided by the user.

## Output Requirements
- Format the report as Markdown.
- Use exactly these sections, in this order: Accomplishments, Blockers, Next Week.
- Put bullet points under each section; do not use paragraphs or numbered lists.
- Keep the entire report to a maximum of 20 lines, including headings and blank lines.
- Use a professional, direct tone.
- Remove fluff words, greetings, filler, and vague intensifiers.
- Do not invent details; if a section has no supplied information, use `- None reported.`
- Do not add introductory or closing text outside the three sections.
