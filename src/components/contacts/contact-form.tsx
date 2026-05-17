'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createContact } from '@/app/(dashboard)/dashboard/contacts/actions'
import { CONTACT_STATUSES, PRESET_TAGS, FREE_CONTACT_LIMIT } from '@/db/schema'

const INPUT = 'w-full rounded-md border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-2 text-[13px] text-[oklch(18%_0.012_254)] outline-none transition focus:border-[oklch(52%_0.245_265)] focus:bg-white focus:ring-2 focus:ring-[oklch(93%_0.04_265)] placeholder:text-[oklch(68%_0.016_254)]'
const LABEL = 'block text-[11px] font-700 uppercase tracking-[0.6px] text-[oklch(55%_0.020_254)] mb-1.5'
const HINT = 'text-[10px] text-[oklch(68%_0.016_254)] mt-1'

const PRESET_SOURCES = ['Facebook', 'Referral', 'Walk-in', 'เพื่อน/ครอบครัว', 'Online', 'Other']

function val(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string ?? '').trim()
  return v === '' || v === '-' ? null : v
}

export function ContactForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [extraSources, setExtraSources] = useState<string[]>([])
  const [showAddSource, setShowAddSource] = useState(false)
  const [newSource, setNewSource] = useState('')
  const [showStatusHint, setShowStatusHint] = useState(false)
  const [showInsurance, setShowInsurance] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function addCustomTag() {
    const t = customTag.trim()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setCustomTag('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)

    const source = selectedSource || null

    try {
      await createContact({
        name: val(fd, 'name')!,
        phone: val(fd, 'phone')!,
        lineId: val(fd, 'lineId'),
        email: val(fd, 'email'),
        status: val(fd, 'status') ?? 'Prospect',
        source,
        interestedProduct: val(fd, 'interestedProduct'),
        estimatedValue: fd.get('estimatedValue') ? String(Number(fd.get('estimatedValue'))) : null,
        nextFollowUpDate: val(fd, 'nextFollowUpDate'),
        notes: val(fd, 'notes'),
        tags,
        insuranceCompany: val(fd, 'insuranceCompany'),
        policyNumber: val(fd, 'policyNumber'),
        annualPremium: fd.get('annualPremium') ? String(Number(fd.get('annualPremium'))) : null,
        premiumDueDate: val(fd, 'premiumDueDate'),
      })
      router.push('/dashboard/contacts')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(msg.startsWith('CONTACT_LIMIT_REACHED')
        ? `ถึงขีดจำกัด Free tier (${FREE_CONTACT_LIMIT} contacts) — กรุณาอัปเกรด Pro`
        : msg)
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-lg border border-[oklch(90%_0.014_254)] p-6">
      {error && (
        <div className="mb-4 rounded-md bg-[oklch(95%_0.040_25)] border border-[oklch(88%_0.06_25)] px-4 py-3 text-[13px] font-600 text-[oklch(44%_0.21_25)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={LABEL}>ชื่อ *</label>
          <input name="name" required placeholder="นายก สมใจ" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>เบอร์โทร *</label>
          <input name="phone" required placeholder="081-234-5678" pattern="[0-9]{9,10}" className={INPUT} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={LABEL}>LINE ID</label>
          <input name="lineId" placeholder="line_id หรือพิม -" className={INPUT} />
          <p className={HINT}>ไม่มีให้พิม -</p>
        </div>
        <div>
          <label className={LABEL}>อีเมล</label>
          <input name="email" type="text" placeholder="email@example.com หรือพิม -" className={INPUT}
            onKeyDown={e => {
              const inp = e.currentTarget
              if ((e.key === 'Enter' || e.key === 'Tab') && inp.value.trim() === '-') {
                e.preventDefault()
                inp.value = ''
                const form = inp.form
                if (form) {
                  const els = Array.from(form.elements) as HTMLElement[]
                  const idx = els.indexOf(inp)
                  els[idx + 1]?.focus()
                }
              }
            }}
          />
          <p className={HINT}>ไม่มีให้พิม -</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-[11px] font-700 uppercase tracking-[0.6px] text-[oklch(55%_0.020_254)]">Status</label>
            <div className="relative">
              <button type="button" onClick={() => setShowStatusHint(v => !v)}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-[oklch(92%_0.010_254)] text-[oklch(58%_0.018_254)] hover:bg-[oklch(88%_0.014_254)] transition-colors text-[9px] font-800">
                ?
              </button>
              {showStatusHint && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusHint(false)} />
                  <div className="absolute left-0 bottom-6 z-20 w-64 rounded-xl border border-[oklch(88%_0.014_254)] bg-white/90 backdrop-blur-sm shadow-lg px-3 py-2.5 space-y-1.5">
                    <div className="absolute -bottom-1.5 left-2 w-3 h-3 rotate-45 border-r border-b border-[oklch(88%_0.014_254)] bg-white/90" />
                    {[
                      ['Lead', 'ได้ชื่อ/เบอร์มา ยังไม่ได้คุย'],
                      ['Prospect', 'คุยแล้ว สนใจ กำลัง follow-up'],
                      ['Appointment', 'นัดพบแล้ว รอวันนัด'],
                      ['Proposal', 'เสนอแผนแล้ว รอตัดสินใจ'],
                      ['Client', 'ซื้อแล้ว เป็นลูกค้า'],
                      ['Lost', 'ไม่สนใจ / หมดหวัง'],
                    ].map(([s, desc]) => (
                      <div key={s} className="flex gap-2 text-[11px]">
                        <span className="font-700 text-[oklch(30%_0.020_254)] w-20 shrink-0">{s}</span>
                        <span className="text-[oklch(58%_0.016_254)]">{desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <select name="status" defaultValue="Prospect" className={INPUT}>
            {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>แหล่งที่มา</label>
          <div className="flex gap-2">
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className={INPUT}
            >
              <option value="">— เลือก —</option>
              {[...PRESET_SOURCES, ...extraSources].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setShowAddSource(v => !v)}
              className="flex-shrink-0 px-2.5 rounded-md border border-[oklch(90%_0.014_254)] text-[12px] font-700 text-[oklch(52%_0.245_265)] hover:bg-[oklch(96%_0.020_265)] transition-colors"
            >
              + เพิ่ม
            </button>
          </div>
          {showAddSource && (
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                placeholder="แหล่งที่มาใหม่..."
                className="flex-1 rounded-md border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-1.5 text-[12px] outline-none focus:border-[oklch(52%_0.245_265)]"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const v = newSource.trim()
                    if (v && ![...PRESET_SOURCES, ...extraSources].includes(v)) {
                      setExtraSources(prev => [...prev, v])
                      setSelectedSource(v)
                    }
                    setNewSource('')
                    setShowAddSource(false)
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const v = newSource.trim()
                  if (v && ![...PRESET_SOURCES, ...extraSources].includes(v)) {
                    setExtraSources(prev => [...prev, v])
                    setSelectedSource(v)
                  }
                  setNewSource('')
                  setShowAddSource(false)
                }}
                className="rounded-md bg-[oklch(52%_0.245_265)] px-3 py-1.5 text-[12px] font-700 text-white hover:bg-[oklch(46%_0.245_265)] transition-colors"
              >
                บันทึก
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={LABEL}>สินค้าที่สนใจ</label>
          <input name="interestedProduct" placeholder="AIA H&S Extra หรือพิม -" className={INPUT} />
          <p className={HINT}>ไม่มีให้พิม -</p>
        </div>
        <div>
          <label className={LABEL}>มูลค่าประมาณการ (บาท/ปี)</label>
          <input name="estimatedValue" type="number" min="0" placeholder="18000" className={INPUT} />
        </div>
      </div>

      <div className="mb-4">
        <label className={LABEL}>Follow-up ครั้งถัดไป</label>
        <input name="nextFollowUpDate" type="date" className={INPUT} />
      </div>

      {/* Insurance fields — collapsible */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowInsurance(v => !v)}
          className="flex items-center gap-2 text-[12px] font-600 text-[oklch(42%_0.20_265)] hover:text-[oklch(32%_0.20_265)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: showInsurance ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          {showInsurance ? 'ซ่อนข้อมูลประกัน' : '+ เพิ่มข้อมูลประกัน (ไม่บังคับ)'}
        </button>

        {showInsurance && (
          <div className="mt-3 rounded-lg border border-[oklch(88%_0.06_265)] bg-[oklch(97.5%_0.015_265)] p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={LABEL}>บริษัทประกัน</label>
                <input name="insuranceCompany" placeholder="AIA, FWD, Prudential..." className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>เลขกรมธรรม์</label>
                <input name="policyNumber" placeholder="P-XXXXXXXXX" className={INPUT} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>เบี้ยต่อปี (฿)</label>
                <input name="annualPremium" type="number" min="0" placeholder="18000" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>วันครบเบี้ยถัดไป</label>
                <input name="premiumDueDate" type="date" className={INPUT} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className={LABEL}>แท็ก</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {[...PRESET_TAGS, ...tags.filter(t => !PRESET_TAGS.includes(t as typeof PRESET_TAGS[number]))].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-md px-3 py-1.5 text-[12px] font-600 border transition-all ${
                tags.includes(tag)
                  ? 'bg-[oklch(93%_0.04_265)] border-[oklch(70%_0.10_265)] text-[oklch(42%_0.20_265)]'
                  : 'bg-[oklch(98.2%_0.006_254)] border-[oklch(90%_0.014_254)] text-[oklch(55%_0.020_254)] hover:border-[oklch(80%_0.020_254)]'
              }`}
            >
              {tag} {tags.includes(tag) && '×'}
            </button>
          ))}
        </div>
        {/* Custom tag input */}
        <div className="flex gap-2">
          <input
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
            placeholder="เพิ่มแท็กเอง..."
            className={INPUT + ' flex-1'}
          />
          <button
            type="button"
            onClick={addCustomTag}
            className="px-3 rounded-md border border-[oklch(90%_0.014_254)] text-[12px] font-600 text-[oklch(52%_0.245_265)] hover:bg-[oklch(96%_0.020_265)] transition-colors"
          >
            + เพิ่ม
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className={LABEL}>หมายเหตุ</label>
        <textarea name="notes" rows={3} placeholder="โน้ตเพิ่มเติม..." className={INPUT + ' resize-none'} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md border border-[oklch(90%_0.014_254)] text-[13px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 rounded-md bg-[oklch(52%_0.245_265)] text-white text-[13px] font-700 hover:bg-[oklch(46%_0.245_265)] transition-colors disabled:opacity-60"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึก Contact'}
        </button>
      </div>
    </form>
  )
}
