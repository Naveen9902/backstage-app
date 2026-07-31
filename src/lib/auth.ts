import { cookies } from 'next/headers';
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = cookies();
  let sessionToken = cookieStore.get('sessionToken')?.value;
  
  if (!sessionToken) {
    const { headers } = await import('next/headers');
    const authHeader = headers().get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }
  }
  
  if (!sessionToken) {
    return null;
  }

  try {
    const userId = await redis.get(`session:${sessionToken}`);
    return userId as string | null;
  } catch (error) {
    console.error("Redis session fetch error:", error);
    return null;
  }
}
