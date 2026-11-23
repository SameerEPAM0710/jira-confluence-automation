# Northstar Application QA Report

**Date:** 2026-11-23  
**Environment:** Local Docker Compose demo at `http://localhost:5173/`  
**Result:** Main navigation and the primary sample-action workflow passed. One browser-console issue was found and fixed.

## Coverage

All seven main pages were opened and visually inspected. Full-page screenshots were captured during the session.

| Page | Elements inspected |
| --- | --- |
| **Overview** | Reporting-period selector; Run digest, Open digest, Review, Scan sample notes, and All runs controls; summary cards; sample signal rows; proposal cards; capacity summary; recent runs. |
| **Risk digest** | Run digest and Run digest now controls; seven sample findings, their signal explanations, owners, dates, and Show details controls; latest-run summary. |
| **Meeting actions** | Scan sample notes; four proposal cards; source links; Review and Details controls; local-demo disclaimer. |
| **Capacity** | Team assignment/capacity totals; Mark source unavailable and Run capacity snapshot controls; explanatory text about sample estimates and unknown capacity. |
| **Run history** | Run digest, Scan notes, and Capacity snapshot controls; three recorded sample runs and their statuses. |
| **Connections** | Jira, Confluence, and Capacity source fixture cards; Test fixture controls; selected project and prototype-mode notices. |
| **Settings** | Risk thresholds; risk-rule checkboxes; weekly schedule controls; weekday, time, and timezone fields; project-scope checkboxes; Save settings. |

The shared navigation, search field, demo-mode indicator, run-history shortcut, prototype/data-mode notices, and profile status were also inspected. Most controls outside the primary workflow were inspected but not activated.

## Primary workflow tested

1. Started on **Overview** and opened the review form for ACT-2764, “Document the retry budget.”
2. The action text, owner (Noah Kim), and due date (Nov 24, 2026) were already populated. The duplicate check reported no exact-title sample duplicate.
3. Confirmed **Create sample issue**.
4. Verified the success notification **“created sample issue DEMO-502”** and the proposal queue changing from **2 open** to **1 open**. The submit and follow-up API requests returned HTTP 200.

This workflow writes to local demo data only; no Jira account is connected.

## Issue found and fix

- **Issue:** The browser requested `/favicon.ico`, which returned 404 and appeared as a console error.
- **Fix:** Added a Northstar-branded SVG favicon and linked it from the web app document head.
- **Verification:** After rebuilding and reloading, the page and `/northstar.svg` both returned HTTP 200. Chrome reported no console errors or warnings, and the new favicon was requested successfully.

## Current status

- `npm run build` in `apps/web` passed.
- Docker Compose PostgreSQL and API containers are healthy; the web container is running.
- Current HTTP checks: frontend `200`, API health `200`, favicon `200`.
- No browser-console errors or warnings were present after the favicon fix.

## Test limits

This was a manual UI smoke test, not a full regression or accessibility audit. The primary proposal-creation path was submitted; other forms and actions (including settings save, fixture checks, digest execution, and capacity controls) were inspected but not submitted.
