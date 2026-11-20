import { useMemo, useState } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, CircleAlert, CircleCheck, Clock3, ExternalLink,
  FileText, Gauge, LayoutDashboard, ListChecks, MoreHorizontal,
  RefreshCw, Search, Settings2, ShieldCheck, UsersRound, X,
} from 'lucide-react'
import './Dashboard.css'

const navItems = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Risk digest', icon: CircleAlert, badge: '12' },
  { name: 'Meeting actions', icon: ListChecks, badge: '3' },
  { name: 'Capacity', icon: Gauge },
  { name: 'Run history', icon: Activity },
]

const issues = [
  { key: 'OPS-248', title: 'Billing v2 rollout', project: 'Operations', owner: 'Maya Chen', initials: 'MC', signal: 'Milestone drift', tone: 'coral', detail: 'Target date moved twice', updated: '18 min ago' },
  { key: 'PLAT-091', title: 'OAuth callback retries', project: 'Platform', owner: 'Evan Brooks', initials: 'EB', signal: 'Blocked', tone: 'red', detail: 'Blocked by PLAT-088', updated: '1 hr ago' },
  { key: 'DATA-117', title: 'Event schema mapping', project: 'Data platform', owner: 'Ari Patel', initials: 'AP', signal: 'Aging', tone: 'amber', detail: 'No status change in 11 days', updated: '3 hrs ago' },
  { key: 'CLOUD-040', title: 'Usage export review', project: 'Cloud services', owner: 'Leah Morgan', initials: 'LM', signal: 'Due soon', tone: 'lime', detail: 'Due in 2 days', updated: 'Yesterday' },
]

const initialActions = [
  { id: 'ACT-032', title: 'Add retry metrics to the API dashboard', source: 'Platform weekly sync', date: 'Oct 14, 2026', owner: 'Priya Nair', initials: 'PN', due: 'Oct 16', quality: 'Clear owner + date' },
  { id: 'ACT-031', title: 'Confirm data retention window with Security', source: 'Data governance review', date: 'Oct 13, 2026', owner: 'Unassigned', initials: 'NA', due: 'Not set', quality: 'Needs owner' },
  { id: 'ACT-030', title: 'Share revised rollout checklist with Support', source: 'Billing launch notes', date: 'Oct 12, 2026', owner: 'Maya Chen', initials: 'MC', due: 'Oct 19', quality: 'Clear owner + date' },
]

const teams = [
  { name: 'Platform', assigned: 76, capacity: 84, tone: 'green' },
  { name: 'Data platform', assigned: 91, capacity: 78, tone: 'coral' },
  { name: 'Operations', assigned: 62, capacity: 80, tone: 'yellow' },
  { name: 'Cloud services', assigned: 68, capacity: 72, tone: 'green' },
]

const runData = [
  { name: 'Weekly risk digest', scope: '3 projects · 48 issues', time: '08:42', status: 'Complete' },
  { name: 'Meeting action scan', scope: '6 pages · 3 proposals', time: '08:39', status: 'Review needed' },
  { name: 'Capacity snapshot', scope: '4 teams · 32 issues', time: '08:35', status: 'Complete' },
  { name: 'Weekly risk digest', scope: '3 projects · 47 issues', time: 'Yesterday', status: 'Complete' },
]

const pageCopy = {
  Overview: ['Portfolio pulse', 'Wednesday, October 14, 2026'],
  'Risk digest': ['Risk digest', 'Signals across selected projects'],
  'Meeting actions': ['Meeting actions', 'Proposals from recent Confluence notes'],
  Capacity: ['Capacity watch', 'Assignment load against planned capacity'],
  'Run history': ['Run history', 'Recent automation activity'],
  Connections: ['Connections', 'Project source status'],
  Settings: ['Workspace settings', 'Automation defaults and access'],
}

function Avatar({ initials }) {
  return <span className={`avatar avatar-${initials.toLowerCase()}`}>{initials === 'NA' ? '?' : initials}</span>
}

function Sidebar({ active, onNavigate, pending }) {
  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => onNavigate('Overview')}>
        <span className="brand-mark"><Activity size={18} strokeWidth={2.5} /></span><span className="brand-name">northstar<span>.</span></span>
      </button>
      <button className="workspace-picker" type="button">
        <span className="workspace-glyph">N</span><span className="workspace-copy"><strong>Northstar Labs</strong><small>Delivery workspace</small></span><ChevronDown size={14} />
      </button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="primary-nav" aria-label="Workspace navigation">
        {navItems.map(({ name, icon: Icon, badge }) => (
          <button className={`nav-item ${active === name ? 'active' : ''}`} key={name} type="button" onClick={() => onNavigate(name)} aria-current={active === name ? 'page' : undefined}>
            <Icon size={17} /><span>{name}</span>{badge && <span className={`nav-count ${name === 'Meeting actions' ? 'count-highlight' : ''}`}>{name === 'Meeting actions' ? pending : badge}</span>}
          </button>
        ))}
      </nav>
      <div className="nav-label nav-label-spaced">MANAGE</div>
      <nav className="primary-nav secondary-nav" aria-label="Workspace management">
        <button className={`nav-item ${active === 'Connections' ? 'active' : ''}`} type="button" onClick={() => onNavigate('Connections')}><UsersRound size={17} /><span>Connections</span><i className="connection-dot" /></button>
        <button className={`nav-item ${active === 'Settings' ? 'active' : ''}`} type="button" onClick={() => onNavigate('Settings')}><Settings2 size={17} /><span>Settings</span></button>
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-status"><ShieldCheck size={16} /><span><strong>Demo workspace</strong><small>Sample data only</small></span><i /></div>
      <button className="profile-button" type="button" onClick={() => onNavigate('Settings')}><Avatar initials="AM" /><span className="profile-copy"><strong>Alex Morgan</strong><small>Workspace admin</small></span><MoreHorizontal size={18} /></button>
    </aside>
  )
}

function Topbar({ query, setQuery, refresh, navigate }) {
  return (
    <header className="topbar">
      <div className="breadcrumbs"><span>Northstar Labs</span><b>/</b><strong>Delivery operations</strong></div>
      <div className="topbar-actions">
        <label className="search-box"><Search size={15} /><input aria-label="Search issues or actions" placeholder="Search issues or actions" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
        <span className="sample-pill"><i /> SAMPLE DATA</span>
        <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => navigate('Run history')}><Bell size={16} /><i /></button>
        <button className="icon-button mobile-refresh" type="button" aria-label="Refresh sample preview" onClick={refresh}><RefreshCw size={15} /></button>
      </div>
    </header>
  )
}

function PageHeading({ page, period, setPeriod, refresh }) {
  const [title, subtitle] = pageCopy[page]
  return (
    <div className="page-heading">
      <div><div className="eyebrow"><i /> DELIVERY INTELLIGENCE <b>/</b> {page.toUpperCase()}</div><h1>{title}<span>.</span></h1><p>{subtitle}</p></div>
      <div className="heading-controls">
        {page === 'Overview' && <label className="select-wrap"><CalendarDays size={14} /><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Reporting period"><option>This week</option><option>Last 7 days</option><option>Last 30 days</option></select><ChevronDown size={13} /></label>}
        <button className="button button-primary" type="button" onClick={refresh}><RefreshCw size={14} />Refresh preview</button>
      </div>
    </div>
  )
}

function StatCard({ label, value, change, caption, icon: Icon, tone }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><i className={`stat-icon ${tone}`}><Icon size={16} /></i></div><div className="stat-main"><strong>{value}</strong><span><ArrowUpRight size={13} />{change}</span></div><div className="stat-caption">{caption}</div></article>
}

function PanelHeading({ title, meta, action, onAction }) {
  return <div className="panel-heading"><div><h2>{title}</h2>{meta && <span>{meta}</span>}</div>{action && <button className="text-button" type="button" onClick={onAction}>{action}<ArrowRight size={13} /></button>}</div>
}

function SignalTable({ rows, openIssue }) {
  return (
    <div className="table-scroll"><table className="signal-table"><thead><tr><th>ISSUE</th><th>SIGNAL</th><th>OWNER</th><th>UPDATED</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.key}><td><div className="issue-cell"><span>{row.key}</span><strong>{row.title}</strong><small>{row.project}</small></div></td><td><div className="signal-cell"><span className={`signal-pill ${row.tone}`}><i />{row.signal}</span><small>{row.detail}</small></div></td><td><span className="owner-cell"><Avatar initials={row.initials} />{row.owner}</span></td><td className="updated-cell">{row.updated}</td><td><button className="row-action" type="button" aria-label={`Open sample issue ${row.key}`} onClick={() => openIssue(row)}><ExternalLink size={14} /></button></td></tr>)}
      {rows.length === 0 && <tr><td className="empty-row" colSpan="5">No matching sample issues.</td></tr>}
    </tbody></table></div>
  )
}

function ActionCard({ action, decision, review }) {
  return (
    <article className="action-card">
      <div className="action-card-top"><span className="action-id">{action.id}</span><span className={`confidence ${action.owner === 'Unassigned' ? 'needs-info' : ''}`}><i />{decision || action.quality}</span></div>
      <h3>{action.title}</h3>
      <button className="source-link" type="button" onClick={() => review(action)}><FileText size={13} />{action.source}<span>· {action.date}</span></button>
      <div className="action-card-bottom"><span className="action-owner"><Avatar initials={action.initials} />{action.owner}</span><span className="due-date"><Clock3 size={12} />{action.due}</span><button className="review-button" type="button" onClick={() => review(action)}>{decision ? 'View' : 'Review'}<ArrowRight size={13} /></button></div>
    </article>
  )
}

function ActionPanel({ actions, decisions, review, viewAll }) {
  const pending = actions.filter((action) => !decisions[action.id])
  return <section className="panel action-panel"><PanelHeading title="Meeting actions" meta={`${pending.length} awaiting review`} action="View queue" onAction={viewAll} /><div className="action-list">{actions.slice(0, 2).map((action) => <ActionCard key={action.id} action={action} decision={decisions[action.id]} review={review} />)}{actions.length === 0 && <div className="empty-state"><CircleCheck size={19} />All matching proposals reviewed.</div>}</div><div className="panel-footnote"><ShieldCheck size={13} />Preview mode · no Jira changes are sent</div></section>
}

function CapacityPanel({ compact = false }) {
  return <section className="panel capacity-panel"><PanelHeading title="Capacity watch" meta="Assigned work vs planned capacity" action={compact ? null : 'Team view'} />
    <div className="capacity-legend"><span><i className="legend-assigned" />Assigned</span><span><i className="legend-capacity" />Capacity</span><small>Current sprint · sample hours</small></div>
    <div className="capacity-list">{teams.map((team) => <div className="capacity-row" key={team.name}><div className="capacity-label"><span>{team.name}</span><strong className={team.assigned > team.capacity ? 'over-capacity' : ''}>{team.assigned}<small> / {team.capacity}h</small></strong></div><div className="capacity-track" aria-label={`${team.name}: ${team.assigned} assigned of ${team.capacity} hours planned`}><i className={`capacity-fill ${team.tone}`} style={{ width: `${team.assigned}%` }} /><b style={{ left: `${team.capacity}%` }} /></div></div>)}</div>
    {!compact && <div className="capacity-note"><span><ArrowUpRight size={14} /></span><div><strong>Data platform is 13h over plan.</strong><small>Three unestimated issues excluded from this preview.</small></div></div>}
  </section>
}

function RunsPanel({ compact = false }) {
  return <section className="panel runs-panel"><PanelHeading title="Recent runs" meta="Today" action={compact ? 'All runs' : null} />{runData.slice(0, compact ? 3 : 4).map((run) => <div className="run-row" key={`${run.name}-${run.time}`}><span className={`run-icon ${run.status === 'Complete' ? 'run-ok' : 'run-review'}`}>{run.status === 'Complete' ? <Check size={13} /> : <ListChecks size={13} />}</span><span className="run-name"><strong>{run.name}</strong><small>{run.scope}</small></span><span className="run-time">{run.time}</span>{!compact && <span className={`run-status ${run.status === 'Complete' ? 'status-complete' : 'status-review'}`}>{run.status}</span>}</div>)}</section>
}

function ReviewModal({ action, close, decide }) {
  if (!action) return null
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title"><div className="modal-top"><span>ACTION PROPOSAL · {action.id}</span><button className="icon-button" type="button" aria-label="Close" onClick={close}><X size={17} /></button></div><h2 id="review-title">{action.title}</h2><div className="modal-source"><FileText size={15} /><span><strong>{action.source}</strong><small>{action.date} · Confluence sample</small></span></div><div className="modal-fields"><div><small>OWNER</small><strong>{action.owner}</strong></div><div><small>DUE DATE</small><strong>{action.due}</strong></div><div><small>EXTRACTION</small><strong>{action.quality}</strong></div></div><div className="modal-notice"><ShieldCheck size={15} />Preview only. Approval updates this sample screen; it does not create or update a Jira issue.</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => decide(action, 'Dismissed in preview')}>Dismiss</button><button className="button button-primary" type="button" onClick={() => decide(action, 'Approved in preview')}><Check size={14} />Approve preview</button></div></section></div>
}

function App() {
  const [page, setPage] = useState('Overview')
  const [period, setPeriod] = useState('This week')
  const [query, setQuery] = useState('')
  const [reviewing, setReviewing] = useState(null)
  const [decisions, setDecisions] = useState({})
  const [toast, setToast] = useState('')
  const [refreshed, setRefreshed] = useState('08:42')
  const visibleIssues = useMemo(() => issues.filter((item) => `${item.key} ${item.title} ${item.project} ${item.owner} ${item.signal}`.toLowerCase().includes(query.trim().toLowerCase())), [query])
  const visibleActions = useMemo(() => initialActions.filter((item) => `${item.id} ${item.title} ${item.source} ${item.owner}`.toLowerCase().includes(query.trim().toLowerCase())), [query])
  const pending = initialActions.filter((item) => !decisions[item.id]).length

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }
  function refresh() {
    setRefreshed(new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()))
    notify('Sample preview refreshed. No external services were contacted.')
  }
  function decide(action, result) {
    setDecisions((current) => ({ ...current, [action.id]: result }))
    setReviewing(null)
    notify(`${result}. Preview only; no Jira write was sent.`)
  }

  return <div className="app-shell">
    <Sidebar active={page} onNavigate={setPage} pending={pending} />
    <div className="app-main"><Topbar query={query} setQuery={setQuery} refresh={refresh} navigate={setPage} />
      <main className="main-content"><PageHeading page={page} period={period} setPeriod={setPeriod} refresh={refresh} />
        {page === 'Overview' && <>
          <section className="stat-grid" aria-label="Portfolio summary"><StatCard label="Open signals" value="12" change="2" caption="vs. previous week" icon={CircleAlert} tone="coral-icon" /><StatCard label="Actions to review" value={String(pending).padStart(2, '0')} change="3 new" caption="from recent meeting notes" icon={ListChecks} tone="lime-icon" /><StatCard label="Teams over plan" value="01" change="13h" caption="Data platform · this sprint" icon={UsersRound} tone="amber-icon" /><StatCard label="Source freshness" value="08m" change="All sources" caption="Last successful sync" icon={Clock3} tone="green-icon" /></section>
          <div className="dashboard-grid"><section className="panel signals-panel"><PanelHeading title="Signals to watch" meta="12 open across 3 projects" action="Open digest" onAction={() => setPage('Risk digest')} /><SignalTable rows={visibleIssues.slice(0, 4)} openIssue={(item) => notify(`${item.key} is sample data. No live Jira issue is connected.`)} /><div className="signals-footer"><span><i />Data as of 08:42</span><span>Sample project data</span></div></section><ActionPanel actions={visibleActions} decisions={decisions} review={setReviewing} viewAll={() => setPage('Meeting actions')} /></div>
          <div className="lower-grid"><CapacityPanel compact /><RunsPanel compact /></div>
        </>}
        {page === 'Risk digest' && <section className="panel full-panel"><PanelHeading title="Open signals" meta={`${visibleIssues.length} matching sample issues`} /><SignalTable rows={visibleIssues} openIssue={(item) => notify(`${item.key} is sample data. No live Jira issue is connected.`)} /><div className="signals-footer"><span><i />Last sample sync 08:42</span><span>Illustrative rules</span></div></section>}
        {page === 'Meeting actions' && <section className="panel queue-panel"><PanelHeading title="Review queue" meta={`${pending} awaiting review`} /><div className="action-list action-list-full">{visibleActions.map((action) => <ActionCard key={action.id} action={action} decision={decisions[action.id]} review={setReviewing} />)}{visibleActions.length === 0 && <div className="empty-state">No matching sample proposals.</div>}</div><div className="panel-footnote"><ShieldCheck size={13} />Preview mode · no Jira changes are sent</div></section>}
        {page === 'Capacity' && <div className="single-column"><CapacityPanel /><div className="capacity-note"><span><ArrowUpRight size={14} /></span><div><strong>One sample team exceeds planned capacity.</strong><small>These figures do not use connected Jira or leave data.</small></div></div></div>}
        {page === 'Run history' && <section className="panel full-panel"><PanelHeading title="Recent automation runs" meta="Sample activity" /><RunsPanel /></section>}
        {page === 'Connections' && <div className="connections-grid">{[{ name: 'Jira', description: 'Issues, projects, status history', letter: 'J', cls: 'jira-mark' }, { name: 'Confluence', description: 'Meeting notes and project pages', letter: 'C', cls: 'confluence-mark' }].map((service) => <article className="panel connection-card" key={service.name}><span className={`service-mark ${service.cls}`}>{service.letter}</span><div className="connection-info"><h2>{service.name}</h2><p>{service.description}</p><span><i />Sample connection</span></div><button className="button button-secondary" type="button" onClick={() => notify('Demo preview only. No external account is connected.')}>Configure<ArrowRight size={13} /></button></article>)}<div className="connection-disclaimer"><ShieldCheck size={15} />Illustrative sample data only. No credentials are stored or services connected.</div></div>}
        {page === 'Settings' && <section className="panel settings-panel"><PanelHeading title="Workspace defaults" meta="Preview configuration" /><div className="settings-row"><div><strong>Digest cadence</strong><small>Recurring portfolio summary</small></div><span>Weekly <ChevronDown size={13} /></span></div><div className="settings-row"><div><strong>Workspace timezone</strong><small>Used for dates and scheduled runs</small></div><span>America / Los Angeles <ChevronDown size={13} /></span></div><div className="settings-row"><div><strong>Write actions</strong><small>Jira proposals require explicit review</small></div><span className="setting-lock"><ShieldCheck size={13} />Review required</span></div><div className="settings-disclaimer">Illustrative values; this preview does not save configuration.</div></section>}
        <footer className="page-footer"><span>Northstar <i>·</i> Preview build</span><span><Clock3 size={12} />Sample sync {refreshed}<i>·</i>{period}</span></footer>
      </main>
    </div>
    {reviewing && <ReviewModal action={reviewing} close={() => setReviewing(null)} decide={decide} />}
    {toast && <div className="toast" role="status"><CircleCheck size={15} /><span>{toast}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button></div>}
  </div>
}

export default App
