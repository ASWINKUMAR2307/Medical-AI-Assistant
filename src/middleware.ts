import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: Request) {
  const url = new URL(req.url)
  const isOnLogin = url.pathname === '/login'
  const isOnRegister = url.pathname === '/register'
  const isOnForgotPassword = url.pathname === '/forgot-password'
  const isOnAuth = url.pathname.startsWith('/api/auth')
  const isOnStatic = url.pathname.startsWith('/_next') || url.pathname.includes('.')
  const isOnAssistant = url.pathname.startsWith('/api/assistant')

  if (isOnStatic || isOnAuth || isOnRegister || isOnForgotPassword || isOnAssistant) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token

  if (isOnLogin) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/overview', url))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}