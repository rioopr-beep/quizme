import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.quizfrend.my.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/quiz/*/preview'],
        disallow: ['/admin', '/dashboard', '/school', '/quiz'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
