const dayMilliseconds = 24 * 60 * 60 * 1000

function isoDaysFromNow(days) {
  return new Date(Date.now() + days * dayMilliseconds).toISOString()
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * dayMilliseconds).toISOString()
}

export function createInitialState() {
  return {
    version: 1,
    projects: [
      { key: 'OPS', name: 'Operations', selected: true },
      { key: 'PLAT', name: 'Platform', selected: true },
      { key: 'DATA', name: 'Data platform', selected: true },
      { key: 'CLOUD', name: 'Cloud services', selected: true },
    ],
    connections: [
      { provider: 'jira', label: 'Jira', status: 'sample', description: 'Issue, status, and estimate fixtures', lastValidatedAt: null },
      { provider: 'confluence', label: 'Confluence', status: 'sample', description: 'Meeting-note action fixtures', lastValidatedAt: null },
      { provider: 'capacity', label: 'Capacity source', status: 'sample', description: 'Planned team capacity fixtures', lastValidatedAt: null },
    ],
    issues: [
      { key: 'OPS-248', title: 'Billing v2 rollout', projectKey: 'OPS', project: 'Operations', owner: 'Maya Chen', status: 'In Progress', priority: 'High', dueDate: isoDaysFromNow(-1), updatedAt: isoDaysAgo(1), remainingHours: 18, team: 'Operations', blockerKeys: [], milestoneMoved: true, fixVersion: 'Billing v2', url: 'https://example.invalid/browse/OPS-248' },
      { key: 'PLAT-091', title: 'OAuth callback retries', projectKey: 'PLAT', project: 'Platform', owner: 'Evan Brooks', status: 'Blocked', priority: 'High', dueDate: isoDaysFromNow(7), updatedAt: isoDaysAgo(2), remainingHours: 22, team: 'Platform', blockerKeys: ['PLAT-088'], milestoneMoved: false, fixVersion: 'Identity Q4', url: 'https://example.invalid/browse/PLAT-091' },
      { key: 'DATA-117', title: 'Event schema mapping', projectKey: 'DATA', project: 'Data platform', owner: 'Ari Patel', status: 'In Progress', priority: 'Medium', dueDate: isoDaysFromNow(12), updatedAt: isoDaysAgo(11), remainingHours: 31, team: 'Data platform', blockerKeys: [], milestoneMoved: false, fixVersion: 'Events 2.4', url: 'https://example.invalid/browse/DATA-117' },
      { key: 'CLOUD-040', title: 'Usage export review', projectKey: 'CLOUD', project: 'Cloud services', owner: 'Leah Morgan', status: 'To Do', priority: 'Medium', dueDate: isoDaysFromNow(2), updatedAt: isoDaysAgo(1), remainingHours: 24, team: 'Cloud services', blockerKeys: [], milestoneMoved: false, fixVersion: 'Usage Q4', url: 'https://example.invalid/browse/CLOUD-040' },
      { key: 'OPS-310', title: 'Share revised rollout checklist with Support', projectKey: 'OPS', project: 'Operations', owner: 'Maya Chen', status: 'To Do', priority: 'Low', dueDate: isoDaysFromNow(5), updatedAt: isoDaysAgo(1), remainingHours: 8, team: 'Operations', blockerKeys: [], milestoneMoved: false, fixVersion: 'Billing v2', url: 'https://example.invalid/browse/OPS-310' },
    ],
    meetingPages: [
      { id: 'PAGE-102', title: 'Platform weekly sync', updatedAt: isoDaysAgo(0), url: 'https://example.invalid/wiki/PAGE-102', actions: ['Add retry metrics to the API dashboard — owner: Priya Nair — due: +2d'] },
      { id: 'PAGE-101', title: 'Data governance review', updatedAt: isoDaysAgo(1), url: 'https://example.invalid/wiki/PAGE-101', actions: ['Confirm data retention window with Security — owner: missing — due: missing'] },
      { id: 'PAGE-099', title: 'Billing launch notes', updatedAt: isoDaysAgo(2), url: 'https://example.invalid/wiki/PAGE-099', actions: ['Share revised rollout checklist with Support — owner: Maya Chen — due: +5d'] },
      { id: 'PAGE-103', title: 'API operations review', updatedAt: isoDaysAgo(0), url: 'https://example.invalid/wiki/PAGE-103', actions: ['Document the retry budget — owner: Noah Kim — due: +4d'] },
    ],
    actions: [
      { id: 'ACT-032', title: 'Add retry metrics to the API dashboard', sourceTitle: 'Platform weekly sync', sourceId: 'PAGE-102', sourceUrl: 'https://example.invalid/wiki/PAGE-102', owner: 'Priya Nair', dueDate: isoDaysFromNow(2).slice(0, 10), confidence: 'Clear owner + date', status: 'pending', createdIssueKey: null, createdAt: isoDaysAgo(0) },
      { id: 'ACT-031', title: 'Confirm data retention window with Security', sourceTitle: 'Data governance review', sourceId: 'PAGE-101', sourceUrl: 'https://example.invalid/wiki/PAGE-101', owner: '', dueDate: '', confidence: 'Needs owner and due date', status: 'needs_info', createdIssueKey: null, createdAt: isoDaysAgo(1) },
      { id: 'ACT-030', title: 'Share revised rollout checklist with Support', sourceTitle: 'Billing launch notes', sourceId: 'PAGE-099', sourceUrl: 'https://example.invalid/wiki/PAGE-099', owner: 'Maya Chen', dueDate: isoDateFromNow(5), confidence: 'Possible Jira match', status: 'pending', createdIssueKey: null, createdAt: isoDaysAgo(2) },
    ],
    teams: [
      { name: 'Platform', capacityHours: 84, memberCount: 5 },
      { name: 'Data platform', capacityHours: 78, memberCount: 4 },
      { name: 'Operations', capacityHours: 80, memberCount: 4 },
      { name: 'Cloud services', capacityHours: 72, memberCount: 3 },
    ],
    capacityAvailable: true,
    rules: { agingDays: 10, dueSoonDays: 3, overdueEnabled: true, blockedEnabled: true, milestoneDriftEnabled: true },
    schedule: { enabled: false, dayOfWeek: 1, time: '09:00', timezone: 'UTC' },
    audit: [],
    runs: [],
    nextDemoIssueNumber: 500,
  }
}

export function isoDateFromNow(days) {
  return isoDaysFromNow(days).slice(0, 10)
}