import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session')
  const path = request.nextUrl.pathname

  const isAdminRoute =
    path.startsWith('/puka/sudu/admin/new') ||
    path.startsWith('/puka/sudu/admin/dashboard') ||
    path.startsWith('/puka/sudu/admin/edit') ||
    path.startsWith('/puka/sudu/admin/categories')

  if (isAdminRoute) {
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/puka/sudu/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/puka/sudu/admin/new',
    '/puka/sudu/admin/new/:path*',
    '/puka/sudu/admin/dashboard',
    '/puka/sudu/admin/edit/:path*',
    '/puka/sudu/admin/categories',
    '/puka/sudu/admin/categories/:path*',
  ],
}
