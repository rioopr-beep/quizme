import Link from 'next/link';

export const metadata = {
  title: 'Syarat & Ketentuan — QuizFrend',
  description: 'Syarat dan ketentuan penggunaan QuizFrend.',
};

export default function TermsPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-indigo-900 hover:underline">
          ← Kembali
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Syarat &amp; Ketentuan</h1>
        <p className="mt-1 text-sm text-slate-400">Terakhir diperbarui: Agustus 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">1. Tentang QuizFrend</h2>
            <p>
              QuizFrend adalah platform belajar berbasis kuis studi kasus lintas disiplin. Dengan
              menggunakan layanan ini, kamu setuju dengan syarat dan ketentuan di bawah.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">2. Sifat Materi Pembelajaran</h2>
            <p>
              Materi soal dan pembahasan di QuizFrend disusun melalui proses kurasi sumber, penyusunan
              konten, dan pemeriksaan sebelum ditampilkan. Meski begitu, tetap mungkin ada ketidaksesuaian
              pada sebagian kecil konten. Kami menyediakan fitur laporan soal agar kamu bisa membantu kami
              meninjau dan memperbaikinya secara berkelanjutan.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">3. Akun Pengguna</h2>
            <p>
              Kamu bertanggung jawab menjaga kerahasiaan akun dan kata sandimu. Satu akun hanya untuk satu
              pengguna.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">4. Komentar dan Konten Pengguna</h2>
            <p>
              Saat berkomentar di forum diskusi, kamu setuju untuk tidak mengirim konten yang melanggar
              hukum, mengandung ujaran kebencian, atau melecehkan pengguna lain. Kami berhak menghapus
              komentar yang melanggar ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">5. Perubahan Layanan</h2>
            <p>
              Kami dapat memperbarui fitur, tampilan, atau ketentuan ini dari waktu ke waktu. Perubahan
              signifikan akan diinformasikan melalui aplikasi.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">6. Kontak</h2>
            <p>
              Pertanyaan seputar layanan bisa disampaikan lewat fitur laporan di dalam aplikasi.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
