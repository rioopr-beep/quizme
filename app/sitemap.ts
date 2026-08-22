import type { MetadataRoute } from 'next';

const baseUrl = 'https://quizfrend.my.id';

// Topik yang sudah punya soal (exclude yang masih 0 soal: cryptography, translation, book-trivia)
// PENTING: slug di bawah HARUS sama persis dengan VALID_SECTORS di
// app/(quiz)/quiz/[sector]/[difficulty]/page.tsx — kalau beda, URL 404.
const topics = [
  // Topik langsung
  'financial',
  'psychology',
  'physics',
  'linguistics',
  'curiosities',
  'mathematics',

  // Science
  'chemistry',
  'biology',
  'computer_science',
  'astronomy',
  'earth_science',
  'economics',

  // Engineering
  'civil_engineering',
  'mechanical_engineering',
  'electrical_engineering',
  'software_engineering',
  'industrial_engineering',
  'aerospace_engineering',
  'automotive_engineering',
  'environmental_engineering',

  // Sports
  'football',
  'basketball',
  'badminton',
  'olympics_history',
  'tennis',
  'esports',
  'motorsport',
  'general_sports',
];

const levels = ['foundational', 'intermediate', 'advanced'] as const;

// Jumlah soal default dipakai di URL supaya Googlebot langsung lihat
// soal beneran, bukan layar "Berapa soal?" (halaman tanpa ?count kosong).
const DEFAULT_COUNT = 10;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const quizPages: MetadataRoute.Sitemap = topics.flatMap((topic) =>
    levels.map((level) => ({
      url: `${baseUrl}/quiz/${topic}/${level}?count=${DEFAULT_COUNT}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...quizPages];
}
