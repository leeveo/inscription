// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Passer le pathname dans les headers pour le layout
  res.headers.set('x-pathname', req.nextUrl.pathname)
  
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/landing/:path*', '/qr-scanner/:path*', '/qr-scanner-new/:path*', '/scanner/:path*'],
}
