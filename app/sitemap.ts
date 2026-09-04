import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

const baseUrl = 'https://www.quizfrend.my.id';

const PREVIEW_SECTORS = [
  'astronomy', 'biology', 'chemistry', 'civil_engineering', 'computer_science',
  'cryptography', 'curiosities', 'economics', 'electrical_engineering',
  'environmental_engineering', 'financial', 'general_sports', 'linguistics',
  'mathematics', 'mechanical_engineering', 'motorsport', 'physics', 'psychology',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/topics`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/topics/engineering`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/topics/sports`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/topics/science`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/history`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${baseUrl}/profile`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  const previewPages: MetadataRoute.Sitemap = PREVIEW_SECTORS.map((sector) => ({
    url: `${baseUrl}/quiz/${sector}/preview`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Blog index per bahasa, saling nunjuk sebagai alternate lewat hreflang
  const blogIndexPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/blog/en`,
          id: `${baseUrl}/blog/id`,
        },
      },
    },
    {
      url: `${baseUrl}/blog/id`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/blog/en`,
          id: `${baseUrl}/blog/id`,
        },
      },
    },
  ];

  const [postsEn, postsId] = await Promise.all([getAllPosts('en'), getAllPosts('id')]);

  const blogArticlePages: MetadataRoute.Sitemap = postsEn.flatMap((post) => {
    const hasIdVersion = postsId.some((p) => p.slug === post.slug);
    const urlEn = `${baseUrl}/blog/en/${post.sector}/${post.slug}`;
    const urlId = `${baseUrl}/blog/id/${post.sector}/${post.slug}`;

    const entries: MetadataRoute.Sitemap = [
      {
        url: urlEn,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: hasIdVersion ? { languages: { en: urlEn, id: urlId } } : undefined,
      },
    ];

    if (hasIdVersion) {
      entries.push({
        url: urlId,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: { en: urlEn, id: urlId } },
      });
    }

    return entries;
  });

  const uniqueSectorsEn = Array.from(new Set(postsEn.map((post) => post.sector)));
  const uniqueSectorsId = Array.from(new Set(postsId.map((post) => post.sector)));

  const blogSectorPages: MetadataRoute.Sitemap = [
    ...uniqueSectorsEn.map((sector) => ({
      url: `${baseUrl}/blog/en/${sector}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: uniqueSectorsId.includes(sector)
        ? { languages: { en: `${baseUrl}/blog/en/${sector}`, id: `${baseUrl}/blog/id/${sector}` } }
        : undefined,
    })),
    ...uniqueSectorsId.map((sector) => ({
      url: `${baseUrl}/blog/id/${sector}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: uniqueSectorsEn.includes(sector)
        ? { languages: { en: `${baseUrl}/blog/en/${sector}`, id: `${baseUrl}/blog/id/${sector}` } }
        : undefined,
    })),
  ];

  return [...staticPages, ...previewPages, ...blogIndexPages, ...blogArticlePages, ...blogSectorPages];
      }
