# Module 10 Completion Report

## Instruction Files
create-status-report.agent.md
creating-instructions.agent.md
main.agent.md

## main.agent.md Contents
# Instructions Catalog

Each entry below is an instruction file with a one-line description.

- [./instructions/create-status-report.agent.md](./create-status-report.agent.md) â€” generate a concise weekly status report using only supplied facts.
  + Keywords: status report, weekly update, progress summary, accomplishments
- [./instructions/creating-instructions.agent.md](./creating-instructions.agent.md) â€” create or update instruction files and the project instruction infrastructure.
  + Keywords: create instruction, instruction setup, custom instructions, agent guide

## Sample Instruction
- File: create-status-report.agent.md
- Contents:
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
