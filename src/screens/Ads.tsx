import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue
} from 'framer-motion'
import {
  BellRinging,
  CaretRight,
  CheckCircle,
  FileText,
  Fingerprint,
  Gauge,
  GasPump,
  LockKey,
  MapPin,
  SealCheck,
  ShieldCheck
} from '@phosphor-icons/react'
import { EASE, SPRING } from '../ui'

type SceneProps = { px: MotionValue<number>; py: MotionValue<number> }

function CountUp({ to, decimals = 0, duration = 1.4, delay = 0 }: { to: number; decimals?: number; duration?: number; delay?: number }) {
  const mv = useMotionValue(0)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const controls = animate(mv, to, { duration, delay, ease: EASE })
    const unsub = mv.on('change', (v) => setVal(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [to, duration, delay, mv])
  return <>{val.toFixed(decimals)}</>
}

/* ------------------------------------------------------------------ scene 1 */

function RenewalScene({ px, py }: SceneProps) {
  const reduce = useReducedMotion()
  const depth1 = useTransform(px, (v) => v * 26)
  const depth2 = useTransform(py, (v) => v * -18)
  const float = reduce ? {} : { y: [0, -8, 0] }

  const sheets = [
    { key: 'licence', rotate: 9, x: 62, y: -22, z: 1, hue: 46, title: "Driver's Licence" },
    { key: 'registration', rotate: -10, x: -58, y: -8, z: 2, hue: 146, title: 'Registration' },
    { key: 'insurance', rotate: -1, x: 0, y: 16, z: 3, hue: 208, title: 'Insurance' }
  ]

  return (
    <motion.div style={{ position: 'absolute', inset: 0, x: useTransform(depth1, (v) => v * 0.4) }} {...float} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, x: depth1, y: depth2, display: 'grid', placeItems: 'center' }}
      >
        <motion.div
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 286,
            height: 286,
            borderRadius: '50%',
            border: '1.5px dashed rgba(255,255,255,0.22)'
          }}
        />
        <motion.div
          animate={reduce ? undefined : { rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 214,
            height: 214,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.12)'
          }}
        />

        <div className="doc-stack">
          {sheets.map((s, i) => (
            <motion.div
              key={s.key}
              className="doc-sheet"
              initial={{ opacity: 0, y: 70, rotate: s.rotate - 8, scale: 0.9 }}
              animate={{ opacity: 1, y: s.y, rotate: s.rotate, scale: 1 }}
              transition={{ ...SPRING, delay: 0.25 + i * 0.13 }}
              style={{ zIndex: s.z, marginLeft: s.x }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, i % 2 === 0 ? -5 : 5, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      background: `hsl(${s.hue} 82% 52%)`,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff'
                    }}
                  >
                    <FileText size={12} weight="bold" />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="doc-line" style={{ width: '70%', background: '#2b2350', height: 6 }} />
                    <div className="doc-line" style={{ width: '42%', height: 4, marginTop: 4 }} />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div className="doc-line" style={{ width: '88%' }} />
                  <div className="doc-line" style={{ width: '72%' }} />
                  <div className="doc-line" style={{ width: '80%' }} />
                  <div className="doc-line" style={{ width: '54%' }} />
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ height: 3, borderRadius: 3, background: `hsl(${s.hue} 70% 82%)` }} />
                  <div style={{ marginTop: 9, fontSize: 9.5, fontWeight: 800, color: '#6f6b86', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {s.title}
                  </div>
                </div>
                <div className="doc-stamp">
                  <SealCheck size={24} weight="fill" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="float-card"
          style={{ left: '6%', top: '12%', x: useTransform(px, (v) => v * -34) }}
          initial={{ opacity: 0, scale: 0.8, y: -14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.7 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 9,
                background: 'rgba(255,255,255,0.2)',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <BellRinging size={14} weight="fill" />
            </span>
            <div>
              <div className="fc-title">Reminders set</div>
              <div className="fc-value">30 · 15 · 7 days</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="float-card"
          style={{ right: '4%', bottom: '16%', x: useTransform(px, (v) => v * 30) }}
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.9 }}
        >
          <div className="fc-title">Insurance expires in</div>
          <div className="fc-value" style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 24 }}>12</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>days</span>
          </div>
          <div style={{ marginTop: 7, height: 4, width: 108, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 1.4, delay: 1.1, ease: EASE }}
              style={{ height: '100%', borderRadius: 4, background: '#ffd68a' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ scene 2 */

function ServiceScene({ px, py }: SceneProps) {
  const reduce = useReducedMotion()
  const tiltX = useTransform(px, (v) => v * 10)
  const tiltY = useTransform(py, (v) => v * -8)

  const ticks = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => {
        const a = (-210 + (i * 240) / 12) * (Math.PI / 180)
        const r1 = 108
        const r2 = i % 3 === 0 ? 94 : 100
        return {
          x1: 140 + Math.cos(a) * r1,
          y1: 140 + Math.sin(a) * r1,
          x2: 140 + Math.cos(a) * r2,
          y2: 140 + Math.sin(a) * r2,
          strong: i % 3 === 0
        }
      }),
    []
  )

  return (
    <motion.div
      style={{ position: 'absolute', inset: 0, rotateX: tiltY, rotateY: tiltX, transformStyle: 'preserve-3d' }}
    >
      <div className="gauge">
        <svg viewBox="0 0 280 280" width="100%" height="100%">
          <defs>
            <linearGradient id="gaugeArc" x1="24" y1="24" x2="256" y2="256" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6ee7ff" />
              <stop offset="55%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f0abfc" />
            </linearGradient>
          </defs>
          <circle cx="140" cy="140" r="116" fill="rgba(255,255,255,0.05)" />
          <circle cx="140" cy="140" r="116" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="10" />
          <motion.g
            transform="rotate(-218 140 140)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.circle
              cx="140"
              cy="140"
              r="116"
              fill="none"
              stroke="url(#gaugeArc)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 116}
              initial={{ strokeDashoffset: 2 * Math.PI * 116 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 116 * (1 - 0.68) }}
              transition={{ duration: 1.8, delay: 0.3, ease: EASE }}
            />
          </motion.g>
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.strong ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)'}
              strokeWidth={t.strong ? 2.4 : 1.6}
              strokeLinecap="round"
            />
          ))}
          <motion.g
            animate={reduce ? undefined : { rotate: [-118, -62, -18, -74, -118] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '140px 140px' }}
          >
            <line x1="140" y1="140" x2="140" y2="68" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="140" cy="140" r="7" fill="#fff" />
            <circle cx="140" cy="140" r="3" fill="#5b3bff" />
          </motion.g>
        </svg>
        <div className="gauge-readout">
          <div className="gauge-value">
            <CountUp to={12.4} decimals={1} duration={1.6} delay={0.5} />
          </div>
          <div className="gauge-unit">km / litre</div>
        </div>
      </div>

      <motion.div
        className="float-card solid"
        style={{ left: '5%', top: '14%', x: useTransform(px, (v) => v * -22) }}
        initial={{ opacity: 0, y: 18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.75 }}
      >
        <div className="fc-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <GasPump size={13} weight="bold" /> Last fill-up
        </div>
        <div className="fc-value">₦18,400</div>
        <svg width="104" height="26" viewBox="0 0 104 26" style={{ marginTop: 4 }}>
          <motion.path
            d="M2 22 C 16 22, 18 10, 30 12 S 48 20, 58 10 S 78 2, 100 6"
            fill="none"
            stroke="#4a25f5"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 as never }}
            animate={{ pathLength: 1 as never }}
            transition={{ duration: 1.4, delay: 1, ease: EASE }}
          />
        </svg>
      </motion.div>

      <motion.div
        className="float-card"
        style={{ right: '4%', bottom: '13%', x: useTransform(px, (v) => v * 24) }}
        initial={{ opacity: 0, y: 18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.95 }}
      >
        <div className="fc-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Gauge size={13} weight="bold" /> Odometer
        </div>
        <div className="fc-value" style={{ letterSpacing: '-0.01em' }}>
          <CountUp to={72480} duration={1.8} delay={0.6} /> km
        </div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 800 }}>
          <motion.span
            animate={reduce ? undefined : { opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: 6, background: '#7cf3c9', display: 'inline-block' }}
          />
          synced 3 days ago
        </div>
      </motion.div>

      <motion.div
        className="float-card"
        style={{ left: '7%', bottom: '8%', x: useTransform(px, (v) => v * -14) }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 1.1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} weight="fill" color="#7cf3c9" />
          <div>
            <div className="fc-title">Oil change</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>due in 9 days</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ scene 3 */

function VaultScene({ px, py }: SceneProps) {
  const reduce = useReducedMotion()
  const parallax = useTransform(px, (v) => v * 18)
  const parallaxY = useTransform(py, (v) => v * -12)

  return (
    <motion.div style={{ position: 'absolute', inset: 0, x: parallax }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, y: parallaxY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* pulse rings behind the phone */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '48%',
              width: 240,
              height: 240,
              marginLeft: -120,
              marginTop: -120,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.25)'
            }}
            animate={reduce ? undefined : { scale: [0.7, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
          />
        ))}

        <div className="vault-phone">
          <motion.div
            initial={{ y: 40, opacity: 0, rotateX: 8 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                Doc vault
              </span>
              <CheckCircle size={16} weight="fill" color="#7cf3c9" />
            </div>
            {[
              { label: 'Insurance', hue: 208, verified: true },
              { label: 'Registration', hue: 146, verified: true },
              { label: 'Driver’s licence', hue: 46, verified: false }
            ].map((row, i) => (
              <motion.div
                key={row.label}
                className="vault-chip"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.45 + i * 0.14 }}
              >
                <span style={{ width: 20, height: 20, borderRadius: 6, background: `hsl(${row.hue} 80% 60%)`, display: 'grid', placeItems: 'center' }}>
                  <FileText size={11} weight="bold" color="#fff" />
                </span>
                <span style={{ flex: 1 }}>{row.label}</span>
                {row.verified && <SealCheck size={14} weight="fill" color="#7cf3c9" />}
              </motion.div>
            ))}
            <div style={{ marginTop: 12, fontSize: 9.5, fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              OFFLINE COPY · 4 DOCUMENTS
            </div>

            <motion.div
              className="vault-lock"
              animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Fingerprint size={32} weight="duotone" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="float-card"
          style={{ left: '4%', top: '12%' }}
          initial={{ opacity: 0, y: -16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING, delay: 0.7 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <LockKey size={16} weight="fill" color="#ffd68a" />
            <div>
              <div className="fc-title">No signal?</div>
              <div style={{ fontSize: 12.5, fontWeight: 800 }}>Still opens</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="float-card"
          style={{ right: '3%', top: '26%' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING, delay: 0.9 }}
        >
          <div className="fc-title" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={13} weight="bold" /> Vault
          </div>
          <div className="fc-value">3 taps</div>
        </motion.div>

        <motion.div
          className="float-card"
          style={{ left: '6%', bottom: '9%' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 1.05 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <MapPin size={16} weight="fill" color="#a78bfa" />
            <div>
              <div className="fc-title">Mechanics near you</div>
              <div style={{ fontSize: 12.5, fontWeight: 800 }}>8 verified</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="map-pin"
          style={{ right: '12%', bottom: '12%', width: 38, height: 38 }}
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: -45 }}
          transition={{ ...SPRING, delay: 1.2 }}
        >
          <MapPin size={16} weight="fill" />
        </motion.div>
        <motion.div
          className="map-pin"
          style={{ right: '30%', bottom: '4%', width: 30, height: 30 }}
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: -45 }}
          transition={{ ...SPRING, delay: 1.35 }}
        >
          <MapPin size={13} weight="fill" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* -------------------------------------------------------------------- ads */

const SLIDES = [
  {
    kicker: 'RENEWALS · REMINDERS',
    title: ['Never miss a', 'renewal again.'],
    sub: 'Licence, insurance, roadworthiness. WheelWell alerts you at 30, 15 and 7 days — then on the day.',
    cta: 'Next'
  },
  {
    kicker: 'SERVICE · FUEL · MILEAGE',
    title: ['Know your car', 'before it complains.'],
    sub: 'Log every service and fill-up. Watch fuel efficiency and mileage so small problems never become breakdowns.',
    cta: 'Next'
  },
  {
    kicker: 'DOCUMENT VAULT · MECHANICS',
    title: ['Your papers.', 'Offline. In 3 taps.'],
    sub: 'Encrypted on your device and unlocked with a fingerprint. Show your documents anywhere — even without a signal.',
    cta: 'Get started'
  }
]

export default function Ads({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const reduce = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 90, damping: 18 })
  const sy = useSpring(py, { stiffness: 90, damping: 18 })

  const goTo = useCallback(
    (next: number) => {
      setDir(next > index ? 1 : -1)
      setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)))
    },
    [index]
  )

  const advance = useCallback(() => {
    if (index < SLIDES.length - 1) goTo(index + 1)
    else onDone()
  }, [index, goTo, onDone])

  useEffect(() => {
    if (index >= SLIDES.length - 1) return
    const t = window.setTimeout(() => goTo(index + 1), 7000)
    return () => clearTimeout(t)
  }, [index, goTo])

  const slide = SLIDES[index]

  return (
    <div
      className="ad"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width - 0.5)
        py.set((e.clientY - r.top) / r.height - 0.5)
      }}
    >
      <motion.div
        key={`bg-${index}`}
        className={`ad-bg ad-${index + 1}`}
        style={{ position: 'absolute', inset: 0 }}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <div className="ad-noise" />

      <div className="ad-top">
        <img src="/assets/logo-white.png" alt="WheelWell" style={{ width: 118, opacity: 0.94 }} />
        <button className="ad-skip" onClick={onDone} type="button">
          Skip
        </button>
      </div>

      <motion.div
        className="ad-scene"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60 || info.velocity.x < -420) goTo(index + 1)
          if (info.offset.x > 60 || info.velocity.x > 420) goTo(index - 1)
        }}
      >
        <motion.div
          key={`scene-${index}`}
          style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0, x: dir * 50, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ ...SPRING, delay: 0.05 }}
        >
          {index === 0 && <RenewalScene px={sx} py={sy} />}
          {index === 1 && <ServiceScene px={sx} py={sy} />}
          {index === 2 && <VaultScene px={sx} py={sy} />}
        </motion.div>
      </motion.div>

      <motion.div
        key={`copy-${index}`}
        className="ad-copy"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
      >
        <span className="ad-kicker">
          <motion.span
            animate={reduce ? undefined : { rotate: [0, 12, -8, 0] }}
            transition={{ duration: 3.4, repeat: Infinity }}
            style={{ display: 'inline-grid', placeItems: 'center' }}
          >
            <CheckCircle size={12} weight="fill" />
          </motion.span>
          {slide.kicker}
        </span>
        <h1 className="ad-title">
          {slide.title.map((line, i) => (
            <span key={line} style={{ display: 'block', overflow: 'hidden' }}>
              <motion.span
                style={{ display: 'block' }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.75, ease: EASE, delay: 0.18 + i * 0.09 }}
                className={i === 1 ? 'accent' : undefined}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="ad-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42 }}
        >
          {slide.sub}
        </motion.p>
      </motion.div>

      <div className="ad-bottom">
        <div className="ad-dots">
          {SLIDES.map((s, i) => (
            <button key={s.kicker} className="ad-dot" onClick={() => goTo(i)} aria-label={`Ad ${i + 1}`} type="button">
              {i === index ? (
                <motion.span
                  key={`fill-${index}`}
                  initial={{ width: '0%' }}
                  animate={{ width: index === SLIDES.length - 1 ? '100%' : '100%' }}
                  transition={{ duration: index === SLIDES.length - 1 ? 1.2 : 7, ease: 'linear' }}
                />
              ) : (
                <span style={{ width: i < index ? '100%' : '0%' }} />
              )}
            </button>
          ))}
        </div>
        <div className="ad-actions">
          <span className="ad-hint">{index + 1} of {SLIDES.length} · swipe</span>
          <motion.button
            type="button"
            className={`ad-next ${index === 2 ? '' : 'ad-next-dark'}`}
            onClick={advance}
            whileTap={{ scale: 0.96 }}
            transition={SPRING}
          >
            {slide.cta}
            <CaretRight size={16} weight="bold" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
