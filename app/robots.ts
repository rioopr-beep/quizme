import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://quizfrend.my.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/school'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
