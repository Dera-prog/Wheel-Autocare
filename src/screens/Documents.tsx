import { useEffect, useRef, useState } from 'react'
import {
  ArrowsClockwise,
  CalendarBlank,
  CarProfile,
  CheckCircle,
  FileText,
  IdentificationCard,
  SealCheck,
  ShareNetwork,
  ShieldCheck,
  Sparkle
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useStore } from '../store'
import type { DocType, VehicleDocument } from '../types'
import {
  DOC_META,
  STATUS_LABEL,
  docDaysLabel,
  docStatus,
  fileToDataUrl,
  fmtDate,
  pendingAlerts,
  todayISO
} from '../lib'
import { Btn, Field, Sheet, StatusPill, useToast } from '../ui'

export const DOC_ICON: Record<DocType, Icon> = {
  licence: IdentificationCard,
  registration: CarProfile,
  insurance: ShieldCheck,
  inspection: SealCheck,
  other: FileText
}

export function DocGlyph({ type, size = 20 }: { type: DocType; size?: number }) {
  const Glyph = DOC_ICON[type]
  return <Glyph size={size} weight="duotone" />
}

const TYPES: DocType[] = ['licence', 'registration', 'insurance', 'inspection', 'other']

export type ComposerState = { mode: 'new'; type?: DocType } | { mode: 'edit'; id: string } | null

export function DocComposer({
  state,
  onClose,
  onView
}: {
  state: ComposerState
  onClose: () => void
  onView: (id: string) => void
}) {
  const { state: app, addDocument, updateDocument } = useStore()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const editing = state?.mode === 'edit' ? app.documents.find((d) => d.id === state.id) ?? null : null

  const [type, setType] = useState<DocType>('insurance')
  const [label, setLabel] = useState('')
  const [number, setNumber] = useState('')
  const [issued, setIssued] = useState('')
  const [expiry, setExpiry] = useState('')
  const [fileName, setFileName] = useState<string | undefined>()
  const [dataUrl, setDataUrl] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!state) return
    setError('')
    setBusy(false)
    if (editing) {
      setType(editing.type)
      setLabel(editing.label)
      setNumber(editing.number ?? '')
      setIssued(editing.issued ?? '')
      setExpiry(editing.expiry)
      setFileName(editing.fileName)
      setDataUrl(editing.dataUrl)
    } else {
      const preset = state.mode === 'new' && state.type ? state.type : 'insurance'
      setType(preset)
      setLabel(DOC_META[preset].label)
      setNumber('')
      setIssued(todayISO())
      setExpiry('')
      setFileName(undefined)
      setDataUrl(undefined)
    }
  }, [state])

  const pickType = (t: DocType) => {
    setType(t)
    setLabel(DOC_META[t].label)
  }

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError('')
    const url = await fileToDataUrl(file)
    setBusy(false)
    if (!url) {
      setError('That file type cannot be previewed here. Choose a JPG or PNG photo.')
      return
    }
    setDataUrl(url)
    setFileName(file.name)
  }

  const alerts = expiry ? pendingAlerts(expiry) : []

  const save = () => {
    if (!label.trim()) {
      setError('Give this document a name.')
      return
    }
    if (!expiry) {
      setError('Add an expiry date so reminders can be scheduled.')
      return
    }
    const payload = {
      type,
      label: label.trim(),
      number: number.trim() || undefined,
      issued: issued || undefined,
      expiry,
      fileName,
      dataUrl
    }
    if (editing) {
      updateDocument(editing.id, payload)
      toast('Document updated', `${payload.label} · ${docDaysLabel(expiry)}`, 'success')
      onClose()
      return
    }
    const created = addDocument(payload)
    toast('Saved to your vault', `${payload.label} · reminders set`, 'success')
    onClose()
    onView(created.id)
  }

  return (
    <Sheet
      open={!!state}
      onClose={onClose}
      title={editing ? 'Renew document' : 'Add a document'}
      subtitle={editing ? 'New dates restart the reminder countdown' : 'Photo or paper copy — stays on this device'}
      tall
      footer={
        <Btn full size="lg" onClick={save} loading={busy} iconLeft={<CheckCircle size={18} weight="fill" />}>
          {editing ? 'Save renewal' : 'Save to vault'}
        </Btn>
      }
    >
      <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>
        Document type
      </span>
      <div className="type-grid">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`type-opt ${type === t ? 'is-active' : ''}`}
            onClick={() => pickType(t)}
          >
            <span
              className="type-dot"
              style={{
                background: `hsl(${DOC_META[t].hue} 90% 94%)`,
                color: `hsl(${DOC_META[t].hue} 65% 42%)`
              }}
            >
              <DocGlyph type={t} size={15} />
            </span>
            {DOC_META[t].short}
          </button>
        ))}
      </div>

      <div className="stack gap-12 mt-14">
        <Field label="Document name">
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Comprehensive cover" />
        </Field>
        <Field label="Document number" hint="optional">
          <input className="input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Policy / certificate number" />
        </Field>
        <div className="row gap-10">
          <div className="grow">
            <Field label="Issued" hint="optional">
              <input className="input" type="date" value={issued} onChange={(e) => setIssued(e.target.value)} />
            </Field>
          </div>
          <div className="grow">
            <Field label="Expires">
              <input className="input" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </Field>
          </div>
        </div>

        <div>
          <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Photo copy <em>optional</em>
          </span>
          {dataUrl ? (
            <div className="file-preview">
              <img src={dataUrl} alt={fileName ?? 'Document preview'} />
              <div className="grow">
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName ?? 'Document photo'}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', marginTop: 3 }}>
                  Stored on this device
                </div>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                Replace
              </Btn>
            </div>
          ) : (
            <button type="button" className="upload" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Sparkle size={20} weight="fill" />
              {busy ? 'Compressing photo…' : 'Add a photo of this document'}
              <small>JPG or PNG · compressed before it is stored</small>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              void pickFile(f)
            }}
          />
        </div>

        {expiry && (
          <div>
            <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>
              Reminders scheduled
            </span>
            {alerts.length > 0 ? (
              <div className="alert-list">
                {alerts.map((a) => (
                  <div className="alert-item" key={a.offset}>
                    <CalendarBlank size={15} weight="bold" color="var(--brand)" />
                    {a.offset === 0 ? 'On expiry day' : a.offset === 1 ? '1 day after expiry' : `${a.offset} days before expiry`}
                    <time>{fmtDate(a.date, 'short')}</time>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                This date has passed every reminder point. Pick a future expiry to restart alerts.
              </p>
            )}
          </div>
        )}

        {error && <p className="auth-error" style={{ color: '#d03434', marginTop: 0 }}>{error}</p>}
      </div>
    </Sheet>
  )
}

export function DocViewer({
  doc,
  onClose,
  onEdit
}: {
  doc: VehicleDocument | null
  onClose: () => void
  onEdit: (id: string) => void
}) {
  const { state, archiveDocument, deleteDocument } = useStore()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)

  useEffect(() => setConfirming(false), [doc?.id])

  const status = doc ? docStatus(doc.expiry) : 'active'
  const alerts = doc ? pendingAlerts(doc.expiry) : []

  const share = async () => {
    if (!doc) return
    const text = `${doc.label}${doc.number ? ` · ${doc.number}` : ''} — expires ${fmtDate(doc.expiry, 'long')} (${docDaysLabel(doc.expiry)})`
    if (navigator.share) {
      try {
        await navigator.share({ title: doc.label, text })
        return
      } catch {
        return
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      toast('Summary copied', 'Paste it into WhatsApp or email', 'success')
    } catch {
      toast('Could not share', 'Clipboard is not available in this browser', 'danger')
    }
  }

  const remove = () => {
    if (!doc) return
    deleteDocument(doc.id)
    toast('Document deleted', doc.label)
    onClose()
  }

  return (
    <Sheet
      open={!!doc}
      onClose={onClose}
      title={doc?.label}
      subtitle={doc ? `${DOC_META[doc.type].label} · ${STATUS_LABEL[status]}` : undefined}
      tall
      footer={
        doc && (
          <div className="row gap-8">
            <Btn variant="soft" full onClick={() => onEdit(doc.id)} iconLeft={<ArrowsClockwise size={17} weight="bold" />}>
              Renew
            </Btn>
            <Btn full onClick={() => void share()} iconLeft={<ShareNetwork size={17} weight="bold" />}>
              Share
            </Btn>
          </div>
        )
      }
    >
      {doc && (
        <>
          <div className="doc-viewer">
            <div className="doc-viewer-media">
              {doc.dataUrl ? (
                <img src={doc.dataUrl} alt={doc.label} />
              ) : (
                <div className="doc-paper">
                  <div className="doc-paper-head">
                    <b>{DOC_META[doc.type].label}</b>
                    <DocGlyph type={doc.type} size={22} />
                  </div>
                  <div className="doc-paper-row">
                    <span>Holder</span>
                    <strong>{state.profile?.name ?? 'WheelWell owner'}</strong>
                  </div>
                  <div className="doc-paper-row">
                    <span>Document no.</span>
                    <strong>{doc.number ?? '—'}</strong>
                  </div>
                  <div className="doc-paper-row">
                    <span>Vehicle</span>
                    <strong>{state.vehicle ? `${state.vehicle.make} ${state.vehicle.model} · ${state.vehicle.plate}` : '—'}</strong>
                  </div>
                  <div className="doc-paper-row">
                    <span>Issued</span>
                    <strong>{doc.issued ? fmtDate(doc.issued, 'mid') : '—'}</strong>
                  </div>
                  <div className="doc-paper-row" style={{ borderBottom: 0 }}>
                    <span>Expires</span>
                    <strong>{fmtDate(doc.expiry, 'mid')}</strong>
                  </div>
                  <div className="doc-paper-seal">
                    On-device
                    <br />
                    copy
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row gap-8" style={{ marginBottom: 14 }}>
            <StatusPill kind={doc.archived ? 'scheduled' : status}>
              {doc.archived ? 'Archived' : STATUS_LABEL[status]}
            </StatusPill>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{docDaysLabel(doc.expiry)}</span>
          </div>

          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="field-label">Reminder schedule</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>30 · 15 · 7 · 0 · +1 days</span>
          </div>
          {alerts.length > 0 ? (
            <div className="alert-list" style={{ marginTop: 0 }}>
              {alerts.map((a) => (
                <div className="alert-item" key={a.offset}>
                  <CalendarBlank size={15} weight="bold" color="var(--brand)" />
                  {a.offset === 0 ? 'Expiry day alert' : a.offset === 1 ? 'Day-after follow-up' : `${a.offset}-day warning`}
                  <time>{fmtDate(a.date, 'short')}</time>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No reminders left on this expiry date.</p>
          )}

          <div style={{ marginTop: 16 }}>
            {confirming ? (
              <div className="row gap-8">
                <span className="grow" style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                  Delete this document for good?
                </span>
                <Btn variant="danger" size="sm" onClick={remove}>
                  Delete
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Keep
                </Btn>
              </div>
            ) : (
              <div className="row gap-8">
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    archiveDocument(doc.id)
                    toast(doc.archived ? 'Document restored' : 'Document archived', doc.label)
                  }}
                >
                  {doc.archived ? 'Restore' : 'Archive'}
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                  Delete
                </Btn>
              </div>
            )}
          </div>
        </>
      )}
    </Sheet>
  )
}
