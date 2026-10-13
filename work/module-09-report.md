# Module 09 Completion Report

## Tracked Files
backlog.md
project_spec.md

## Backlog Commit History
c3224af (HEAD -> master) Add release schedule report backlog

## backlog.md Contents
# Release Schedule Report Backlog

## Setup

- [ ] Confirm the combined CSV's exact headers, date formats, encoding, and field mapping for Jira versions/issues plus manually maintained owners and milestones.
- [ ] Provide representative combined CSV files, including releases with multiple tickets, no qualifying tickets, missing target dates, and malformed values.
- [ ] Confirm the input folder, shared output folder, and deployment environment; verify the output location is restricted to the authorized Release Management team.
- [ ] Identify the operator responsible for exporting Jira data, staging each combined CSV, and monitoring scheduled runs.
- [ ] Define how the Jira export/as-of date is supplied and what age makes an input stale.
- [ ] Confirm whether Jira status `Done` is considered closed in this workflow, so the non-closed-ticket scope is unambiguous.
- [ ] Decide how to handle overdue unreleased versions and versions with no target date.
- [ ] Confirm report retention and secure-deletion requirements, plus where run errors and audit details must be surfaced.
- [ ] Approve the Setup decisions above as implementation inputs before starting Core Features.

## Core Features

- [ ] Implement configuration for the combined-CSV field mapping, project key (`EPMCDMETST`), input location, output location, stale-input limit, and report settings.
- [ ] Parse the combined CSV and validate required fields, project key, release state, dates, source as-of date, and Fix Version values; return actionable errors for invalid data.
- [ ] Select unreleased project versions with target dates from the report date through 90 days later, inclusive, using IST calendar dates and the approved overdue/missing-date policy.
- [ ] Associate tickets with releases by Jira Fix Version; include all in-scope non-closed tickets without filtering by assignee.
- [ ] Include the manually maintained release owner and milestone data for each release.
- [ ] Calculate readiness using exact status `Done`: `Ready` only when at least one required ticket exists and every required ticket is `Done`; otherwise `Not Ready`.
- [ ] Calculate and include required-ticket and Done-ticket counts for each release.
- [ ] Generate UTF-8 CSV with the specified columns and one row per release-ticket pair; repeat release fields for each ticket and emit one row with blank ticket fields for a release with no qualifying tickets.
- [ ] Preserve ticket descriptions, including commas, quotes, and line breaks, as valid CSV field values.
- [ ] Name each report `release-schedule-YYYY-MM-DD.csv` using the IST report date; record the IST run timestamp and source export/as-of date in the approved audit location.
- [ ] Ensure missing, stale, or invalid input stops generation and cannot leave a partial or misleading report in the publish location.

## Integration

- [ ] Define the operator run procedure for exporting Jira data, combining it with owner/milestone data, and staging a fresh CSV for each run.
- [ ] Configure runs for the 1st and 16th of each month at 09:00 IST in the approved deployment environment.
- [ ] Connect the generator to the configured input and team-restricted output folders without adding Jira API access or publishing to an unapproved destination.
- [ ] Surface success, validation failures, and execution errors in the agreed monitoring location, with enough context to identify the failed run and source file.
- [ ] Perform an end-to-end trial that reads a staged combined CSV and publishes the correctly named report to the restricted shared folder.

## Testing

- [ ] Test input validation for missing columns, wrong project key, invalid release states, malformed dates, invalid Fix Versions, missing as-of date, and stale input.
- [ ] Test the inclusive 90-day IST date boundaries and the approved overdue/missing-target-date behavior.
- [ ] Test Fix Version association, inclusion of all qualifying assignees, and exclusion of closed tickets according to the confirmed workflow rule.
- [ ] Test readiness and counts for all-Done tickets, mixed statuses, no qualifying tickets, and exact-case/non-exact `Done` values.
- [ ] Test output schema, UTF-8 encoding, date-stamped IST filename, repeated release fields, blank ticket fields for empty releases, and CSV-safe descriptions containing commas, quotes, and line breaks.
- [ ] Test that missing, stale, and invalid inputs produce a clear error and do not publish partial output or overwrite a valid report.
- [ ] Verify scheduled execution at the configured dates and time, including behavior when a fresh input is unavailable.
- [ ] Verify the published report is readable only by the authorized Release Management team.
- [ ] Run the full test suite and acceptance checks against representative Jira export data before release.

## Documentation

- [ ] Document the combined CSV schema, exact headers, date formats, field mappings, and sample input.
- [ ] Document configuration values, including project key, input/output paths, stale-input threshold, schedule, and approved overdue/missing-date behavior.
- [ ] Write the operator procedure for exporting, combining, staging, running, and checking the report.
- [ ] Document output columns, row behavior, readiness rules, ticket scope, and IST filename convention.
- [ ] Document validation errors, where run status/audit details appear, and how to recover from a failed or missed run without reusing stale input.
- [ ] Document access restrictions, retention/deletion requirements, and the response if sensitive or regulated data appears in the source.
- [ ] Record the confirmed deployment decisions and obtain Release Manager acceptance against the specification's acceptance criteria.
