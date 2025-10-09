// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  // Passer le pathname dans les headers pour le layout
  supabaseResponse.headers.set('x-pathname', req.nextUrl.pathname)

  // Routes builder gèrent leur propre auth - skip middleware auth
  if (req.nextUrl.pathname.startsWith('/admin/builder')) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session si elle existe - important!
    const { data: { session } } = await supabase.auth.getSession()

    // Routes protégées qui nécessitent une authentification
    const protectedRoutes = ['/admin', '/dashboard']
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    // Routes publiques d'authentification
    const authRoutes = ['/auth/login', '/auth/signup']
    const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Si l'utilisateur est connecté et tente d'accéder aux pages d'authentification
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // En cas d'erreur, laisser passer - les pages géreront l'auth
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/auth/:path*', '/landing/:path*', '/qr-scanner/:path*', '/qr-scanner-new/:path*', '/scanner/:path*', '/p/:path*', '/preview/:path*'],
}
