import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CaretRight,
  Files,
  Fingerprint,
  LockSimple,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  X
} from '@phosphor-icons/react'
import { useStore } from '../store'
import type { DocType, VehicleDocument } from '../types'
import { DOC_META, docDaysLabel, docStatus } from '../lib'
import { IconBtn, useToast } from '../ui'
import { DocGlyph } from './Documents'

const TYPES: DocType[] = ['licence', 'registration', 'insurance', 'inspection', 'other']
const PILL: Record<string, string> = {
  active: 'vp-active',
  soon: 'vp-soon',
  expired: 'vp-expired',
  archived: 'vp-active'
}

export default function Vault({
  onOpenDoc,
  onNewDoc
}: {
  onOpenDoc: (id: string) => void
  onNewDoc: () => void
}) {
  const { state } = useStore()
  const toast = useToast()
  const [folder, setFolder] = useState<'all' | DocType>('all')
  const [query, setQuery] = useState('')

  const docs = state.documents
  const active = docs.filter((d) => !d.archived)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return docs.filter((d) => {
      if (folder !== 'all' && d.type !== folder) return false
      if (!q) return true
      return (
        d.label.toLowerCase().includes(q) ||
        DOC_META[d.type].label.toLowerCase().includes(q) ||
        (d.number ?? '').toLowerCase().includes(q)
      )
    })
  }, [docs, folder, query])

  const groups: { title: string; items: VehicleDocument[] }[] = [
    { title: 'Expired', items: visible.filter((d) => !d.archived && docStatus(d.expiry) === 'expired') },
    {
      title: 'Expiring soon',
      items: visible.filter((d) => !d.archived && docStatus(d.expiry) === 'soon')
    },
    { title: 'Active', items: visible.filter((d) => !d.archived && docStatus(d.expiry) === 'active') },
    { title: 'Archived', items: visible.filter((d) => d.archived) }
  ].filter((g) => g.items.length > 0)

  const needAction = active.filter((d) => docStatus(d.expiry) !== 'active').length

  return (
    <motion.div className="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="vault-head">
        <span className="vault-title">
          <LockSimple size={16} weight="fill" />
          Document Vault
        </span>
        <div className="vault-head-actions">
          <IconBtn
            label="Vault security"
            tone="glass"
            onClick={() =>
              toast(
                state.settings.biometric ? 'Fingerprint lock is on' : 'Vault is local to this device',
                state.settings.biometric ? 'Unlock is simulated in this web demo' : 'Turn on biometric lock in Settings',
                'default'
              )
            }
          >
            <Fingerprint size={20} weight="duotone" />
          </IconBtn>
          <IconBtn label="Add document" tone="glass" onClick={onNewDoc}>
            <Plus size={20} weight="bold" />
          </IconBtn>
        </div>
      </div>

      <div className="folders-head">
        <h2>
          {active.length} document{active.length === 1 ? '' : 's'}
          {needAction > 0 && (
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, color: '#ffd68a' }}>
              {needAction} need action
            </span>
          )}
        </h2>
        <button type="button" onClick={() => setFolder('all')}>
          {folder === 'all' ? 'Showing all' : 'Clear folder'}
        </button>
      </div>

      <div className="folder-strip">
        <motion.button
          type="button"
          className={`folder-card ${folder === 'all' ? 'is-active' : ''}`}
          onClick={() => setFolder('all')}
          whileTap={{ scale: 0.96 }}
        >
          <div className="folder-icon" style={{ color: 'rgba(255,255,255,0.95)' }}>
            <span className="folder-tab" style={{ background: 'rgba(255,255,255,0.34)' }} />
            <span className="folder-body" style={{ background: 'rgba(255,255,255,0.22)' }} />
            <Files size={19} weight="fill" style={{ position: 'absolute', inset: 0, margin: 'auto', zIndex: 2 }} />
          </div>
          <b>All papers</b>
          <span>{docs.length} files</span>
        </motion.button>

        {TYPES.map((t) => {
          const count = docs.filter((d) => d.type === t).length
          const meta = DOC_META[t]
          return (
            <motion.button
              key={t}
              type="button"
              className={`folder-card ${folder === t ? 'is-active' : ''}`}
              onClick={() => setFolder(t)}
              whileTap={{ scale: 0.96 }}
            >
              <div className="folder-icon" style={{ color: `hsl(${meta.hue} 90% 92%)` }}>
                <span className="folder-tab" style={{ background: `hsl(${meta.hue} 75% 62%)` }} />
                <span className="folder-body" style={{ background: `hsl(${meta.hue} 78% 55%)` }} />
                <DocGlyph type={t} size={18} />
              </div>
              <b>{meta.short}</b>
              <span>
                {count} file{count === 1 ? '' : 's'}
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="vault-search">
        <MagnifyingGlass size={19} weight="bold" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, type or number"
          aria-label="Search documents"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
            <X size={16} weight="bold" />
          </button>
        )}
      </div>

      {docs.length === 0 && (
        <div className="vault-group" style={{ textAlign: 'center', paddingTop: 40 }}>
          <span
            style={{
              display: 'inline-grid',
              placeItems: 'center',
              width: 74,
              height: 74,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.14)',
              marginBottom: 16
            }}
          >
            <ShieldCheck size={34} weight="duotone" />
          </span>
          <h3 style={{ fontSize: 17, display: 'block', color: '#fff', textTransform: 'none', letterSpacing: 0 }}>
            Start with your most urgent paper
          </h3>
          <p style={{ marginTop: 8, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Insurance, roadworthiness and your licence are the ones that cause trouble on the road.
          </p>
          <button
            type="button"
            className="vault-fab"
            style={{ position: 'static', marginTop: 20, display: 'inline-flex' }}
            onClick={onNewDoc}
          >
            <Plus size={17} weight="bold" /> Add my first document
          </button>
        </div>
      )}

      {docs.length > 0 && groups.length === 0 && (
        <div className="vault-group">
          <div
            style={{
              padding: 20,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.14)',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 800 }}>No documents in this folder</p>
            <p style={{ marginTop: 4, fontSize: 11.5, color: 'rgba(255,255,255,0.66)' }}>
              Change the folder or clear your search.
            </p>
          </div>
        </div>
      )}

      {groups.map((group) => (
        <div className="vault-group" key={group.title}>
          <h3>
            {group.title}
            <span>{group.items.length}</span>
          </h3>
          {group.items.map((d, i) => {
            const status = d.archived ? 'archived' : docStatus(d.expiry)
            return (
              <motion.button
                key={d.id}
                type="button"
                className="doc-row"
                onClick={() => onOpenDoc(d.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <span
                  className="doc-row-icon"
                  style={{
                    background: `hsla(${DOC_META[d.type].hue}, 90%, 88%, 0.25)`,
                    color: `hsl(${DOC_META[d.type].hue} 85% 88%)`
                  }}
                >
                  <DocGlyph type={d.type} size={21} />
                </span>
                <span className="doc-row-main">
                  <strong>{d.label}</strong>
                  <span>
                    {DOC_META[d.type].label} · {docDaysLabel(d.expiry)}
                  </span>
                </span>
                <span className={`violet-pill ${PILL[status]}`}>
                  {status === 'active' ? 'Active' : status === 'soon' ? 'Soon' : status === 'expired' ? 'Expired' : 'Archived'}
                </span>
                <CaretRight size={14} weight="bold" style={{ opacity: 0.55 }} />
              </motion.button>
            )
          })}
        </div>
      ))}

      <p style={{ textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.45)', padding: '22px 30px 0', lineHeight: 1.5 }}>
        Stored on this device only. Use the share button in a document to send a summary.
      </p>
    </motion.div>
  )
}
