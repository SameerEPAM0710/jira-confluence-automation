# Create Training Modules from Backlog Tasks

Use this workflow when turning a repository backlog item or GitHub issue into a self-contained training task for a coding agent.

## Select the task

- Read the relevant backlog item, GitHub issue, and supporting repository files before choosing work.
- Verify the issue state and identify dependencies, decisions, and required inputs.
- Prefer one scoped task with a clear deliverable and verifiable outcome.
- Do not reopen or repurpose a closed issue unless the user asks.

## Make the task agent-ready

Include these sections in the task or issue description:

- **Goal:** one concrete outcome.
- **Context:** repository artifacts and confirmed requirements to use.
- **Work:** bounded implementation or documentation steps.
- **Out of scope:** related work that must not be added.
- **Acceptance criteria:** observable, testable completion conditions.

Name expected files, interfaces, or outputs when known. Acceptance criteria should say how to verify the result, not only restate the goal.

## Keep requirements grounded

- Distinguish confirmed facts from proposals and unresolved decisions.
- Do not invent schemas, field names, formats, business rules, or sample data.
- If an essential input is missing, record the specific blocker and the decision or artifact needed; do not claim the task is ready or implement dependent behavior.
- Use synthetic, clearly labeled examples rather than private or credential-bearing source data.

For a combined Jira and manually maintained CSV schema task, specify acceptance criteria for:

- Exact headers and any required ordering.
- Field mappings for Jira versions, Jira issues, release owners, and milestones, including type, requiredness, and blank-value meaning.
- Delimiter and quoting conventions, encoding, date formats, timezone, and export/as-of-date handling.
- Clearly labeled examples for multiple issues in a release, a release with no qualifying issues, a missing target date, and malformed values.
- An explicit list of unresolved decisions. Do not start parser, API, scheduling, or report-generation work until its required schema and policies are confirmed.

## Verify and report

- Run the smallest relevant validation for the task; documentation-only work needs no test command unless documentation tests exist.
- Report the selected task, changed deliverables, verification performed, and any remaining blockers.
- When updating a GitHub issue, verify the repository and issue number, update only requested fields, and preserve its state and labels unless asked otherwise.
