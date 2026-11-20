import { startTransition, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, CircleAlert, CircleCheck, Clock3, ExternalLink, FileText,
  Gauge, LayoutDashboard, ListChecks, MoreHorizontal, RefreshCw, Search,
  Settings2, ShieldCheck, UsersRound, X,
} from 'lucide-react'
import './Dashboard.css'
import './Prototype.css'

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Risk digest', icon: CircleAlert },
  { name: 'Meeting actions', icon: ListChecks },
  { name: 'Capacity', icon: Gauge },
  { name: 'Run history', icon: Activity },
]

const pageCopy = {
  Overview: ['Portfolio pulse', 'Delivery signals and follow-up across selected sample projects'],
  'Risk digest': ['Risk digest', 'Calculated signals from local sample issue records'],
  'Meeting actions': ['Meeting actions', 'Review proposals parsed from explicit sample-note formats'],
  Capacity: ['Capacity watch', 'Assigned sample work compared with sample team capacity'],
  'Run history': ['Run history', 'Local demo job history and source freshness'],
  Connections: ['Connections', 'Sample source status; no external accounts are contacted'],
  Settings: ['Workspace settings', 'Demo thresholds, schedule, and sample project scope'],
}

const emptyFindings = []

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error ?? `Request failed (${response.status})`)
    error.candidates = payload.candidates ?? []
    throw error
  }
  return payload
}

function formatDate(value) {
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

function Avatar({ name = '' }) {
  const initials = name ? name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() : '?'
  return <span className={`avatar avatar-${initials.toLowerCase()}`}>{initials}</span>
}

function Sidebar({ page, onNavigate, pending = 0, mode = 'memory-demo' }) {
  return <aside className="sidebar">
    <button className="brand" type="button" onClick={() => onNavigate('Overview')}><span className="brand-mark"><Activity size={18} /></span><span className="brand-name">northstar<span>.</span></span></button>
    <div className="workspace-picker"><span className="workspace-glyph">N</span><span className="workspace-copy"><strong>Northstar Labs</strong><small>Demo workspace</small></span><ChevronDown size={14} /></div>
    <div className="nav-label">WORKSPACE</div>
    <nav className="primary-nav" aria-label="Workspace navigation">{navigation.map(({ name, icon: Icon }) => <button className={`nav-item ${page === name ? 'active' : ''}`} key={name} type="button" onClick={() => onNavigate(name)} aria-current={page === name ? 'page' : undefined}><Icon size={17} /><span>{name}</span>{name === 'Meeting actions' && <span className="nav-count count-highlight">{pending}</span>}</button>)}</nav>
    <div className="nav-label nav-label-spaced">MANAGE</div>
    <nav className="primary-nav secondary-nav" aria-label="Workspace management"><button className={`nav-item ${page === 'Connections' ? 'active' : ''}`} type="button" onClick={() => onNavigate('Connections')}><UsersRound size={17} /><span>Connections</span><i className="connection-dot" /></button><button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} type="button" onClick={() => onNavigate('Settings')}><Settings2 size={17} /><span>Settings</span></button></nav>
    <div className="sidebar-spacer" />
    <div className="sidebar-status"><ShieldCheck size={16} /><span><strong>Prototype mode</strong><small>{mode === 'postgres-demo' ? 'PostgreSQL · sample records' : 'Memory · resets on restart'}</small></span><i /></div>
    <div className="profile-button"><Avatar name="Demo User" /><span className="profile-copy"><strong>Demo User</strong><small>Not authenticated</small></span><MoreHorizontal size={18} /></div>
  </aside>
}

function Topbar({ query, onQuery, onNavigate }) {
  return <header className="topbar"><div className="breadcrumbs"><span>Northstar Labs</span><b>/</b><strong>Delivery operations</strong></div><div className="topbar-actions"><label className="search-box"><Search size={15} /><input aria-label="Search issues or actions" placeholder="Search issues or actions" value={query} onChange={(event) => onQuery(event.target.value)} /><kbd>Search</kbd></label><span className="sample-pill"><i /> DEMO DATA</span><button className="icon-button notification-button" type="button" aria-label="Open run history" onClick={() => onNavigate('Run history')}><Bell size={16} /></button></div></header>
}

function PageHeading({ page, period, onPeriod, onRefresh, busy }) {
  const [title, subtitle] = pageCopy[page]
  return <div className="page-heading"><div><div className="eyebrow"><i /> DELIVERY INTELLIGENCE <b>/</b> {page.toUpperCase()}</div><h1>{title}<span>.</span></h1><p>{subtitle}</p></div><div className="heading-controls">{page === 'Overview' && <label className="select-wrap"><CalendarDays size={14} /><select value={period} onChange={(event) => onPeriod(event.target.value)} aria-label="Reporting period"><option>This week</option><option>Last 7 days</option><option>Last 30 days</option></select><ChevronDown size={13} /></label>}<button className="button button-primary" type="button" disabled={busy} onClick={onRefresh}><RefreshCw size={14} />{busy ? 'Running…' : 'Run digest'}</button></div></div>
}

function StatCard({ label, value, change, caption, icon: Icon, tone }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><i className={`stat-icon ${tone}`}><Icon size={16} /></i></div><div className="stat-main"><strong>{value}</strong><span><ArrowUpRight size={13} />{change}</span></div><div className="stat-caption">{caption}</div></article>
}

function PanelHeading({ title, meta, action, onAction, disabled = false }) {
  return <div className="panel-heading"><div><h2>{title}</h2>{meta && <span>{meta}</span>}</div>{action && <button className="text-button" type="button" disabled={disabled} onClick={onAction}>{action}<ArrowRight size={13} /></button>}</div>
}

function SignalTable({ findings, onSelect }) {
  return <div className="table-scroll"><table className="signal-table"><thead><tr><th>ISSUE</th><th>SIGNAL</th><th>OWNER</th><th>UPDATED</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>
    {findings.map((item) => <tr key={item.id}><td><div className="issue-cell"><span>{item.issueKey}</span><strong>{item.issueTitle}</strong><small>{item.project} · {item.priority}</small></div></td><td><div className="signal-cell"><span className={`signal-pill ${item.rule === 'blocked' ? 'red' : item.rule === 'overdue' || item.rule === 'milestone-drift' ? 'coral' : item.rule === 'aging' ? 'amber' : 'lime'}`}><i />{item.signal}</span><small>{item.explanation}</small></div></td><td><span className="owner-cell"><Avatar name={item.owner} />{item.owner}</span></td><td className="updated-cell">{formatDate(item.sourceUpdatedAt)}</td><td><button className="row-action" type="button" aria-label={`Show details for ${item.issueKey}`} onClick={() => onSelect(item)}><ExternalLink size={14} /></button></td></tr>)}
    {findings.length === 0 && <tr><td className="empty-row" colSpan="5">No sample issues match this search or rule set.</td></tr>}
  </tbody></table></div>
}

function ActionCard({ action, onReview }) {
  const label = action.status === 'created' ? `Created ${action.createdIssueKey}` : action.status === 'linked' ? `Linked ${action.createdIssueKey}` : action.status === 'updated' ? `Updated ${action.createdIssueKey}` : action.status === 'dismissed' ? 'Dismissed' : action.confidence
  return <article className="action-card"><div className="action-card-top"><span className="action-id">{action.id}</span><span className={`confidence ${!action.owner || !action.dueDate ? 'needs-info' : ''}`}><i />{label}</span></div><h3>{action.title}</h3><a className="source-link" href={action.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => { event.preventDefault(); onReview(action, true) }}><FileText size={13} />{action.sourceTitle}<span>· {formatDate(action.createdAt)}</span></a><div className="action-card-bottom"><span className="action-owner"><Avatar name={action.owner} />{action.owner || 'Unassigned'}</span><span className="due-date"><Clock3 size={12} />{formatDate(action.dueDate)}</span><button className="review-button" type="button" onClick={() => onReview(action)}>{['created', 'linked', 'updated', 'dismissed'].includes(action.status) ? 'Details' : 'Review'}<ArrowRight size={13} /></button></div></article>
}

function ActionPanel({ actions, onReview, onScan, busy, full = false }) {
  const pending = actions.filter((action) => !['created', 'linked', 'updated', 'dismissed'].includes(action.status)).length
  return <section className={`panel action-panel ${full ? 'queue-panel' : ''}`}><PanelHeading title={full ? 'Proposal queue' : 'Meeting actions'} meta={`${pending} open · ${actions.length} total`} action="Scan sample notes" onAction={onScan} disabled={busy} /><div className={`action-list ${full ? 'action-list-full' : ''}`}>{(full ? actions : actions.slice(0, 2)).map((action) => <ActionCard key={action.id} action={action} onReview={onReview} />)}{actions.length === 0 && <div className="empty-state"><CircleCheck size={19} />No proposals in this queue.</div>}</div><div className="panel-footnote"><ShieldCheck size={13} />Demo writes affect local sample issues only; no Jira account is connected</div></section>
}

function CapacityPanel({ teams, available, onRun, busy, full = false, onToggleAvailability }) {
  const maxValue = Math.max(1, ...teams.map((team) => Math.max(team.assignedHours, team.capacityHours ?? 0)))
  return <section className="panel capacity-panel"><PanelHeading title="Capacity watch" meta={available ? 'Calculated from sample issue estimates' : 'Capacity unavailable · assignments still shown'} action={full ? (available ? 'Mark source unavailable' : 'Restore sample source') : null} onAction={onToggleAvailability} /><div className="capacity-legend"><span><i className="legend-assigned" />Assigned</span><span><i className="legend-capacity" />Capacity</span><small>Current sprint · hours</small></div><div className="capacity-list">{teams.map((team) => <div className="capacity-row" key={team.name}><div className="capacity-label"><span>{team.name}</span><strong className={team.deltaHours > 0 ? 'over-capacity' : ''}>{team.assignedHours}<small> / {team.capacityHours === null ? 'unknown' : `${team.capacityHours}h`}</small></strong></div><div className="capacity-track" aria-label={`${team.name}: ${team.assignedHours} assigned hours; capacity ${team.capacityHours ?? 'unknown'}`}><i className={`capacity-fill ${team.deltaHours > 0 ? 'coral' : 'green'}`} style={{ width: `${Math.min(100, (team.assignedHours / maxValue) * 100)}%` }} />{team.capacityHours !== null && <b style={{ left: `${Math.min(100, (team.capacityHours / maxValue) * 100)}%` }} />}</div><small className="capacity-row-detail">{team.issueCount} issues · {available ? (team.deltaHours > 0 ? `${team.deltaHours}h over plan` : `${Math.abs(team.deltaHours)}h available`) : 'capacity unknown'}</small></div>)}</div>{full && <div className="panel-action-row"><button className="button button-primary" type="button" disabled={busy} onClick={onRun}><Gauge size={14} />Run capacity snapshot</button><span>Totals recalculate from sample issue records.</span></div>}</section>
}

function RunsPanel({ runs, onRun, busy, full = false }) {
  return <section className="panel runs-panel"><PanelHeading title={full ? 'Automation runs' : 'Recent runs'} meta={`${runs.length} recorded`} action={full ? null : 'All runs'} onAction={onRun} />{full && <div className="run-controls"><button className="button button-secondary" type="button" disabled={busy} onClick={() => onRun('risk_digest')}>Run digest</button><button className="button button-secondary" type="button" disabled={busy} onClick={() => onRun('action_scan')}>Scan notes</button><button className="button button-secondary" type="button" disabled={busy} onClick={() => onRun('capacity_snapshot')}>Capacity snapshot</button></div>}{runs.map((run) => <div className="run-row" key={run.id}><span className={`run-icon ${run.status === 'complete' ? 'run-ok' : 'run-review'}`}>{run.status === 'complete' ? <Check size={13} /> : <ListChecks size={13} />}</span><span className="run-name"><strong>{run.type.replaceAll('_', ' ')}</strong><small>{run.summary}</small></span><span className="run-time">{formatDate(run.completedAt)}</span><span className={`run-status ${run.status === 'complete' ? 'status-complete' : 'status-review'}`}>{run.status}</span></div>)}{runs.length === 0 && <div className="empty-state">No runs yet. Start one to create a sample snapshot.</div>}</section>
}

function SettingsPage({ settings, onSave, saving }) {
  const [draft, setDraft] = useState(settings)
  if (!draft) return null
  function updateRule(key, value) { setDraft((current) => ({ ...current, rules: { ...current.rules, [key]: value } })) }
  function updateSchedule(key, value) { setDraft((current) => ({ ...current, schedule: { ...current.schedule, [key]: value } })) }
  function toggleProject(key) { setDraft((current) => ({ ...current, projects: current.projects.map((project) => project.key === key ? { ...project, selected: !project.selected } : project) })) }
  return <form className="panel settings-panel settings-form" onSubmit={(event) => { event.preventDefault(); onSave(draft) }}><PanelHeading title="Workspace defaults" meta="Saved to demo API" />
    <div className="settings-section"><h3>Risk rules <small>Example defaults; tune for your workflow</small></h3><label className="setting-control"><span>Age threshold <small>Days without an update</small></span><input type="number" min="1" max="365" value={draft.rules.agingDays} onChange={(event) => updateRule('agingDays', Number(event.target.value))} /></label><label className="setting-control"><span>Due soon threshold <small>Calendar days</small></span><input type="number" min="0" max="90" value={draft.rules.dueSoonDays} onChange={(event) => updateRule('dueSoonDays', Number(event.target.value))} /></label><label className="setting-check"><input type="checkbox" checked={draft.rules.blockedEnabled} onChange={(event) => updateRule('blockedEnabled', event.target.checked)} />Blocked work</label><label className="setting-check"><input type="checkbox" checked={draft.rules.overdueEnabled} onChange={(event) => updateRule('overdueEnabled', event.target.checked)} />Overdue work</label><label className="setting-check"><input type="checkbox" checked={draft.rules.milestoneDriftEnabled} onChange={(event) => updateRule('milestoneDriftEnabled', event.target.checked)} />Milestone date moved</label></div>
    <div className="settings-section"><h3>Weekly schedule <small>Disabled until enabled</small></h3><label className="setting-check"><input type="checkbox" checked={draft.schedule.enabled} onChange={(event) => updateSchedule('enabled', event.target.checked)} />Enable local demo digest schedule</label><label className="setting-control"><span>Weekday</span><select value={draft.schedule.dayOfWeek} onChange={(event) => updateSchedule('dayOfWeek', Number(event.target.value))}><option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option></select></label><label className="setting-control"><span>Time</span><input type="time" value={draft.schedule.time} onChange={(event) => updateSchedule('time', event.target.value)} /></label><label className="setting-control"><span>Timezone <small>Use an IANA timezone, e.g. America/Los_Angeles</small></span><input value={draft.schedule.timezone} onChange={(event) => updateSchedule('timezone', event.target.value)} /></label></div>
    <div className="settings-section"><h3>Project scope <small>Sample projects used by the demo workflows</small></h3>{draft.projects.map((project) => <label className="setting-check" key={project.key}><input type="checkbox" checked={project.selected} onChange={() => toggleProject(project.key)} />{project.key} · {project.name}</label>)}</div>
    <div className="settings-footer"><span>These rules and schedules only affect sample data in this prototype.</span><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button></div>
  </form>
}

function ConnectionsPage({ connections, projects, onTest, busy }) {
  return <div className="connections-grid">{connections.map((connection) => <article className="panel connection-card" key={connection.provider}><span className={`service-mark ${connection.provider === 'jira' ? 'jira-mark' : 'confluence-mark'}`}>{connection.label[0]}</span><div className="connection-info"><h2>{connection.label}</h2><p>{connection.description}</p><span><i />{connection.status === 'sample' ? 'Sample fixture ready' : connection.status}</span>{connection.lastValidatedAt && <small className="connection-validated">Last fixture check {formatDate(connection.lastValidatedAt)}</small>}</div><button className="button button-secondary" type="button" disabled={busy} onClick={() => onTest(connection.provider)}>Test fixture</button></article>)}<div className="connection-disclaimer"><ShieldCheck size={15} />Prototype mode: these checks exercise fixture providers only. No credentials are stored and no Jira/Confluence endpoint is contacted. Selected projects: {projects.filter((project) => project.selected).map((project) => project.key).join(', ') || 'none'}.</div></div>
}

function ReviewModal({ action, close, onSave, onApprove, onResolve, onDismiss, busy }) {
  const [fields, setFields] = useState({ title: action.title, owner: action.owner ?? '', dueDate: action.dueDate ?? '' })
  const [phase, setPhase] = useState(action.status === 'ready_for_confirmation' ? 'confirm' : 'edit')
  const [candidates, setCandidates] = useState([])
  const [message, setMessage] = useState('')
  const resolved = ['created', 'linked', 'updated', 'dismissed'].includes(action.status)

  async function review() {
    try {
      if (fields.title !== action.title || fields.owner !== action.owner || fields.dueDate !== action.dueDate) {
        await onSave(action.id, fields)
      }
      const outcome = await onApprove(action.id)
      setCandidates(outcome.candidates ?? [])
      setPhase('confirm')
      setMessage(outcome.candidates?.length ? 'A matching sample issue was found. Choose whether to link or update it.' : 'No matching sample issue was found. Confirm to create a local demo issue.')
    } catch (error) { setMessage(error.message) }
  }

  async function resolve(decision, issueKey) {
    try { await onResolve(action.id, { decision, issueKey }); close() } catch (error) { setMessage(error.message) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title"><div className="modal-top"><span>ACTION PROPOSAL · {action.id}</span><button className="icon-button" type="button" aria-label="Close" onClick={close}><X size={17} /></button></div><h2 id="review-title">{action.title}</h2><div className="modal-source"><FileText size={15} /><span><strong>{action.sourceTitle}</strong><small>{action.sourceId} · sample Confluence page</small></span><a href={action.sourceUrl} target="_blank" rel="noreferrer">Source</a></div>
    {resolved ? <><div className="modal-notice"><CircleCheck size={15} />This proposal is {action.status}: {action.createdIssueKey || 'no issue linked'}.</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={close}>Done</button></div></> : phase === 'edit' ? <><div className="modal-fields modal-edit-fields"><label>Action text<input value={fields.title} onChange={(event) => setFields((current) => ({ ...current, title: event.target.value }))} /></label><label>Owner<input value={fields.owner} onChange={(event) => setFields((current) => ({ ...current, owner: event.target.value }))} placeholder="Required before review" /></label><label>Due date<input type="date" value={fields.dueDate} onChange={(event) => setFields((current) => ({ ...current, dueDate: event.target.value }))} /></label><div><small>EXTRACTION</small><strong>{action.confidence}</strong></div></div><div className="modal-notice"><ShieldCheck size={15} />Final confirmation is required after duplicate checking. This creates or links a local sample issue only.</div><div className="modal-actions"><button className="button button-secondary" type="button" disabled={busy} onClick={() => onDismiss(action.id).then(close)}>Dismiss</button><button className="button button-primary" type="button" disabled={busy} onClick={review}><Check size={14} />Review proposal</button></div></> : <><div className="modal-fields"><div><small>OWNER</small><strong>{action.owner}</strong></div><div><small>DUE DATE</small><strong>{formatDate(action.dueDate)}</strong></div></div>{candidates.map((candidate) => <div className="duplicate-option" key={candidate.key}><div><strong>Possible match · {candidate.key}</strong><small>{candidate.title} · {candidate.status}</small></div><div><button className="button button-secondary" type="button" disabled={busy} onClick={() => resolve('link', candidate.key)}>Link issue</button><button className="button button-secondary" type="button" disabled={busy} onClick={() => resolve('update', candidate.key)}>Update issue</button></div></div>)}{candidates.length === 0 && <div className="modal-notice"><CircleCheck size={15} />No exact-title sample duplicate found.</div>}<div className="modal-notice"><ShieldCheck size={15} />Confirming will modify sample API data only; no Jira account is connected.</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => setPhase('edit')}>Back to edit</button>{candidates.length === 0 && <button className="button button-primary" type="button" disabled={busy} onClick={() => resolve('create')}><Check size={14} />Create sample issue</button>}</div></>}
    {message && <div className="modal-message" role="status">{message}</div>}</section></div>
}

function FindingModal({ finding, close }) {
  if (!finding) return null
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="finding-title"><div className="modal-top"><span>RISK SIGNAL · {finding.issueKey}</span><button className="icon-button" type="button" aria-label="Close details" onClick={close}><X size={17} /></button></div><h2 id="finding-title">{finding.issueTitle}</h2><div className="modal-fields"><div><small>SIGNAL</small><strong>{finding.signal}</strong></div><div><small>RULE</small><strong>{finding.rule}</strong></div><div><small>EXPLANATION</small><strong>{finding.explanation}</strong></div><div><small>PROJECT / PRIORITY</small><strong>{finding.project} · {finding.priority}</strong></div></div><div className="modal-notice"><ExternalLink size={15} />{finding.issueKey} · sample Jira source identifier (not a live link)</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={close}>Close</button></div></section></div>
}

function App() {
  const [page, setPage] = useState('Overview')
  const [period, setPeriod] = useState('This week')
  const [query, setQuery] = useState('')
  const [overview, setOverview] = useState(null)
  const [digest, setDigest] = useState(null)
  const [actions, setActions] = useState([])
  const [capacity, setCapacity] = useState({ teams: [], available: false })
  const [runs, setRuns] = useState([])
  const [settings, setSettings] = useState(null)
  const [connections, setConnections] = useState([])
  const [projects, setProjects] = useState([])
  const [mode, setMode] = useState('memory-demo')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [reviewing, setReviewing] = useState(null)
  const [finding, setFinding] = useState(null)

  async function loadAll(_search = '') {
    const [health, overviewData, digestData, actionData, capacityData, runData, settingsData, connectionData] = await Promise.all([
      api('/api/health'), api('/api/overview'), api('/api/digest'), api('/api/actions'), api('/api/capacity'), api('/api/runs'), api('/api/settings'), api('/api/connections'),
    ])
    startTransition(() => {
      setMode(health.mode)
      setOverview(overviewData)
      setDigest(digestData)
      setActions(actionData.actions)
      setCapacity(capacityData)
      setRuns(runData.runs)
      setSettings({ rules: settingsData.rules, schedule: settingsData.schedule, projects: settingsData.projects })
      setProjects(connectionData.projects)
      setConnections(connectionData.connections)
      setError('')
      setLoading(false)
    })
  }

  useEffect(() => { loadAll().catch((requestError) => startTransition(() => { setError(requestError.message); setLoading(false) })) }, [])

  function notify(message) { setToast(message); window.setTimeout(() => setToast(''), 3800) }

  async function refreshAll() {
    setBusy(true)
    try { await api('/api/digest/run', { method: 'POST' }); await loadAll(query); notify('Digest run complete using sample records.') }
    catch (requestError) { setError(requestError.message); notify(requestError.message) }
    finally { setBusy(false) }
  }

  async function runJob(type) {
    setBusy(true)
    try {
      const result = type === 'action_scan' ? await api('/api/actions/scan', { method: 'POST' }) : await api(`/api/runs/${type}`, { method: 'POST' })
      await loadAll(query)
      notify(result.run?.summary ?? `${result.added} new sample actions found.`)
    } catch (requestError) { notify(requestError.message) }
    finally { setBusy(false) }
  }

  async function updateAction(id, fields) {
    const result = await api(`/api/actions/${id}`, { method: 'PATCH', body: fields })
    setReviewing(result.action)
    await loadAll(query)
    return result.action
  }

  async function approveAction(id) {
    const result = await api(`/api/actions/${id}/approve`, { method: 'POST' })
    await loadAll(query)
    return result
  }

  async function resolveAction(id, body) {
    const result = await api(`/api/actions/${id}/resolve`, { method: 'POST', body })
    await loadAll(query)
    notify(`${result.operation.status} sample issue ${result.operation.issueKey}`)
    return result
  }

  async function dismissAction(id) {
    await api(`/api/actions/${id}/dismiss`, { method: 'POST', body: { actor: 'Demo user' } })
    await loadAll(query)
    notify('Proposal dismissed in the local demo workspace.')
  }

  async function saveSettings(draft) {
    setBusy(true)
    try {
      const result = await api('/api/settings', { method: 'PATCH', body: { rules: draft.rules, schedule: draft.schedule, projects: draft.projects.filter((project) => project.selected).map((project) => project.key) } })
      await loadAll(query)
      notify(`Demo settings saved${result.schedule.enabled ? '; weekly schedule enabled' : ''}.`)
    } catch (requestError) { notify(requestError.message) }
    finally { setBusy(false) }
  }

  async function testConnection(provider) {
    setBusy(true)
    try { const result = await api(`/api/connections/${provider}/test`, { method: 'POST' }); await loadAll(query); notify(result.message) }
    catch (requestError) { notify(requestError.message) }
    finally { setBusy(false) }
  }

  async function toggleCapacity() {
    setBusy(true)
    try { await api('/api/capacity', { method: 'PATCH', body: { available: !capacity.available } }); await loadAll(query) }
    catch (requestError) { notify(requestError.message) }
    finally { setBusy(false) }
  }

  const pendingCount = actions.filter((action) => !['created', 'linked', 'updated', 'dismissed'].includes(action.status)).length
  const currentFindings = digest?.findings ?? emptyFindings
  const visibleFindings = useMemo(() => currentFindings.filter((item) => `${item.issueKey} ${item.issueTitle} ${item.project} ${item.signal} ${item.owner}`.toLowerCase().includes(query.trim().toLowerCase())), [currentFindings, query])
  const visibleActions = useMemo(() => actions.filter((action) => `${action.id} ${action.title} ${action.owner} ${action.sourceTitle}`.toLowerCase().includes(query.trim().toLowerCase())), [actions, query])
  const recentRuns = runs.slice(0, 4)

  if (loading) return <div className="app-loading"><span className="brand-mark"><Activity size={18} /></span><strong>Starting local prototype…</strong><small>Connecting to the Express demo API</small></div>

  return <div className="app-shell"><Sidebar page={page} onNavigate={setPage} pending={pendingCount} mode={mode} /><div className="app-main"><Topbar query={query} onQuery={setQuery} onNavigate={setPage} /><main className="main-content"><PageHeading page={page} period={period} onPeriod={setPeriod} onRefresh={refreshAll} busy={busy} />
    <div className="demo-banner"><ShieldCheck size={14} /><span>Prototype mode · sample source data · Jira actions modify local demo records only</span><span className="storage-mode">{mode}</span></div>
    {error && <div className="error-banner" role="alert"><CircleAlert size={15} />{error}<button type="button" onClick={() => loadAll(query).catch((requestError) => setError(requestError.message))}>Retry</button></div>}
    {page === 'Overview' && overview && <><section className="stat-grid" aria-label="Portfolio summary"><StatCard label="Open signals" value={overview.metrics.openSignals} change={`${currentFindings.length} calculated`} caption="from selected sample projects" icon={CircleAlert} tone="coral-icon" /><StatCard label="Actions to review" value={overview.metrics.actionsToReview} change="local queue" caption="from explicit sample note syntax" icon={ListChecks} tone="lime-icon" /><StatCard label="Teams over plan" value={overview.metrics.teamsOverPlan ?? '—'} change={capacity.available ? 'sample capacity' : 'unknown'} caption={capacity.available ? 'based on remaining-hour estimates' : 'capacity source unavailable'} icon={UsersRound} tone="amber-icon" /><StatCard label="Last successful run" value={runs.length ? `${overview.metrics.freshnessMinutes}m` : '—'} change={runs[0]?.type.replaceAll('_', ' ') ?? 'none yet'} caption="sample run freshness" icon={Clock3} tone="green-icon" /></section>
      <div className="dashboard-grid"><section className="panel signals-panel"><PanelHeading title="Signals to watch" meta={`${visibleFindings.length} calculated findings`} action="Open digest" onAction={() => setPage('Risk digest')} /><SignalTable findings={visibleFindings.slice(0, 5)} onSelect={setFinding} /><div className="signals-footer"><span><i />Rules: {digest?.rules.agingDays}d aging · {digest?.rules.dueSoonDays}d due soon</span><span>Source: sample Jira fixtures</span></div></section><ActionPanel actions={visibleActions} onReview={(action) => setReviewing(action)} onScan={() => runJob('action_scan')} busy={busy} /></div><div className="lower-grid"><CapacityPanel teams={capacity.teams} available={capacity.available} /><RunsPanel runs={recentRuns} onRun={() => setPage('Run history')} busy={busy} /></div></>}
    {page === 'Risk digest' && <section className="panel full-panel"><PanelHeading title="Calculated sample findings" meta={`${visibleFindings.length} matches across selected projects`} action={busy ? 'Running…' : 'Run digest now'} onAction={() => runJob('risk_digest')} disabled={busy} /><SignalTable findings={visibleFindings} onSelect={setFinding} /><div className="signals-footer"><span><i />Latest run: {digest?.latestRun ? formatDate(digest.latestRun.completedAt) : 'not run'}</span><span>{digest?.latestRun?.summary ?? 'On-demand run creates the first snapshot'}</span></div></section>}
    {page === 'Meeting actions' && <ActionPanel actions={visibleActions} onReview={(action) => setReviewing(action)} onScan={() => runJob('action_scan')} busy={busy} full />}
    {page === 'Capacity' && <div className="single-column"><CapacityPanel teams={capacity.teams} available={capacity.available} full onToggleAvailability={toggleCapacity} busy={busy} onRun={() => runJob('capacity_snapshot')} /><div className="capacity-explainer"><span className="note-marker"><ArrowUpRight size={14} /></span><div><strong>Calculation uses issue remaining-hour samples.</strong><p>When the fixture capacity source is unavailable, assigned hours remain visible and capacity/delta are explicitly unknown.</p></div></div></div>}
    {page === 'Run history' && <RunsPanel runs={runs} full busy={busy} onRun={runJob} />}
    {page === 'Connections' && <ConnectionsPage connections={connections} projects={projects} onTest={testConnection} busy={busy} />}
    {page === 'Settings' && <SettingsPage settings={settings} onSave={saveSettings} saving={busy} />}
    <footer className="page-footer"><span>Northstar <i>·</i> Interactive prototype</span><span><Clock3 size={12} />{runs.length ? `Last sample run ${formatDate(runs[0].completedAt)}` : 'No runs yet'}<i>·</i>{period}</span></footer>
  </main></div>
  {reviewing && <ReviewModal key={reviewing.id} action={reviewing} close={() => setReviewing(null)} onSave={updateAction} onApprove={approveAction} onResolve={resolveAction} onDismiss={dismissAction} busy={busy} />}
  {finding && <FindingModal finding={finding} close={() => setFinding(null)} />}
  {toast && <div className="toast" role="status"><CircleCheck size={15} /><span>{toast}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button></div>}
  </div>
}

export default App