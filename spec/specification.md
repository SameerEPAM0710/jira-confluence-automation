# Feature Specification: Jira and Confluence Automation

- **Feature Branch**: TBD
- **Created**: 2026-10-14
- **Status**: Draft
- **Input**: `PROJECT_IDEAS.md` and `spec/constitution.md`

## Summary

Provide a web application that reduces manual project coordination by turning Jira and Confluence data into traceable delivery insights and reviewable follow-up actions. The proposed capabilities are a weekly delivery risk digest, converting meeting decisions into Jira actions, and a workload/capacity early warning. Each capability must make its source data and limitations visible; the system must not silently make consequential changes or present incomplete data as healthy.

This specification treats the three ideas as capabilities of one product. Their release order, specific risk thresholds, and integration configuration remain open decisions; this document does not assume they all ship in the first release.

## Users and Outcomes

- **Project or delivery manager**: reviews delivery risks, recent changes, and workload concerns across selected projects.
- **Meeting facilitator or action owner**: reviews proposed Jira actions extracted from Confluence meeting notes and follows their status.
- **Project administrator**: configures project connections, source selection, access, and automation schedules.

Users should be able to verify an insight against its Jira issue or Confluence page, understand when data was last refreshed, and distinguish a genuine empty result from a failed or incomplete run.

## Scope

### In Scope

- Connect to authorized Jira and Confluence projects and retrieve only data permitted to the configured integration identity.
- Generate a weekly delivery risk digest, including relevant work, explanatory signals, source links, and changes since the prior successful digest.
- Identify explicitly formatted action items in configured Confluence meeting notes and present them for review before Jira writes.
- Summarize assignment and capacity signals using authorized Jira work data and, when configured, authorized capacity data.
- Show automation configuration, run status, data freshness, and actionable failures.

### Out of Scope for This Specification

- A specific risk-scoring formula, aging period, or due-date warning window.
- A specific authentication vendor, Jira or Confluence deployment type, API version, or AI provider.
- A specific notification channel, capacity source, leave system, or retention period.
- Automatically assigning work, changing issue status, or publishing meeting content without user review.

## User Scenarios and Testing

### Scenario 1: Review a Weekly Delivery Risk Digest

As a delivery manager, I want a weekly view of blocked, overdue, aging, or milestone-threatening work across selected projects so that I can investigate delivery risks without assembling the report manually.

**Acceptance scenarios**

1. **Given** selected projects have been configured and their data is current, **when** the scheduled digest completes, **then** the manager can see the relevant work, the signal attached to each item, the reason for the signal, and a link to the source issue or page.
2. **Given** a prior digest completed successfully, **when** a new digest is generated, **then** it identifies changes since that digest using the configured comparison fields and links each changed item to its source.
3. **Given** a source is unavailable, stale, or only partially retrieved, **when** the digest runs, **then** the result is marked incomplete or failed, the affected source and reason are shown, and partial data is not presented as a complete healthy digest.
4. **Given** no items meet the configured signals, **when** the digest completes successfully, **then** the user sees an explicit empty result and the data freshness timestamp.

### Scenario 2: Turn Meeting Decisions into Jira Actions

As a meeting facilitator, I want explicitly formatted actions in Confluence notes collected as reviewable proposals so that decisions can be tracked in Jira without losing their context or creating duplicate work.

**Acceptance scenarios**

1. **Given** a configured meeting page contains an explicitly formatted action, **when** it is processed, **then** the proposed action shows its text, any stated owner and due date, the source page, and any fields that need user input.
2. **Given** an action is missing an owner, due date, or other configured required field, **when** it is presented, **then** the missing information is identified and is not silently invented.
3. **Given** a proposed action is awaiting review, **when** a user edits, approves, or dismisses it, **then** the user's choice and the proposal's source are recorded.
4. **Given** a user approves a proposal, **when** the system checks Jira for a possible existing issue, **then** it presents a likely match for confirmation or creates the approved issue only when no match is found.
5. **Given** an issue is created or an existing issue is explicitly selected for update, **when** the operation succeeds, **then** the result links the Jira issue to the source Confluence page and records the outcome.
6. **Given** Jira rejects a write or the operation outcome is uncertain, **when** the workflow reports its result, **then** the proposal remains visibly unresolved or failed and retrying cannot silently create a duplicate.

### Scenario 3: Review Workload and Capacity Warnings

As a delivery manager, I want to see how planned work is distributed and whether it exceeds known capacity so that I can identify concentration or upcoming gaps early.

**Acceptance scenarios**

1. **Given** Jira assignment and estimate or remaining-work data is available, **when** the workload view is generated for a configured team and time window, **then** it summarizes the work by the configured person or team grouping and links to the contributing issues.
2. **Given** authorized capacity data is configured, **when** work is compared with capacity, **then** the view identifies the comparison period, units, and capacity source used.
3. **Given** capacity data is missing or unauthorized, **when** workload is shown, **then** the system can show available assignment totals but clearly states that capacity sufficiency could not be assessed.
4. **Given** source work or capacity data is incomplete, **when** the warning is generated, **then** the incomplete inputs and their effect on the result are visible.

### Scenario 4: Configure and Monitor Automations

As a project administrator, I want to select authorized projects and sources, configure schedules, and inspect run outcomes so that the automations operate only within their intended scope.

**Acceptance scenarios**

1. **Given** an administrator configures a project or source, **when** the connection is validated, **then** the system reports the granted access and any missing permissions without exposing credentials.
2. **Given** a schedule is configured, **when** its run starts and finishes, **then** an authorized user can see its status, completion time, source freshness, and any actionable error.
3. **Given** a user lacks access to a project or run, **when** they request its data, **then** the system denies access and does not disclose protected project content.

## Functional Requirements

### Integrations and Data Handling

- **FR-001**: The system MUST allow an authorized administrator to configure Jira and Confluence connections and select the projects, pages, or page-selection rules within scope.
- **FR-002**: The system MUST retrieve only fields required by enabled capabilities and MUST respect the source-system permissions of the configured integration.
- **FR-003**: Each retrieved dataset and generated result MUST record its source and refresh or retrieval time so users can judge freshness.
- **FR-004**: The system MUST treat source content as untrusted data and MUST NOT execute instructions found in Jira issues or Confluence pages.
- **FR-005**: The system MUST expose per-source retrieval failures and MUST distinguish complete, partial, stale, and failed results.

### Delivery Risk Digest

- **FR-006**: An authorized user MUST be able to configure the projects included in a digest and generate a digest on demand.
- **FR-007**: The system MUST support a weekly scheduled digest for configured projects.
- **FR-008**: The digest MUST be able to include Jira issue status and status history, priority, assignee, due date, sprint or release, estimates, blocker/dependency links, and last-updated time when available and authorized.
- **FR-009**: The digest MUST identify configured blocked, overdue, aging, and milestone-risk signals and show the fields and rule that caused each signal.
- **FR-010**: Risk thresholds and milestone-risk rules MUST be configurable or explicitly documented as pending product decisions; the system MUST NOT invent an opaque risk score.
- **FR-011**: The digest MUST compare current results with the last successful digest and show relevant changes. It MUST NOT use a failed or incomplete run as the comparison baseline.
- **FR-012**: Each issue-level finding MUST include a link or stable identifier for its Jira source. Confluence goals, milestones, or decisions used to contextualize a finding MUST also be traceable to their source.

### Meeting Decisions to Jira Actions

- **FR-013**: An authorized user MUST be able to select or configure Confluence meeting notes for action extraction using an approved selection rule, such as explicit page selection, labels, or templates.
- **FR-014**: The system MUST identify explicitly formatted action text and retain a link to the originating page and, where available, the relevant source location.
- **FR-015**: The system MUST capture stated owner, due date, and configured Jira fields without silently inferring missing values. Uncertain extraction MUST be marked for review.
- **FR-016**: Extracted actions MUST enter a review state in which an authorized user can edit, approve, or dismiss each proposal before any Jira write.
- **FR-017**: Before creating an issue, the system MUST search the configured Jira scope for likely duplicates and show a possible match for user resolution.
- **FR-018**: The system MUST create an issue only after explicit approval. Updating an existing issue MUST require the user to select the issue and confirm the proposed changes.
- **FR-019**: A successful Jira action MUST retain links between the Jira issue, the source Confluence page, and the approved proposal.
- **FR-020**: The system MUST record the proposal state, user decision, operation outcome, and sufficient change context for audit and troubleshooting without logging secrets.

### Workload and Capacity

- **FR-021**: An authorized user MUST be able to configure the teams or people, time window, and Jira projects included in a workload view.
- **FR-022**: The system MUST summarize assigned Jira work using available estimates or remaining-work values and MUST expose the contributing issues and units.
- **FR-023**: The system MUST compare workload with capacity only when an authorized capacity source and compatible units are configured.
- **FR-024**: The system MUST identify missing or incomplete capacity inputs and MUST NOT describe unavailable capacity as zero or as sufficient.
- **FR-025**: Planned leave or other personal capacity details MUST only be used when explicitly authorized and MUST be shown at the least detailed aggregation needed for the warning.

### User Experience and Operations

- **FR-026**: The application MUST provide clear loading, empty, success, partial, and failure states for user-triggered and scheduled work.
- **FR-027**: A user MUST be able to inspect the source and explanation behind a digest signal, proposed Jira action, or workload warning.
- **FR-028**: The system MUST expose schedule configuration, last-run status, completion time, and actionable failure details to authorized users.
- **FR-029**: Repeated or retried writes MUST be idempotent or guarded by duplicate detection and operation-state checks.

## Non-Functional Requirements

- **NFR-001 Security**: Credentials MUST remain server-side, MUST be stored using an approved secret-management mechanism, and MUST NOT appear in browser assets, logs, or error responses.
- **NFR-002 Authorization**: The application MUST enforce authorization for configuration, source data, proposals, reports, and run history; hiding a UI control alone is insufficient.
- **NFR-003 Privacy**: The system MUST minimize collected and retained data, protect it in transit and at rest, and honor source access restrictions.
- **NFR-004 Reliability**: External API errors, rate limits, and timeouts MUST be handled explicitly. Retries MUST use bounded retry behavior and MUST NOT duplicate Jira writes.
- **NFR-005 Auditability**: Consequential user approvals and Jira mutations MUST be attributable to an authorized user and traceable to their source proposal.
- **NFR-006 Testability**: Business rules and integration boundaries MUST be testable without live Jira or Confluence credentials, using controlled fixtures or test instances.
- **NFR-007 Accessibility and responsiveness**: Core workflows MUST be usable with keyboard navigation and supported desktop and mobile viewport sizes.
- **NFR-008 Maintainability**: Business rules MUST be separated from external API clients and environment-specific configuration.

## Key Entities

- **Integration**: A configured Jira or Confluence connection, its permission scope, and validation status. Credential material is not exposed to application users.
- **Project Scope**: The Jira projects, Confluence spaces, pages, teams, and selection rules enabled for an automation.
- **Automation Configuration**: Capability-specific settings, schedule, thresholds, and enabled scope.
- **Run**: One execution with start/end time, selected sources, freshness, status, and error summary.
- **Digest Finding**: A risk signal with the contributing Jira data, applicable rule, explanation, timestamp, and source links.
- **Action Proposal**: Extracted meeting action text, stated or missing fields, source reference, review state, user decision, and Jira operation outcome.
- **Workload Snapshot**: Aggregated assignment and estimate data for a configured period, with capacity source and completeness information when available.

## Success Criteria

- **SC-001**: In fixture-based tests, every configured qualifying digest item is included, every configured signal has a visible reason and source, and non-qualifying items are excluded according to the configured rules.
- **SC-002**: Digest comparison reports changes from the prior successful run and does not treat a failed or incomplete run as a successful baseline.
- **SC-003**: A Confluence action proposal can be traced to its source; missing fields and uncertain extraction are visible; no Jira write occurs before approval.
- **SC-004**: Reprocessing or retrying an approved action does not create a duplicate Jira issue, and updates to existing issues occur only after explicit user selection and confirmation.
- **SC-005**: Workload calculations match independently calculated fixture results; when capacity data is absent, the UI explicitly reports that capacity sufficiency is unknown.
- **SC-006**: Unauthorized users cannot retrieve protected project data or trigger Jira mutations through either the interface or backend endpoints.
- **SC-007**: Tests verify that credentials are not returned to the browser or written to application logs, and source content cannot alter system instructions or bypass user approval.
- **SC-008**: Scheduled and on-demand runs expose completion status, source freshness, and actionable error details; incomplete results are never labeled complete.

## Assumptions and Dependencies

- The product will integrate with Jira and Confluence using approved interfaces and credentials supplied by the project owner.
- A Jira/Confluence deployment type, supported API versions, authentication method, and required permissions have not yet been selected.
- Data fields may be unavailable because of permissions, project configuration, or source quality; the application must report these limitations rather than infer values.
- The specified implementation stack is React 18 with Vite, Node.js with Express, and PostgreSQL 15 via Docker. Browser code will access external services only through the backend.
- This document covers the product capabilities in `PROJECT_IDEAS.md`; implementation sequencing will be decided during planning.

## Open Questions

- Which capability is the first release, and what is the release order for the other two?
- Are Jira and Confluence Cloud, Data Center, or both required? Which API versions and authentication model are approved?
- Which users and groups may configure integrations, view reports, approve proposals, and administer schedules?
- What exact issue statuses, age thresholds, due-date windows, release/sprint definitions, and milestone rules define risk?
- How should Confluence meeting pages be discovered, and what exact markup or page template identifies an action item?
- Which Jira issue types and fields may be set from an action? What is the matching policy for duplicate detection and updates?
- What is the source of team membership and capacity, what units and time windows are used, and may individual capacity or leave data be processed?
- Where should digests and failures be delivered or viewed, and what schedule timezone is required?
- What data retention, deletion, audit-log, and report-export requirements apply?
- What availability, performance, and maximum project/issue volume targets must the system meet?