import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Check, X } from '@phosphor-icons/react'

export const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 } as const
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ---------------------------------------------------------------- buttons */

type BtnVariant = 'primary' | 'soft' | 'ghost' | 'dark' | 'danger' | 'glass'
type BtnSize = 'sm' | 'md' | 'lg'

interface BtnProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onDragEnter'
    | 'onDragExit'
    | 'onDragLeave'
    | 'onDragOver'
    | 'style'
  > {
  variant?: BtnVariant
  size?: BtnSize
  full?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
}

export function Btn({
  variant = 'primary',
  size = 'md',
  full,
  iconLeft,
  iconRight,
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: BtnProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.965 }}
      transition={SPRING}
      className={`btn btn-${variant} btn-${size} ${full ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden />
      ) : (
        <>
          {iconLeft && <span className="btn-icon">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className="btn-icon">{iconRight}</span>}
        </>
      )}
    </motion.button>
  )
}

export function IconBtn({
  children,
  label,
  onClick,
  className = '',
  tone = 'light'
}: {
  children: ReactNode
  label: string
  onClick?: () => void
  className?: string
  tone?: 'light' | 'dark' | 'glass'
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={SPRING}
      className={`icon-btn icon-btn-${tone} ${className}`}
    >
      {children}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ cards */

export function Card({
  children,
  className = '',
  onClick,
  ...rest
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  [key: string]: unknown
}) {
  if (onClick) {
    return (
      <motion.div whileTap={{ scale: 0.985 }} transition={SPRING} className={`card ${className}`} onClick={onClick} {...rest}>
        {children}
      </motion.div>
    )
  }
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function SectionHeader({
  title,
  action,
  sub,
  onAction
}: {
  title: string
  sub?: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="section-head">
      <div>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action && (
        <button className="link-btn" onClick={onAction} type="button">
          {action}
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ chips */

export function Chip({
  children,
  active,
  onClick,
  dot
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  dot?: string
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      className={`chip ${active ? 'chip-active' : ''}`}
      onClick={onClick}
    >
      {dot && <span className="chip-dot" style={{ background: dot }} />}
      {children}
    </motion.button>
  )
}

export function StatusPill({ kind, children }: { kind: 'active' | 'soon' | 'expired' | 'overdue' | 'scheduled' | 'open' | 'closed'; children: ReactNode }) {
  return <span className={`pill pill-${kind}`}>{children}</span>
}

export function CountBadge({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'danger' | 'neutral' }) {
  return <span className={`count-badge count-${tone}`}>{children}</span>
}

/* ----------------------------------------------------------------- fields */

export function Field({
  label,
  hint,
  children,
  htmlFor
}: {
  label: string
  hint?: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field-label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
    </label>
  )
}

export function Switch({
  checked,
  onChange,
  label
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? 'switch-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <motion.span layout transition={SPRING} className="switch-thumb">
        <AnimatePresence initial={false} mode="popLayout">
          {checked ? (
            <motion.span key="on" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
              <Check size={12} weight="bold" />
            </motion.span>
          ) : (
            <motion.span key="off" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
              <X size={12} weight="bold" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  )
}

/* -------------------------------------------------------------- segmented */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = 'light',
  id
}: {
  options: { value: T; label: string; badge?: number }[]
  value: T
  onChange: (v: T) => void
  tone?: 'light' | 'violet'
  id?: string
}) {
  const autoId = useId()
  const layoutId = `seg-${id ?? autoId}`
  return (
    <div className={`segmented segmented-${tone}`}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            className={`segmented-item ${active ? 'is-active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="segmented-pill"
              />
            )}
            <span className="segmented-label">
              {opt.label}
              {typeof opt.badge === 'number' && opt.badge > 0 && (
                <span className="segmented-badge">{opt.badge}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ rings */

export function Ring({
  value,
  size = 44,
  stroke = 4,
  children,
  color = 'var(--brand)',
  track = 'rgba(74,37,245,0.12)'
}: {
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
  color?: string
  track?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }}
          transition={{ duration: 1.1, ease: EASE }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <span className="ring-label">{children}</span>}
    </div>
  )
}

/* ------------------------------------------------------------------ sheet */

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  tall
}: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  tall?: boolean
}) {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const overlay = (
    <AnimatePresence>
      {open && (
        <div className="sheet-root">
          <motion.div
            className="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={`sheet ${tall ? 'sheet-tall' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? { y: 40, opacity: 0 } : { y: '100%' }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { y: 40, opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag={reduce ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 700) onClose()
            }}
          >
            <div className="sheet-grab" />
            {(title || subtitle) && (
              <div className="sheet-head">
                <div>
                  {title && <h3>{title}</h3>}
                  {subtitle && <p>{subtitle}</p>}
                </div>
                <IconBtn label="Close" onClick={onClose} tone="light">
                  <X size={18} weight="bold" />
                </IconBtn>
              </div>
            )}
            <div className="sheet-body">{children}</div>
            {footer && <div className="sheet-footer">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(overlay, document.querySelector('.device') ?? document.body)
}

/* ------------------------------------------------------------------ toast */

interface ToastItem {
  id: string
  title: string
  detail?: string
  tone: 'default' | 'success' | 'danger'
}

const ToastContext = createContext<(title: string, detail?: string, tone?: ToastItem['tone']) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef<Record<string, number>>({})

  const push = useCallback((title: string, detail?: string, tone: ToastItem['tone'] = 'default') => {
    const id = Math.random().toString(36).slice(2)
    setItems((list) => [...list.slice(-2), { id, title, detail, tone }])
    timers.current[id] = window.setTimeout(() => {
      setItems((list) => list.filter((t) => t.id !== id))
    }, 3600)
  }, [])

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-stack" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.tone}`}
              initial={{ y: 24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={SPRING}
            >
              <div className="toast-mark">
                {t.tone === 'success' ? <Check size={14} weight="bold" /> : t.tone === 'danger' ? <X size={14} weight="bold" /> : '•'}
              </div>
              <div>
                <p>{t.title}</p>
                {t.detail && <span>{t.detail}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

/* ------------------------------------------------------------- empty state */

export function EmptyState({
  icon,
  title,
  copy,
  action
}: {
  icon: ReactNode
  title: string
  copy: string
  action?: ReactNode
}) {
  return (
    <motion.div
      className="empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </motion.div>
  )
}

/* ----------------------------------------------------------------- header */

export function ScreenHeader({
  title,
  sub,
  onBack,
  right,
  tone = 'light'
}: {
  title?: string
  sub?: string
  onBack?: () => void
  right?: ReactNode
  tone?: 'light' | 'violet'
}) {
  return (
    <div className={`screen-header screen-header-${tone}`}>
      <div className="screen-header-left">
        {onBack && (
          <IconBtn label="Go back" onClick={onBack} tone={tone === 'violet' ? 'glass' : 'light'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBtn>
        )}
        {(title || sub) && (
          <div>
            {title && <h1>{title}</h1>}
            {sub && <p>{sub}</p>}
          </div>
        )}
      </div>
      {right}
    </div>
  )
}

/* ---------------------------------------------------------------- helpers */

export function Avatar({ name, size = 40, hue = 262 }: { name: string; size?: number; hue?: number }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(140deg, hsl(${hue} 82% 62%), hsl(${hue + 40} 88% 52%))`
      }}
    >
      {initials || 'W'}
    </div>
  )
}

export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

export function useStagger(count: number) {
  return useMemo(
    () => ({
      container: { animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } },
      item: {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }
      },
      total: count
    }),
    [count]
  )
}
