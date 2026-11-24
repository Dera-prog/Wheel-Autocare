import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  MapPin,
  NavigationArrow,
  Phone,
  Siren,
  Star,
  WhatsappLogo,
  Wrench
} from '@phosphor-icons/react'
import { MECHANICS } from '../seed'
import { Avatar, Chip, ScreenHeader, StatusPill } from '../ui'

type Filter = 'all' | 'open' | 'engine' | 'tyres' | 'electrical' | 'brakes' | 'ac'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All workshops' },
  { value: 'open', label: 'Open now' },
  { value: 'engine', label: 'Engine' },
  { value: 'tyres', label: 'Tyres' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'ac', label: 'AC' }
]

export default function Mechanics() {
  const [filter, setFilter] = useState<Filter>('all')

  const list = useMemo(() => {
    return MECHANICS.filter((m) => {
      if (filter === 'all') return true
      if (filter === 'open') return m.open
      return m.services.some((s) => s.toLowerCase().includes(filter))
    }).sort((a, b) => a.distanceKm - b.distanceKm)
  }, [filter])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <ScreenHeader title="Mechanics near you" sub="Lagos · verified workshops" />

      <div className="map-banner">
        <img src="/assets/garage.webp" alt="A workshop in Lagos" />
        <span className="map-banner-badge">
          <MapPin size={14} weight="fill" color="var(--brand)" />
          {MECHANICS.length} workshops · within 10 km
        </span>
      </div>

      <div className="chip-row mt-14">
        {FILTERS.map((f) => (
          <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>

      <div className="pad-20" style={{ marginTop: 12 }}>
        {list.map((m, i) => (
          <motion.div
            key={m.id}
            className="mech-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="mech-top">
              <Avatar name={m.name} size={46} hue={m.hue} />
              <div className="mech-main">
                <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <h4>{m.name}</h4>
                  <StatusPill kind={m.open ? 'open' : 'closed'}>{m.open ? 'Open' : 'Closed'}</StatusPill>
                </div>
                <div className="mech-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#b8791a', fontWeight: 800 }}>
                    <Star size={12} weight="fill" />
                    {m.rating.toFixed(1)}
                  </span>
                  <span>({m.reviews})</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={12} weight="bold" /> {m.distanceKm} km
                  </span>
                  <span>· {m.area}</span>
                </div>
                <div className="mech-meta" style={{ marginTop: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} weight="bold" /> {m.hours}
                  </span>
                </div>
                <div className="mech-services">
                  {m.services.map((s) => (
                    <span className="mech-tag" key={s}>
                      {s}
                    </span>
                  ))}
                  {m.makes[0] !== 'All makes' && <span className="mech-tag">{m.makes.join(' · ')}</span>}
                </div>
              </div>
            </div>
            <div className="mech-actions">
              <a className="mech-action primary" href={`tel:${m.phone}`}>
                <Phone size={14} weight="fill" /> Call
              </a>
              <a
                className="mech-action"
                href={`https://wa.me/${m.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hi ${m.name}, I found you on WheelWell AutoCare. I'd like to book a service.`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappLogo size={14} weight="fill" /> WhatsApp
              </a>
              <a
                className="mech-action"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.name}, ${m.address}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <NavigationArrow size={14} weight="fill" /> Directions
              </a>
            </div>
          </motion.div>
        ))}

        {list.length === 0 && (
          <div
            style={{
              padding: 26,
              borderRadius: 20,
              border: '1px solid var(--line)',
              background: '#fff',
              textAlign: 'center'
            }}
          >
            <Wrench size={28} weight="duotone" color="var(--brand)" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13.5, fontWeight: 800 }}>No workshops with that specialty nearby</p>
            <p style={{ marginTop: 4, fontSize: 11.5, color: 'var(--muted)' }}>Try another filter or all workshops.</p>
          </div>
        )}

        <a
          href="tel:112"
          className="att-row"
          style={{ marginTop: 8, textDecoration: 'none', color: 'inherit', background: '#fff6f6', borderColor: '#f7dede' }}
        >
          <span className="att-icon tone-danger">
            <Siren size={20} weight="duotone" />
          </span>
          <span className="att-main">
            <strong>Road emergency? Call 112</strong>
            <span>Nigeria's national emergency line — free from any network.</span>
          </span>
          <Phone size={17} weight="bold" color="#d03434" />
        </a>

        <p style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted-2)', marginTop: 18, lineHeight: 1.5 }}>
          Workshop listings are demo data for this build. Always call ahead before you drive out.
        </p>
      </div>
    </motion.div>
  )
}
