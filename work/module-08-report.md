# Module 08 Completion Report

## Tracked Files
```text
project_spec.md
```

## Spec Commit History
```text
0996acb (HEAD -> master) Add release schedule report specification
```

## project_spec.md Contents
~~~~markdown
# Release Schedule Report - Technical Specification

## 1. Purpose

Produce a CSV release schedule for the Release Manager and the four-person Release Management team working on the pharma project. The report is intended to show upcoming release dates, owners, milestones, and ticket readiness.

Implementation has not started. This document records the interviewed requirements and identifies deployment details that remain to be confirmed.

## 2. Users and Access

- Primary user: Release Manager.
- Audience: Release Management team; the user confirmed that this team may see the report data.
- Team roster filtering is not required. Ticket inclusion is based on release Fix Version, not assignee.
- The shared output location must be accessible only to the authorized Release Management team.

## 3. Data Sources

### 3.1 Jira

- Tracker: Jira Cloud.
- Project key: `EPMCDMETST`.
- Access method: manual CSV export only; no Jira API credentials are currently available.
- The report consumes one combined CSV per run. It contains Jira version and issue data, plus manually maintained release owner and milestone data.

### 3.2 Required Input Data

The combined CSV must provide, or be mapped to, at least:

- Jira project key and release/version name.
- Release target date and unreleased/released state.
- Release owner and milestone dates or milestone data.
- Issue key, Fix Version, status, and ticket description.
- Source export/as-of date, so stale inputs can be detected.

Exact input headers and date formats are deployment configuration and must be documented before implementation.

## 4. Scope and Filtering

- Include unreleased Jira Versions with target dates from the report date through the following 90 days, inclusive, using IST dates.
- Associate tickets to releases using Jira Fix Version.
- Consider all non-closed tickets associated with each included release; do not filter by the four team members' identities.
- Include manually maintained release owner and milestone data from the combined CSV.
- Releases outside the 90-day window are excluded. Handling of overdue unreleased releases and releases with no target date is an open decision.

## 5. Readiness Rules

- A required ticket is complete only when its Jira status is exactly `Done`.
- A release is `Ready` only when it has at least one required ticket and every required ticket is `Done`.
- A release with any required ticket in another status is `Not Ready`.
- A release with no qualifying tickets is `Not Ready`; an empty scope must not be treated as complete.
- Include required-ticket and Done-ticket counts in the readiness summary.
- No separate `At Risk` state or date-based risk threshold was specified.

## 6. Output

- Format: UTF-8 CSV.
- Destination: a shared drive folder accessible to the Release Management team. The exact folder path is configurable and remains to be supplied.
- Generate one row per release-ticket pair, repeating release-level fields for each ticket. For a release with no qualifying tickets, emit one row with blank ticket fields and `Not Ready` readiness.
- Required columns:
  - `release_name`
  - `target_release_date`
  - `release_owner`
  - `milestones`
  - `readiness_status`
  - `required_ticket_count`
  - `done_ticket_count`
  - `ticket_key`
  - `ticket_status`
  - `ticket_description`
- Use a date-stamped filename in IST, for example `release-schedule-YYYY-MM-DD.csv`.

## 7. Refresh Schedule and Run Workflow

- Refresh on the 1st and 16th of each month at 09:00 IST.
- Jira data is supplied by manual CSV export; the report generator does not query Jira directly.
- A fresh combined CSV must be available for each scheduled run. The operator and input-folder location are deployment details to be configured.
- Do not silently reuse a stale input file. If the required input is missing or invalid, do not publish a partial or misleading report; record a clear run error.

## 8. Pharma Data Handling

- The user stated that Jira contains no sensitive data and authorized inclusion of ticket descriptions.
- Do not add patient, clinical, or other regulated data to the source or output.
- Keep generated reports in the team-restricted shared folder; do not send report data to an unapproved destination.
- If the source begins to contain sensitive or regulated data, pause report publication and review the data handling requirements before continuing.
- Retention period and secure deletion requirements remain to be confirmed by the project owner.

## 9. Validation and Error Handling

- Validate required columns, project key, release state, dates, and Fix Version values before generating output.
- Reject malformed or stale inputs with a clear error and do not publish a partial report.
- Preserve ticket descriptions as CSV-safe field values, including commas, quotes, and line breaks.
- Record the run timestamp in IST and the source export/as-of date for auditability.

## 10. Acceptance Criteria

1. The report includes only unreleased project versions whose target dates fall within the next 90 days, subject to the unresolved overdue/missing-date rule.
2. Tickets are associated with releases by Fix Version and are not filtered by assignee.
3. Every release row contains the release name, target date, owner, milestones, readiness state, and ticket counts.
4. Readiness is `Ready` only when at least one required ticket exists and every required ticket has exact status `Done`; otherwise it is `Not Ready`.
5. The generated file is valid UTF-8 CSV and is written to the configured shared drive location on the 1st and 16th at 09:00 IST.
6. Missing, stale, or invalid input does not produce a partial report and produces a clear run error.
7. The report is available only to the authorized Release Management team.

## 11. Open Decisions Before Implementation

- Confirm the combined CSV's exact headers, date formats, and how Jira export fields are combined with manually maintained owner/milestone data.
- Provide the shared input and output folder paths and identify who exports and stages the input file.
- Confirm whether status `Done` is also treated as a closed status in this Jira workflow, given the requirement to consider non-closed tickets.
- Decide how to handle overdue unreleased versions and releases without target dates.
- Confirm how stale input is defined, the report retention period, and where run errors should be surfaced.
~~~~