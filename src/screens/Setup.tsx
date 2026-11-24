import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Car, GasPump, SteeringWheel } from '@phosphor-icons/react'
import { useStore } from '../store'
import type { Vehicle } from '../types'
import { Btn, Chip, Field, ScreenHeader, useToast } from '../ui'

const FUELS: Vehicle['fuelType'][] = ['Petrol', 'Diesel', 'Hybrid', 'Electric']

export default function Setup({ onDone, onCancel }: { onDone: () => void; onCancel?: () => void }) {
  const { saveVehicle } = useStore()
  const toast = useToast()
  const [make, setMake] = useState('Toyota')
  const [model, setModel] = useState('Corolla')
  const [year, setYear] = useState('2018')
  const [plate, setPlate] = useState('')
  const [odometer, setOdometer] = useState('0')
  const [fuel, setFuel] = useState<Vehicle['fuelType']>('Petrol')
  const [error, setError] = useState('')

  const submit = () => {
    if (!make.trim() || !model.trim()) {
      setError('Add the make and model of your car.')
      return
    }
    if (plate.trim().length < 3) {
      setError('Add the plate number so documents can be matched.')
      return
    }
    const odo = Number(odometer)
    saveVehicle({
      make: make.trim(),
      model: model.trim(),
      year: Math.max(1980, Math.min(2027, Number(year) || 2018)),
      plate: plate.trim().toUpperCase(),
      odometer: Number.isFinite(odo) ? Math.max(0, Math.round(odo)) : 0,
      fuelType: fuel,
      odometerUpdatedAt: new Date().toISOString().slice(0, 10)
    })
    toast('Garage created', `${make} ${model} is ready`, 'success')
    onDone()
  }

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ paddingTop: 8 }}
    >
      <ScreenHeader title="Add your car" sub="This takes about 30 seconds" onBack={onCancel} />

      <div className="maint-hero" style={{ margin: '16px 20px 18px' }}>
        <div className="maint-hero-top">
          <div>
            <h3>One car, fully covered</h3>
            <p>Documents, renewals and service reminders all follow this vehicle.</p>
          </div>
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.14)',
              flex: 'none'
            }}
          >
            <Car size={26} weight="duotone" />
          </div>
        </div>
      </div>

      <div className="stack gap-12" style={{ padding: '0 20px 30px' }}>
        <div className="row gap-10">
          <div className="grow">
            <Field label="Make">
              <input className="input" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
            </Field>
          </div>
          <div className="grow">
            <Field label="Model">
              <input className="input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Corolla" />
            </Field>
          </div>
        </div>
        <div className="row gap-10">
          <div className="grow">
            <Field label="Year">
              <input className="input" value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" placeholder="2018" />
            </Field>
          </div>
          <div className="grow">
            <Field label="Plate number">
              <input
                className="input"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="LAG 482 XA"
              />
            </Field>
          </div>
        </div>
        <Field label="Odometer (km)">
          <input
            className="input"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value.replace(/[^\d]/g, ''))}
            inputMode="numeric"
            placeholder="72,480"
          />
        </Field>

        <div>
          <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            <GasPump size={13} weight="bold" style={{ marginRight: 5, verticalAlign: -1 }} />
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

        {error && <p style={{ fontSize: 12, fontWeight: 700, color: '#d03434' }}>{error}</p>}

        <Btn full size="lg" onClick={submit} iconRight={<ArrowRight size={18} weight="bold" />} className="mt-8">
          Create my garage
        </Btn>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', display: 'flex', justifyContent: 'center', gap: 6 }}>
          <SteeringWheel size={14} weight="duotone" /> You can edit all of this later in Settings.
        </p>
      </div>
    </motion.div>
  )
}
