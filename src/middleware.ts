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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Version',
        'Access-Control-Allow-Credentials': 'true'
      },
    });
  }

  // If the request is for an API route, allow it and append CORS headers
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Version');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
  
  // Otherwise, block access to the frontend with a 403
  return NextResponse.json({ error: 'This server only acts as an API backend. Please use the mobile app.' }, { status: 403 });
}

export const config = {
  matcher: ['/:path*']
};
