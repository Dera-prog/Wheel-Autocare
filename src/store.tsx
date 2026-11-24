import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppState, Profile, ServiceRecord, Settings, Task, Vehicle, VehicleDocument } from './types'
import { DEFAULT_SETTINGS, EMPTY_STATE, demoGarage } from './seed'
import { addDays, todayISO, uid } from './lib'
import {
  DEMO_ACCOUNT,
  consumeLegacyGarage,
  findAccount,
  freshState,
  getSession,
  hashPassword,
  legacyGarage,
  loadAccounts,
  loadGarage,
  newAccount,
  normalizeEmail,
  saveAccounts,
  saveGarage,
  setSession,
  verifyPassword,
  type Account,
  type AuthResult
} from './accounts'

export interface CompletePayload {
  date: string
  odometer: number
  cost: number
  workshop: string
  notes?: string
}

export interface NewTaskInput {
  title: string
  kind: Task['kind']
  intervalDays?: number
  intervalKm?: number
  nextDueAt?: string
  nextDueKm?: number
}

interface Store {
  state: AppState
  signedIn: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  enterDemo: () => Promise<AuthResult>
  signOut: () => void
  saveVehicle: (vehicle: Vehicle) => void
  updateOdometer: (odometer: number) => void
  addDocument: (doc: Omit<VehicleDocument, 'id' | 'createdAt'>) => VehicleDocument
  updateDocument: (id: string, patch: Partial<VehicleDocument>) => void
  archiveDocument: (id: string) => void
  deleteDocument: (id: string) => void
  addTask: (input: NewTaskInput) => void
  completeTask: (id: string, payload: CompletePayload) => Task | null
  updateSettings: (patch: Partial<Settings>) => void
  updateProfile: (patch: Partial<Profile>) => AuthResult
  loadSampleGarage: () => void
  resetGarage: () => void
  exportJson: () => string
}

const StoreContext = createContext<Store | null>(null)

function boot(): { id: string | null; state: AppState } {
  const id = getSession()
  const account = id ? loadAccounts().find((a) => a.id === id) : undefined
  if (!id || !account) {
    return { id: null, state: { ...EMPTY_STATE, settings: { ...DEFAULT_SETTINGS } } }
  }
  const saved = loadGarage(id)
  return {
    id,
    state: saved.profile ? saved : { ...saved, profile: { name: account.name, email: account.email } }
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [booted] = useState(boot)
  const [sessionId, setSessionId] = useState<string | null>(booted.id)
  const [state, setState] = useState<AppState>(booted.state)

  useEffect(() => {
    if (sessionId) saveGarage(sessionId, state)
  }, [state, sessionId])

  const startSession = useCallback((account: Account) => {
    setSession(account.id)
    setSessionId(account.id)
    const saved = loadGarage(account.id)
    setState(
      saved.profile ? saved : { ...saved, profile: { name: account.name, email: account.email } }
    )
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const target = normalizeEmail(email)
      if (!target) return { ok: false, error: 'Enter the email you signed up with.' }
      if (!password) return { ok: false, error: 'Enter your password.' }
      const account = findAccount(target)
      if (!account) {
        return { ok: false, error: 'No garage is registered with that email. Create an account instead.' }
      }
      let valid = false
      try {
        valid = await verifyPassword(password, account)
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Could not check that password.' }
      }
      if (!valid) return { ok: false, error: 'That password does not match. Try again.' }
      startSession(account)
      return { ok: true }
    },
    [startSession]
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const cleanName = name.trim()
      const target = normalizeEmail(email)
      if (cleanName.length < 2) return { ok: false, error: 'Add the name you want on your papers.' }
      if (!/^\S+@\S+\.\S+$/.test(target)) return { ok: false, error: 'That email address looks incomplete.' }
      if (password.length < 6) return { ok: false, error: 'Use at least 6 characters for your password.' }
      if (findAccount(target)) return { ok: false, error: 'That email already has a garage. Sign in instead.' }
      try {
        const creds = await hashPassword(password)
        const account = newAccount(cleanName, target, creds)
        saveAccounts([...loadAccounts(), account])
        const next = freshState({ name: cleanName, email: target })
        saveGarage(account.id, next)
        setSession(account.id)
        setSessionId(account.id)
        setState(next)
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Could not create the account.' }
      }
    },
    []
  )

  const enterDemo = useCallback(async (): Promise<AuthResult> => {
    let account = loadAccounts().find((a) => a.demo)
    if (!account) {
      try {
        const creds = await hashPassword(DEMO_ACCOUNT.password)
        account = newAccount(DEMO_ACCOUNT.name, DEMO_ACCOUNT.email, creds, true)
        const legacy = legacyGarage()
        const seed: AppState = legacy?.vehicle
          ? {
              ...legacy,
              profile: {
                name: DEMO_ACCOUNT.name,
                email: DEMO_ACCOUNT.email,
                phone: legacy.profile?.phone
              }
            }
          : {
              ...freshState({ name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email }),
              ...demoGarage(),
              sampleData: true
            }
        saveAccounts([...loadAccounts(), account])
        saveGarage(account.id, seed)
        if (legacy) consumeLegacyGarage()
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Could not open the demo garage.' }
      }
    }
    const saved = loadGarage(account.id)
    if (!saved.vehicle) {
      const seed: AppState = {
        ...freshState({ name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email }),
        ...demoGarage(),
        sampleData: true
      }
      saveGarage(account.id, seed)
      setSession(account.id)
      setSessionId(account.id)
      setState(seed)
      return { ok: true }
    }
    startSession(account)
    return { ok: true }
  }, [startSession])

  const signOut = useCallback(() => {
    setSession(null)
    setSessionId(null)
    setState({ ...EMPTY_STATE, settings: { ...DEFAULT_SETTINGS } })
  }, [])

  const saveVehicle = useCallback((vehicle: Vehicle) => {
    setState((s) => ({ ...s, vehicle }))
  }, [])

  const updateOdometer = useCallback((odometer: number) => {
    setState((s) =>
      s.vehicle
        ? { ...s, vehicle: { ...s.vehicle, odometer, odometerUpdatedAt: todayISO() } }
        : s
    )
  }, [])

  const addDocument = useCallback((input: Omit<VehicleDocument, 'id' | 'createdAt'>) => {
    const created: VehicleDocument = { ...input, id: uid(), createdAt: todayISO() }
    setState((s) => ({ ...s, documents: [created, ...s.documents] }))
    return created
  }, [])

  const updateDocument = useCallback((id: string, patch: Partial<VehicleDocument>) => {
    setState((s) => ({
      ...s,
      documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d))
    }))
  }, [])

  const archiveDocument = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      documents: s.documents.map((d) => (d.id === id ? { ...d, archived: !d.archived } : d))
    }))
  }, [])

  const deleteDocument = useCallback((id: string) => {
    setState((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) }))
  }, [])

  const addTask = useCallback((input: NewTaskInput) => {
    setState((s) => {
      const odo = s.vehicle?.odometer ?? 0
      const task: Task = {
        id: uid(),
        title: input.title,
        kind: input.kind,
        intervalDays: input.intervalDays,
        intervalKm: input.intervalKm,
        nextDueAt: input.nextDueAt ?? addDays(todayISO(), input.intervalDays ?? 90),
        nextDueKm: input.nextDueKm ?? (input.intervalKm ? odo + input.intervalKm : undefined)
      }
      return { ...s, tasks: [task, ...s.tasks] }
    })
  }, [])

  const completeTask = useCallback((id: string, payload: CompletePayload) => {
    let updated: Task | null = null
    setState((s) => {
      const task = s.tasks.find((t) => t.id === id)
      if (!task) return s
      const next: Task = {
        ...task,
        lastDoneAt: payload.date,
        lastDoneKm: payload.odometer,
        nextDueAt: addDays(payload.date, task.intervalDays ?? 90),
        nextDueKm: task.intervalKm ? payload.odometer + task.intervalKm : undefined
      }
      updated = next
      const record: ServiceRecord = {
        id: uid(),
        taskId: task.id,
        title: task.title,
        date: payload.date,
        odometer: payload.odometer,
        cost: payload.cost,
        workshop: payload.workshop,
        notes: payload.notes
      }
      return {
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? next : t)),
        records: [record, ...s.records],
        vehicle: s.vehicle ? { ...s.vehicle, odometer: Math.max(s.vehicle.odometer, payload.odometer) } : s.vehicle
      }
    })
    return updated
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const updateProfile = useCallback(
    (patch: Partial<Profile>): AuthResult => {
      if (!sessionId) return { ok: false, error: 'Sign in first.' }
      const cleanEmail = patch.email ? normalizeEmail(patch.email) : undefined
      if (cleanEmail) {
        const owner = findAccount(cleanEmail)
        if (owner && owner.id !== sessionId) {
          return { ok: false, error: 'Another garage already uses that email.' }
        }
      }
      setState((s) => ({
        ...s,
        profile: s.profile
          ? { ...s.profile, ...patch, ...(cleanEmail ? { email: cleanEmail } : {}) }
          : s.profile
      }))
      saveAccounts(
        loadAccounts().map((a) =>
          a.id === sessionId
            ? { ...a, name: patch.name?.trim() || a.name, email: cleanEmail ?? a.email }
            : a
        )
      )
      return { ok: true }
    },
    [sessionId]
  )

  const loadSampleGarage = useCallback(() => {
    setState((s) => ({ ...s, ...demoGarage(), sampleData: true }))
  }, [])

  const resetGarage = useCallback(() => {
    setState((s) => ({ ...s, documents: [], tasks: [], records: [], sampleData: false }))
  }, [])

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state])

  const value = useMemo<Store>(
    () => ({
      state,
      signedIn: !!sessionId,
      signIn,
      signUp,
      enterDemo,
      signOut,
      saveVehicle,
      updateOdometer,
      addDocument,
      updateDocument,
      archiveDocument,
      deleteDocument,
      addTask,
      completeTask,
      updateSettings,
      updateProfile,
      loadSampleGarage,
      resetGarage,
      exportJson
    }),
    [
      state,
      sessionId,
      signIn,
      signUp,
      enterDemo,
      signOut,
      saveVehicle,
      updateOdometer,
      addDocument,
      updateDocument,
      archiveDocument,
      deleteDocument,
      addTask,
      completeTask,
      updateSettings,
      updateProfile,
      loadSampleGarage,
      resetGarage,
      exportJson
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
