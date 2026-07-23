import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/worker/', '/manager/', '/admin/', '/api/'],
    },
    sitemap: 'https://backstage-app.vercel.app/sitemap.xml',
  };
}
