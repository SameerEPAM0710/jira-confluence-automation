import unittest

import report_generator


class ReportGeneratorTests(unittest.TestCase):
    def test_build_report_replaces_template_fields(self):
        data = {
            "project": "Customer Portal Release 2.4",
            "start_date": "2026-10-01",
            "end_date": "2026-10-15",
            "prepared_by": "Project Manager",
            "status": "At risk",
            "summary": "Core development is complete and the release remains planned for 2026-11-06.",
            "completed": ["Completed development and code review for the account settings workflow."],
            "planned": ["Complete integration testing — QA Lead — 2026-10-23."],
            "milestones": [
                {"name": "Feature complete", "owner": "Engineering Lead", "target_date": "2026-10-16", "status": "Complete", "notes": "All planned development merged."}
            ],
            "risks": [
                {"name": "Billing test environment is unavailable", "impact": "Integration testing may finish late.", "mitigation": "Environment owner to restore access.", "owner": "Platform Lead", "due_date": "2026-10-20"}
            ],
            "decision": "Platform Lead to confirm environment restoration by 2026-10-20.",
            "priorities": ["Restore billing test environment access — Platform Lead — 2026-10-20."]
        }

        report = report_generator.build_report(data)

        self.assertIn("# Project Status Report", report)
        self.assertIn("**Project:** Customer Portal Release 2.4", report)
        self.assertIn("## Summary", report)
        self.assertIn("Core development is complete", report)
        self.assertIn("| Feature complete | Engineering Lead | 2026-10-16 | Complete |", report)
        self.assertIn("| Billing test environment is unavailable |", report)
        self.assertIn("1. Restore billing test environment access", report)


if __name__ == "__main__":
    unittest.main()
