"""Render a markdown project-status report from structured input data."""

from __future__ import annotations

from typing import Any, Iterable


def _as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, Iterable):
        return [str(item) for item in value]
    return [str(value)]


def _render_bullets(items: Iterable[str]) -> str:
    cleaned = [str(item).strip() for item in items if str(item).strip()]
    if not cleaned:
        return "- [Add item]"
    return "\n".join(f"- {item}" for item in cleaned)


def _render_milestones(items: Iterable[dict[str, Any]]) -> str:
    rows = []
    for item in items:
        if not item:
            continue
        name = str(item.get("name", "")).strip()
        owner = str(item.get("owner", "")).strip()
        target_date = str(item.get("target_date", "")).strip()
        status = str(item.get("status", "")).strip()
        notes = str(item.get("notes", "")).strip()
        rows.append(f"| {name} | {owner} | {target_date} | {status} | {notes} |")

    if not rows:
        rows.append("| [Milestone] | [Owner] | [YYYY-MM-DD] | [Status] | [Short note] |")

    return "\n".join([
        "| Milestone | Owner | Target date | Status | Notes |",
        "| --- | --- | --- | --- | --- |",
        *rows,
    ])


def _render_risks(items: Iterable[dict[str, Any]]) -> str:
    rows = []
    for item in items:
        if not item:
            continue
        name = str(item.get("name", "")).strip()
        impact = str(item.get("impact", "")).strip()
        mitigation = str(item.get("mitigation", "")).strip()
        owner = str(item.get("owner", "")).strip()
        due_date = str(item.get("due_date", "")).strip()
        rows.append(f"| {name} | {impact} | {mitigation} | {owner} | {due_date} |")

    if not rows:
        rows.append("| [Risk or issue] | [Impact] | [Action] | [Owner] | [YYYY-MM-DD] |")

    return "\n".join([
        "| Risk or issue | Impact | Mitigation or next action | Owner | Due date |",
        "| --- | --- | --- | --- | --- |",
        *rows,
    ])


def _render_priorities(items: Iterable[str]) -> str:
    values = []
    for index, item in enumerate(_as_list(items), start=1):
        if str(item).strip():
            values.append(f"{index}. {item}")
    if not values:
        values.append("1. [Priority, owner, and target date]")
    return "\n".join(values)


def build_report(data: dict[str, Any]) -> str:
    project = str(data.get("project", "[Project name]")).strip() or "[Project name]"
    start_date = str(data.get("start_date", "[Start date]")).strip() or "[Start date]"
    end_date = str(data.get("end_date", "[End date]")).strip() or "[End date]"
    prepared_by = str(data.get("prepared_by", "[Name or role]")).strip() or "[Name or role]"
    status = str(data.get("status", "[On track / At risk / Off track]")).strip() or "[On track / At risk / Off track]"
    summary = str(data.get("summary", "[Summarize current health, the most important change this period, and the outlook.]"))

    completed = _as_list(data.get("completed", []))
    planned = _as_list(data.get("planned", []))
    milestones = data.get("milestones", []) or []
    risks = data.get("risks", []) or []
    decision = str(data.get("decision", "None")).strip() or "None"
    priorities = _as_list(data.get("priorities", []))

    return f"""# Project Status Report

**Project:** {project}  
**Reporting period:** {start_date} to {end_date}  
**Prepared by:** {prepared_by}  
**Overall status:** {status}

## Summary
{summary}

## Progress

### Completed this period
{_render_bullets(completed)}

### Planned next period
{_render_bullets(planned)}

## Milestones

{_render_milestones(milestones)}

## Risks and Issues

{_render_risks(risks)}

## Decisions or Support Needed
- {decision}

## Next Period Priorities
{_render_priorities(priorities)}
"""


if __name__ == "__main__":
    from data_fetcher import fetch_report_data

    print(build_report(fetch_report_data()))
