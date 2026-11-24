import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Icon } from '@phosphor-icons/react'
import {
  BatteryFull,
  CaretRight,
  CheckCircle,
  CheckFat,
  Drop,
  Gauge,
  Plus,
  Tire,
  Warning,
  Wrench
} from '@phosphor-icons/react'
import { useStore } from '../store'
import type { Task } from '../types'
import { MECHANICS } from '../seed'
import { TASK_META, addDays, fmtDate, naira, num, taskPace, todayISO } from '../lib'
import {
  Btn,
  Chip,
  EmptyState,
  Field,
  IconBtn,
  Ring,
  ScreenHeader,
  Segmented,
  Sheet,
  StatusPill,
  useToast,
  EASE
} from '../ui'

const KIND_ICON: Record<Task['kind'], Icon> = {
  oil: Drop,
  engine: Gauge,
  tyres: Tire,
  battery: BatteryFull,
  brakes: Warning,
  custom: Wrench
}

const KIND_LABEL: Record<Task['kind'], string> = {
  oil: 'Oil',
  engine: 'Engine',
  tyres: 'Tyres',
  battery: 'Battery',
  brakes: 'Brakes',
  custom: 'Custom'
}

type View = 'upcoming' | 'overdue' | 'history'

export default function Maintenance() {
  const { state, addTask, completeTask } = useStore()
  const toast = useToast()
  const [view, setView] = useState<View>('upcoming')
  const [completeId, setCompleteId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const vehicle = state.vehicle

  const [date, setDate] = useState(todayISO())
  const [odo, setOdo] = useState('')
  const [cost, setCost] = useState('')
  const [workshop, setWorkshop] = useState(`${MECHANICS[0].name}, ${MECHANICS[0].area}`)
  const [notes, setNotes] = useState('')

  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<Task['kind']>('custom')
  const [intervalDays, setIntervalDays] = useState('180')
  const [intervalKm, setIntervalKm] = useState('')
  const [firstDue, setFirstDue] = useState(addDays(todayISO(), 30))

  const tasks = useMemo(() => {
    const o = vehicle?.odometer ?? 0
    return state.tasks.map((t) => ({ task: t, pace: taskPace(t, o) }))
  }, [state.tasks, vehicle?.odometer])

  const upcoming = tasks
    .filter((t) => t.pace.status !== 'overdue')
    .sort((a, b) => a.task.nextDueAt.localeCompare(b.task.nextDueAt))
  const overdue = tasks.filter((t) => t.pace.status === 'overdue')
  const done = tasks.filter((t) => t.pace.status === 'done')

  const health = tasks.length === 0 ? 1 : (tasks.length - overdue.length) / tasks.length
  const next = upcoming[0]
  const totalSpent = state.records.reduce((sum, r) => sum + r.cost, 0)

  const selected = state.tasks.find((t) => t.id === completeId) ?? null

  const openComplete = (task: Task) => {
    setDate(todayISO())
    setOdo(String(vehicle?.odometer ?? 0))
    setCost('')
    setWorkshop(`${MECHANICS[0].name}, ${MECHANICS[0].area}`)
    setNotes('')
    setCompleteId(task.id)
  }

  const saveComplete = () => {
    if (!selected) return
    const reading = Number(odo)
    if (!Number.isFinite(reading) || reading <= 0) {
      toast('Add the odometer reading', 'Numbers only, in kilometres', 'danger')
      return
    }
    const amount = Number(cost) || 0
    completeTask(selected.id, {
      date,
      odometer: reading,
      cost: amount,
      workshop: workshop.trim() || 'Workshop not recorded',
      notes: notes.trim() || undefined
    })
    const nextDate = addDays(date, selected.intervalDays ?? 90)
    setCompleteId(null)
    toast('Service logged', `${selected.title} · next due ${fmtDate(nextDate, 'mid')}`, 'success')
  }

  const saveTask = () => {
    if (!title.trim()) {
      toast('Name the service', 'e.g. Wheel alignment or AC service', 'danger')
      return
    }
    addTask({
      title: title.trim(),
      kind,
      intervalDays: Number(intervalDays) || 180,
      intervalKm: Number(intervalKm) || undefined,
      nextDueAt: firstDue
    })
    setAddOpen(false)
    setTitle('')
    setKind('custom')
    setIntervalDays('180')
    setIntervalKm('')
    setFirstDue(addDays(todayISO(), 30))
    toast('Service added', `Reminder set for ${fmtDate(firstDue, 'mid')}`, 'success')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <ScreenHeader
        title="Maintenance"
        sub={vehicle ? `${vehicle.make} ${vehicle.model} · ${num(vehicle.odometer)} km` : 'Service schedule'}
        right={
          <IconBtn label="Add a service" onClick={() => setAddOpen(true)}>
            <Plus size={19} weight="bold" />
          </IconBtn>
        }
      />

      <motion.div
        className="maint-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="maint-hero-top">
          <div>
            <h3>{overdue.length > 0 ? `${overdue.length} service${overdue.length === 1 ? '' : 's'} overdue` : 'Well maintained'}</h3>
            <p>
              {next
                ? `Next up: ${next.task.title} on ${fmtDate(next.task.nextDueAt, 'short')}.`
                : 'No upcoming services — add an interval to start tracking.'}
            </p>
          </div>
          <Ring value={health} size={70} stroke={7} color="#fff" track="rgba(255,255,255,0.2)">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>
              {Math.round(health * 100)}%
            </span>
          </Ring>
        </div>
      </motion.div>

      <div className="pad-20 mt-14">
        <Segmented<View>
          id="maint"
          value={view}
          onChange={setView}
          options={[
            { value: 'upcoming', label: 'Upcoming', badge: upcoming.length },
            { value: 'overdue', label: 'Overdue', badge: overdue.length },
            { value: 'history', label: 'History', badge: state.records.length }
          ]}
        />
      </div>

      <div className="pad-20" style={{ marginTop: 16 }}>
        {view === 'upcoming' && (
          <>
            {upcoming.length === 0 && (
              <EmptyState
                icon={<CheckCircle size={28} weight="duotone" />}
                title="Nothing planned"
                copy="Add oil changes, tyre rotations or any custom service with its own interval."
                action={
                  <Btn variant="soft" size="sm" onClick={() => setAddOpen(true)} iconLeft={<Plus size={15} weight="bold" />}>
                    Add a service
                  </Btn>
                }
              />
            )}
            {upcoming.map(({ task, pace }, i) => {
              const Glyph = KIND_ICON[task.kind]
              const hue = TASK_META[task.kind].hue
              return (
                <motion.div
                  key={task.id}
                  className="task-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span
                    className="task-icon"
                    style={{ background: `hsl(${hue} 90% 95%)`, color: `hsl(${hue} 60% 40%)` }}
                  >
                    <Glyph size={22} weight="duotone" />
                  </span>
                  <div className="task-body">
                    <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                      <h4>{task.title}</h4>
                      <StatusPill kind={pace.status === 'done' ? 'scheduled' : pace.status}>{pace.status === 'soon' ? 'Due soon' : 'Scheduled'}</StatusPill>
                    </div>
                    <p>{pace.dueLabel}</p>
                    <div className={`bar ${pace.status === 'soon' ? 'is-warn' : ''}`}>
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(pace.progress * 100)}%` }}
                        transition={{ duration: 0.9, ease: EASE }}
                      />
                    </div>
                    <div className="task-foot">
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)' }}>
                        Every {task.intervalDays ?? 90} days
                        {task.intervalKm ? ` · ${num(task.intervalKm)} km` : ''}
                      </span>
                      <Btn variant="soft" size="sm" onClick={() => openComplete(task)}>
                        Log service
                      </Btn>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            {done.length > 0 && (
              <p style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 14 }}>
                {done.length} service{done.length === 1 ? '' : 's'} logged this cycle — see History.
              </p>
            )}
          </>
        )}

        {view === 'overdue' && (
          <>
            {overdue.length === 0 && (
              <EmptyState
                icon={<CheckFat size={28} weight="duotone" />}
                title="All caught up"
                copy="No service has slipped past its due date or kilometre interval."
              />
            )}
            {overdue.map(({ task, pace }, i) => {
              const Glyph = KIND_ICON[task.kind]
              return (
                <motion.div
                  key={task.id}
                  className="task-card"
                  style={{ borderColor: '#f7d4d4', background: 'linear-gradient(160deg,#fff,#fff8f8)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="task-icon" style={{ background: '#fdecec', color: '#d03434' }}>
                    <Glyph size={22} weight="duotone" />
                  </span>
                  <div className="task-body">
                    <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                      <h4>{task.title}</h4>
                      <StatusPill kind="overdue">Overdue</StatusPill>
                    </div>
                    <p style={{ color: '#b94a4a', fontWeight: 700 }}>{pace.dueLabel}</p>
                    <div className="task-foot">
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)' }}>
                        Last done {task.lastDoneAt ? fmtDate(task.lastDoneAt, 'mid') : '—'}
                      </span>
                      <Btn variant="primary" size="sm" onClick={() => openComplete(task)}>
                        Fix this
                      </Btn>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </>
        )}

        {view === 'history' && (
          <>
            {state.records.length === 0 && (
              <EmptyState
                icon={<Wrench size={28} weight="duotone" />}
                title="No history yet"
                copy="Log a service and the cost, odometer and workshop are saved here."
              />
            )}
            {state.records.length > 0 && (
              <div className="att-row" style={{ marginBottom: 14, background: 'linear-gradient(150deg,#f7f4ff,#fff)' }}>
                <span className="att-icon">
                  <Wrench size={19} weight="duotone" />
                </span>
                <span className="att-main">
                  <strong>Total logged</strong>
                  <span>{state.records.length} services recorded</span>
                </span>
                <span className="display" style={{ fontSize: 16 }}>
                  {naira(totalSpent)}
                </span>
              </div>
            )}
            {state.records.map((r, i) => (
              <motion.div
                key={r.id}
                className="record-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <span className="att-icon" style={{ width: 38, height: 38, borderRadius: 12, background: '#e9fbf3', color: '#0f9c6d' }}>
                  <CheckCircle size={18} weight="fill" />
                </span>
                <span className="record-main">
                  <strong>{r.title}</strong>
                  <span>
                    {fmtDate(r.date, 'mid')} · {r.workshop} · {num(r.odometer)} km
                  </span>
                  {r.notes && <span style={{ color: 'var(--muted-2)' }}>{r.notes}</span>}
                </span>
                <span className="record-cost">{naira(r.cost)}</span>
              </motion.div>
            ))}
          </>
        )}

        <div className="mt-20">
          <button
            type="button"
            className="att-row"
            style={{ width: '100%', textAlign: 'left', marginBottom: 0 }}
            onClick={() => setAddOpen(true)}
          >
            <span className="att-icon">
              <Plus size={18} weight="bold" />
            </span>
            <span className="att-main">
              <strong>Add a custom service</strong>
              <span>Anything you want reminded by date or distance.</span>
            </span>
            <CaretRight size={16} weight="bold" color="var(--muted-2)" />
          </button>
        </div>
      </div>

      <Sheet
        open={!!selected}
        onClose={() => setCompleteId(null)}
        title={selected?.title ?? 'Log service'}
        subtitle="Record what was done and the reminders reschedule themselves"
        footer={
          <Btn full size="lg" onClick={saveComplete} iconLeft={<CheckCircle size={18} weight="fill" />}>
            Save service record
          </Btn>
        }
      >
        <div className="stack gap-12">
          <div className="row gap-10">
            <div className="grow">
              <Field label="Date">
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>
            <div className="grow">
              <Field label="Odometer (km)">
                <input
                  className="input"
                  value={odo}
                  onChange={(e) => setOdo(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                />
              </Field>
            </div>
          </div>
          <Field label="Cost" hint="optional">
            <input
              className="input"
              value={cost}
              onChange={(e) => setCost(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="₦ 0"
            />
          </Field>
          <Field label="Workshop">
            <input className="input" value={workshop} onChange={(e) => setWorkshop(e.target.value)} placeholder="Where was it done?" />
          </Field>
          <Field label="Notes" hint="optional">
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Parts used, symptoms, next steps…"
            />
          </Field>
          {selected && (
            <div className="alert-list">
              <div className="alert-item">
                <Gauge size={15} weight="bold" color="var(--brand)" />
                Next {selected.title.toLowerCase()} due
                <time>
                  {selected.intervalDays ? fmtDate(addDays(date, selected.intervalDays), 'mid') : '—'}
                </time>
              </div>
            </div>
          )}
        </div>
      </Sheet>

      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a service"
        subtitle="Set a date, a distance, or both"
        footer={
          <Btn full size="lg" onClick={saveTask} iconLeft={<Plus size={18} weight="bold" />}>
            Add to schedule
          </Btn>
        }
      >
        <div className="stack gap-12">
          <Field label="What needs doing?">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wheel alignment"
            />
          </Field>
          <div>
            <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>
              Category
            </span>
            <div className="chip-row" style={{ padding: 0 }}>
              {(Object.keys(KIND_LABEL) as Task['kind'][]).map((k) => (
                <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                  {KIND_LABEL[k]}
                </Chip>
              ))}
            </div>
          </div>
          <div className="row gap-10">
            <div className="grow">
              <Field label="Every" hint="days">
                <input
                  className="input"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                />
              </Field>
            </div>
            <div className="grow">
              <Field label="Or" hint="km · optional">
                <input
                  className="input"
                  value={intervalKm}
                  onChange={(e) => setIntervalKm(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="5000"
                />
              </Field>
            </div>
          </div>
          <Field label="First reminder">
            <input className="input" type="date" value={firstDue} onChange={(e) => setFirstDue(e.target.value)} />
          </Field>
        </div>
      </Sheet>
    </motion.div>
  )
}
