import type { MetadataRoute } from 'next';
import { getAllPosts, getAllSlugs } from '@/lib/blog';

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
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const previewPages: MetadataRoute.Sitemap = PREVIEW_SECTORS.map((sector) => ({
    url: `${baseUrl}/quiz/${sector}/preview`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const slugs = await getAllSlugs();
  const blogPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...previewPages, ...blogPages];
}
