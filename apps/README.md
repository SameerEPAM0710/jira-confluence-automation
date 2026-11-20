# Northstar Prototype

This is an interactive local prototype for the Jira/Confluence automation specification. All source integrations use fixtures: it does not connect to Jira, Confluence, or an external capacity provider. Sample issue creation, linking, and updates affect only the local demo state.

## Docker Compose

With Docker Desktop running, set a local-only password and start PostgreSQL 15, the Express API, and Vite from the repository root:

```powershell
$env:POSTGRES_PASSWORD = 'choose-a-local-only-password'
docker compose up --build
```

Open `http://localhost:5173/`. The API health endpoint is `http://localhost:3001/api/health`. Stop the stack with `Ctrl+C`; use `docker compose down` to stop detached services. `docker compose down -v` also deletes the local PostgreSQL demo data.

Compose requires `POSTGRES_PASSWORD`; no database password is committed. Never reuse a prototype password outside this local environment.

## Run Without Docker

In separate PowerShell terminals:

```powershell
cd apps/api
npm install
npm run dev
```

```powershell
cd apps/web
npm install
npm run dev
```

Without `DATA_MODE=postgres`, the API uses volatile in-memory sample state. Restarting the API resets proposals, runs, settings, and sample issue changes.

## Demo Flow

1. **Overview** loads calculated risk signals, open proposal count, team load, and recent runs from the API.
2. **Risk digest** opens a finding to inspect its rule and explanation. Run the digest to save a sample snapshot; later runs compare with the last successful snapshot.
3. **Meeting actions** scans explicitly formatted sample-note fixtures. Open a proposal, fill required fields, review it, then link/update a duplicate or create a local demo issue. Decisions and outcomes are stored in the API.
4. **Capacity** calculates remaining work from sample issues and compares it with sample team capacity. Toggle the sample source unavailable to see unknown capacity while assignments remain visible.
5. **Run history** launches digest, action-scan, and capacity-snapshot jobs and displays their stored outcomes.
6. **Connections** validates fixtures only; it never requests credentials or calls external services.
7. **Settings** changes demo risk thresholds, selected projects, and an optional weekly local digest schedule.

## Prototype Limits

- No authentication or production authorization is implemented.
- The PostgreSQL migration stores the prototype's domain state in one JSONB document; it is not a production schema.
- The weekly scheduler is local-process behavior and runs only while the API is running.
- The seeded rules and connection responses are examples, not approved business or integration policies.