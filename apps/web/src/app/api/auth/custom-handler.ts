import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Create NextAuth handler
const handler = NextAuth(authOptions);

// Custom handler with CORS support
export async function customAuthHandler(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  // Determine if origin is allowed
  const isAllowed = origin && (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://192.168.') ||
    origin.startsWith('http://10.') ||
    origin.startsWith('exp://')
  );
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    const headers: HeadersInit = {};
    if (isAllowed) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRF-Token, Cookie';
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Access-Control-Max-Age'] = '86400';
    }
    return new Response(null, {
      status: 200,
      headers,
    });
  }
  
  const response = await handler(req as any, NextResponse as any);
  
  // Add CORS headers to the existing response if origin is allowed
  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, Cookie');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}
