import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Eye, EyeSlash, Fingerprint, SealCheck, Sparkle } from '@phosphor-icons/react'
import { useStore } from '../store'
import { EASE, SPRING } from '../ui'

const BLOBS = [
  { x: '8%', y: '12%', w: 190, h: 190, color: 'rgba(173, 142, 255, 0.7)' },
  { x: '62%', y: '4%', w: 150, h: 150, color: 'rgba(80, 80, 243, 0.75)' },
  { x: '70%', y: '46%', w: 210, h: 210, color: 'rgba(176, 25, 126, 0.32)' },
  { x: '-8%', y: '62%', w: 220, h: 220, color: 'rgba(120, 160, 255, 0.5)' }
]

type Mode = 'signin' | 'signup'

export default function Auth({ onDone }: { onDone: () => void }) {
  const { signIn, signUp, enterDemo } = useStore()
  const reduce = useReducedMotion()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'submit' | 'demo' | null>(null)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setPassword('')
    setShowPassword(false)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError('')
    setBusy('submit')
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(name, email, password)
    setBusy(null)
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong. Try again.')
      return
    }
    setPassword('')
    onDone()
  }

  const openDemo = async () => {
    if (busy) return
    setError('')
    setBusy('demo')
    const result = await enterDemo()
    setBusy(null)
    if (!result.ok) {
      setError(result.error ?? 'Could not open the demo garage.')
      return
    }
    onDone()
  }

  return (
    <div className="auth">
      <div className="auth-mesh" aria-hidden>
        {BLOBS.map((b, i) => (
          <motion.i
            key={i}
            style={{ left: b.x, top: b.y, width: b.w, height: b.h, background: b.color }}
            animate={
              reduce
                ? undefined
                : { x: [0, 18, -10, 0], y: [0, -14, 10, 0], scale: [1, 1.08, 0.96, 1] }
            }
            transition={{ duration: 14 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          />
        ))}
      </div>

      <div className="auth-inner">
        <motion.img
          src="/assets/logo-white.png"
          alt="WheelWell AutoCare"
          className="auth-logo"
          initial={{ opacity: 0, y: 18, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: EASE }}
        />

        <motion.h1
          key={`title-${mode}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {mode === 'signin' ? 'Welcome back.' : 'Start your garage.'}
        </motion.h1>
        <motion.p
          key={`lead-${mode}`}
          className="auth-lead"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          {mode === 'signin'
            ? 'Your papers, services and mechanics — one calm place.'
            : 'One account, one car, every renewal in view.'}
        </motion.p>

        <motion.div
          className="auth-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={`auth-tab ${mode === m ? 'is-active' : ''}`}
                onClick={() => switchMode(m)}
              >
                {mode === m && <motion.span layoutId="auth-tab-pill" className="auth-tab-pill" transition={SPRING} />}
                <span>{m === 'signin' ? 'Sign in' : 'Create account'}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate>
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingBottom: 14 }}>
                    <label className="auth-label" htmlFor="auth-name">
                      Your name
                    </label>
                    <input
                      id="auth-name"
                      className="auth-input"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setError('')
                      }}
                      placeholder="e.g. Chidera Uzoma"
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: 14 }}>
              <label className="auth-label" htmlFor="auth-email">
                Email address
              </label>
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="auth-label" htmlFor="auth-password">
                Password
              </label>
              <div className="auth-pass">
                <input
                  id="auth-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder={mode === 'signin' ? 'Your password' : 'At least 6 characters'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlash size={19} weight="bold" /> : <Eye size={19} weight="bold" />}
                </button>
              </div>
              {mode === 'signup' && <p className="auth-hint">Stored as a hash on this device — never sent anywhere.</p>}
            </div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.p
                  key={error}
                  className="auth-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              className="auth-cta"
              type="submit"
              disabled={!!busy}
              whileTap={{ scale: 0.975 }}
            >
              {busy === 'submit' ? (
                <span className="btn-spinner" aria-hidden />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign in' : 'Create my account'}
                  <ArrowRight size={18} weight="bold" />
                </>
              )}
            </motion.button>
          </form>

          <div className="auth-divider">
            <span>or look around first</span>
          </div>

          <button type="button" className="auth-demo" onClick={() => void openDemo()} disabled={!!busy}>
            {busy === 'demo' ? <span className="btn-spinner" aria-hidden /> : <Sparkle size={16} weight="fill" />}
            Explore the demo garage
          </button>

          <div className="auth-switch">
            {mode === 'signin' ? 'New to WheelWell?' : 'Already have a garage?'}
            <button type="button" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </motion.div>

        <div className="auth-foot">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              fontSize: 11,
              fontWeight: 800
            }}
          >
            <SealCheck size={14} weight="fill" />
            Local-first · everything stays on this device
          </div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 18, opacity: 0.7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Fingerprint size={13} weight="bold" /> Password-protected
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Sparkle size={13} weight="fill" /> Works offline
            </span>
          </div>
          <p style={{ marginTop: 14, fontSize: 10.5, lineHeight: 1.5, opacity: 0.6 }}>
            Accounts are stored in this browser only. Passwords are hashed before they are saved and nothing is
            sent to a server.
          </p>
        </div>
      </div>
    </div>
  )
}
