export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
export async function GET(req) {
  return NextResponse.json({ headers: Object.fromEntries(req.headers.entries()) });
}
