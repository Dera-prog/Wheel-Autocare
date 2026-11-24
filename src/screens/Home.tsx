import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Icon } from '@phosphor-icons/react'
import {
  BatteryFull,
  BellSimple,
  CaretRight,
  CheckCircle,
  Drop,
  FolderSimple,
  Gauge,
  MapPinLine,
  Plus,
  SealWarning,
  Sparkle,
  Tire,
  Warning,
  Wrench
} from '@phosphor-icons/react'
import { useStore } from '../store'
import type { Task } from '../types'
import { DOC_META, TASK_META, docStatus, docDaysLabel, nextAlert, fmtDate, taskPace, relativeDays, num } from '../lib'
import {
  Avatar,
  Btn,
  EmptyState,
  Field,
  IconBtn,
  Ring,
  SectionHeader,
  Sheet,
  StatusPill,
  useNow,
  useToast,
  EASE
} from '../ui'
import { DocGlyph } from './Documents'
import type { Tab } from '../nav'

const TASK_ICON: Record<Task['kind'], Icon> = {
  oil: Drop,
  engine: Gauge,
  tyres: Tire,
  battery: BatteryFull,
  brakes: Warning,
  custom: Wrench
}

const PACE_LABEL: Record<string, string> = {
  overdue: 'Overdue',
  soon: 'Due soon',
  scheduled: 'Scheduled',
  done: 'Done'
}

export default function Home({
  onOpenDoc,
  onNewDoc,
  onNavigate
}: {
  onOpenDoc: (id: string) => void
  onNewDoc: () => void
  onNavigate: (tab: Tab) => void
}) {
  const { state, updateOdometer } = useStore()
  const toast = useToast()
  const now = useNow(60_000)
  const [notifOpen, setNotifOpen] = useState(false)
  const [odoOpen, setOdoOpen] = useState(false)
  const [odoValue, setOdoValue] = useState('')
  const vehicle = state.vehicle

  const docs = useMemo(() => state.documents.filter((d) => !d.archived), [state.documents])

  const tasks = useMemo(() => {
    const odo = vehicle?.odometer ?? 0
    return state.tasks
      .map((t) => ({ task: t, pace: taskPace(t, odo) }))
      .sort((a, b) => a.task.nextDueAt.localeCompare(b.task.nextDueAt))
  }, [state.tasks, vehicle?.odometer])

  if (!vehicle) return null

  const hour = new Date(now).getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = state.profile?.name.split(' ')[0] ?? 'there'

  const attention = [
    ...docs
      .filter((d) => docStatus(d.expiry) !== 'active')
      .map((d) => ({
        id: `doc-${d.id}`,
        title: docStatus(d.expiry) === 'expired' ? `${DOC_META[d.type].short} expired` : `${DOC_META[d.type].short} expires soon`,
        sub: `${d.label} · ${docDaysLabel(d.expiry)}`,
        tone: docStatus(d.expiry) === 'expired' ? ('danger' as const) : ('warn' as const),
        icon: <Warning size={18} weight="duotone" />,
        go: () => onOpenDoc(d.id)
      })),
    ...tasks
      .filter((t) => t.pace.status === 'overdue' || t.pace.status === 'soon')
      .map((t) => ({
        id: `task-${t.task.id}`,
        title: t.task.title,
        sub: t.pace.dueLabel,
        tone: t.pace.status === 'overdue' ? ('danger' as const) : ('warn' as const),
        icon: <Wrench size={18} weight="duotone" />,
        go: () => onNavigate('service')
      }))
  ].slice(0, 3)

  const upcoming = tasks.filter((t) => t.pace.status !== 'overdue').slice(0, 2)
  const overdueCount = tasks.filter((t) => t.pace.status === 'overdue').length
  const totalTasks = tasks.length
  const health = totalTasks === 0 ? 1 : (totalTasks - overdueCount) / totalTasks

  const recentDocs = [...docs].sort((a, b) => a.expiry.localeCompare(b.expiry)).slice(0, 4)

  const saveOdo = () => {
    const n = Number(odoValue)
    if (!Number.isFinite(n) || n <= 0) {
      toast('Enter a valid odometer reading', 'Numbers only, in kilometres', 'danger')
      return
    }
    if (n < vehicle.odometer) {
      toast('Odometer cannot go backwards', `Last recorded: ${num(vehicle.odometer)} km`, 'danger')
      return
    }
    updateOdometer(n)
    setOdoOpen(false)
    toast('Odometer updated', `${num(n)} km · service intervals refreshed`, 'success')
  }

  return (
    <motion.div className="screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: EASE }}>
      <div className="home-top">
        <div className="home-top-left">
          <button type="button" onClick={() => onNavigate('settings')} aria-label="Open settings">
            <Avatar name={state.profile?.name ?? 'WheelWell'} size={42} hue={262} />
          </button>
          <span className="hero-plate" style={{ background: 'var(--lav-2)', color: 'var(--brand)', borderColor: 'var(--line)' }}>
            <SealWarning size={13} weight="fill" />
            {vehicle.plate}
          </span>
        </div>
        <div className="bell-wrap">
          <IconBtn label="Notifications" onClick={() => setNotifOpen(true)}>
            <BellSimple size={20} weight="duotone" />
          </IconBtn>
          {attention.length > 0 && <span className="bell-dot" />}
        </div>
      </div>

      <motion.div
        className="greeting"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <h1>
          {greeting},
          <br />
          {firstName}.
        </h1>
        <p>
          {attention.length > 0
            ? `${attention.length} thing${attention.length === 1 ? '' : 's'} need${attention.length === 1 ? 's' : ''} a look today.`
            : 'Everything is on schedule. Nice work.'}
        </p>
      </motion.div>

      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.06 }}
      >
        <img src="/assets/hero-car.webp" alt={`${vehicle.make} ${vehicle.model}`} />
        <div className="hero-body">
          <span className="hero-plate">{vehicle.plate}</span>
          <div>
            <div className="hero-title">
              <h2>
                {vehicle.make} {vehicle.model}
              </h2>
              <div className="hero-meta">
                <span>{vehicle.year}</span>
                <span>·</span>
                <span>{vehicle.fuelType}</span>
                <span>·</span>
                <span>{num(vehicle.odometer)} km</span>
              </div>
            </div>
            <div className="hero-foot" style={{ marginTop: 14 }}>
              <div className="odo">
                <strong>{Math.round(health * 100)}% on track</strong>
                <span>Garage health</span>
              </div>
              <button
                type="button"
                className="odo-btn"
                onClick={() => {
                  setOdoValue(String(vehicle.odometer))
                  setOdoOpen(true)
                }}
              >
                <Gauge size={15} weight="bold" />
                Update
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="quick-grid mt-14">
        {[
          { label: 'Add document', icon: <Plus size={18} weight="bold" />, go: onNewDoc },
          { label: 'Log service', icon: <Wrench size={18} weight="duotone" />, go: () => onNavigate('service') },
          { label: 'Renew', icon: <SealWarning size={18} weight="duotone" />, go: () => onNavigate('vault') },
          { label: 'Mechanics', icon: <MapPinLine size={18} weight="duotone" />, go: () => onNavigate('garage') }
        ].map((q, i) => (
          <motion.button
            key={q.label}
            type="button"
            className="quick"
            onClick={q.go}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 + i * 0.04 }}
          >
            <i>{q.icon}</i>
            {q.label}
          </motion.button>
        ))}
      </div>

      {state.sampleData && (
        <motion.button
          type="button"
          className="att-row"
          style={{ width: '100%', textAlign: 'left', marginTop: 14, marginBottom: 0, background: 'linear-gradient(135deg,#fdf8ff,#f3efff)' }}
          onClick={() => onNavigate('settings')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="att-icon tone-warn">
            <Sparkle size={19} weight="fill" />
          </span>
          <span className="att-main">
            <strong>You're exploring sample data</strong>
            <span>Swap in your own car and papers in Settings.</span>
          </span>
          <CaretRight size={16} weight="bold" color="var(--muted-2)" />
        </motion.button>
      )}

      <div className="mt-20">
        <SectionHeader
          title="Needs attention"
          sub={attention.length > 0 ? 'The things that bite if ignored' : 'Nothing urgent today'}
          action={attention.length > 0 ? 'See all' : undefined}
          onAction={() => onNavigate('vault')}
        />
        {attention.length > 0 ? (
          <div>
            {attention.map((a, i) => (
              <motion.button
                key={a.id}
                type="button"
                className="att-row"
                style={{ width: '100%', textAlign: 'left' }}
                onClick={a.go}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <span className={`att-icon ${a.tone === 'danger' ? 'tone-danger' : 'tone-warn'}`}>{a.icon}</span>
                <span className="att-main">
                  <strong>{a.title}</strong>
                  <span>{a.sub}</span>
                </span>
                <CaretRight size={16} weight="bold" color="var(--muted-2)" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="att-row">
            <span className="att-icon" style={{ background: '#e9fbf3', color: '#0f9c6d' }}>
              <CheckCircle size={20} weight="fill" />
            </span>
            <span className="att-main">
              <strong>All clear</strong>
              <span>No expired papers or overdue services.</span>
            </span>
          </div>
        )}
      </div>

      <div className="mt-20">
        <SectionHeader title="Upcoming maintenance" action="Open" onAction={() => onNavigate('service')} />
        {upcoming.length > 0 ? (
          upcoming.map(({ task, pace }) => {
            const Glyph = TASK_ICON[task.kind]
            return (
              <button
                key={task.id}
                type="button"
                className="task-row"
                style={{ width: '100%', textAlign: 'left' }}
                onClick={() => onNavigate('service')}
              >
                <div className="task-row-top">
                  <span
                    className="att-icon"
                    style={{
                      background: `hsl(${TASK_META[task.kind]?.hue ?? 262} 90% 95%)`,
                      color: `hsl(${TASK_META[task.kind]?.hue ?? 262} 60% 40%)`
                    }}
                  >
                    <Glyph size={20} weight="duotone" />
                  </span>
                  <span className="task-title">
                    <strong>{task.title}</strong>
                    <span>{pace.dueLabel}</span>
                  </span>
                  <StatusPill kind={pace.status === 'done' ? 'scheduled' : pace.status}>{PACE_LABEL[pace.status]}</StatusPill>
                </div>
                <div className={`bar ${pace.status === 'soon' ? 'is-warn' : ''}`}>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(pace.progress * 100)}%` }}
                    transition={{ duration: 0.9, ease: EASE }}
                  />
                </div>
              </button>
            )
          })
        ) : (
          <div className="att-row">
            <span className="att-icon">
              <Wrench size={19} weight="duotone" />
            </span>
            <span className="att-main">
              <strong>No planned services</strong>
              <span>Add an interval so WheelWell can remind you.</span>
            </span>
            <IconBtn label="Add service" onClick={() => onNavigate('service')}>
              <Plus size={16} weight="bold" />
            </IconBtn>
          </div>
        )}
      </div>

      <div className="mt-20">
        <SectionHeader title="Document vault" sub="Closest expiry first" action="Vault" onAction={() => onNavigate('vault')} />
        {recentDocs.length > 0 ? (
          <div className="doc-strip">
            {recentDocs.map((d, i) => {
              const status = docStatus(d.expiry)
              return (
                <motion.button
                  key={d.id}
                  type="button"
                  className="doc-card"
                  onClick={() => onOpenDoc(d.id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="doc-card-top">
                    <span
                      className="att-icon"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: `hsl(${DOC_META[d.type].hue} 90% 94%)`,
                        color: `hsl(${DOC_META[d.type].hue} 65% 40%)`
                      }}
                    >
                      <DocGlyph type={d.type} size={18} />
                    </span>
                    <StatusPill kind={status}>{status === 'soon' ? 'Soon' : status === 'expired' ? 'Expired' : 'Active'}</StatusPill>
                  </div>
                  <h4>{DOC_META[d.type].label}</h4>
                  <p>{d.label}</p>
                  <p style={{ marginTop: 6, fontWeight: 700, color: status === 'expired' ? '#d03434' : 'var(--muted)' }}>
                    {docDaysLabel(d.expiry)}
                  </p>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={<FolderSimple size={26} weight="duotone" />}
            title="Your vault is empty"
            copy="Add your licence, insurance and registration to get renewal reminders."
            action={
              <Btn variant="soft" size="sm" onClick={onNewDoc} iconLeft={<Plus size={15} weight="bold" />}>
                Add a document
              </Btn>
            }
          />
        )}
      </div>

      <Sheet open={odoOpen} onClose={() => setOdoOpen(false)} title="Update odometer" subtitle="Fresh numbers keep every service interval accurate">
        <div className="row gap-12" style={{ marginBottom: 16 }}>
          <Ring value={Math.min(1, Number(odoValue || 0) / 100_000)} size={64} stroke={6}>
            <Gauge size={20} weight="duotone" />
          </Ring>
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Last reading</p>
            <p className="display" style={{ fontSize: 20 }}>
              {num(vehicle.odometer)} km
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              updated {relativeDays(vehicle.odometerUpdatedAt)}
            </p>
          </div>
        </div>
        <Field label="Current odometer (km)">
          <input
            className="input"
            value={odoValue}
            onChange={(e) => setOdoValue(e.target.value.replace(/[^\d]/g, ''))}
            inputMode="numeric"
            placeholder={String(vehicle.odometer)}
            autoFocus
          />
        </Field>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 16 }}>
          Service reminders use this number to calculate kilometres left.
        </p>
        <Btn full size="lg" onClick={saveOdo} iconLeft={<CheckCircle size={18} weight="fill" />}>
          Save reading
        </Btn>
      </Sheet>

      <Sheet
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        subtitle={state.settings.quietHours ? 'Quiet hours on · 9pm – 7am' : 'Alerts are active'}
      >
        <AnimatePresence initial={false}>
          {attention.length > 0 ? (
            attention.map((a) => (
              <motion.button
                key={a.id}
                type="button"
                className="att-row"
                style={{ width: '100%', textAlign: 'left' }}
                onClick={() => {
                  setNotifOpen(false)
                  a.go()
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className={`att-icon ${a.tone === 'danger' ? 'tone-danger' : 'tone-warn'}`}>{a.icon}</span>
                <span className="att-main">
                  <strong>{a.title}</strong>
                  <span>{a.sub}</span>
                </span>
              </motion.button>
            ))
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Nothing needs your attention right now.</p>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 14 }}>
          <span className="field-label">Next scheduled alerts</span>
          <div className="alert-list">
            {docs
              .map((d) => ({ d, alert: nextAlert(d.expiry) }))
              .filter((x) => x.alert)
              .slice(0, 4)
              .map(({ d, alert }) => (
                <div className="alert-item" key={d.id}>
                  <DocGlyph type={d.type} size={15} />
                  {DOC_META[d.type].short} · {alert!.offset === 0 ? 'expiry day' : `${alert!.offset}-day warning`}
                  <time>{fmtDate(alert!.date, 'short')}</time>
                </div>
              ))}
            {docs.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted)' }}>Add a document to set alerts.</p>}
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 14 }}>
          In this web demo, alerts appear inside the app. Push, SMS and email arrive with the mobile release.
        </p>
      </Sheet>
    </motion.div>
  )
}
