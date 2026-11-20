# Implementation Plan: Jira and Confluence Automation

- **Status**: Draft
- **Inputs**: `spec/specification.md`, `spec/constitution.md`, `spec/clarify.md`
- **Schedule**: No calendar dates assigned; phase exit criteria determine progression.

## Plan Summary

Deliver a secure web application in gated increments. Establish product and access-control decisions first, build the shared platform and source integration foundation, then implement the selected first capability and add the remaining capabilities only in the approved order. Treat a capability as complete only when its specification scenarios and success criteria pass with representative test data.

The specification does not select an MVP, Jira/Confluence editions, identity model, risk rules, or capacity source. Those decisions are explicit gates, not implementation assumptions. Do not begin production writes or claim a capability is accepted while its relevant decisions remain unresolved.

## Technical Context

- **Frontend**: React 18 with Vite.
- **Backend**: Node.js with Express. Jira and Confluence access, credentials, authorization checks, and privileged writes remain server-side.
- **Database**: PostgreSQL 15 via Docker for local and reproducible development; schema changes use versioned migrations.
- **External dependencies**: Approved Jira and Confluence interfaces, credentials and scopes, and, if workload comparison is selected, an approved capacity source.
- **Runtime choices still to decide**: Jira/Confluence editions and API versions, authentication model, deployment topology, schedule execution model, and whether action extraction uses deterministic rules or AI.

Proposed logical separation, to be adapted to the confirmed repository structure:

- Frontend: configuration, digest, action review, workload, and run-status experiences.
- Backend API: authentication/authorization, validation, and capability endpoints.
- Backend services: business rules, run coordination, audit events, and capability workflows.
- Integration adapters: Jira, Confluence, and any approved capacity source; isolate external contracts from business logic.
- Persistence: migrations and repositories for configuration, run state, snapshots, proposals, and audit data.
- Tests: unit tests, adapter contract tests, integration tests, and end-to-end acceptance tests.

## Phase 0: Resolve Scope and Decision Gates

**Purpose**: Make the first deliverable safe to design and objectively testable.

**Work

- Select the MVP capability and order for the other two; identify which capabilities are explicitly deferred.
- Decide supported Jira and Confluence products/versions, API access method, credential ownership, and minimum scopes.
- Define application roles and whether connections use per-user or shared identities; document how source permissions map to application authorization.
- Define project-to-space/page/team mapping and how authorized project scope is administered.
- For the selected capability, settle its data rules: digest signal definitions and time window; or action markup, field mapping, duplicate policy, and final approval step; or workload inclusion rules, units, team membership, and capacity source.
- Decide whether action extraction is AI-assisted. If so, define review evidence and uncertainty behavior; otherwise specify deterministic parsing behavior.
- Decide schedule timezone, missed-run/retry behavior, report delivery or viewing location, freshness thresholds, and partial-result policy.
- Set retention/deletion, audit access, expected data volume, performance, availability, and recovery targets needed for the first release.

**Milestone M0: Scope and Security Decisions Approved

- MVP and deferred capabilities are recorded in the specification.
- Identity, authorization, integration scope, supported products, and credential handling are approved.
- The selected capability has deterministic business rules and acceptance examples; remaining decisions are explicitly assigned or marked non-blocking.
- The specification and clarification log are updated; no security-critical ambiguity is silently assumed.

**Gate**: Do not begin feature implementation until M0. Revisit only decisions that block shared foundations before implementing those foundations.

## Phase 1: Architecture and Workflow Design

**Purpose**: Convert approved requirements into backend/frontend boundaries and testable contracts without committing prematurely to details outside the spec.

**Work

- Define the logical entities and relationships for integrations, project scope, automation configuration, runs, source snapshots, findings, proposals, approvals, Jira mutations, and audit events.
- Define authorization checks at API and data-access boundaries, including project-level access and read-only operation.
- Define run/proposal state transitions, freshness and partial-data semantics, error categories, cancellation/overlap behavior, and retry/idempotency behavior.
- Define integration adapter contracts and field mappings for the supported Jira/Confluence versions; identify unsupported or optional fields.
- Define the final Jira write review sequence, duplicate-match outcomes, uncertain timeout reconciliation, and recovery actions.
- Define the schedule execution responsibility and deployment assumptions; keep the choice consistent with the approved runtime and operations model.
- Produce UI flow designs for configuration, each selected capability, source inspection, and loading/empty/partial/failure states.
- Create a threat model for credentials, source content, authorization bypass, prompt/content injection if AI is used, and duplicate or unintended writes.
- Map specification FRs, NFRs, scenarios, and success criteria to design decisions and planned tests.

## Milestone M1: Design and Contracts Reviewed

- Architecture and data-flow boundaries are documented and comply with the constitution.
- Authorization, state transitions, retries, audit events, and data lifecycle have reviewed definitions.
- Adapter and API contracts support the selected product editions and approved permissions.
- Acceptance tests can be written from the approved rules without inventing expected outcomes.

## Phase 2: Shared Platform Foundation

**Purpose**: Establish a runnable, testable, secure application baseline.

## Work

- Create or confirm the application repository layout for the React/Vite frontend, Express backend, migrations, and tests without disturbing unrelated workspace projects.
- Configure local Docker services for PostgreSQL 15, persistent development data, health checks, and documented startup/shutdown behavior.
- Add environment-specific configuration validation; keep credentials out of browser bundles, source control, logs, and error responses.
- Add versioned database migrations and a reproducible test database setup.
- Implement backend authentication and the approved authorization model before exposing protected project data.
- Establish frontend routes and shared states for loading, empty, success, partial, and failure results.
- Establish structured, redacted operational logging, correlation identifiers, health checks, and error responses.
- Add automated test and build gates for frontend, backend, migrations, and security-sensitive behavior.

## Milestone M2: Secure Local Platform Runs

- A developer can start the app and PostgreSQL 15 using the documented Docker workflow.
- Migrations apply to a clean database and tests can use an isolated database.
- Backend authorization is enforced server-side; secrets are not exposed to the browser or logs.
- Baseline frontend/backend tests and builds run reproducibly.

## Phase 3: Integration and Data-Quality Foundation

**Purpose**: Prove safe source access and establish consistent retrieval, freshness, and failure behavior before feature-specific calculations.

**Work

- Implement Jira and Confluence adapters for the approved editions and authentication model.
- Validate connection permissions and selected project/page scope; report actionable missing-permission errors without exposing credentials.
- Implement required pagination, rate-limit handling, bounded retries, timeouts, and source-link generation.
- Normalize only the fields required by the approved capability; preserve source identifiers and retrieval timestamps.
- Implement per-source freshness and complete/partial/stale/failed outcomes, including explicit empty versus unavailable data.
- Treat Jira and Confluence content as untrusted data; ensure retrieved content cannot alter application instructions or bypass authorization/approval.
- Add adapter tests with fixtures and contract tests against controlled test instances where available.

## Milestone M3: Permission-Safe Data Slice Verified

- An authorized test user can retrieve the configured source data and follow source links.
- An unauthorized user cannot retrieve that data or trigger a source operation.
- Missing permissions, rate limits, stale inputs, partial responses, and empty results are distinguishable and visible.
- Integration tests confirm that secrets and unnecessary source content do not leak into browser responses or logs.

## Phase 4: Capability Delivery Tracks

Implement the selected MVP track first. The order of later tracks is decided at M0 or by a reviewed change to the specification. Each track has its own acceptance milestone; a capability not selected for a release is not a release blocker.

### Track A: Weekly Delivery Risk Digest

**Work

- Implement project selection, approved signal configuration, and on-demand digest generation.
- Implement only the approved signal rules, with each finding showing the triggering fields, explanation, timestamp, and Jira/Confluence source links.
- Implement weekly scheduling in the approved timezone and delivery/viewing behavior.
- Persist the minimum snapshot needed for comparison; compare only with the prior successful run and apply the approved retention policy.
- Support empty, partial, stale, and failed digest states and the approved behavior when one source/project fails.
- Add fixture tests for every signal, threshold boundary, missing field, changed/removed issue, changed rule/scope, and failed comparison baseline.

## Milestone M4-A: Digest Accepted

- SC-001, SC-002, and applicable parts of SC-008 pass against approved fixtures.
- Scheduled and on-demand behavior, timezone, data freshness, delivery, and comparison are verified against M0 decisions.

### Track B: Confluence Decisions to Jira Actions

**Work

- Implement the approved Confluence page-selection and explicit-action parsing rules.
- Preserve the source page and relevant source location; show extracted text, stated fields, missing fields, and uncertainty evidence.
- Implement proposal states and authorized edit/approve/dismiss workflows.
- Implement Jira field mapping, duplicate detection, explicit match resolution, and final-payload confirmation.
- Make writes idempotent; reconcile uncertain outcomes before retry; retain the approved audit context and source-to-issue links.
- Test malformed/edited/deleted pages, missing fields, ambiguous and duplicate matches, permission failures, concurrent/retried requests, and timed-out writes.

**Milestone M4-B: Action Workflow Accepted

- SC-003, SC-004, and applicable parts of SC-006/SC-007 pass.
- No Jira write occurs before the approved final confirmation; retried or concurrent operations cannot silently create duplicates.

### Track C: Workload and Capacity Early Warning

**Work

- Implement approved project/team/person and time-window selection.
- Normalize estimates and remaining-work values according to the approved precedence, status filters, and units.
- Integrate only the approved capacity source and compare values only across compatible units and aligned periods.
- Display aggregation, contributing issue links, capacity source, missing inputs, and uncertainty; apply approved privacy aggregation rules.
- Test known totals, unestimated work, unmatched team members, missing capacity, incompatible units, period boundaries, and restricted personal data.

**Milestone M4-C: Workload View Accepted

- SC-005 and applicable parts of SC-006 pass against independently calculated fixtures.
- The view never treats missing capacity as zero or sufficient and complies with approved access and aggregation rules.

## Phase 5: Cross-Capability Operations and Hardening

**Purpose**: Verify the system as an operated product, not only as individual feature workflows.

**Work

- Complete schedule monitoring, run history, per-source error summaries, and approved notification or in-app delivery behavior.
- Verify role-based access for configuration, source content, findings, proposals, approvals, run history, and audit history.
- Verify audit attribution with the chosen integration identity model and ensure operational logs remain redacted.
- Implement approved retention, deletion, disconnect, and data export behavior.
- Test overlapping/manual/scheduled runs, retries, rate limits, outages, recovery, and database migration behavior.
- Run accessibility and responsive checks against the approved conformance target and viewport support matrix.
- Measure response time and run completion against the agreed volume and performance targets; address failures before release.

## Milestone M5: Operational Readiness Verified

- NFR-001 through NFR-008 have test evidence or documented accepted exceptions.
- SC-006 through SC-008 pass for the enabled release capabilities.
- Recovery, backup/restore expectations, monitoring ownership, support procedures, and known limitations are documented.

## Phase 6: User Acceptance and Release

**Purpose**: Confirm the enabled capability set works with representative users and controlled source instances.

**Work

- Run end-to-end acceptance scenarios with representative Jira/Confluence data and the intended user roles.
- Verify the approved source permissions, field mappings, schedule, timezone, thresholds, and capacity inputs in a non-production environment.
- Review every failed/partial run and unresolved proposal state for understandable user guidance.
- Confirm that no unresolved high-priority clarification affects the enabled release scope.
- Publish deployment, configuration, credential setup/rotation, migration, rollback, and operator runbooks.
- Obtain project-owner approval for the enabled capability set and document deferred capabilities and known limitations.

### Milestone M6: Release Approved

- All acceptance scenarios and success criteria for the enabled release capabilities pass.
- Security and operational gates are complete; no unresolved high-priority risk is accepted without an owner and mitigation.
- Deployment and rollback procedures have been exercised in the target environment.

## Verification Strategy

- **Unit tests**: business rules, signal evaluation, field normalization, date/time behavior, capacity calculations, state transitions, and access decisions.
- **Adapter tests**: Jira/Confluence request mapping, pagination, source-link construction, rate limits, permission errors, retries, and redaction using fixtures.
- **Database integration tests**: migrations, constraints, scope isolation, snapshot comparison, audit persistence, and retention behavior using PostgreSQL 15.
- **API/security tests**: authorization on every protected endpoint, validation, credential secrecy, source-content injection resistance, and idempotent writes.
- **End-to-end tests**: approved user scenarios for each enabled capability, including empty, partial, stale, failure, and success outcomes.
- **Controlled integration tests**: use approved test tenants or sandboxes for contract validation and write confirmation flows; never depend on production data for routine tests.
- **Acceptance traceability**: link each implemented FR/NFR and SC to its tests and record evidence at the corresponding milestone.

## Cross-Cutting Risks and Controls

- **Over-broad source access**: block feature access until identity mapping and per-user/project authorization are approved and tested.
- **Ambiguous business rules**: require explicit rules and fixture expectations for the selected capability before implementation; do not invent thresholds.
- **Duplicate or unintended Jira writes**: require reviewed final payload, explicit confirmation, duplicate resolution, durable operation state, and retry reconciliation.
- **Stale or partial data presented as complete**: define freshness and completeness semantics in Phase 0; show source-level status in every applicable view.
- **Excessive retention of project or personal data**: settle data lifecycle before production persistence and enforce the approved policy in Phase 5.
- **Unbounded integration cost or runtime**: establish expected volumes, rate-limit behavior, and completion targets before production readiness.

## Planning Notes

- This plan intentionally assigns no calendar dates or estimates because team capacity and target release timing were not provided.
- Phase 4 track order is not a product decision; select it through M0 and update this plan if priorities change.
- Details such as exact API routes, physical schema, framework libraries, and schedule implementation belong in the design/implementation artifacts after the M0 decisions, not as unsupported assumptions in this plan.
