import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL of your app
  const baseUrl = 'https://backstage-app.vercel.app';

  // Fetch all public events to add to sitemap
  const events = await prisma.event.findMany({
    where: {
      status: 'UPCOMING',
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  const eventUrls = events.map((event) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: event.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Define static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...eventUrls];
}
