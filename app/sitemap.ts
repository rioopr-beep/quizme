import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.quizfrend.my.id';

// CATATAN: URL /quiz/[sector]/[difficulty] sengaja TIDAK dimasukkan ke sitemap.
// Semua soal dikunci di balik login, jadi kalau bot crawl tanpa login,
// URL-nya redirect ke /login -> dianggap "3XX redirect in sitemap" +
// "Duplicate pages without canonical" (banyak URL beda mendarat di tujuan
// yang sama). Kalau nanti ada mode preview/guest, baru pertimbangkan
// masukin lagi topik yang benar-benar bisa diakses publik.

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
      url: `${baseUrl}/topics/engineering`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics/sports`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics/science`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
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

  return staticPages;
}
