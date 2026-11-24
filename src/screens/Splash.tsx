import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../ui'

const STATUS = ['Opening your garage', 'Checking renewals', 'Securing documents']

function Gear({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden>
      <path
        d="M50 8l6.2 7.1 9.1-2.6 3.9 8.6 9.4 1.2 1.2 9.4 8.6 3.9-2.6 9.1 7.1 6.2-7.1 6.2 2.6 9.1-8.6 3.9-1.2 9.4-9.4 1.2-3.9 8.6-9.1-2.6L50 92l-6.2-7.1-9.1 2.6-3.9-8.6-9.4-1.2-1.2-9.4-8.6-3.9 2.6-9.1L7.1 50l7.1-6.2-2.6-9.1 8.6-3.9 1.2-9.4 9.4-1.2 3.9-8.6 9.1 2.6L50 8z"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <circle cx="50" cy="50" r="13" stroke="currentColor" strokeWidth="3.4" opacity="0.5" />
    </svg>
  )
}

export default function Splash({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const [status, setStatus] = useState(0)

  useEffect(() => {
    const t1 = window.setTimeout(() => setStatus(1), 1000)
    const t2 = window.setTimeout(() => setStatus(2), 1900)
    const t3 = window.setTimeout(onDone, reduce ? 1400 : 3300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onDone, reduce])

  const sparkles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280
        const r = seed / 233280
        return {
          id: i,
          left: `${8 + ((r * 84) % 84)}%`,
          top: `${18 + ((i * 37) % 62)}%`,
          size: 3 + ((i * 7) % 5),
          delay: (i % 7) * 0.28,
          duration: 3.4 + (i % 5) * 0.5,
          rise: -40 - ((i * 13) % 60)
        }
      }),
    []
  )

  return (
    <motion.div
      className="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {/* drifting mesh blobs */}
      <motion.div
        className="blob blob-a"
        animate={reduce ? undefined : { x: [0, 26, -12, 0], y: [0, -18, 10, 0], scale: [1, 1.08, 0.97, 1], rotate: [0, 10, -6, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob blob-b"
        animate={reduce ? undefined : { x: [0, -18, 12, 0], y: [0, 14, -8, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob blob-c"
        animate={reduce ? undefined : { x: [0, -24, 14, 0], y: [0, 16, -12, 0], scale: [1, 1.07, 0.95, 1], rotate: [0, -8, 6, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob blob-d"
        animate={reduce ? undefined : { x: [0, 16, -10, 0], y: [0, -12, 8, 0], scale: [1, 1.04, 0.96, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* rising sparkles */}
      {!reduce &&
        sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="sparkle"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
            animate={{ y: [0, s.rise], opacity: [0, 0.9, 0], scale: [0.6, 1, 0.4] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

      <div className="splash-center">
        <motion.div
          className="splash-logo-wrap"
          initial={{ opacity: 0, scale: 0.82, y: 26, filter: 'blur(18px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.05, ease: EASE, delay: 0.12 }}
        >
          <motion.div
            className="orbit"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          >
            <div className="orbit-ring" />
            <div className="orbit-ring" style={{ inset: '16%', opacity: 0.7 }} />
            <div className="orbit-dot" style={{ transform: 'translate(-50%,-50%) translate(0,-50%)' }} />
            <div
              className="orbit-dot"
              style={{
                transform: 'translate(-50%,-50%) translate(0,-50%)',
                background: '#b0197e',
                width: 6,
                height: 6
              }}
            />
          </motion.div>

          <motion.div
            animate={reduce ? undefined : { rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: '-12%', zIndex: 1 }}
          >
            <Gear className="gear" />
          </motion.div>

          <motion.img
            src="/assets/logo.png"
            alt="WheelWell AutoCare"
            className="splash-logo"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 1.15, ease: EASE, delay: 0.42 }}
          />

          <motion.div
            className="logo-sheen"
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.1, ease: 'easeInOut', delay: 1.25 }}
          />

          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-18%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(74,37,245,0.16) 0%, transparent 62%)',
              zIndex: 0
            }}
            animate={reduce ? undefined : { scale: [0.92, 1.12, 0.92], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="splash-copy">
          <motion.h1
            initial={{ opacity: 0, y: 10, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.24em' }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.15 }}
          >
            Always in your pocket
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 1.5 }}
          >
            Never miss a service or renewal again.
          </motion.p>
        </div>
      </div>

      <div className="splash-foot">
        <div className="splash-progress">
          <motion.span
            initial={{ width: '4%' }}
            animate={{ width: '100%' }}
            transition={{ duration: reduce ? 1 : 2.9, ease: 'easeInOut', delay: 0.2 }}
          />
        </div>
        <div className="splash-status">
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {STATUS[status]}
            </motion.span>
          </AnimatePresence>
          <span>WheelWell · v1.0</span>
        </div>
      </div>
    </motion.div>
  )
}
