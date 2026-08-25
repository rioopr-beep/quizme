'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SECTORS = [
  'financial', 'cryptography', 'linguistics', 'translation', 'physics',
  'psychology', 'curiosities', 'mathematics', 'chemistry', 'biology',
  'computer_science', 'astronomy', 'earth_science', 'economics',
  'civil_engineering', 'mechanical_engineering', 'electrical_engineering',
  'software_engineering', 'industrial_engineering', 'aerospace_engineering',
  'automotive_engineering', 'environmental_engineering',
  'football', 'basketball', 'badminton', 'olympics_history', 'tennis',
  'esports', 'motorsport', 'general_sports',
]

const DIFFICULTIES = ['foundational', 'intermediate', 'advanced']

export default function ContributePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ status: string; reason: string } | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    sector: '',
    difficulty: '',
    prompt_id: '', prompt_en: '',
    context_id: '', context_en: '',
    optA_id: '', optA_en: '',
    optB_id: '', optB_en: '',
    optC_id: '', optC_en: '',
    optD_id: '', optD_en: '',
    correct_option: '',
    summary_id: '', summary_en: '',
    reasoning_id: '', reasoning_en: '', // dipisah per baris
    reference_url: '', reference_title: '',
    contributor_display_name: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setResult(null)

    const payload = {
      sector: form.sector,
      difficulty: form.difficulty,
      prompt_id: form.prompt_id,
      prompt_en: form.prompt_en,
      context_id: form.context_id,
      context_en: form.context_en,
      options_id: { A: form.optA_id, B: form.optB_id, C: form.optC_id, D: form.optD_id },
      options_en: { A: form.optA_en, B: form.optB_en, C: form.optC_en, D: form.optD_en },
      correct_option: form.correct_option,
      dossier: {
        summary: { id: form.summary_id, en: form.summary_en },
        reasoning: {
          id: form.reasoning_id.split('\n').filter(Boolean),
          en: form.reasoning_en.split('\n').filter(Boolean),
        },
        references: [{ url: form.reference_url, title: form.reference_title }],
      },
      contributor_display_name: form.contributor_display_name,
    }

    try {
      const res = await fetch('/api/contributor/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal submit, coba lagi')
      } else {
        setResult({ status: data.status, reason: data.ai_reason })
      }
    } catch {
      setError('Gagal konek ke server')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-10 rounded-2xl bg-white shadow-sm">
        {result.status === 'pending' ? (
          <>
            <h2 className="text-xl font-bold text-slate-800">Soal berhasil dikirim 🎉</h2>
            <p className="mt-2 text-slate-600">
              Soal kamu lolos pengecekan awal dan sekarang lagi ditinjau tim admin.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-red-600">Soal belum bisa diterima</h2>
            <p className="mt-2 text-slate-600">{result.reason}</p>
          </>
        )}
        <button
          onClick={() => { setResult(null); router.refresh() }}
          className="mt-6 px-4 py-2 rounded-xl bg-blue-900 text-white"
        >
          Kirim soal lain
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 pb-24 space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Kontribusi Soal</h1>

      <section className="space-y-3">
        <label className="block text-sm font-medium">Topik</label>
        <select required value={form.sector} onChange={e => update('sector', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200">
          <option value="">Pilih topik</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="block text-sm font-medium">Tingkat Kesulitan</label>
        <select required value={form.difficulty} onChange={e => update('difficulty', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200">
          <option value="">Pilih tingkat</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-medium">Cerita/Konteks Soal (ID)</label>
        <textarea required value={form.context_id} onChange={e => update('context_id', e.target.value)}
          rows={3} className="w-full p-3 rounded-xl border border-slate-200" />

        <label className="block text-sm font-medium">Context (EN)</label>
        <textarea required value={form.context_en} onChange={e => update('context_en', e.target.value)}
          rows={3} className="w-full p-3 rounded-xl border border-slate-200" />

        <label className="block text-sm font-medium">Pertanyaan (ID)</label>
        <textarea required value={form.prompt_id} onChange={e => update('prompt_id', e.target.value)}
          rows={2} className="w-full p-3 rounded-xl border border-slate-200" />

        <label className="block text-sm font-medium">Question (EN)</label>
        <textarea required value={form.prompt_en} onChange={e => update('prompt_en', e.target.value)}
          rows={2} className="w-full p-3 rounded-xl border border-slate-200" />
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-medium">Pilihan Jawaban</label>
        {(['A', 'B', 'C', 'D'] as const).map(letter => (
          <div key={letter} className="grid grid-cols-2 gap-2">
            <input required placeholder={`Opsi ${letter} (ID)`}
              value={form[`opt${letter}_id` as keyof typeof form]}
              onChange={e => update(`opt${letter}_id`, e.target.value)}
              className="p-3 rounded-xl border border-slate-200" />
            <input required placeholder={`Option ${letter} (EN)`}
              value={form[`opt${letter}_en` as keyof typeof form]}
              onChange={e => update(`opt${letter}_en`, e.target.value)}
              className="p-3 rounded-xl border border-slate-200" />
          </div>
        ))}

        <label className="block text-sm font-medium">Jawaban Benar</label>
        <select required value={form.correct_option} onChange={e => update('correct_option', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200">
          <option value="">Pilih</option>
          <option value="A">A</option><option value="B">B</option>
          <option value="C">C</option><option value="D">D</option>
        </select>
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-medium">Ringkasan Penjelasan (ID)</label>
        <textarea required value={form.summary_id} onChange={e => update('summary_id', e.target.value)}
          rows={2} className="w-full p-3 rounded-xl border border-slate-200" />
        <label className="block text-sm font-medium">Summary (EN)</label>
        <textarea required value={form.summary_en} onChange={e => update('summary_en', e.target.value)}
          rows={2} className="w-full p-3 rounded-xl border border-slate-200" />

        <label className="block text-sm font-medium">Penalaran, 1 langkah per baris (ID)</label>
        <textarea required value={form.reasoning_id} onChange={e => update('reasoning_id', e.target.value)}
          rows={3} className="w-full p-3 rounded-xl border border-slate-200" />
        <label className="block text-sm font-medium">Reasoning, one step per line (EN)</label>
        <textarea required value={form.reasoning_en} onChange={e => update('reasoning_en', e.target.value)}
          rows={3} className="w-full p-3 rounded-xl border border-slate-200" />

        <label className="block text-sm font-medium">Link Sumber</label>
        <input required value={form.reference_url} onChange={e => update('reference_url', e.target.value)}
          placeholder="https://..." className="w-full p-3 rounded-xl border border-slate-200" />
        <input required value={form.reference_title} onChange={e => update('reference_title', e.target.value)}
          placeholder="Judul sumber" className="w-full p-3 rounded-xl border border-slate-200" />
      </section>

      <section>
        <label className="block text-sm font-medium">Nama kamu (ditampilkan sebagai pembuat soal)</label>
        <input required value={form.contributor_display_name}
          onChange={e => update('contributor_display_name', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200" />
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-xl bg-blue-900 text-white font-medium disabled:opacity-50">
        {submitting ? 'Mengirim...' : 'Kirim Soal'}
      </button>
    </form>
  )
}
