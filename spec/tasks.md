# Implementation Tasks: Jira and Confluence Automation

- **Status**: Draft
- **Inputs**: `spec/plan.md`, `spec/specification.md`, `spec/constitution.md`, `spec/clarify.md`
- **Scheduling**: No estimates or dates assigned.
- **Task status**: All tasks are not started. Update checkboxes as work is accepted.

## Execution Rules

- Complete Phase 0 and pass Milestone M0 before capability implementation.
- Complete design and shared prerequisites before dependent work. A task marked conditional is performed only if its capability is selected for the release.
- Keep the three capability tracks order-neutral until M0 records the product-owner decision.
- “Done” means all listed acceptance criteria pass and applicable specification requirements/tests are linked in the implementation record.
- A specification change that changes acceptance criteria must be reviewed and reflected in this task list before affected tasks are marked done.

## Phase 0: Scope and Decision Gates

### M0: Scope and Security Decisions Approved

- [ ] **T-001 Select MVP and release sequence**
  - **Depends on**: None.
  - **Work**: Choose the first capability and explicitly defer or order the remaining capabilities.
  - **Acceptance criteria**: `spec/specification.md` names the MVP, records deferred capabilities, and identifies requirements that block the first release.

- [ ] **T-002 Approve Jira and Confluence integration targets**
  - **Depends on**: T-001.
  - **Work**: Select supported product editions/versions, API access method, authentication method, and minimum scopes.
  - **Acceptance criteria**: Approved target products, API versions, auth method, credential owner, and required permissions are recorded in the specification or an approved decision record.

- [ ] **T-003 Define user identity and authorization policy**
  - **Depends on**: T-002.
  - **Work**: Choose per-user or shared integration identity and define role/capability/project access.
  - **Acceptance criteria**: A role-permission matrix identifies who can configure connections, select scope, view source data/results, approve Jira actions, and administer schedules; source permission enforcement is explicitly defined.

- [ ] **T-004 Define project and source mappings**
  - **Depends on**: T-001, T-002.
  - **Work**: Define how Jira projects map to Confluence spaces/pages and teams, including ambiguous or missing mappings.
  - **Acceptance criteria**: The selected mapping method, configuration owner, and behavior for zero or multiple matches are documented with examples.

- [ ] **T-005 Finalize MVP business rules**
  - **Depends on**: T-001, T-004.
  - **Work**: Resolve the selected capability's business rules: risk signals and comparison rules for the digest; page/action format, fields, duplicate handling, and approval for action conversion; or work inclusion, units, grouping, and capacity rules for workload.
  - **Acceptance criteria**: Each selected rule has example inputs and expected outputs, including missing/invalid data and boundary cases; the specification and success criteria are updated.

- [ ] **T-006 Decide action extraction behavior**
  - **Depends on**: T-001.
  - **Work**: Decide deterministic versus AI-assisted extraction and define source evidence and uncertainty behavior.
  - **Acceptance criteria**: The specification states the extraction approach; sample actions show expected parsed fields, review evidence, and handling of uncertain or malformed input.

- [ ] **T-007 Set operating and data-lifecycle requirements**
  - **Depends on**: T-001, T-002.
  - **Work**: Set timezone/date policy, schedule and delivery behavior, freshness and partial-result limits, retention/deletion, expected volume, performance, availability, and recovery targets for the MVP.
  - **Acceptance criteria**: Each selected target has a defined value or an explicitly approved deferral with an owner; digest scheduling and comparison have testable examples if the digest is in scope.

**M0 exit**: T-001 through T-007 are accepted, the specification/clarification log is updated, and no security-critical ambiguity remains for the selected capability.

## Phase 1: Architecture and Workflow Design

### M1: Design and Contracts Reviewed

- [ ] **T-008 Define domain entities and lifecycle**
  - **Depends on**: M0.
  - **Work**: Specify logical identifiers, ownership, relationships, retention, and lifecycle for integrations, project scope, configurations, runs, snapshots, findings, proposals, approvals, mutations, and audit events.
  - **Acceptance criteria**: A reviewed logical model covers the entities needed by the MVP and explains how a run links to source data, user decisions, and resulting Jira writes.

- [ ] **T-009 Define API and authorization boundaries**
  - **Depends on**: T-003, T-008.
  - **Work**: Define frontend-to-Express API operations and server-side authorization checks at route and data-access boundaries.
  - **Acceptance criteria**: Each protected operation maps to the approved permission matrix; tests can be specified for allowed and denied user/project combinations; no browser-to-Jira/Confluence privileged calls are required.

- [ ] **T-010 Define integration adapter contracts**
  - **Depends on**: T-002, T-004, T-005.
  - **Work**: Specify normalized fields, source IDs, links, pagination, optional fields, permission checks, rate-limit handling, and errors for supported Jira/Confluence targets.
  - **Acceptance criteria**: Contract examples exist for successful, empty, partial, stale, unauthorized, rate-limited, and unavailable source responses.

- [ ] **T-011 Define run, proposal, and retry state models**
  - **Depends on**: T-005, T-007, T-008.
  - **Work**: Define state transitions for scheduled/manual runs and action proposals, including concurrency, cancellation, uncertain writes, reconciliation, and retry rules.
  - **Acceptance criteria**: State diagrams or tables define valid transitions and terminal states; retrying any approved Jira write has a defined duplicate-prevention/reconciliation path.

- [ ] **T-012 Design capability user flows and accessibility criteria**
  - **Depends on**: T-001, T-003, T-005, T-007.
  - **Work**: Design configuration, core capability, source inspection, run status, empty/error/partial, and approval flows for the MVP; record accessibility and viewport targets.
  - **Acceptance criteria**: Reviewed flows cover every MVP user scenario and all required status states; keyboard and responsive acceptance checks are identified.

- [ ] **T-013 Complete threat model and requirements traceability**
  - **Depends on**: T-003, T-008, T-009, T-010, T-011.
  - **Work**: Assess credential exposure, over-broad source access, content/prompt injection, unauthorized writes, duplicate operations, and data retention; map requirements to design and tests.
  - **Acceptance criteria**: Threats have mitigations and verification tests; each MVP FR, NFR, scenario, and success criterion maps to a design element and planned test.

**M1 exit**: T-008 through T-013 are reviewed; adapter, authorization, state, and acceptance contracts are sufficiently defined to implement without inventing product behavior.

## Phase 2: Shared Platform Foundation

### M2: Secure Local Platform Runs

- [ ] **T-014 Confirm application repository layout**
  - **Depends on**: M1.
  - **Work**: Identify the application root and establish frontend, backend, migration, and test boundaries without altering unrelated workspace projects.
  - **Acceptance criteria**: The chosen layout is documented and a clean checkout can identify the React/Vite, Express, database, and test entry points.

- [ ] **T-015 Run PostgreSQL 15 locally with Docker**
  - **Depends on**: T-014.
  - **Work**: Add Docker-based local database configuration, persistent development data behavior, and health/startup checks.
  - **Acceptance criteria**: A documented command starts PostgreSQL 15; the app/test process can detect readiness; data persistence and teardown behavior match the documented policy.

- [ ] **T-016 Add validated server configuration and secret handling**
  - **Depends on**: T-002, T-014.
  - **Work**: Define environment configuration validation and approved development secret injection; prevent secrets entering frontend assets, source control, logs, and error bodies.
  - **Acceptance criteria**: Missing/invalid required configuration fails clearly; automated checks confirm test credentials do not appear in built browser assets, logs, or API error responses.

- [ ] **T-017 Add database migrations and isolated test setup**
  - **Depends on**: T-008, T-015.
  - **Work**: Add versioned migrations and reproducible database setup for local and automated tests.
  - **Acceptance criteria**: Migrations create a clean database successfully; the test suite uses an isolated PostgreSQL database and leaves no shared developer data modified.

- [ ] **T-018 Implement authentication and authorization middleware**
  - **Depends on**: T-003, T-009, T-016.
  - **Work**: Implement the approved application identity model and enforce permissions on backend routes and data access.
  - **Acceptance criteria**: Automated tests prove authorized operations succeed and unauthorized project/capability operations are denied server-side; denial responses do not disclose protected content.

- [ ] **T-019 Establish frontend application shell and shared states**
  - **Depends on**: T-012, T-014.
  - **Work**: Add React/Vite shell and reusable loading, empty, success, partial, and failure states for protected workflows.
  - **Acceptance criteria**: Each state renders in the relevant route without exposing data to unauthorized users; frontend build and component tests pass.

- [ ] **T-020 Add redacted logging, correlation, health, and error handling**
  - **Depends on**: T-011, T-016.
  - **Work**: Add structured logs, request/run correlation IDs, health reporting, and consistent safe errors.
  - **Acceptance criteria**: A test request can be traced across API logs with a correlation ID; injected credentials and configured sensitive content are redacted; health state distinguishes application from database readiness.

- [ ] **T-021 Add automated build and test gates**
  - **Depends on**: T-014, T-017, T-018, T-019, T-020.
  - **Work**: Configure reproducible frontend, backend, migration, unit, and security-test commands in the project's automated checks.
  - **Acceptance criteria**: A clean checkout runs the documented checks; a deliberately failing test or build causes the gate to fail.

**M2 exit**: T-014 through T-021 pass; a developer can run the secure local platform and its tests reproducibly.

## Phase 3: Integration and Data-Quality Foundation

### M3: Permission-Safe Data Slice Verified

- [ ] **T-022 Implement Jira connection validation and client adapter**
  - **Depends on**: M2, T-002, T-010.
  - **Work**: Implement the approved Jira authentication, permission validation, requests, and normalized responses.
  - **Acceptance criteria**: Controlled tests validate a successful connection, insufficient permissions, timeout, rate limit, and unavailable service without exposing credentials.

- [ ] **T-023 Implement Confluence connection validation and client adapter**
  - **Depends on**: M2, T-002, T-010.
  - **Work**: Implement the approved Confluence authentication, permission validation, page retrieval, and normalized responses.
  - **Acceptance criteria**: Controlled tests validate a successful connection, insufficient permissions, timeout, rate limit, and unavailable service without exposing credentials.

- [ ] **T-024 Implement project and page scope configuration**
  - **Depends on**: T-004, T-009, T-022, T-023.
  - **Work**: Implement authorized selection and persistence of projects/pages/mapping rules required by the MVP.
  - **Acceptance criteria**: An authorized administrator can save and validate scope; unauthorized users cannot view or change it; ambiguous mappings produce the approved resolution state.

- [ ] **T-025 Implement source pagination, normalization, and timestamps**
  - **Depends on**: T-010, T-022, T-023.
  - **Work**: Retrieve all required pages of source data, normalize selected fields, and preserve source identifiers and retrieval timestamps.
  - **Acceptance criteria**: Multi-page fixtures yield complete expected records with stable source references; optional/missing fields remain distinguishable from empty values.

- [ ] **T-026 Implement freshness and completeness outcomes**
  - **Depends on**: T-007, T-011, T-025.
  - **Work**: Apply approved freshness limits and per-source/project complete, partial, stale, failed, and empty states.
  - **Acceptance criteria**: Boundary fixtures produce the approved state; an empty successful source is not confused with an unavailable or unauthorized source.

- [ ] **T-027 Implement source links and safe content handling**
  - **Depends on**: T-010, T-022, T-023, T-013.
  - **Work**: Generate usable Jira/Confluence links and ensure retrieved content is treated as untrusted data in backend and, if applicable, AI workflows.
  - **Acceptance criteria**: Fixture links resolve to the correct source identifiers; malicious/instruction-like source text cannot change system behavior, authorization, or approval state.

- [ ] **T-028 Verify adapters with fixtures and controlled test instances**
  - **Depends on**: T-022 through T-027.
  - **Work**: Add adapter contract and integration tests for supported products and permissions.
  - **Acceptance criteria**: Tests cover pagination, source links, rate limits, permission errors, partial data, freshness, and redaction; no routine test requires production credentials/data.

**M3 exit**: T-022 through T-028 pass; source access is permission-safe, observable, and independently testable.

## Phase 4: Capability Tracks

**Execution rule**: Start with the M0-selected MVP track. Execute other tracks only when added to an approved release. All tracks depend on M3 unless a task states otherwise.

### Track A: Weekly Delivery Risk Digest (Conditional)

- [ ] **T-029 Implement digest configuration and on-demand run**
  - **Depends on**: M3, approved digest scope/rules.
  - **Work**: Add authorized project/rule configuration and on-demand digest execution.
  - **Acceptance criteria**: Authorized users can configure the approved scope and start a run; unauthorized users cannot; the run records its selected scope and status.

- [ ] **T-030 Implement risk signal evaluation and explanations**
  - **Depends on**: T-029.
  - **Work**: Evaluate approved blocked, overdue, aging, and milestone-risk rules using approved fields.
  - **Acceptance criteria**: Rule fixtures produce the agreed findings at and around each boundary; each finding displays the rule, contributing fields, source, and explanation.

- [ ] **T-031 Implement digest snapshots and change comparison**
  - **Depends on**: T-029, T-030, approved retention policy.
  - **Work**: Persist the minimum data needed and compare against the previous successful digest.
  - **Acceptance criteria**: Tests detect approved changed/new/removed items; failed/partial baselines are handled per policy; scope or rule changes do not create misleading comparisons.

- [ ] **T-032 Implement digest schedule and approved delivery/view**
  - **Depends on**: T-029, T-031, approved schedule/timezone/delivery decisions.
  - **Work**: Execute the weekly schedule and expose or deliver results through the approved channel.
  - **Acceptance criteria**: A controlled-clock test proves the schedule fires at the configured local time and reports missed/failed runs according to policy.

- [ ] **T-033 Verify digest acceptance scenarios**
  - **Depends on**: T-030 through T-032.
  - **Work**: Add end-to-end tests for success, empty, partial, stale, failed, and comparison outcomes.
  - **Acceptance criteria**: SC-001, SC-002, and applicable SC-008 scenarios pass using approved fixtures; no incomplete run is presented as complete.

**M4-A exit**: T-029 through T-033 pass; digest acceptance is recorded independently of other feature tracks.

### Track B: Confluence Decisions to Jira Actions (Conditional)

- [ ] **T-034 Implement meeting-page discovery and action parser**
  - **Depends on**: M3, approved page-selection and markup rules, T-006.
  - **Work**: Discover eligible pages and extract only approved explicit action formats.
  - **Acceptance criteria**: Fixtures cover supported markup, page changes, malformed input, and duplicate processing; extracted fields and source location match approved examples.

- [ ] **T-035 Implement proposal persistence and review workflow**
  - **Depends on**: T-034, T-018, T-020.
  - **Work**: Add proposal states and authorized edit, approve, and dismiss actions with source evidence.
  - **Acceptance criteria**: State-transition tests reject invalid transitions; reviewers can inspect source and correct fields; every decision is attributed and persisted.

- [ ] **T-036 Implement Jira field mapping and duplicate resolution**
  - **Depends on**: T-022, T-035, approved Jira mapping/match policy.
  - **Work**: Map reviewed proposals to Jira fields and show zero, one, or multiple likely matches for resolution.
  - **Acceptance criteria**: Mapping fixtures produce the approved payload; each duplicate outcome has the approved next state; a final payload and source are visible before write confirmation.

- [ ] **T-037 Implement confirmed Jira create/update operations**
  - **Depends on**: T-036, T-011, T-020.
  - **Work**: Create only after final confirmation; update only a user-selected issue and confirmed fields; maintain source links.
  - **Acceptance criteria**: Tests prove no write occurs before confirmation; unauthorized/invalid writes are rejected; success records issue/source/proposal links and operation outcome.

- [ ] **T-038 Implement idempotency and uncertain-write reconciliation**
  - **Depends on**: T-037.
  - **Work**: Prevent duplicate writes during retries/concurrency and reconcile timed-out or indeterminate requests.
  - **Acceptance criteria**: Repeated, concurrent, and timed-out test requests result in at most one intended Jira mutation; indeterminate state is visible and has a documented resolution path.

- [ ] **T-039 Verify action workflow acceptance scenarios**
  - **Depends on**: T-034 through T-038.
  - **Work**: Add end-to-end tests for extraction, review, duplicate handling, create/update, failure, and recovery.
  - **Acceptance criteria**: SC-003 and SC-004 plus applicable SC-006/SC-007 tests pass; every write is traceable to a source and authorized decision.

**M4-B exit**: T-034 through T-039 pass; no Jira write bypasses final review or duplicate/retry controls.

### Track C: Workload and Capacity Early Warning (Conditional)

- [ ] **T-040 Implement workload scope and member grouping**
  - **Depends on**: M3, approved team-membership and privacy policy.
  - **Work**: Add authorized project, person/team, and time-window selection.
  - **Acceptance criteria**: Authorized users can select only permitted scope; membership and ambiguous/unmatched-user cases follow the approved rules.

- [ ] **T-041 Implement workload normalization and aggregation**
  - **Depends on**: T-040, approved work/status/unit rules.
  - **Work**: Normalize estimates or remaining-work values and calculate per-person/team totals.
  - **Acceptance criteria**: Totals match independently calculated fixtures for included, excluded, unestimated, and mixed-estimate cases; units and contributing issues are visible.

- [ ] **T-042 Integrate approved capacity source**
  - **Depends on**: T-040, approved capacity provider and permissions.
  - **Work**: Retrieve authorized capacity and align it with workload periods and units.
  - **Acceptance criteria**: Valid capacity records map to the correct person/team and time period; missing, unauthorized, or incompatible data is reported as unknown, not zero.

- [ ] **T-043 Implement workload warnings and privacy aggregation**
  - **Depends on**: T-041, T-042, approved warning thresholds.
  - **Work**: Apply approved concentration/capacity warning rules and restrict personal details to approved audiences/granularity.
  - **Acceptance criteria**: Boundary fixtures produce the expected warning and explanation; users without permission cannot access individual-level results.

- [ ] **T-044 Verify workload acceptance scenarios**
  - **Depends on**: T-040 through T-043.
  - **Work**: Add end-to-end tests for known totals, unknown capacity, incomplete data, and restricted details.
  - **Acceptance criteria**: SC-005 and applicable SC-006 criteria pass; unavailable capacity is never described as sufficient.

**M4-C exit**: T-040 through T-044 pass; workload acceptance is recorded against approved calculation rules.

## Phase 5: Operations and Hardening

### M5: Operational Readiness Verified

- [ ] **T-045 Implement run history and operational status views**
  - **Depends on**: T-020, M3, at least one selected capability track.
  - **Work**: Expose authorized run history, source freshness, per-source errors, and actionable outcomes.
  - **Acceptance criteria**: A user can distinguish success, empty, partial, stale, failed, and in-progress states for accessible runs; inaccessible run details remain hidden.

- [ ] **T-046 Verify authorization matrix across workflows**
  - **Depends on**: T-018 and selected capability tracks.
  - **Work**: Exercise read, configure, approve, mutate, and audit permissions at UI and API/data boundaries.
  - **Acceptance criteria**: Automated tests cover every approved role/scope combination; forbidden operations fail server-side without leaking protected data.

- [ ] **T-047 Implement retention, disconnect, and deletion behavior**
  - **Depends on**: T-007, T-008, at least one selected capability track.
  - **Work**: Apply approved retention/deletion to source snapshots, runs, proposals, and audit records; handle disconnected sources.
  - **Acceptance criteria**: Expired/disconnected data follows the approved policy; records needed for allowed audit/comparison remain only for the approved duration; deletion is tested.

- [ ] **T-048 Test integration failure, overlap, and recovery behavior**
  - **Depends on**: T-011, T-020, M3, selected capability tracks.
  - **Work**: Test rate limits, outages, overlapping runs, cancellation, retries, migration failures, and recovery paths.
  - **Acceptance criteria**: Runs end in defined states; retries are bounded and do not duplicate writes; recovery outcomes and operator actions are documented and testable.

- [ ] **T-049 Verify accessibility and responsive behavior**
  - **Depends on**: T-012, selected capability tracks.
  - **Work**: Test the approved accessibility target and viewport matrix for critical workflows.
  - **Acceptance criteria**: Keyboard-only completion succeeds for identified workflows; automated/manual checks meet the approved conformance target at supported viewport sizes.

- [ ] **T-050 Measure performance and recovery targets**
  - **Depends on**: T-007, selected capability tracks, T-048.
  - **Work**: Run representative-volume tests and verify availability, backup/restore, and recovery expectations.
  - **Acceptance criteria**: Recorded measurements meet approved targets or have an owner-approved mitigation; restore and recovery procedures are exercised in a controlled environment.

- [ ] **T-051 Complete security and audit verification**
  - **Depends on**: T-013, T-016, T-018, T-020, selected capability tracks.
  - **Work**: Verify credential handling, content-injection defenses, actor attribution, audit access, and logging redaction.
  - **Acceptance criteria**: Security tests cover NFR-001 through NFR-005; Jira mutations can be traced to an authorized actor and proposal without credentials or unnecessary source content in logs.

**M5 exit**: T-045 through T-051 pass or have explicitly approved exceptions with owners and mitigations; operational procedures and evidence are recorded.

## Phase 6: User Acceptance and Release

### M6: Release Approved

- [ ] **T-052 Run end-to-end user acceptance**
  - **Depends on**: M4 for each enabled track, M5.
  - **Work**: Execute approved scenarios with representative users, roles, and controlled Jira/Confluence data.
  - **Acceptance criteria**: Every enabled scenario and success criterion has a pass/fail result and linked evidence; failed criteria block release or have explicit approval to defer.

- [ ] **T-053 Verify target-environment configuration**
  - **Depends on**: T-002, T-007, T-052.
  - **Work**: Validate source permissions, credentials, project/page mappings, schedules, timezone, thresholds, and capacity data in a non-production target environment.
  - **Acceptance criteria**: A signed configuration checklist is complete; test credentials are not production credentials; no unresolved security-critical setup issue remains.

- [ ] **T-054 Publish deployment and operator runbooks**
  - **Depends on**: T-015, T-047, T-048, T-050, T-053.
  - **Work**: Document deployment, migration, credential setup/rotation, monitoring, failure response, backup/restore, rollback, and known limitations.
  - **Acceptance criteria**: A second operator can follow the runbooks in a controlled environment to deploy, diagnose a simulated failure, and roll back or restore as documented.

- [ ] **T-055 Record release approval and deferred scope**
  - **Depends on**: T-052 through T-054.
  - **Work**: Obtain project-owner approval for enabled capabilities and record deferred tracks, known risks, and accepted exceptions.
  - **Acceptance criteria**: Approval, enabled capability list, unresolved issues, mitigations, and follow-up owners are recorded; M6 exit criteria in `spec/plan.md` are met.

**M6 exit**: T-052 through T-055 are accepted; all enabled-release criteria pass and deployment/rollback have been exercised.

## Cross-Task Traceability

- **Platform and access**: T-002 through T-004, T-009, T-014 through T-028, T-046, T-051.
- **Digest**: T-005, T-007, T-010 through T-013, T-026, T-029 through T-033.
- **Meeting actions**: T-005, T-006, T-010 through T-013, T-027, T-034 through T-039.
- **Workload/capacity**: T-005, T-007, T-010 through T-013, T-026, T-040 through T-044.
- **Operations, privacy, and release**: T-007, T-011, T-016 through T-021, T-045 through T-055.

## Blocking Decisions

The following decisions must not be silently guessed in implementation: first-release scope; Jira/Confluence product and auth model; user/source authorization mapping; selected-capability business rules; action write-confirmation and duplicate semantics; schedule/timezone/delivery; freshness/partial-result rules; retention; and production performance/recovery targets. Track them in `spec/clarify.md` and update this file when decisions are approved.
