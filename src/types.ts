export type DocType = 'licence' | 'registration' | 'insurance' | 'inspection' | 'other'

export interface VehicleDocument {
  id: string
  type: DocType
  label: string
  expiry: string
  issued?: string
  number?: string
  fileName?: string
  dataUrl?: string
  createdAt: string
  archived?: boolean
}

export interface Vehicle {
  make: string
  model: string
  year: number
  plate: string
  vin?: string
  odometer: number
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'
  odometerUpdatedAt: string
}

export interface Task {
  id: string
  title: string
  kind: 'oil' | 'engine' | 'tyres' | 'battery' | 'brakes' | 'custom'
  intervalDays?: number
  intervalKm?: number
  lastDoneAt?: string
  lastDoneKm?: number
  nextDueAt: string
  nextDueKm?: number
  notes?: string
}

export interface ServiceRecord {
  id: string
  taskId?: string
  title: string
  date: string
  odometer: number
  cost: number
  workshop: string
  notes?: string
}

export interface Profile {
  name: string
  email: string
  phone?: string
}

export interface Settings {
  push: boolean
  sms: boolean
  email: boolean
  quietHours: boolean
  biometric: boolean
  autoLockMin: number
}

export interface Mechanic {
  id: string
  name: string
  rating: number
  reviews: number
  distanceKm: number
  services: string[]
  makes: string[]
  area: string
  address: string
  phone: string
  hours: string
  open: boolean
  initials: string
  hue: number
}

export interface AppState {
  profile: Profile | null
  vehicle: Vehicle | null
  documents: VehicleDocument[]
  tasks: Task[]
  records: ServiceRecord[]
  settings: Settings
  sampleData: boolean
}
