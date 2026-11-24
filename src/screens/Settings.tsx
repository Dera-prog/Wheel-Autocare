import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowCounterClockwise,
  BellRinging,
  Car,
  CaretRight,
  Clock,
  DownloadSimple,
  Fingerprint,
  GasPump,
  Gauge,
  Info,
  LockSimple,
  SealCheck,
  SignOut,
  Sparkle,
  Trash
} from '@phosphor-icons/react'
import { useStore } from '../store'
import type { Vehicle } from '../types'
import { num } from '../lib'
import {
  Avatar,
  Btn,
  Chip,
  Field,
  IconBtn,
  ScreenHeader,
  Sheet,
  Switch,
  useToast
} from '../ui'

const FUELS: Vehicle['fuelType'][] = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
const LOCKS = [1, 5, 15, 30]

function SRow({
  icon,
  title,
  sub,
  value,
  onClick,
  right
}: {
  icon?: ReactNode
  title: string
  sub?: string
  value?: string
  onClick?: () => void
  right?: ReactNode
}) {
  const inner = (
    <>
      {icon && <span className="settings-row-icon">{icon}</span>}
      <span className="settings-row-main">
        <strong>{title}</strong>
        {sub && <span>{sub}</span>}
      </span>
      {right ?? (value ? <span className="settings-row-value">{value}</span> : null)}
    </>
  )
  if (onClick) {
    return (
      <button type="button" className="settings-row" onClick={onClick}>
        {inner}
      </button>
    )
  }
  return <div className="settings-row">{inner}</div>
}

export default function Settings() {
  const {
    state,
    signOut,
    updateSettings,
    updateProfile,
    saveVehicle: persistVehicle,
    exportJson,
    resetGarage,
    loadSampleGarage
  } = useStore()
  const toast = useToast()

  const [profileOpen, setProfileOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const [name, setName] = useState(state.profile?.name ?? '')
  const [email, setEmail] = useState(state.profile?.email ?? '')
  const [phone, setPhone] = useState(state.profile?.phone ?? '')

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [plate, setPlate] = useState('')
  const [odometer, setOdometer] = useState('')
  const [fuel, setFuel] = useState<Vehicle['fuelType']>('Petrol')

  const vehicle = state.vehicle

  const openProfile = () => {
    setName(state.profile?.name ?? '')
    setEmail(state.profile?.email ?? '')
    setPhone(state.profile?.phone ?? '')
    setProfileOpen(true)
  }

  const openVehicle = () => {
    if (!vehicle) return
    setMake(vehicle.make)
    setModel(vehicle.model)
    setYear(String(vehicle.year))
    setPlate(vehicle.plate)
    setOdometer(String(vehicle.odometer))
    setFuel(vehicle.fuelType)
    setVehicleOpen(true)
  }

  const saveProfile = () => {
    if (!name.trim()) {
      toast('Add your name', 'It appears on document summaries', 'danger')
      return
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast('Check the email address', 'It is also your sign-in name', 'danger')
      return
    }
    const result = updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined })
    if (!result.ok) {
      toast('Could not save profile', result.error, 'danger')
      return
    }
    setProfileOpen(false)
    toast('Profile saved', undefined, 'success')
  }

  const saveVehicle = () => {
    if (!vehicle) return
    if (!make.trim() || !model.trim() || plate.trim().length < 3) {
      toast('Check the car details', 'Make, model and plate are required', 'danger')
      return
    }
    const odo = Math.max(vehicle.odometer, Number(odometer) || 0)
    persistVehicle({
      ...vehicle,
      make: make.trim(),
      model: model.trim(),
      year: Math.max(1980, Math.min(2027, Number(year) || vehicle.year)),
      plate: plate.trim().toUpperCase(),
      odometer: odo,
      fuelType: fuel,
      odometerUpdatedAt: odo !== vehicle.odometer ? new Date().toISOString().slice(0, 10) : vehicle.odometerUpdatedAt
    })
    setVehicleOpen(false)
    toast('Vehicle updated', `${make} ${model} · ${plate.toUpperCase()}`, 'success')
  }

  const exportData = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wheelwell-garage-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1500)
    toast('Export ready', 'Check your downloads folder', 'success')
  }

  const doReset = () => {
    resetGarage()
    setResetOpen(false)
    toast('Garage reset', 'Documents, services and records removed', 'success')
  }

  const cycleLock = () => {
    const i = LOCKS.indexOf(state.settings.autoLockMin)
    updateSettings({ autoLockMin: LOCKS[(i + 1) % LOCKS.length] })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <ScreenHeader title="Settings" sub="Your garage, your rules" />

      <div className="profile-card">
        <Avatar name={state.profile?.name ?? 'WheelWell'} size={56} hue={262} />
        <div className="grow">
          <h3>{state.profile?.name ?? 'WheelWell owner'}</h3>
          <p>{state.profile?.email ?? 'No email on file'}</p>
          <span className="profile-chip">
            <SealCheck size={12} weight="fill" />
            LOCAL-FIRST MEMBER
          </span>
        </div>
        <IconBtn label="Edit profile" tone="glass" onClick={openProfile}>
          <CaretRight size={18} weight="bold" />
        </IconBtn>
      </div>

      <div className="settings-group">
        <h3>Vehicle</h3>
        <div className="settings-list">
          <SRow
            icon={<Car size={18} weight="duotone" />}
            title={vehicle ? `${vehicle.make} ${vehicle.model}` : 'No vehicle yet'}
            sub={vehicle ? `${vehicle.year} · ${vehicle.plate}` : 'Add your car'}
            onClick={openVehicle}
            right={<CaretRight size={15} weight="bold" color="var(--muted-2)" />}
          />
          <SRow
            icon={<Gauge size={18} weight="duotone" />}
            title="Odometer"
            sub="Tap to update the reading"
            onClick={openVehicle}
            value={vehicle ? `${num(vehicle.odometer)} km` : '—'}
          />
          <SRow
            icon={<GasPump size={18} weight="duotone" />}
            title="Fuel type"
            sub="Used for running-cost estimates"
            value={vehicle?.fuelType ?? '—'}
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>Renewal alerts</h3>
        <div className="settings-list">
          <SRow
            icon={<BellRinging size={18} weight="duotone" />}
            title="Alert schedule"
            sub="Each document gets five reminder moments"
            value="30 · 15 · 7 · 0 · +1 d"
          />
          <SRow
            icon={<BellRinging size={18} weight="duotone" />}
            title="Push reminders"
            sub="In-app alerts while the app is open"
            right={
              <Switch
                label="Push reminders"
                checked={state.settings.push}
                onChange={(v) => updateSettings({ push: v })}
              />
            }
          />
          <SRow
            icon={<BellRinging size={18} weight="duotone" />}
            title="SMS alerts"
            sub="Not sent in this web demo"
            right={
              <Switch label="SMS alerts" checked={state.settings.sms} onChange={(v) => updateSettings({ sms: v })} />
            }
          />
          <SRow
            icon={<BellRinging size={18} weight="duotone" />}
            title="Email digest"
            sub="Not sent in this web demo"
            right={
              <Switch
                label="Email digest"
                checked={state.settings.email}
                onChange={(v) => updateSettings({ email: v })}
              />
            }
          />
          <SRow
            icon={<Clock size={18} weight="duotone" />}
            title="Quiet hours"
            sub="No alerts between 9pm and 7am"
            right={
              <Switch
                label="Quiet hours"
                checked={state.settings.quietHours}
                onChange={(v) => updateSettings({ quietHours: v })}
              />
            }
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>Security</h3>
        <div className="settings-list">
          <SRow
            icon={<Fingerprint size={18} weight="duotone" />}
            title="Fingerprint unlock"
            sub="Preference saved · native lock ships with the mobile app"
            right={
              <Switch
                label="Fingerprint unlock"
                checked={state.settings.biometric}
                onChange={(v) => {
                  updateSettings({ biometric: v })
                  toast(v ? 'Fingerprint preference on' : 'Fingerprint preference off', 'Saved on this device')
                }}
              />
            }
          />
          <SRow
            icon={<LockSimple size={18} weight="duotone" />}
            title="Auto-lock"
            sub="Tap to cycle the timeout"
            onClick={cycleLock}
            value={`${state.settings.autoLockMin} min`}
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>Data & privacy</h3>
        <div className="settings-list">
          {state.sampleData && (
            <SRow
              icon={<Sparkle size={18} weight="fill" />}
              title="Sample garage is active"
              sub="Reset below when you're ready for real papers"
              value="Demo"
            />
          )}
          <SRow
            icon={<DownloadSimple size={18} weight="duotone" />}
            title="Export my data"
            sub="Every document, task and record as JSON"
            onClick={exportData}
            right={<CaretRight size={15} weight="bold" color="var(--muted-2)" />}
          />
          <SRow
            icon={<ArrowCounterClockwise size={18} weight="duotone" />}
            title="Reload sample garage"
            sub="Restore the demo car, papers and history"
            onClick={() => {
              loadSampleGarage()
              toast('Sample garage loaded', 'Toyota Corolla · 4 documents', 'success')
            }}
          />
          <SRow
            icon={<Trash size={18} weight="duotone" />}
            title="Reset garage contents"
            sub="Delete documents, services and records"
            onClick={() => setResetOpen(true)}
            right={<CaretRight size={15} weight="bold" color="var(--muted-2)" />}
          />
        </div>
      </div>

      <div className="settings-group" style={{ marginBottom: 24 }}>
        <h3>Account</h3>
        <div className="settings-list">
          <SRow
            icon={<SignOut size={18} weight="duotone" />}
            title="Sign out"
            sub="Your garage stays saved with your account"
            onClick={() => {
              signOut()
              toast('Signed out', 'Sign back in to pick up where you stopped')
            }}
            right={<CaretRight size={15} weight="bold" color="var(--muted-2)" />}
          />
          <SRow
            icon={<Info size={18} weight="duotone" />}
            title="About WheelWell"
            sub="Installable web app · V1 demo"
            value="v1.0.0"
          />
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted-2)', padding: '0 30px 30px', lineHeight: 1.6 }}>
        WheelWell AutoCare · Built for Nigerian roads.
        <br />
        Local storage only — clearing browser data removes this garage.
      </p>

      <Sheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Edit profile"
        subtitle="Shown on document summaries and shares"
        footer={
          <Btn full size="lg" onClick={saveProfile}>
            Save profile
          </Btn>
        }
      >
        <div className="stack gap-12">
          <Field label="Full name">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <Field label="Email address">
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Phone" hint="optional">
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 803 000 0000"
            />
          </Field>
        </div>
      </Sheet>

      <Sheet
        open={vehicleOpen}
        onClose={() => setVehicleOpen(false)}
        title="Edit vehicle"
        subtitle="Keep the car details current"
        footer={
          <Btn full size="lg" onClick={saveVehicle}>
            Save vehicle
          </Btn>
        }
      >
        <div className="stack gap-12">
          <div className="row gap-10">
            <div className="grow">
              <Field label="Make">
                <input className="input" value={make} onChange={(e) => setMake(e.target.value)} />
              </Field>
            </div>
            <div className="grow">
              <Field label="Model">
                <input className="input" value={model} onChange={(e) => setModel(e.target.value)} />
              </Field>
            </div>
          </div>
          <div className="row gap-10">
            <div className="grow">
              <Field label="Year">
                <input
                  className="input"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                />
              </Field>
            </div>
            <div className="grow">
              <Field label="Plate">
                <input className="input" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} />
              </Field>
            </div>
          </div>
          <Field label="Odometer (km)">
            <input
              className="input"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
            />
          </Field>
          <div>
            <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>
              Fuel type
            </span>
            <div className="chip-row" style={{ padding: 0 }}>
              {FUELS.map((f) => (
                <Chip key={f} active={fuel === f} onClick={() => setFuel(f)}>
                  {f}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Sheet>

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset garage contents?"
        subtitle="This cannot be undone"
        footer={
          <div className="stack gap-8">
            <Btn variant="danger" full size="lg" onClick={doReset} iconLeft={<Trash size={17} weight="bold" />}>
              Delete garage contents
            </Btn>
            <Btn variant="ghost" full onClick={() => setResetOpen(false)}>
              Keep my data
            </Btn>
          </div>
        }
      >
        <div className="alert-list">
          <div className="alert-item">
            <Trash size={15} weight="bold" color="#d03434" />
            All documents and photos
          </div>
          <div className="alert-item">
            <Trash size={15} weight="bold" color="#d03434" />
            Every service task and record
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          Your vehicle and profile stay so you can start adding real papers straight away. Export first if you
          want a backup.
        </p>
      </Sheet>
    </motion.div>
  )
}
