# Project Constitution

## Mission

Build reliable Jira and Confluence automations that reduce manual coordination while keeping project teams in control of decisions and changes.

## Principles

### 1. Trustworthy, Traceable Results

- Summaries, risk signals, and extracted actions MUST be grounded in retrieved Jira or Confluence data.
- Results that refer to source material MUST include links or identifiers that let users verify the source.
- The system MUST distinguish missing or stale data from healthy status, and MUST NOT present guesses as facts.

### 2. Safe and Reversible Jira Changes

- Before creating an issue from a Confluence decision, the system MUST check for an existing matching issue and avoid duplicates.
- Automated writes MUST be scoped to the requested action, use idempotent behavior where possible, and retain enough context to diagnose or reverse mistakes.
- Destructive or materially consequential changes MUST require explicit user confirmation. The system MUST clearly show the proposed change and its source before confirmation.
- Read-only reporting MUST remain available without granting write access.

### 3. Least Privilege and Data Protection

- Jira and Confluence access MUST use approved authentication and the minimum permissions required for each feature.
- Secrets MUST NOT be committed, exposed to the browser, or written to application logs. They MUST be supplied through an approved secret-management mechanism.
- The system MUST collect and retain only data needed for its stated workflow, protect it in transit and at rest, and respect source-system permissions.
- Jira and Confluence content MUST be treated as untrusted input, including content that may contain instructions or malformed data.

### 4. Observable, Resilient Integrations

- External API failures, rate limits, permission errors, and stale or incomplete data MUST be surfaced clearly; the system MUST NOT silently report partial results as complete.
- Retried operations MUST avoid duplicate writes. Logs MUST support troubleshooting without exposing credentials or unnecessary project content.
- Scheduled or long-running work MUST expose its status and outcome to an authorized user.

### 5. Usable Human Oversight

- Users MUST be able to understand why a result or warning was produced and inspect its supporting data.
- AI-assisted extraction or prioritization MUST communicate uncertainty and allow users to review or correct proposed outcomes.
- The interface MUST provide clear loading, empty, success, and failure states, and MUST remain usable on supported desktop and mobile viewports.

### 6. Testable, Maintainable Delivery

- Business rules and integration boundaries MUST be testable independently of live Jira and Confluence services.
- Changes MUST include focused automated tests for expected behavior, important edge cases, authorization boundaries, and failure handling.
- External API contracts and configuration MUST be isolated from business logic so providers, credentials, and environments can be changed without rewriting core workflows.

## Technology Constraints

- Frontend: React 18 with Vite.
- Backend: Node.js with Express.
- Database: PostgreSQL 15, run via Docker for local development and reproducible environments.
- Browser code MUST communicate with Jira and Confluence through the backend; credentials and privileged API calls MUST NOT be placed in the frontend.
- Database changes MUST be managed through versioned migrations. Docker configuration MUST make required services and persistent data behavior explicit.

## Development Workflow

- Define user-visible behavior, data access, and acceptance criteria before implementation.
- Record unresolved assumptions and security-sensitive decisions in the feature specification; do not silently convert assumptions into requirements.
- Validate changes with automated tests and, where applicable, integration checks using controlled fixtures or test instances.
- Update the specification when verified behavior or an approved decision changes.

## Governance

- This constitution applies to all features and changes in the project.
- A proposed exception MUST state its rationale, affected principles, risks, and compensating controls in the relevant feature plan.
- Amendments MUST be reviewed with affected stakeholders, versioned, and accompanied by updates to any specifications or plans they invalidate.

**Version:** 1.0.0