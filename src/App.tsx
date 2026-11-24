import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Icon } from '@phosphor-icons/react'
import { FolderSimple, GearSix, House, MapPinLine, Plus, Wrench } from '@phosphor-icons/react'
import { useStore } from './store'
import { EASE, SPRING, ToastProvider, useNow } from './ui'
import { docStatus, taskPace } from './lib'
import type { Tab } from './nav'
import Splash from './screens/Splash'
import Ads from './screens/Ads'
import Auth from './screens/Auth'
import Setup from './screens/Setup'
import Home from './screens/Home'
import NewGarage from './screens/NewGarage'
import Vault from './screens/Vault'
import Maintenance from './screens/Maintenance'
import Mechanics from './screens/Mechanics'
import Settings from './screens/Settings'
import { DocComposer, DocViewer, type ComposerState } from './screens/Documents'

type Stage = 'splash' | 'ads' | 'auth' | 'app'

const INTRO_KEY = 'wheelwell.intro.v1'

const NAV: { id: Tab; label: string; icon: Icon }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'vault', label: 'Vault', icon: FolderSimple },
  { id: 'service', label: 'Service', icon: Wrench },
  { id: 'garage', label: 'Garage', icon: MapPinLine },
  { id: 'settings', label: 'Settings', icon: GearSix }
]

function StatusBar({ dark, transparent, violet }: { dark?: boolean; transparent?: boolean; violet?: boolean }) {
  const now = useNow(30_000)
  const time = new Date(now)
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?[AP]M/i, '')

  return (
    <div
      className={`statusbar ${dark || violet ? 'on-dark' : ''}`}
      style={violet ? { background: '#4a25f5' } : transparent ? { background: 'transparent' } : undefined}
    >
      <span>{time}</span>
      <div className="statusbar-icons" aria-hidden>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.2c2.3 0 4.4.9 5.9 2.4l1.3-1.3C13.4 1.5 10.8.4 8 .4S2.6 1.5.8 3.3l1.3 1.3C3.6 3.1 5.7 2.2 8 2.2z" />
          <path d="M8 5.6c1.4 0 2.6.5 3.5 1.4l1.3-1.3C11.6 4.5 9.9 3.8 8 3.8S4.4 4.5 3.2 5.7l1.3 1.3C5.4 6.1 6.6 5.6 8 5.6z" />
          <path d="M8 9c.5 0 1 .2 1.4.6L8 11.2 6.6 9.6C7 9.2 7.5 9 8 9z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" stroke="currentColor" strokeOpacity="0.5" />
          <rect x="2.3" y="2.3" width="17" height="7.4" rx="2" fill="currentColor" />
          <path d="M23.2 4v4c1.1-.2 1.6-.9 1.6-2s-.5-1.8-1.6-2z" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  )
}

function BottomNav({
  tab,
  onChange,
  badges
}: {
  tab: Tab
  onChange: (t: Tab) => void
  badges: Partial<Record<Tab, number>>
}) {
  return (
    <nav className="bottomnav" aria-label="Main">
      {NAV.map(({ id, label, icon: Glyph }) => {
        const active = tab === id
        const badge = badges[id] ?? 0
        return (
          <button
            key={id}
            type="button"
            className={`nav-item ${active ? 'is-active' : ''}`}
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
          >
            {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={SPRING} />}
            <span className="nav-glyph">
              <Glyph size={21} weight={active ? 'fill' : 'regular'} />
              {badge > 0 && <span className="nav-dot" />}
            </span>
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function App() {
  const { state, signedIn } = useStore()
  const [stage, setStage] = useState<Stage>('splash')
  const [tab, setTab] = useState<Tab>('home')
  const [composer, setComposer] = useState<ComposerState>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [setupOpen, setSetupOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const afterSplash = useCallback(() => {
    if (localStorage.getItem(INTRO_KEY) !== '1') {
      setStage('ads')
    } else {
      setStage(signedIn ? 'app' : 'auth')
    }
  }, [signedIn])

  const finishIntro = useCallback(() => {
    localStorage.setItem(INTRO_KEY, '1')
    setStage(signedIn ? 'app' : 'auth')
  }, [signedIn])

  useEffect(() => {
    if (!signedIn && stage === 'app') setStage('auth')
  }, [signedIn, stage])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [tab])

  const changeTab = (next: Tab) => {
    setSetupOpen(false)
    if (next === tab) {
      bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setTab(next)
  }

  const showSetup = setupOpen && !state.vehicle
  const viewDoc = state.documents.find((d) => d.id === viewId) ?? null

  const odo = state.vehicle?.odometer ?? 0
  const overdue = state.tasks.filter((t) => taskPace(t, odo).status === 'overdue').length
  const docAlerts = state.documents.filter((d) => !d.archived && docStatus(d.expiry) !== 'active').length

  const dark = stage === 'ads' || stage === 'auth'
  const transparent = stage === 'ads' || stage === 'auth'
  const violetBar = stage === 'app' && tab === 'vault'

  return (
    <div className="device">
      <ToastProvider>
        <StatusBar dark={dark} transparent={transparent} violet={violetBar} />
        {stage === 'app' && (
          <div
            className="app-body"
            ref={bodyRef}
            style={tab === 'vault' ? { paddingBottom: 0 } : undefined}
          >
            <motion.div
              key={showSetup ? 'setup' : tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ minHeight: '100%' }}
            >
                {showSetup ? (
                  <Setup
                    onCancel={() => setSetupOpen(false)}
                    onDone={() => {
                      setSetupOpen(false)
                      setTab('home')
                    }}
                  />
                ) : tab === 'home' ? (
                  state.vehicle ? (
                    <Home onOpenDoc={setViewId} onNewDoc={() => setComposer({ mode: 'new' })} onNavigate={changeTab} />
                  ) : (
                    <NewGarage
                      onAddCar={() => setSetupOpen(true)}
                      onNewDoc={(type) => setComposer({ mode: 'new', type })}
                      onNavigate={changeTab}
                    />
                  )
                ) : tab === 'vault' ? (
                  <Vault onOpenDoc={setViewId} onNewDoc={() => setComposer({ mode: 'new' })} />
                ) : tab === 'service' ? (
                  <Maintenance />
                ) : tab === 'garage' ? (
                  <Mechanics />
                ) : (
                  <Settings />
                )}
              </motion.div>
          </div>
        )}

        {stage === 'app' && <BottomNav tab={tab} onChange={changeTab} badges={{ vault: docAlerts, service: overdue }} />}

        <AnimatePresence>
          {stage === 'app' && tab === 'vault' && (
            <motion.button
              type="button"
              className="vault-fab"
              onClick={() => setComposer({ mode: 'new' })}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={SPRING}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={17} weight="bold" />
              Add document
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage === 'splash' && <Splash key="splash" onDone={afterSplash} />}
          {stage === 'ads' && <Ads key="ads" onDone={finishIntro} />}
        </AnimatePresence>

        {stage === 'auth' && (
          <Auth
            onDone={() => {
              setSetupOpen(false)
              setTab('home')
              setStage('app')
            }}
          />
        )}

        <DocComposer
          state={composer}
          onClose={() => setComposer(null)}
          onView={(id) => setViewId(id)}
        />
        <DocViewer
          doc={viewDoc}
          onClose={() => setViewId(null)}
          onEdit={(id) => {
            setViewId(null)
            setComposer({ mode: 'edit', id })
          }}
        />
      </ToastProvider>
    </div>
  )
}
