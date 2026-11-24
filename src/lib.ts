export const MS_DAY = 86_400_000

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISO(new Date())
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export function daysUntil(iso: string): number {
  const a = parseISO(todayISO()).getTime()
  const b = parseISO(iso).getTime()
  return Math.round((b - a) / MS_DAY)
}

const longFmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
const midFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export function fmtDate(iso: string, style: 'long' | 'mid' | 'short' | 'month' = 'long'): string {
  const d = parseISO(iso)
  if (style === 'long') return longFmt.format(d)
  if (style === 'mid') return midFmt.format(d)
  if (style === 'month') return monthFmt.format(d)
  return shortFmt.format(d)
}

export function relativeDays(iso: string): string {
  const n = daysUntil(iso)
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  if (n > 1) return `in ${n} days`
  return `${Math.abs(n)} days ago`
}

export function naira(n: number): string {
  return `₦${Math.round(n).toLocaleString('en-NG')}`
}

export function num(n: number): string {
  return n.toLocaleString('en-US')
}

export type DocStatus = 'active' | 'soon' | 'expired'

export function docStatus(expiry: string): DocStatus {
  const d = daysUntil(expiry)
  if (d < 0) return 'expired'
  if (d <= 30) return 'soon'
  return 'active'
}

export const STATUS_LABEL: Record<DocStatus, string> = {
  active: 'Active',
  soon: 'Expiring soon',
  expired: 'Expired'
}

export function docDaysLabel(expiry: string): string {
  const n = daysUntil(expiry)
  if (n < 0) return `Expired ${Math.abs(n)} ${Math.abs(n) === 1 ? 'day' : 'days'} ago`
  if (n === 0) return 'Expires today'
  if (n === 1) return 'Expires tomorrow'
  return `${n} days left`
}

export const ALERT_OFFSETS = [30, 15, 7, 0, 1]

/** Upcoming alerts (30/15/7 days before, expiry day, +1 day) still in the future. */
export function pendingAlerts(expiry: string): { offset: number; date: string }[] {
  return ALERT_OFFSETS.map((offset) => ({ offset, date: addDays(expiry, -offset) }))
    .filter((a) => daysUntil(a.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function nextAlert(expiry: string): { offset: number; date: string } | null {
  return pendingAlerts(expiry)[0] ?? null
}

export type TaskStatus = 'overdue' | 'soon' | 'scheduled' | 'done'

export interface TaskPace {
  status: TaskStatus
  daysLeft: number | null
  kmLeft: number | null
  /** 0..1 progress through the interval */
  progress: number
  dueLabel: string
}

export function taskPace(
  task: { nextDueAt: string; nextDueKm?: number; intervalDays?: number; intervalKm?: number },
  odometer: number
): TaskPace {
  const daysLeft = daysUntil(task.nextDueAt)
  const kmLeft = typeof task.nextDueKm === 'number' ? task.nextDueKm - odometer : null
  const overdue = daysLeft < 0 || (kmLeft !== null && kmLeft < 0)
  const soon = !overdue && (daysLeft <= 14 || (kmLeft !== null && kmLeft <= 500))
  const interval = task.intervalDays ?? (task.intervalKm ? Math.round((task.intervalKm / 40) * 7) : 180)
  const progress = Math.min(1, Math.max(0, 1 - Math.max(daysLeft, 0) / Math.max(interval, 1)))
  const parts: string[] = []
  if (daysLeft >= 0) parts.push(`in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`)
  else parts.push(`${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'} overdue`)
  if (kmLeft !== null) {
    parts.push(kmLeft >= 0 ? `${num(Math.max(0, kmLeft))} km left` : `${num(Math.abs(kmLeft))} km past`)
  }
  return {
    status: overdue ? 'overdue' : soon ? 'soon' : 'scheduled',
    daysLeft,
    kmLeft,
    progress,
    dueLabel: parts.join(' · ')
  }
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Compress an image file into a data URL small enough for localStorage. */
export async function fileToDataUrl(file: File, maxSide = 1400, quality = 0.72): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}

export const DOC_META: Record<
  string,
  { label: string; short: string; hue: number; icon: 'licence' | 'registration' | 'insurance' | 'inspection' | 'other' }
> = {
  licence: { label: "Driver's Licence", short: 'Licence', hue: 46, icon: 'licence' },
  registration: { label: 'Vehicle Registration', short: 'Registration', hue: 146, icon: 'registration' },
  insurance: { label: 'Insurance', short: 'Insurance', hue: 208, icon: 'insurance' },
  inspection: { label: 'Roadworthiness', short: 'Inspection', hue: 356, icon: 'inspection' },
  other: { label: 'Other document', short: 'Other', hue: 268, icon: 'other' }
}

export const TASK_META: Record<string, { icon: string; hue: number }> = {
  oil: { icon: 'Drop', hue: 32 },
  engine: { icon: 'Gauge', hue: 208 },
  tyres: { icon: 'Tire', hue: 152 },
  battery: { icon: 'BatteryFull', hue: 46 },
  brakes: { icon: 'Warning', hue: 356 },
  custom: { icon: 'Wrench', hue: 268 }
}
