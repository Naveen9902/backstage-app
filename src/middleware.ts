import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter, that allows 20 requests per 10 seconds
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '10 s'),
      analytics: true,
    })
  : null;

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // If Upstash isn't configured, bypass rate limiting
  if (!ratelimit) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  
  try {
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
  } catch (err) {
    console.error('Rate limiting failed:', err);
    // If Redis fails, we should still let the request pass rather than taking down the app
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
