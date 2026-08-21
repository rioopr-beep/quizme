import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.quizfrend.my.id';

// Topik yang sudah punya soal (exclude yang masih 0 soal: cryptography, translation, book-trivia)
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
  'computer-science',
  'astronomy',
  'earth-science',
  'economics',

  // Engineering
  'civil-engineering',
  'mechanical-engineering',
  'electrical-engineering',
  'software-engineering',
  'industrial-engineering',
  'aerospace-engineering',
  'automotive-engineering',
  'environmental-engineering',

  // Sports
  'football',
  'basketball',
  'badminton',
  'olympics-sports-history',
  'tennis',
  'esports',
  'motorsport',
  'general-sports',
];

const levels = ['foundational', 'intermediate', 'advanced'] as const;

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
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
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
      url: `${baseUrl}/quiz/${topic}/${level}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...quizPages];
}
