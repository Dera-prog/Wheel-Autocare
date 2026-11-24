import type { AppState, Mechanic, ServiceRecord, Settings, Task, VehicleDocument } from './types'
import { addDays, todayISO } from './lib'

export const DEFAULT_SETTINGS: Settings = {
  push: true,
  sms: false,
  email: true,
  quietHours: true,
  biometric: false,
  autoLockMin: 1
}

export const EMPTY_STATE: AppState = {
  profile: null,
  vehicle: null,
  documents: [],
  tasks: [],
  records: [],
  settings: DEFAULT_SETTINGS,
  sampleData: false
}

function doc(
  id: string,
  type: VehicleDocument['type'],
  label: string,
  expiry: string,
  issued: string,
  number: string
): VehicleDocument {
  return { id, type, label, expiry, issued, number, createdAt: todayISO() }
}

export function demoGarage(): Pick<AppState, 'vehicle' | 'documents' | 'tasks' | 'records'> {
  const today = todayISO()
  const documents: VehicleDocument[] = [
    doc('doc-insurance', 'insurance', 'Comprehensive cover', addDays(today, 12), addDays(today, -353), 'AIICO / CM / 2026 / 0091'),
    doc('doc-registration', 'registration', 'Lagos state registration', addDays(today, 34), addDays(today, -331), 'REG-LAG-26-8841'),
    doc('doc-licence', 'licence', 'Class B driver licence', addDays(today, 168), addDays(today, -562), 'DL-LAG-2290-4471'),
    doc('doc-inspection', 'inspection', 'Roadworthiness certificate', addDays(today, -4), addDays(today, -369), 'RW-LAG-A-2190')
  ]

  const tasks: Task[] = [
    {
      id: 'task-oil',
      title: 'Engine oil & filter',
      kind: 'oil',
      intervalDays: 180,
      intervalKm: 5000,
      lastDoneAt: addDays(today, -171),
      lastDoneKm: 67_600,
      nextDueAt: addDays(today, 9),
      nextDueKm: 72_600
    },
    {
      id: 'task-tyres',
      title: 'Tyre rotation & pressure',
      kind: 'tyres',
      intervalDays: 180,
      intervalKm: 8000,
      lastDoneAt: addDays(today, -186),
      lastDoneKm: 65_000,
      nextDueAt: addDays(today, -6),
      nextDueKm: 73_000
    },
    {
      id: 'task-brakes',
      title: 'Brake pads inspection',
      kind: 'brakes',
      intervalDays: 365,
      intervalKm: 20_000,
      lastDoneAt: addDays(today, -320),
      lastDoneKm: 58_000,
      nextDueAt: addDays(today, 45),
      nextDueKm: 78_000
    },
    {
      id: 'task-battery',
      title: 'Battery health check',
      kind: 'battery',
      intervalDays: 730,
      lastDoneAt: addDays(today, -480),
      nextDueAt: addDays(today, 250)
    },
    {
      id: 'task-engine',
      title: 'Engine diagnostics',
      kind: 'engine',
      intervalDays: 365,
      lastDoneAt: addDays(today, -344),
      nextDueAt: addDays(today, 21)
    }
  ]

  const records: ServiceRecord[] = [
    {
      id: 'rec-1',
      taskId: 'task-oil',
      title: 'Engine oil & filter',
      date: addDays(today, -171),
      odometer: 67_600,
      cost: 32_500,
      workshop: 'Kunle Autoworks, Ikeja',
      notes: '5W-30 synthetic, filter replaced'
    },
    {
      id: 'rec-2',
      taskId: 'task-tyres',
      title: 'Tyre rotation & pressure',
      date: addDays(today, -186),
      odometer: 65_000,
      cost: 9_000,
      workshop: 'Emeka Tyres, Surulere'
    },
    {
      id: 'rec-3',
      taskId: 'task-brakes',
      title: 'Front brake pads replaced',
      date: addDays(today, -320),
      odometer: 58_000,
      cost: 46_000,
      workshop: 'AutoMedic Lagos, Lekki',
      notes: 'Brembo pads, discs resurfaced'
    }
  ]

  return {
    vehicle: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2018,
      plate: 'LAG 482 XA',
      vin: 'JTDBR32E600123456',
      odometer: 72_480,
      fuelType: 'Petrol',
      odometerUpdatedAt: addDays(today, -3)
    },
    documents,
    tasks,
    records
  }
}

export const MECHANICS: Mechanic[] = [
  {
    id: 'm1',
    name: 'Kunle Autoworks',
    rating: 4.9,
    reviews: 214,
    distanceKm: 1.2,
    services: ['Engine', 'Oil change', 'Diagnostics'],
    makes: ['Toyota', 'Lexus', 'Honda'],
    area: 'Ikeja GRA',
    address: '12 Oba Akran Avenue, Ikeja',
    phone: '+2348035550101',
    hours: 'Mon–Sat · 8:00–18:00',
    open: true,
    initials: 'KA',
    hue: 262
  },
  {
    id: 'm2',
    name: 'AutoMedic Lagos',
    rating: 4.8,
    reviews: 158,
    distanceKm: 2.4,
    services: ['Brakes', 'Suspension', 'Diagnostics'],
    makes: ['All makes'],
    area: 'Lekki Phase 1',
    address: '7 Admiralty Way, Lekki',
    phone: '+2348035550102',
    hours: 'Mon–Sun · 7:30–19:00',
    open: true,
    initials: 'AM',
    hue: 208
  },
  {
    id: 'm3',
    name: 'Emeka Tyres & Alignment',
    rating: 4.7,
    reviews: 96,
    distanceKm: 3.1,
    services: ['Tyres', 'Alignment', 'Balancing'],
    makes: ['All makes'],
    area: 'Surulere',
    address: '44 Bode Thomas Street, Surulere',
    phone: '+2348035550103',
    hours: 'Mon–Sat · 8:00–17:00',
    open: true,
    initials: 'ET',
    hue: 152
  },
  {
    id: 'm4',
    name: 'Prime Gear Garage',
    rating: 4.9,
    reviews: 302,
    distanceKm: 4.0,
    services: ['Engine', 'Transmission', 'Electrical'],
    makes: ['Toyota', 'Mercedes-Benz', 'Ford'],
    area: 'Victoria Island',
    address: '3 Adeola Odeku Street, VI',
    phone: '+2348035550104',
    hours: 'Mon–Fri · 8:00–18:00',
    open: false,
    initials: 'PG',
    hue: 32
  },
  {
    id: 'm5',
    name: 'Naija Auto Electric',
    rating: 4.6,
    reviews: 74,
    distanceKm: 5.6,
    services: ['Electrical', 'AC', 'Battery'],
    makes: ['Honda', 'Hyundai', 'Kia'],
    area: 'Yaba',
    address: '19 Herbert Macaulay Way, Yaba',
    phone: '+2348035550105',
    hours: 'Mon–Sat · 9:00–18:00',
    open: true,
    initials: 'NA',
    hue: 46
  },
  {
    id: 'm6',
    name: 'Bosch Car Service Gbagada',
    rating: 4.8,
    reviews: 187,
    distanceKm: 6.3,
    services: ['Oil change', 'Brakes', 'Diagnostics', 'AC'],
    makes: ['All makes'],
    area: 'Gbagada',
    address: '8 Diya Street, Gbagada',
    phone: '+2348035550106',
    hours: 'Mon–Sat · 8:00–17:30',
    open: true,
    initials: 'BS',
    hue: 356
  },
  {
    id: 'm7',
    name: 'Oregun Toyota Specialist',
    rating: 4.7,
    reviews: 121,
    distanceKm: 7.8,
    services: ['Engine', 'Bodywork', 'Suspension'],
    makes: ['Toyota', 'Lexus'],
    area: 'Oregun',
    address: '24 Kudirat Abiola Way, Oregun',
    phone: '+2348035550107',
    hours: 'Mon–Fri · 8:30–18:00',
    open: false,
    initials: 'OT',
    hue: 190
  },
  {
    id: 'm8',
    name: 'Chidi Motors',
    rating: 4.5,
    reviews: 63,
    distanceKm: 9.2,
    services: ['Electrical', 'Engine', 'Diagnostics'],
    makes: ['Honda', 'Toyota', 'Kia'],
    area: 'Ikorodu Road',
    address: '5 Obanikoro Road, Ikorodu Road',
    phone: '+2348035550108',
    hours: 'Mon–Sat · 8:00–17:00',
    open: true,
    initials: 'CM',
    hue: 128
  }
]
