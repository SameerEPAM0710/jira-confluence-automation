# Specification Review: Clarifications Needed

- **Review date**: 2026-10-14
- **Documents reviewed**: `spec/constitution.md`, `spec/specification.md`
- **Review status**: No direct MUST-level contradiction found. Several important behaviors remain ambiguous or underspecified; the findings below should be resolved before implementation planning treats them as acceptance criteria.

## High-Priority Findings

### C-01: First-Release Scope Is Not Selected

**References**: Specification, Summary; Scope; Assumptions and Dependencies.

The document combines three substantial capabilities but explicitly leaves their release order and whether they ship together undecided. This prevents the team from sizing a first release, defining a complete end-to-end slice, and knowing which requirements are launch blockers.

**Clarify**: Which capability is the MVP? Are the other capabilities explicitly deferred, or must the first release support all three? Identify launch-critical requirements for the selected capability.

### C-02: Application Identity and Source Permissions Are Ambiguous

**References**: Constitution, Least Privilege and Data Protection; Specification, FR-001/FR-002 and NFR-002.

The spec says data must respect the configured integration identity's source permissions, while separately requiring application-level authorization. It does not say whether each user connects their own Jira/Confluence identity or whether the application uses shared service credentials. With shared credentials, a user may be able to see data they could not access directly in the source system unless the application explicitly enforces an equivalent access policy.

**Clarify**: Which identity model is required? How are source permissions mapped to application users and groups? Does the application deny data when it cannot establish that a requesting user is authorized? Define who may view, configure, approve, and administer each project scope.

### C-03: Supported Jira and Confluence Products and Authentication Are Unknown

**References**: Specification, Assumptions and Dependencies; Open Questions.

Cloud versus Data Center, API versions, authentication, tenant setup, and required scopes are all deferred. These choices affect what data can be fetched, permission enforcement, link formats, pagination, rate limits, and whether the integrations can meet the stated workflows.

**Clarify**: Which product editions and versions are in scope for the first release? Which authentication methods and minimum permissions are approved? How are connections tested, revoked, and rotated?

### C-04: Risk Signals Have No Operational Definitions

**References**: Specification, Scenario 1; FR-008 through FR-010; SC-001; Open Questions.

“Blocked,” “overdue,” “aging,” “milestone-risk,” and “qualifying” are not defined in terms of Jira fields or rules. “Aging” could mean time in the current status, time since update, or time past a target date. The spec also does not define how missing, conflicting, or workflow-specific values affect a signal.

**Clarify**: Define each signal, its source fields, thresholds, timezone/date semantics, exclusions, and behavior when required data is missing. Define who may configure rules and whether rule changes apply retroactively. Until these are decided, SC-001 cannot be tested against a stable oracle.

### C-05: Digest Time Window, Delivery, and Comparison Semantics Are Incomplete

**References**: Specification, Scenario 1; FR-006/FR-007/FR-011; FR-028; Open Questions.

The digest is weekly and can run on demand, but its time window, schedule timezone, missed-run behavior, recipient, and delivery or viewing mechanism are unspecified. “Changes since the prior successful digest” does not define which fields count as changes, how deleted or newly out-of-scope issues appear, or what happens when project scope or rules change between runs.

**Clarify**: Define the reporting period and timezone, schedule owner, delivery destination or in-app access, missed-run/retry behavior, comparison fields, and handling of removed issues, changed scope, and changed rules. Define how long prior successful snapshots must be retained to support comparisons.

### C-06: Confluence Context for the Digest Is Optional but Not Defined

**References**: `PROJECT_IDEAS.md`, Weekly Delivery Risk Digest; Specification, FR-012.

The source idea suggests using Confluence goals, milestone definitions, and decision notes to contextualize risks. FR-012 only requires traceability if such material is used; no requirement says whether this context is required, optional, or excluded from the first release. Project-to-page association is also unspecified.

**Clarify**: Is Confluence context part of the digest? If so, how are pages selected and associated with Jira projects, which page fields are used, and how are conflicting or stale decisions handled?

### C-07: Meeting-Action Markup and Page Discovery Are Not Specified

**References**: Specification, Scenario 2; FR-013/FR-014; Open Questions.

“Explicitly formatted action” is not defined. Page selection examples (selection, labels, templates) are alternatives rather than a chosen rule. The specification does not state whether existing pages are scanned retroactively, how edited/deleted pages are handled, or whether one action can span multiple lines or owners.

**Clarify**: Choose the supported page-discovery method and define the action syntax/template, required fields, supported page formats/languages, and behavior for edited, deleted, duplicated, or previously processed pages. Define whether the first release scans existing pages or only new/changed pages.

### C-08: Extraction Method and Uncertainty Handling Are Unclear

**References**: Constitution, Usable Human Oversight; Specification, FR-015/FR-016; NFR-006; Open Questions.

The constitution refers conditionally to AI-assisted extraction, but the specification does not say whether extraction is deterministic, AI-assisted, or configurable. “Uncertain” has no threshold or observable definition, and the review UI is not required to show extracted source text or confidence/evidence in a consistent way.

**Clarify**: Decide whether AI is in scope. Define what evidence is shown to reviewers, how uncertainty is represented, when extraction must be withheld for manual entry, and how behavior is tested without relying on nondeterministic live model output. If extraction is not AI-assisted, state that explicitly.

### C-09: Jira Field Mapping and Update Boundaries Are Missing

**References**: Specification, Scenario 2; FR-015/FR-018/FR-019; Open Questions.

The spec does not choose supported issue types, required Jira fields, field defaults, owner-to-account mapping, date conversion rules, or which fields may be changed on an existing issue. It also does not define what happens when the source action conflicts with an existing issue's values or the user's Jira permissions.

**Clarify**: Define per-project issue-type and field mappings, required/default values, user identity mapping, date/timezone handling, allowed update fields, conflict behavior, and permission-failure behavior. Distinguish a proposed update from issue creation in the review experience.

### C-10: Duplicate Detection and Approval Sequence Need a Precise Rule

**References**: Constitution, Safe and Reversible Jira Changes; Specification, Scenario 2 acceptance 4; FR-017/FR-018/FR-029; SC-004.

The scenario says the user approves a proposal before duplicate search, then the system either presents a likely match for confirmation or creates an issue when none is found. It is unclear whether the first approval authorizes creation, whether a second confirmation is required after the duplicate check, and how ambiguous matches are resolved. The duplicate matching fields and scope are not defined. Concurrent processing could also create duplicates after two runs both find no match.

**Clarify**: Define the match criteria and search scope, the states for no/one/multiple matches, which confirmation authorizes the final write, and how concurrent retries are serialized or deduplicated. Make the displayed final Jira payload and source visible before the constitution-required confirmation.

### C-11: Failure After Jira Write Has an Unclear Recovery Contract

**References**: Constitution, Safe and Reversible Jira Changes; Specification, Scenario 2 acceptance 6; FR-020/FR-029; NFR-004/NFR-005.

The spec says an uncertain outcome remains unresolved or failed and retries must not silently duplicate work, but does not define how the system determines whether Jira accepted a timed-out request, how a user resolves an indeterminate operation, or whether/how a successful change can be reversed. “Sufficient change context” is also not defined.

**Clarify**: Define operation states, reconciliation behavior after timeout, retry safeguards, user-visible recovery actions, and the audit record (actor, before/after fields, source, timestamps, outcome). State which actions can be undone and which are only auditable.

### C-12: Workload and Capacity Calculations Are Not Defined

**References**: `PROJECT_IDEAS.md`, Workload and Capacity Early Warning; Specification, Scenario 3; FR-021 through FR-025; SC-005.

The spec does not define which issue statuses count as planned work, how estimates and remaining-work values are combined, how unestimated issues are treated, or what “concentration,” “overloaded,” and “capacity gap” mean. It also leaves the time window, units, capacity source, aggregation, and team membership unresolved. Confluence team ownership/role pages mentioned in the source idea are not explicitly required or excluded.

**Clarify**: Define the work inclusion rules, estimate precedence and units, grouping/team membership source, capacity calculation and period alignment, missing-data behavior, thresholds for warnings, and whether Confluence ownership data is in scope. Define whether individual-level results are visible and to whom.

### C-13: Freshness, Staleness, and Partial-Result Policies Are Unspecified

**References**: Constitution, Trustworthy Results and Observable Integrations; Specification, FR-003/FR-005; Scenario 1 acceptance 3; FR-024/FR-026.

The documents require stale or partial data to be distinguished, but do not define a freshness limit, the granularity of status (per tenant, project, page, or field), whether successful data from one source can be displayed beside a failed source, or when stale data must be withheld rather than shown with a warning.

**Clarify**: Set freshness limits by data type or run schedule, define partial-result policy and status granularity, and specify whether users can view stale cached results. Ensure “empty,” “unknown,” “not applicable,” and “failed to fetch” are distinct states.

## Medium-Priority Findings

### C-14: User Roles and Authorization Rules Need Testable Boundaries

**References**: Specification, Users and Outcomes; Scenario 4; NFR-002; SC-006.

The named personas do not define roles or permissions. “Authorized user” and “authorized administrator” are used throughout without saying whether permissions are global, per connection, per project, or per capability. There are no acceptance scenarios for a user who may view but not approve, or configure but not access report content.

**Clarify**: Define role/capability permissions and scope boundaries, including who can view source data, approve or dismiss proposals, edit schedules/rules, and manage connections. Add tests for allowed and denied combinations.

### C-15: Data Retention and Deletion Are Deferred Despite Persisted History

**References**: Constitution, Least Privilege and Data Protection; Specification, FR-003/FR-011/FR-020; Key Entities; Open Questions.

Runs, snapshots, proposals, source content, and audit history imply persistence, but there is no retention period, deletion behavior, data export rule, or handling for disconnected projects/users. This also affects digest comparisons and auditability.

**Clarify**: Define which source fields are stored versus fetched on demand, retention periods by entity, deletion and disconnect behavior, user-requested deletion/export, and how required audit history is reconciled with data minimization.

### C-16: Audit Attribution and Sensitive Logging Need More Precision

**References**: Constitution, Observable Integrations and Data Protection; Specification, FR-020; NFR-001/NFR-005.

The spec requires attributable approvals and mutations but does not define the actor when Jira writes use a shared integration identity, the audit fields retained, who can read audit records, or how source text and personal data are excluded from diagnostic logs.

**Clarify**: Define actor attribution, audit event fields, access/retention controls, correlation identifiers, and the distinction between durable audit records and operational logs. Confirm which Jira/Confluence content may be stored in either.

### C-17: Error Handling and Run State Transitions Are Too General

**References**: Specification, Scenario 4; FR-005/FR-026/FR-028; NFR-004.

The statuses “complete,” “partial,” “stale,” “failed,” and “unresolved” are named but not defined as a state model. The spec does not define cancellation, overlapping scheduled/manual runs, repeated rate limiting, or whether one failed project blocks a multi-project digest.

**Clarify**: Define run and proposal state transitions, terminal/retryable errors, cancellation and overlap behavior, per-source versus overall status, and which failure conditions permit partial output.

### C-18: Success Criteria Are Not Fully Measurable Yet

**References**: Specification, SC-001 through SC-008; Open Questions.

Most criteria describe desirable outcomes but depend on rules that remain undefined. For example, SC-001 cannot determine “qualifying” items until signal rules are selected, and SC-005 cannot calculate a canonical result until workload semantics and units are set. The criteria also lack target response times, schedule completion windows, and scale limits.

**Clarify**: For each selected capability, define representative acceptance fixtures and expected outputs. Add measurable performance, volume, and schedule-latency targets once expected usage is known. Keep qualitative security principles, but pair them with concrete authorization and data-flow tests.

### C-19: Accessibility and Responsive Support Are Not Testable As Written

**References**: Constitution, Usable Human Oversight; Specification, NFR-007.

“Keyboard navigation” and “supported desktop and mobile viewport sizes” lack a conformance target, required workflows, and viewport/device bounds.

**Clarify**: Select an accessibility target (for example, WCAG 2.2 AA if appropriate), identify critical keyboard-only workflows, and list supported viewport ranges. Add these to acceptance tests.

### C-20: Delivery Timezone, Locale, and Date Semantics Need One Policy

**References**: Specification, FR-007/FR-015/FR-028; Open Questions.

Timezone is called out for schedules, but date-only Jira due dates, extracted meeting dates, digest periods, and capacity windows also depend on timezone and locale. Ambiguous dates can shift a due date or make an item incorrectly overdue.

**Clarify**: Choose the project or user timezone policy, accepted input formats/locales, storage/display conventions, and daylight-saving behavior. Define how date-only values are interpreted and compared.

### C-21: Jira/Confluence Scope Mapping and Data Relationships Need Definition

**References**: Specification, FR-001/FR-013/FR-021; Key Entities; `PROJECT_IDEAS.md`.

The data model names “Project Scope” but does not explain how Jira projects relate to Confluence spaces/pages, teams, or meeting notes. The source idea mentions project keys and page metadata, but no required mapping or behavior for ambiguous mappings is specified.

**Clarify**: Define the project-to-space/page/team mapping and ownership of that configuration. Specify behavior when a page relates to multiple projects or no project can be determined.

### C-22: Non-Functional Targets and Operating Environment Are Missing

**References**: Constitution, Technology Constraints; Specification, NFR-001 through NFR-008; Open Questions.

The stack is specified, but deployment topology, environments, backup/recovery expectations, database migration rollback policy, availability targets, and resource/volume limits are not. NFR-004 says retries are bounded but sets no bound or backoff behavior.

**Clarify**: Decide which operating constraints belong in the feature specification versus the plan. At minimum, set expected project/issue volume, run completion target, availability/recovery expectations, supported deployment environment, and retry/rate-limit policy before production planning.

### C-23: Key Entities Do Not Define Lifecycle or Relationships

**References**: Specification, Key Entities; FR-003/FR-020/FR-028.

The entity list is a useful domain inventory but does not state identifiers, ownership, relationships, lifecycle transitions, or which records are durable. It is therefore not yet sufficient to settle history, deduplication, per-user access, or deletion semantics.

**Clarify**: During planning, define the minimum entity relationships and lifecycle needed for the approved capabilities, especially the links among run, source snapshot, proposal, approval, Jira mutation, and audit event. Avoid finalizing physical schema in the feature specification unless required by the selected design.

## Constitution Alignment

- The specification aligns with the constitution on source traceability, least privilege, server-side credentials, user review before Jira writes, idempotent retries, observable failures, and testable integration boundaries.
- **Potential sequencing ambiguity**: Scenario 2 places user approval before duplicate resolution, while the constitution requires confirmation of the proposed change and its source before consequential changes. Clarify whether approval authorizes only the proposal or the final Jira payload, and ensure the user sees any duplicate match and final field values before the write.
- **Access-control dependency**: FR-002's configured integration identity must not be treated as equivalent to each requesting user's source permissions unless the chosen identity model and application authorization rules establish that equivalence.
- **Conditional AI principle**: The constitution's AI uncertainty requirement applies only if AI is used. The specification should explicitly choose or defer that implementation behavior and preserve human review either way.

## Suggested Clarification Order

1. Select MVP capability and supported Jira/Confluence editions.
2. Set user identity, authorization, and integration-permission model.
3. Define the MVP's signal/action/workload business rules and source mappings.
4. Define review, duplicate resolution, and recovery semantics for Jira writes.
5. Decide run schedule, timezone, delivery, freshness, retention, and measurable operating targets
