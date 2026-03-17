import { NextResponse } from 'next/server'

// POST /api/admin/auth — validate credentials, set httpOnly cookie
export async function POST(request: Request) {
  const { email, password } = await request.json()

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: 'Admin credentials not configured on server.' },
      { status: 500 }
    )
  }

  if (email === adminEmail && password === adminPassword) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return response
  }

  return NextResponse.json(
    { error: 'Invalid email or password.' },
    { status: 401 }
  )
}

// DELETE /api/admin/auth — logout, clear cookie
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}
