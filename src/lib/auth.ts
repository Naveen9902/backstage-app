import { cookies } from 'next/headers';
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get('sessionToken')?.value;
  
  if (!sessionToken) {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }
  }
  
  if (!sessionToken) {
    return null;
  }

  let userId: string | null = null;
  try {
    userId = await redis.get(`session:${sessionToken}`);
  } catch (error) {
    console.error("Redis session fetch error, falling back to DB:", error);
  }

  // Fallback to database if Redis lookup fails or returns null
  if (!userId) {
    try {
      const prisma = (await import('@/lib/prisma')).default;
      const session = await prisma.session.findUnique({
        where: { token: sessionToken }
      });
      
      if (session) {
        userId = session.userId;
        // Self-heal Redis asynchronously
        redis.set(`session:${sessionToken}`, userId, { ex: 604800 }).catch(e => {
          console.error("Failed to self-heal Redis session:", e);
        });
      }
    } catch (dbError) {
      console.error("DB session fallback error:", dbError);
    }
  }

  return userId as string | null;
}
