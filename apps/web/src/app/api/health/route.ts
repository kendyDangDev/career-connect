import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Career Connect API is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}
