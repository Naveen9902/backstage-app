import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  
  // Handle CORS preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Version, X-Backstage-Client',
        'Access-Control-Allow-Credentials': 'true'
      },
    });
  }

  // CSRF Protection for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const method = request.method;
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const isInternalClient = request.headers.get('x-backstage-client') === 'true';
      // Webhooks might need to bypass this, e.g., Stripe, so we'd normally allow specific paths.
      // Assuming all our API routes are consumed by our frontend:
      if (!isInternalClient && !request.nextUrl.pathname.startsWith('/api/webhooks')) {
        return NextResponse.json({ error: 'CSRF token missing or invalid' }, { status: 403 });
      }
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Version, X-Backstage-Client');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/user') || pathname.startsWith('/worker') || pathname.startsWith('/manager')) {
    const userAgent = request.headers.get('user-agent') || '';
    const isMobileApp = userAgent.includes('Capacitor') || userAgent.includes('BackstageFlavor') || userAgent.includes('wv');
    
    if (!isMobileApp) {
      return NextResponse.json({ error: 'This server only acts as an API backend. Please use the mobile app.' }, { status: 403 });
    }
  }
  // Allow access to frontend pages and static assets
  const response = NextResponse.next();
  // Apply CORS headers to everything just in case, though mainly needed for API
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Version');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export const config = {
  matcher: ['/:path*']
};
