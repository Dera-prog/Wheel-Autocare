import { motion } from 'framer-motion'
import {
  Car,
  CarProfile,
  CaretRight,
  Check,
  GearSix,
  IdentificationCard,
  MapPinLine,
  Plus,
  ShieldCheck,
  Sparkle,
  Wrench
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useStore } from '../store'
import type { DocType } from '../types'
import type { Tab } from '../nav'
import { Avatar, Ring, SectionHeader, useToast, EASE } from '../ui'

interface Step {
  key: string
  title: string
  sub: string
  icon: ReactNode
  done: boolean
  go: () => void
}

export default function NewGarage({
  onAddCar,
  onNewDoc,
  onNavigate
}: {
  onAddCar: () => void
  onNewDoc: (type?: DocType) => void
  onNavigate: (tab: Tab) => void
}) {
  const { state, loadSampleGarage } = useStore()
  const toast = useToast()
  const firstName = state.profile?.name.split(' ')[0] ?? 'there'
  const hasDoc = (type: DocType) => state.documents.some((d) => d.type === type)

  const steps: Step[] = [
    {
      key: 'car',
      title: 'Add your car',
      sub: 'Make, model, plate and current odometer',
      icon: <Car size={20} weight="duotone" />,
      done: !!state.vehicle,
      go: onAddCar
    },
    {
      key: 'insurance',
      title: 'Add insurance',
      sub: 'Comprehensive or third-party cover',
      icon: <ShieldCheck size={20} weight="duotone" />,
      done: hasDoc('insurance'),
      go: () => onNewDoc('insurance')
    },
    {
      key: 'registration',
      title: 'Add vehicle registration',
      sub: 'The paper checkpoints ask for first',
      icon: <CarProfile size={20} weight="duotone" />,
      done: hasDoc('registration'),
      go: () => onNewDoc('registration')
    },
    {
      key: 'licence',
      title: "Add your driver's licence",
      sub: 'Class B or whatever you drive with',
      icon: <IdentificationCard size={20} weight="duotone" />,
      done: hasDoc('licence'),
      go: () => onNewDoc('licence')
    },
    {
      key: 'service',
      title: 'Set your first service reminder',
      sub: 'Oil change is a good place to start',
      icon: <Wrench size={20} weight="duotone" />,
      done: state.tasks.length > 0,
      go: () => onNavigate('service')
    }
  ]

  const done = steps.filter((s) => s.done).length
  const left = steps.length - done

  const loadSample = () => {
    loadSampleGarage()
    toast('Sample garage loaded', 'Toyota Corolla · 4 documents · service history', 'success')
  }

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="home-top">
        <div className="home-top-left">
          <button type="button" onClick={() => onNavigate('settings')} aria-label="Open settings">
            <Avatar name={state.profile?.name ?? 'WheelWell'} size={42} hue={262} />
          </button>
          <span
            className="hero-plate"
            style={{ background: 'var(--lav-2)', color: 'var(--brand)', borderColor: 'var(--line)' }}
          >
            <Sparkle size={13} weight="fill" />
            New garage
          </span>
        </div>
      </div>

      <motion.div
        className="greeting"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <h1>
          Welcome,
          <br />
          {firstName}.
        </h1>
        <p>
          {left === 0
            ? 'Everything is set up. Your garage is ready for the road.'
            : `${left} step${left === 1 ? '' : 's'} to a fully covered garage.`}
        </p>
      </motion.div>

      <motion.div
        className="maint-hero"
        style={{ marginTop: 18 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.06 }}
      >
        <div className="maint-hero-top">
          <div>
            <h3>{done === 0 ? 'Let’s get you road-ready' : left === 0 ? 'Your garage is complete' : 'Keep going'}</h3>
            <p>Documents, renewals and service reminders all follow your car.</p>
          </div>
          <Ring value={done / steps.length} size={70} stroke={7} color="#fff" track="rgba(255,255,255,0.2)">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800 }}>
              {done}/{steps.length}
            </span>
          </Ring>
        </div>
      </motion.div>

      <div className="quick-grid mt-14">
        {[
          { label: 'Add car', icon: <Car size={18} weight="duotone" />, go: onAddCar },
          { label: 'Add document', icon: <Plus size={18} weight="bold" />, go: () => onNewDoc() },
          { label: 'Mechanics', icon: <MapPinLine size={18} weight="duotone" />, go: () => onNavigate('garage') },
          { label: 'Settings', icon: <GearSix size={18} weight="duotone" />, go: () => onNavigate('settings') }
        ].map((q, i) => (
          <motion.button
            key={q.label}
            type="button"
            className="quick"
            onClick={q.go}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.04 }}
          >
            <i>{q.icon}</i>
            {q.label}
          </motion.button>
        ))}
      </div>

      <div className="mt-20">
        <SectionHeader
          title="Finish setting up"
          sub={left === 0 ? 'All five steps done' : 'Tap a step to add it'}
        />
        {steps.map((step, i) => {
          const inner = (
            <>
              <span
                className="att-icon"
                style={
                  step.done
                    ? { background: '#e9fbf3', color: '#0f9c6d' }
                    : undefined
                }
              >
                {step.done ? <Check size={20} weight="bold" /> : step.icon}
              </span>
              <span className="att-main">
                <strong>{step.title}</strong>
                <span>{step.sub}</span>
              </span>
              {step.done ? (
                <span
                  style={{
                    padding: '4px 9px',
                    borderRadius: 999,
                    background: '#e9fbf3',
                    color: '#0f9c6d',
                    fontSize: 10.5,
                    fontWeight: 800
                  }}
                >
                  Done
                </span>
              ) : (
                <CaretRight size={16} weight="bold" color="var(--muted-2)" />
              )}
            </>
          )

          return step.done ? (
            <motion.div
              key={step.key}
              className="att-row"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
            >
              {inner}
            </motion.div>
          ) : (
            <motion.button
              key={step.key}
              type="button"
              className="att-row"
              style={{ width: '100%', textAlign: 'left' }}
              onClick={step.go}
              whileTap={{ scale: 0.985 }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
            >
              {inner}
            </motion.button>
          )
        })}
      </div>

      <motion.button
        type="button"
        className="att-row"
        style={{
          width: '100%',
          textAlign: 'left',
          marginTop: 14,
          background: 'linear-gradient(135deg,#fdf8ff,#f3efff)'
        }}
        onClick={loadSample}
        whileTap={{ scale: 0.985 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <span className="att-icon tone-warn">
          <Sparkle size={19} weight="fill" />
        </span>
        <span className="att-main">
          <strong>Want to see a full garage?</strong>
          <span>Load a sample Corolla with papers and history. Reset it any time.</span>
        </span>
        <CaretRight size={16} weight="bold" color="var(--muted-2)" />
      </motion.button>

      <div className="mt-20">
        <SectionHeader title="Why it helps" sub="What WheelWell does once your car is in" />
        <div className="att-row">
          <span className="att-icon">
            <ShieldCheck size={19} weight="duotone" />
          </span>
          <span className="att-main">
            <strong>Expiry alerts before the roadblock</strong>
            <span>Insurance, registration and inspection warned at 30, 15 and 7 days.</span>
          </span>
        </div>
        <div className="att-row">
          <span className="att-icon">
            <Wrench size={19} weight="duotone" />
          </span>
          <span className="att-main">
            <strong>Service reminders by date or distance</strong>
            <span>Oil changes, tyres and brakes tracked against your odometer.</span>
          </span>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted-2)', padding: '20px 24px 26px', lineHeight: 1.6 }}>
        Your account is stored in this browser. Sign out and back in to find this garage again.
      </p>
    </motion.div>
  )
}
