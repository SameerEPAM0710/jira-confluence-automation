import cron from 'node-cron'
import express from 'express'
import { closeStore, getStoreMode, initializeStore, readState, updateState } from './store.js'
import { buildCapacity, buildDigest, buildOverview, confirmAction, makeRun, makeSampleActionFromPage } from './workflows.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)
let scheduledTask = null
let server = null

app.use(express.json({ limit: '64kb' }))

app.get('/api/health', async (_request, response) => {
  try {
    const state = await readState()
    response.json({ status: 'ok', mode: getStoreMode(), demoOnly: true, stateVersion: state.version })
  } catch {
    response.status(503).json({ status: 'unavailable', mode: getStoreMode(), demoOnly: true })
  }
})

app.get('/api/overview', async (_request, response) => response.json(buildOverview(await readState())))

app.get('/api/issues', async (request, response) => {
  const state = await readState()
  const query = String(request.query.q ?? '').trim().toLowerCase()
  const project = String(request.query.project ?? '')
  const issues = state.issues.filter((issue) => {
    const matchesQuery = !query || `${issue.key} ${issue.title} ${issue.project} ${issue.owner} ${issue.status}`.toLowerCase().includes(query)
    const matchesProject = !project || issue.projectKey === project
    return matchesQuery && matchesProject
  })
  response.json({ issues, sourceMode: 'sample', total: issues.length })
})

app.get('/api/digest', async (_request, response) => {
  const state = await readState()
  response.json({ findings: buildDigest(state), rules: state.rules, latestRun: state.runs.find((run) => run.type === 'risk_digest') ?? null, sourceMode: 'sample' })
})

app.post('/api/digest/run', async (_request, response) => {
  const { result: run } = await updateState((state) => makeRun(state, 'risk_digest'))
  response.status(201).json({ run, sourceMode: 'sample' })
})

app.get('/api/actions', async (_request, response) => {
  const state = await readState()
  response.json({ actions: state.actions, pages: state.meetingPages, sourceMode: 'sample' })
})

app.post('/api/actions/scan', async (_request, response) => {
  const { result } = await updateState((state) => {
    const known = new Set(state.actions.map((action) => `${action.sourceId}:${action.title.toLowerCase()}`))
    let added = 0
    for (const page of state.meetingPages) {
      for (const [index, rawAction] of page.actions.entries()) {
        const action = makeSampleActionFromPage(page, rawAction, index)
        if (!action) continue
        const key = `${action.sourceId}:${action.title.toLowerCase()}`
        if (known.has(key)) continue
        known.add(key)
        state.actions.unshift(action)
        added += 1
      }
    }
    const run = makeRun(state, 'action_scan')
    run.summary = `${added} new sample proposals; ${state.actions.length} total proposals`
    return { added, run }
  })
  response.status(201).json({ ...result, sourceMode: 'sample' })
})

app.patch('/api/actions/:id', async (request, response) => {
  const { state, result: action } = await updateState((current) => {
    const item = current.actions.find((candidate) => candidate.id === request.params.id)
    if (!item) return null
    if (item.operationResult) {
      const error = new Error('A completed sample operation cannot be edited')
      error.status = 409
      throw error
    }
    const { title, owner, dueDate } = request.body ?? {}
    if (title !== undefined) item.title = String(title).trim()
    if (owner !== undefined) item.owner = String(owner).trim()
    if (dueDate !== undefined) item.dueDate = String(dueDate).trim()
    item.confidence = !item.owner || !item.dueDate ? 'Needs required fields' : 'Reviewed by demo user'
    item.status = !item.owner || !item.dueDate ? 'needs_info' : 'pending'
    return item
  })
  if (!action) return response.status(404).json({ error: 'Action proposal not found' })
  response.json({ action, mode: getStoreMode() })
})

app.post('/api/actions/:id/approve', async (request, response) => {
  const { result } = await updateState((state) => {
    const action = state.actions.find((item) => item.id === request.params.id)
    if (!action) return null
    if (!action.owner || !action.dueDate) {
      const error = new Error('Add an owner and due date before reviewing this proposal')
      error.status = 422
      throw error
    }
    if (action.operationResult) return { action, candidates: [], alreadyResolved: true }
    action.status = 'ready_for_confirmation'
    const normalized = action.title.trim().toLowerCase()
    const candidates = state.issues.filter((issue) => issue.title.trim().toLowerCase() === normalized)
    return { action, candidates, alreadyResolved: false }
  })
  if (!result) return response.status(404).json({ error: 'Action proposal not found' })
  response.json({ ...result, sourceMode: 'sample', confirmationRequired: !result.alreadyResolved })
})

app.post('/api/actions/:id/resolve', async (request, response) => {
  const { result } = await updateState((state) => {
    const action = state.actions.find((item) => item.id === request.params.id)
    if (!action) return null
    if (action.operationResult) return { action, operation: action.operationResult }
    if (action.status !== 'ready_for_confirmation') {
      const error = new Error('Review the proposal before confirming a Jira sample operation')
      error.status = 409
      throw error
    }
    const operation = confirmAction(state, action, request.body ?? {})
    return { action, operation }
  })
  if (!result) return response.status(404).json({ error: 'Action proposal not found' })
  response.json({ ...result, sourceMode: 'sample', demoOnly: true })
})

app.post('/api/actions/:id/dismiss', async (request, response) => {
  const { result: action } = await updateState((state) => {
    const item = state.actions.find((candidate) => candidate.id === request.params.id)
    if (!item) return null
    if (item.operationResult) {
      const error = new Error('A completed sample operation cannot be dismissed')
      error.status = 409
      throw error
    }
    item.status = 'dismissed'
    item.dismissedAt = new Date().toISOString()
    state.audit.unshift({ id: `AUD-${Date.now()}`, actor: request.body?.actor ?? 'Demo user', actionId: item.id, decision: 'dismissed', sourceUrl: item.sourceUrl, createdAt: new Date().toISOString(), mode: 'sample' })
    return item
  })
  if (!action) return response.status(404).json({ error: 'Action proposal not found' })
  response.json({ action, demoOnly: true })
})

app.get('/api/capacity', async (_request, response) => {
  const state = await readState()
  response.json({ teams: buildCapacity(state), available: state.capacityAvailable, source: 'Sample capacity fixtures', period: 'Current sprint', units: 'hours', sourceMode: 'sample' })
})

app.patch('/api/capacity', async (request, response) => {
  const { state } = await updateState((current) => {
    current.capacityAvailable = Boolean(request.body?.available)
    return current.capacityAvailable
  })
  response.json({ teams: buildCapacity(state), available: state.capacityAvailable, sourceMode: 'sample' })
})

app.get('/api/runs', async (_request, response) => {
  const state = await readState()
  response.json({ runs: state.runs, sourceMode: 'sample' })
})

app.post('/api/runs/:type', async (request, response) => {
  const { result: run } = await updateState((state) => makeRun(state, request.params.type))
  response.status(201).json({ run, sourceMode: 'sample' })
})

app.get('/api/settings', async (_request, response) => {
  const state = await readState()
  response.json({ rules: state.rules, schedule: state.schedule, projects: state.projects, sourceMode: 'sample' })
})

app.patch('/api/settings', async (request, response) => {
  const { state } = await updateState((current) => {
    const body = request.body ?? {}
    if (body.rules) {
      const agingDays = Number(body.rules.agingDays ?? current.rules.agingDays)
      const dueSoonDays = Number(body.rules.dueSoonDays ?? current.rules.dueSoonDays)
      if (!Number.isInteger(agingDays) || agingDays < 1 || agingDays > 365) {
        const error = new Error('Aging threshold must be between 1 and 365 days')
        error.status = 422
        throw error
      }
      if (!Number.isInteger(dueSoonDays) || dueSoonDays < 0 || dueSoonDays > 90) {
        const error = new Error('Due-soon threshold must be between 0 and 90 days')
        error.status = 422
        throw error
      }
      current.rules = { ...current.rules, ...body.rules, agingDays, dueSoonDays }
    }
    if (body.schedule) {
      const dayOfWeek = Number(body.schedule.dayOfWeek ?? current.schedule.dayOfWeek)
      const time = String(body.schedule.time ?? current.schedule.time)
      const timezone = String(body.schedule.timezone ?? current.schedule.timezone)
      if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        const error = new Error('Schedule needs a valid weekday and HH:MM time')
        error.status = 422
        throw error
      }
      try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }) } catch {
        const error = new Error('Schedule timezone is not recognized')
        error.status = 422
        throw error
      }
      current.schedule = { ...current.schedule, ...body.schedule, dayOfWeek, time, timezone, enabled: Boolean(body.schedule.enabled ?? current.schedule.enabled) }
    }
    if (Array.isArray(body.projects)) {
      const selected = new Set(body.projects.map(String))
      current.projects = current.projects.map((project) => ({ ...project, selected: selected.has(project.key) }))
    }
    return current
  })
  await refreshScheduler(state)
  response.json({ rules: state.rules, schedule: state.schedule, projects: state.projects, sourceMode: 'sample' })
})

app.get('/api/connections', async (_request, response) => {
  const state = await readState()
  response.json({ connections: state.connections, projects: state.projects, demoOnly: true })
})

app.post('/api/connections/:provider/test', async (request, response) => {
  const { state, result } = await updateState((current) => {
    const connection = current.connections.find((item) => item.provider === request.params.provider)
    if (!connection) return null
    connection.lastValidatedAt = new Date().toISOString()
    connection.status = 'sample'
    return { connection, projectCount: current.projects.filter((project) => project.selected).length }
  })
  if (!result) return response.status(404).json({ error: 'Sample connection not found' })
  response.json({ ...result, mode: 'sample', message: 'Fixture source is available. No external account was contacted.', demoOnly: true })
})

app.get('/api/audit', async (_request, response) => {
  const state = await readState()
  response.json({ entries: state.audit, demoOnly: true })
})

app.use((error, _request, response, _next) => {
  const status = Number(error.status ?? 500)
  response.status(status).json({ error: status >= 500 ? 'Prototype API error' : error.message, ...(error.candidates ? { candidates: error.candidates } : {}), demoOnly: true })
})

async function refreshScheduler(state) {
  const currentState = state ?? await readState()
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
  }
  if (!currentState.schedule.enabled) return
  const [hour, minute] = currentState.schedule.time.split(':').map(Number)
  const expression = `${minute} ${hour} * * ${currentState.schedule.dayOfWeek}`
  scheduledTask = cron.schedule(expression, async () => {
    await updateState((current) => makeRun(current, 'risk_digest'))
  }, { timezone: currentState.schedule.timezone, noOverlap: true })
}

export async function startServer() {
  const store = await initializeStore()
  await refreshScheduler()
  server = app.listen(port, () => {
    console.log(`Northstar demo API listening on http://localhost:${port} (${store.mode}; sample data only)`)
  })
  return server
}

export async function stopServer() {
  if (scheduledTask) scheduledTask.stop()
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  await closeStore()
}

if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
  startServer().catch((error) => {
    console.error('Could not start the prototype API:', error.message)
    process.exitCode = 1
  })
}

export { app }