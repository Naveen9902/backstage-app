import { NextResponse } from 'next/server';
import { log } from '@logtail/next';

export const dynamic = 'force-dynamic';

export async function GET() {
  log.info("Incoming request to Better Stack test endpoint");
  try {
    throw new Error("Better Stack Test Error from Back Stage!");
  } catch (error) {
    log.error("An intentional error occurred", { error });
    return NextResponse.json({ success: true, message: "Error logged to Better Stack!" });
  }
}
