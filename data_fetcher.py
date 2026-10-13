"""Fetch project data for the status report generator."""

from __future__ import annotations

from typing import Any


def fetch_report_data() -> dict[str, Any]:
    """Return a sample dataset matching the project status report template."""
    return {
        "project": "Customer Portal Release 2.4",
        "start_date": "2026-10-01",
        "end_date": "2026-10-15",
        "prepared_by": "Project Manager",
        "status": "At risk",
        "summary": "Core development is complete and the release remains planned for 2026-11-06. Integration testing is three days behind because the billing test environment is not yet available.",
        "completed": [
            "Completed development and code review for the account settings workflow.",
            "Passed accessibility checks for the primary customer journeys.",
        ],
        "planned": [
            "Complete integration testing — QA Lead — 2026-10-23.",
            "Resolve high-priority defects found in testing — Engineering Lead — 2026-10-28.",
        ],
        "milestones": [
            {
                "name": "Feature complete",
                "owner": "Engineering Lead",
                "target_date": "2026-10-16",
                "status": "Complete",
                "notes": "All planned development merged.",
            },
            {
                "name": "Integration testing complete",
                "owner": "QA Lead",
                "target_date": "2026-10-23",
                "status": "At risk",
                "notes": "Billing environment access is delayed.",
            },
            {
                "name": "Release approval",
                "owner": "Release Manager",
                "target_date": "2026-11-03",
                "status": "Not started",
                "notes": "Depends on test exit criteria.",
            },
        ],
        "risks": [
            {
                "name": "Billing test environment is unavailable",
                "impact": "Integration testing may finish late and compress defect-fix time.",
                "mitigation": "Environment owner to restore access; QA will run unaffected test suites in parallel.",
                "owner": "Platform Lead",
                "due_date": "2026-10-20",
            }
        ],
        "decision": "Platform Lead to confirm environment restoration by 2026-10-20. If the date cannot be met, the Release Manager must decide whether to move the release date.",
        "priorities": [
            "Restore billing test environment access — Platform Lead — 2026-10-20.",
            "Finish integration testing and publish results — QA Lead — 2026-10-23.",
        ],
    }
