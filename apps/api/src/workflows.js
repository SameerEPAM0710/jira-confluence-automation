import { isoDateFromNow } from './demo-state.js'

const dayMilliseconds = 24 * 60 * 60 * 1000

function isOpen(issue) {
  return issue.status.toLowerCase() !== 'done'
}

function dayDifference(from, to) {
  return Math.floor((new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0)) / dayMilliseconds)
}

export function buildDigest(state, now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  const findings = []
  const selectedProjects = new Set(state.projects.filter((project) => project.selected).map((project) => project.key))

  for (const issue of state.issues) {
    if (!isOpen(issue) || !selectedProjects.has(issue.projectKey)) continue
    const add = (type, label, explanation) => findings.push({
      id: `${issue.key}:${type}`,
      issueKey: issue.key,
      issueTitle: issue.title,
      project: issue.project,
      owner: issue.owner,
      status: issue.status,
      priority: issue.priority,
      dueDate: issue.dueDate.slice(0, 10),
      fixVersion: issue.fixVersion,
      blockerKeys: issue.blockerKeys,
      rule: type,
      signal: label,
      explanation,
      sourceUrl: issue.url,
      sourceUpdatedAt: issue.updatedAt,
    })

    if (state.rules.blockedEnabled && (issue.status.toLowerCase() === 'blocked' || issue.blockerKeys.length > 0)) {
      add('blocked', 'Blocked', issue.blockerKeys.length ? `Blocked by ${issue.blockerKeys.join(', ')}` : 'Issue status is Blocked')
    }
    if (state.rules.overdueEnabled && issue.dueDate.slice(0, 10) < today) {
      add('overdue', 'Overdue', `Due date ${issue.dueDate.slice(0, 10)} is before ${today}`)
    }
    if (dayDifference(issue.updatedAt, now) >= state.rules.agingDays) {
      add('aging', 'Aging', `No update for ${dayDifference(issue.updatedAt, now)} days; threshold is ${state.rules.agingDays}`)
    }
    if (state.rules.dueSoonDays > 0 && dayDifference(now, issue.dueDate) >= 0 && dayDifference(now, issue.dueDate) <= state.rules.dueSoonDays) {
      add('due-soon', 'Due soon', `Due within ${state.rules.dueSoonDays} days`)
    }
    if (state.rules.milestoneDriftEnabled && issue.milestoneMoved) {
      add('milestone-drift', 'Milestone drift', 'Target date moved; review the linked release milestone')
    }
  }

  return findings
}

export function buildCapacity(state) {
  const selectedProjects = new Set(state.projects.filter((project) => project.selected).map((project) => project.key))
  return state.teams.map((team) => {
    const issues = state.issues.filter((issue) => issue.team === team.name && isOpen(issue) && selectedProjects.has(issue.projectKey))
    const assignedHours = issues.reduce((total, issue) => total + issue.remainingHours, 0)
    return {
      name: team.name,
      capacityHours: state.capacityAvailable ? team.capacityHours : null,
      assignedHours,
      available: state.capacityAvailable,
      memberCount: team.memberCount,
      issueCount: issues.length,
      issues: issues.map(({ key, title, owner, remainingHours, url }) => ({ key, title, owner, remainingHours, url })),
      deltaHours: state.capacityAvailable ? assignedHours - team.capacityHours : null,
    }
  })
}

export function buildOverview(state) {
  const findings = buildDigest(state)
  const pendingActions = state.actions.filter((action) => ['pending', 'needs_info', 'ready_for_confirmation'].includes(action.status))
  const openIssues = state.issues.filter(isOpen)
  const lastRun = state.runs[0] ?? null
  return {
    metrics: {
      openSignals: findings.length,
      actionsToReview: pendingActions.length,
      teamsOverPlan: state.capacityAvailable ? buildCapacity(state).filter((team) => team.deltaHours > 0).length : null,
      freshnessMinutes: lastRun ? Math.max(0, Math.floor((Date.now() - new Date(lastRun.completedAt).getTime()) / 60000)) : null,
      openIssues: openIssues.length,
    },
    findings: findings.slice(0, 8),
    actions: pendingActions.slice(0, 4),
    capacity: buildCapacity(state),
    runs: state.runs.slice(0, 5),
    connections: state.connections,
    projects: state.projects,
    rules: state.rules,
    schedule: state.schedule,
    capacityAvailable: state.capacityAvailable,
  }
}

export function makeRun(state, type, now = new Date()) {
  const completedAt = now.toISOString()
  const run = {
    id: `RUN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    startedAt: completedAt,
    completedAt,
    status: 'complete',
    sourceMode: 'sample',
    summary: '',
    findings: [],
    changes: [],
    errors: [],
  }

  if (type === 'risk_digest') {
    const findings = buildDigest(state, now)
    const previous = state.runs.find((item) => item.type === type && item.status === 'complete')
    const previousById = new Map((previous?.findings ?? []).map((item) => [item.id, item]))
    const currentById = new Map(findings.map((item) => [item.id, item]))
    run.findings = findings
    if (previous) {
      for (const item of findings) {
        const oldItem = previousById.get(item.id)
        if (!oldItem) {
          run.changes.push({ kind: 'new', id: item.id, issueKey: item.issueKey, signal: item.signal })
        } else if (JSON.stringify(oldItem) !== JSON.stringify(item)) {
          run.changes.push({ kind: 'changed', id: item.id, issueKey: item.issueKey, signal: item.signal })
        }
      }
      for (const item of previous.findings) {
        if (!currentById.has(item.id)) run.changes.push({ kind: 'removed', id: item.id, issueKey: item.issueKey, signal: item.signal })
      }
    } else {
      run.changes = findings.map((item) => ({ kind: 'new', id: item.id, issueKey: item.issueKey, signal: item.signal }))
    }
    run.summary = `${findings.length} sample signals across ${new Set(findings.map((item) => item.project)).size} projects${previous ? `; ${run.changes.length} changes since the previous successful run` : '; first successful snapshot'}`
  } else if (type === 'action_scan') {
    run.summary = `${state.actions.length} sample proposals from ${state.meetingPages.length} sample notes`
  } else if (type === 'capacity_snapshot') {
    const capacity = buildCapacity(state)
    run.summary = state.capacityAvailable
      ? `${capacity.filter((team) => team.deltaHours > 0).length} teams over sample capacity`
      : 'Capacity source unavailable; assignment totals retained and capacity marked unknown'
  } else {
    throw new Error('Unsupported run type')
  }

  state.runs.unshift(run)
  state.runs = state.runs.slice(0, 50)
  return run
}

export function findDuplicateIssues(state, action) {
  const normalizedTitle = action.title.trim().toLowerCase()
  const selectedProjects = new Set(state.projects.filter((project) => project.selected).map((project) => project.key))
  return state.issues.filter((issue) => selectedProjects.has(issue.projectKey) && issue.title.trim().toLowerCase() === normalizedTitle)
}

export function confirmAction(state, action, { decision, issueKey, actor = 'Demo user' }) {
  if (action.operationResult) return action.operationResult

  const duplicates = findDuplicateIssues(state, action)
  let result
  if (decision === 'link') {
    const selected = duplicates.find((issue) => issue.key === issueKey)
    if (!selected) {
      const error = new Error('Select one of the possible matching sample issues')
      error.status = 422
      throw error
    }
    action.createdIssueKey = selected.key
    action.status = 'linked'
    result = { status: 'linked', issueKey: selected.key, issueUrl: selected.url }
  } else if (decision === 'update') {
    const selected = duplicates.find((issue) => issue.key === issueKey)
    if (!selected) {
      const error = new Error('Select one of the possible matching sample issues')
      error.status = 422
      throw error
    }
    const before = { title: selected.title, owner: selected.owner, dueDate: selected.dueDate }
    selected.title = action.title
    selected.owner = action.owner
    selected.dueDate = `${action.dueDate}T00:00:00.000Z`
    selected.updatedAt = new Date().toISOString()
    action.createdIssueKey = selected.key
    action.status = 'updated'
    result = { status: 'updated', issueKey: selected.key, issueUrl: selected.url, before, after: { title: selected.title, owner: selected.owner, dueDate: selected.dueDate } }
  } else if (decision === 'create') {
    if (duplicates.length) {
      const error = new Error('A possible duplicate exists; link the proposal or edit its title before creating')
      error.status = 409
      error.candidates = duplicates
      throw error
    }
    const project = state.projects.find((item) => item.selected)
    if (!project) {
      const error = new Error('Select at least one project before creating a sample issue')
      error.status = 422
      throw error
    }
    state.nextDemoIssueNumber += 1
    const issueKey = `DEMO-${state.nextDemoIssueNumber}`
    const issue = {
      key: issueKey,
      title: action.title,
      projectKey: project.key,
      project: project.name,
      owner: action.owner,
      status: 'To Do',
      priority: 'Medium',
      dueDate: `${action.dueDate}T00:00:00.000Z`,
      updatedAt: new Date().toISOString(),
      remainingHours: 0,
      team: project.name,
      blockerKeys: [],
      milestoneMoved: false,
      fixVersion: 'Demo-created',
      url: `https://example.invalid/browse/${issueKey}`,
      sourceActionId: action.id,
      sourcePageUrl: action.sourceUrl,
    }
    state.issues.push(issue)
    action.createdIssueKey = issueKey
    action.status = 'created'
    result = { status: 'created', issueKey, issueUrl: issue.url }
  } else {
    const error = new Error('Decision must be create or link')
    error.status = 400
    throw error
  }

  action.operationResult = result
  state.audit.unshift({ id: `AUD-${Date.now()}`, actor, actionId: action.id, decision: result.status, issueKey: result.issueKey, sourceUrl: action.sourceUrl, createdAt: new Date().toISOString(), mode: 'sample' })
  return result
}

export function makeSampleActionFromPage(page, rawText, index) {
  const match = rawText.match(/^(.*?)\s+—\s+owner:\s*(.*?)\s+—\s+due:\s*(.*)$/i)
  if (!match) return null
  const [, title, rawOwner, rawDue] = match
  const owner = rawOwner.trim().toLowerCase() === 'missing' ? '' : rawOwner.trim()
  const dueMatch = rawDue.trim().match(/^\+(\d+)d$/i)
  const dueDate = rawDue.trim().toLowerCase() === 'missing'
    ? ''
    : dueMatch
      ? isoDateFromNow(Number(dueMatch[1]))
      : rawDue.trim()
  const missing = [!owner && 'owner', !dueDate && 'due date'].filter(Boolean)
  return {
    id: `ACT-${String(Date.now() + index).slice(-4)}`,
    title: title.trim(),
    sourceTitle: page.title,
    sourceId: page.id,
    sourceUrl: page.url,
    owner,
    dueDate,
    confidence: missing.length ? `Needs ${missing.join(' and ')}` : 'Parsed from explicit sample format',
    status: missing.length ? 'needs_info' : 'pending',
    createdIssueKey: null,
    createdAt: new Date().toISOString(),
  }
}