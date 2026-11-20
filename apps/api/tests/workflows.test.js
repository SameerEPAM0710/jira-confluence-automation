import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialState } from '../src/demo-state.js'
import { buildCapacity, buildDigest, confirmAction, findDuplicateIssues, makeRun, makeSampleActionFromPage } from '../src/workflows.js'

test('digest applies configured blocked, overdue, aging, due-soon, and milestone rules', () => {
  const state = createInitialState()
  const findings = buildDigest(state)
  const byIssue = (key) => findings.filter((finding) => finding.issueKey === key).map((finding) => finding.rule)

  assert.deepEqual(byIssue('OPS-248').sort(), ['milestone-drift', 'overdue'])
  assert.deepEqual(byIssue('PLAT-091'), ['blocked'])
  assert.deepEqual(byIssue('DATA-117'), ['aging'])
  assert.deepEqual(byIssue('CLOUD-040'), ['due-soon'])
  assert.ok(findings.every((finding) => finding.sourceUrl && finding.explanation))
})

test('capacity keeps assignment totals and marks unavailable capacity as unknown', () => {
  const state = createInitialState()
  state.capacityAvailable = false

  const operations = buildCapacity(state).find((team) => team.name === 'Operations')
  assert.equal(operations.assignedHours, 26)
  assert.equal(operations.capacityHours, null)
  assert.equal(operations.deltaHours, null)
  assert.equal(operations.available, false)
})

test('project scope filters digest findings and workload totals', () => {
  const state = createInitialState()
  state.projects = state.projects.map((project) => ({ ...project, selected: project.key === 'OPS' }))

  assert.ok(buildDigest(state).every((finding) => finding.issueKey.startsWith('OPS-')))
  const capacity = buildCapacity(state)
  assert.ok(capacity.find((team) => team.name === 'Operations').assignedHours > 0)
  assert.ok(capacity.filter((team) => team.name !== 'Operations').every((team) => team.assignedHours === 0))
})

test('digest runs compare against the previous successful sample snapshot', () => {
  const state = createInitialState()
  const first = makeRun(state, 'risk_digest')
  assert.equal(first.changes.length, first.findings.length)
  const second = makeRun(state, 'risk_digest')
  assert.equal(second.changes.length, 0)
})

test('digest comparison records changed findings and findings removed by scope changes', () => {
  const state = createInitialState()
  makeRun(state, 'risk_digest')
  state.issues.find((issue) => issue.key === 'OPS-248').dueDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const changedRun = makeRun(state, 'risk_digest')
  assert.ok(changedRun.changes.some((change) => change.kind === 'changed' && change.issueKey === 'OPS-248'))

  state.projects = state.projects.map((project) => project.key === 'DATA' ? { ...project, selected: false } : project)
  const removedRun = makeRun(state, 'risk_digest')
  assert.ok(removedRun.changes.some((change) => change.kind === 'removed' && change.issueKey === 'DATA-117'))
})

test('duplicate proposal can link to a matching issue and repeated resolution is idempotent', () => {
  const state = createInitialState()
  const action = state.actions.find((item) => item.id === 'ACT-030')
  action.status = 'ready_for_confirmation'
  const issueCount = state.issues.length

  const first = confirmAction(state, action, { decision: 'link', issueKey: 'OPS-310', actor: 'Reviewer' })
  const repeated = confirmAction(state, action, { decision: 'link', issueKey: 'OPS-310', actor: 'Reviewer' })

  assert.equal(first.status, 'linked')
  assert.equal(first.issueKey, 'OPS-310')
  assert.deepEqual(repeated, first)
  assert.equal(state.issues.length, issueCount)
  assert.equal(state.audit[0].actor, 'Reviewer')
})

test('duplicate proposal can update the selected issue and records before/after fields once', () => {
  const state = createInitialState()
  const action = state.actions.find((item) => item.id === 'ACT-030')
  action.status = 'ready_for_confirmation'
  action.owner = 'Maya Chen'

  const first = confirmAction(state, action, { decision: 'update', issueKey: 'OPS-310', actor: 'Reviewer' })
  const repeated = confirmAction(state, action, { decision: 'update', issueKey: 'OPS-310', actor: 'Reviewer' })

  assert.equal(first.status, 'updated')
  assert.equal(first.issueKey, 'OPS-310')
  assert.deepEqual(repeated, first)
  assert.equal(state.issues.find((issue) => issue.key === 'OPS-310').owner, 'Maya Chen')
  assert.equal(state.audit.filter((entry) => entry.actionId === action.id).length, 1)
})

test('duplicate checks honor selected project scope and writes require a selected project', () => {
  const state = createInitialState()
  const action = state.actions.find((item) => item.id === 'ACT-030')
  state.projects = state.projects.map((project) => ({ ...project, selected: false }))
  assert.deepEqual(findDuplicateIssues(state, action), [])
  action.status = 'ready_for_confirmation'
  assert.throws(() => confirmAction(state, action, { decision: 'create' }), { status: 422 })
})

test('sample issue creation is idempotent and retains its source reference', () => {
  const state = createInitialState()
  const action = state.actions.find((item) => item.id === 'ACT-032')
  action.title = 'Add a unique cache invalidation check'
  action.status = 'ready_for_confirmation'

  const first = confirmAction(state, action, { decision: 'create' })
  const repeated = confirmAction(state, action, { decision: 'create' })

  assert.equal(first.status, 'created')
  assert.deepEqual(repeated, first)
  assert.equal(state.issues.filter((issue) => issue.sourceActionId === action.id).length, 1)
  assert.equal(state.issues.at(-1).sourcePageUrl, action.sourceUrl)
})

test('explicit sample action parser preserves missing required fields for review', () => {
  const state = createInitialState()
  const page = state.meetingPages.find((item) => item.id === 'PAGE-101')
  const action = makeSampleActionFromPage(page, page.actions[0], 0)

  assert.equal(action.title, 'Confirm data retention window with Security')
  assert.equal(action.owner, '')
  assert.equal(action.dueDate, '')
  assert.equal(action.status, 'needs_info')
})