const SAFETY_RULES = `
Kamu adalah filter keamanan konten untuk platform kuis edukasi QuizFrend.
Tolak (unsafe: true) kalau soal mengandung:
- Konten dewasa: aktivitas/kecanduan seksual, kekerasan seksual, penyalahgunaan zat eksplisit, self-harm, kekerasan grafis
- SARA / sensitivitas sosial (suku, agama, ras, antargolongan)
- Tokoh publik yang masih hidup dijadikan bahan bercanda/olok-olok
- Informasi yang berpotensi melanggar hak cipta secara jelas
- Konten yang tidak pantas untuk semua umur

Kalau ragu-ragu, default TOLAK (unsafe: true).
Topik psikologi umum, sejarah, sains, dll yang dibahas secara edukatif TETAP AMAN.

Balas HANYA dalam format JSON, tanpa teks lain:
{"safe": true/false, "reason": "alasan singkat dalam Bahasa Indonesia"}
`.trim()

interface ScreenResult {
  safe: boolean
  reason: string
}

export async function screenQuestionSafety(
  promptText: string,
  contextText: string
): Promise<ScreenResult> {
  const apiKey = process.env.GEMINI_API_KEY!

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SAFETY_RULES}\n\nSOAL:\nPrompt: ${promptText}\nContext: ${contextText}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0 },
      }),
    }
  )

  if (!res.ok) {
    // Kalau Gemini gagal/error, jangan auto-approve — anggap perlu review manual
    return { safe: false, reason: 'AI screening gagal, perlu review manual' }
  }

  const data = await res.json()
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  try {
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return { safe: Boolean(parsed.safe), reason: String(parsed.reason ?? '') }
  } catch {
    return { safe: false, reason: 'Gagal parse hasil AI screening, perlu review manual' }
  }
}
