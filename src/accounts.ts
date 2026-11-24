import type { AppState } from './types'
import { DEFAULT_SETTINGS, EMPTY_STATE } from './seed'
import { todayISO, uid } from './lib'

const ACCOUNTS_KEY = 'wheelwell.accounts.v1'
const SESSION_KEY = 'wheelwell.session.v1'
const GARAGE_PREFIX = 'wheelwell.state.'
const LEGACY_STATE_KEY = 'wheelwell.state.v1'
const ITERATIONS = 150_000

export const DEMO_ACCOUNT = {
  name: 'Chidera Uzoma',
  email: 'demo@wheelwell.ng',
  password: 'wheelwell-demo'
}

export interface Account {
  id: string
  name: string
  email: string
  salt: string
  hash: string
  iterations: number
  createdAt: string
  demo?: boolean
}

export interface AuthResult {
  ok: boolean
  error?: string
}

function b64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let out = ''
  for (const b of bytes) out += String.fromCharCode(b)
  return btoa(out)
}

function fromB64(value: string) {
  const raw = atob(value)
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

async function derive(password: string, salt: BufferSource, iterations: number): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Secure accounts need HTTPS or localhost.')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  )
  return b64(bits)
}

export async function hashPassword(password: string): Promise<Pick<Account, 'salt' | 'hash' | 'iterations'>> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { salt: b64(salt.buffer), hash: await derive(password, salt, ITERATIONS), iterations: ITERATIONS }
}

export async function verifyPassword(password: string, account: Account): Promise<boolean> {
  const derived = await derive(password, fromB64(account.salt), account.iterations)
  if (derived.length !== account.hash.length) return false
  let diff = 0
  for (let i = 0; i < derived.length; i++) diff |= derived.charCodeAt(i) ^ account.hash.charCodeAt(i)
  return diff === 0
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? (JSON.parse(raw) as Account[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function findAccount(email: string): Account | undefined {
  const target = normalizeEmail(email)
  return loadAccounts().find((a) => a.email === target)
}

export function garageKey(accountId: string): string {
  return `${GARAGE_PREFIX}${accountId}.v1`
}

export function freshState(profile: { name: string; email: string }): AppState {
  return {
    ...EMPTY_STATE,
    profile,
    settings: { ...DEFAULT_SETTINGS }
  }
}

export function loadGarage(accountId: string): AppState {
  try {
    const raw = localStorage.getItem(garageKey(accountId))
    if (!raw) return freshState({ name: '', email: '' })
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...EMPTY_STATE,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) }
    }
  } catch {
    return freshState({ name: '', email: '' })
  }
}

export function saveGarage(accountId: string, state: AppState): void {
  try {
    localStorage.setItem(garageKey(accountId), JSON.stringify(state))
  } catch {
    try {
      const slim = { ...state, documents: state.documents.map((d) => ({ ...d, dataUrl: undefined })) }
      localStorage.setItem(garageKey(accountId), JSON.stringify(slim))
    } catch {
      /* storage is full — keep the in-memory state working */
    }
  }
}

export function getSession(): string | null {
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return null
  if (!loadAccounts().some((a) => a.id === id)) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return id
}

export function setSession(accountId: string | null): void {
  if (accountId) localStorage.setItem(SESSION_KEY, accountId)
  else localStorage.removeItem(SESSION_KEY)
}

/** Garage saved by the pre-accounts build, if any. */
export function legacyGarage(): AppState | null {
  try {
    const raw = localStorage.getItem(LEGACY_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AppState>
    return { ...EMPTY_STATE, ...parsed, settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) } }
  } catch {
    return null
  }
}

export function consumeLegacyGarage(): void {
  try {
    localStorage.removeItem(LEGACY_STATE_KEY)
  } catch {
    /* ignore */
  }
}

export function newAccount(
  name: string,
  email: string,
  creds: Pick<Account, 'salt' | 'hash' | 'iterations'>,
  demo = false
): Account {
  return {
    id: uid(),
    name,
    email: normalizeEmail(email),
    salt: creds.salt,
    hash: creds.hash,
    iterations: creds.iterations,
    createdAt: todayISO(),
    demo: demo || undefined
  }
}
