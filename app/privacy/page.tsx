import Link from 'next/link';

export const metadata = {
  title: 'Kebijakan Privasi — QuizFrend',
  description: 'Kebijakan privasi QuizFrend: data apa yang kami kumpulkan dan bagaimana kami menggunakannya.',
};

export default function PrivacyPolicyPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-indigo-900 hover:underline">
          ← Kembali
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Kebijakan Privasi</h1>
        <p className="mt-1 text-sm text-slate-400">Terakhir diperbarui: Agustus 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">1. Data yang Kami Kumpulkan</h2>
            <p>
              Saat mendaftar, kami menyimpan alamat email, nama pengguna, dan foto profil (jika kamu
              unggah). Kami juga mencatat aktivitas belajar seperti topik yang dipelajari, jawaban kuis,
              skor, dan riwayat check-in harian untuk menampilkan progres dan statistikmu.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">2. Cara Kami Menggunakan Data</h2>
            <p>
              Data digunakan untuk menjalankan fitur inti aplikasi: menyimpan progres belajar, menghitung
              streak dan leaderboard, serta menampilkan riwayat kuismu. Kami tidak menjual data pribadi
              kepada pihak ketiga.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">3. Login dengan Google</h2>
            <p>
              Jika kamu masuk menggunakan akun Google, kami hanya menerima informasi dasar yang diizinkan
              (nama, email, foto profil) untuk membuat akunmu di QuizFrend.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">4. Komentar dan Laporan Soal</h2>
            <p>
              Komentar diskusi dan laporan soal yang kamu kirim tersimpan bersama nama akunmu agar diskusi
              tetap bertanggung jawab, dan bisa ditinjau oleh tim kami.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">5. Penyimpanan Data</h2>
            <p>
              Data disimpan menggunakan penyedia infrastruktur pihak ketiga (Supabase) dengan praktik
              keamanan standar industri. Kamu dapat meminta penghapusan akun dan data terkait kapan saja.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">6. Hubungi Kami</h2>
            <p>
              Pertanyaan seputar privasi bisa disampaikan lewat fitur laporan di dalam aplikasi.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
