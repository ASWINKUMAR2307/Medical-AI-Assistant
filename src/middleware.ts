import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const rolePermissions: Record<string, string[]> = {
  ADMIN: [
    'dashboard:view',
    'dashboard:admin',
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:delete',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:delete',
    'triage:view',
    'triage:create',
    'triage:review',
    'triage:override',
    'assistant:view',
    'assistant:use',
    'medical-records:view',
    'medical-records:create',
    'medical-records:edit',
    'medical-records:delete',
    'analytics:view',
    'analytics:admin',
    'care-team:view',
    'care-team:manage',
    'settings:view',
    'settings:admin',
    'settings:profile',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'audit-logs:view',
  ],
  DOCTOR: [
    'dashboard:view',
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:view_assigned',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:view_own',
    'triage:view',
    'triage:create',
    'triage:review',
    'triage:override',
    'triage:view_assigned',
    'assistant:view',
    'assistant:use',
    'medical-records:view',
    'medical-records:create',
    'medical-records:edit',
    'medical-records:view_own',
    'analytics:view',
    'care-team:view',
    'settings:view',
    'settings:profile',
  ],
  CLINICIAN: [
    'dashboard:view',
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:view_assigned',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:view_own',
    'triage:view',
    'triage:create',
    'triage:review',
    'triage:view_assigned',
    'assistant:view',
    'assistant:use',
    'medical-records:view',
    'medical-records:create',
    'medical-records:edit',
    'medical-records:view_own',
    'analytics:view',
    'care-team:view',
    'settings:view',
    'settings:profile',
  ],
  NURSE: [
    'dashboard:view',
    'patients:view',
    'patients:view_assigned',
    'appointments:view',
    'appointments:view_own',
    'triage:view',
    'triage:view_assigned',
    'assistant:view',
    'assistant:use',
    'medical-records:view',
    'medical-records:view_own',
    'care-team:view',
    'settings:view',
    'settings:profile',
  ],
  CARE_COORDINATOR: [
    'dashboard:view',
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:view_assigned',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:view_own',
    'triage:view',
    'triage:create',
    'triage:view_assigned',
    'assistant:view',
    'assistant:use',
    'medical-records:view',
    'medical-records:view_own',
    'analytics:view',
    'care-team:view',
    'care-team:manage',
    'settings:view',
    'settings:profile',
  ],
}

const routePermissions: Record<string, string[]> = {
  '/overview': ['dashboard:view'],
  '/patients': ['patients:view'],
  '/patients/new': ['patients:create'],
  '/appointments': ['appointments:view'],
  '/appointments/new': ['appointments:create'],
  '/triage': ['triage:view'],
  '/assistant': ['assistant:view'],
  '/medical-records': ['medical-records:view'],
  '/analytics': ['analytics:view'],
  '/care-team': ['care-team:view'],
  '/settings': ['settings:view'],
  '/admin/users': ['users:view'],
  '/admin/audit-logs': ['audit-logs:view'],
  '/admin/settings': ['settings:admin'],
}

function hasPermission(role: string, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

function hasAnyPermission(role: string, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export async function middleware(req: Request) {
  const url = new URL(req.url)
  const pathname = url.pathname

  const isOnLogin = pathname === '/login'
  const isOnRegister = pathname === '/register'
  const isOnForgotPassword = pathname === '/forgot-password'
  const isOnAuth = pathname.startsWith('/api/auth')
  const isOnStatic = pathname.startsWith('/_next') || pathname.includes('.')
  const isOnAssistant = pathname.startsWith('/api/assistant')
  const isOnApi = pathname.startsWith('/api/')

  if (isOnStatic || isOnAuth || isOnRegister || isOnForgotPassword || isOnAssistant) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const userRole = token?.role as string | undefined

  if (isOnLogin) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/overview', url))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', url))
  }

  if (isOnApi) {
    return NextResponse.next()
  }

  const requiredPermissions = routePermissions[pathname]
  if (requiredPermissions && userRole) {
    if (!hasAnyPermission(userRole, requiredPermissions)) {
      return NextResponse.redirect(new URL('/overview?error=unauthorized', url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}