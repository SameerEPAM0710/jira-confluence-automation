import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'

process.env.DATA_MODE = 'memory'
process.env.NODE_ENV = 'test'

const [{ app }, store] = await Promise.all([
  import('../src/server.js'),
  import('../src/store.js'),
])

test('HTTP API supports a full local demo flow', async () => {
  store.resetMemoryStore()
  await store.initializeStore()
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`
  const request = async (path, method = 'GET', body) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    return { status: response.status, body: await response.json() }
  }

  try {
    const health = await request('/api/health')
    assert.equal(health.status, 200)
    assert.equal(health.body.mode, 'memory-demo')

    const scan = await request('/api/actions/scan', 'POST', {})
    assert.equal(scan.status, 201)
    assert.equal(scan.body.added, 1)
    const repeatedScan = await request('/api/actions/scan', 'POST', {})
    assert.equal(repeatedScan.body.added, 0)

    const digest = await request('/api/digest/run', 'POST', {})
    assert.equal(digest.body.run.status, 'complete')
    assert.ok(digest.body.run.findings.length > 0)

    const missingFields = await request('/api/actions/ACT-031/approve', 'POST', {})
    assert.equal(missingFields.status, 422)

    const edit = await request('/api/actions/ACT-030', 'PATCH', { title: 'Share revised rollout checklist with Support', owner: 'Maya Chen', dueDate: '2026-10-19' })
    assert.equal(edit.status, 200)
    const review = await request('/api/actions/ACT-030/approve', 'POST', {})
    assert.equal(review.body.candidates[0].key, 'OPS-310')
    const update = await request('/api/actions/ACT-030/resolve', 'POST', { decision: 'update', issueKey: 'OPS-310' })
    assert.equal(update.body.operation.status, 'updated')
    const repeatedUpdate = await request('/api/actions/ACT-030/resolve', 'POST', { decision: 'update', issueKey: 'OPS-310' })
    assert.deepEqual(repeatedUpdate.body.operation, update.body.operation)

    const capacityUnavailable = await request('/api/capacity', 'PATCH', { available: false })
    assert.equal(capacityUnavailable.body.available, false)
    assert.ok(capacityUnavailable.body.teams.every((team) => team.capacityHours === null))
    assert.ok(capacityUnavailable.body.teams.some((team) => team.assignedHours > 0))

    const audit = await request('/api/audit')
    assert.ok(audit.body.entries.some((entry) => entry.actionId === 'ACT-030' && entry.decision === 'updated'))
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
})