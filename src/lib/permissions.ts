import { UserRole } from '@/generated/prisma/enums'

export type Permission =
  | 'dashboard:view'
  | 'dashboard:admin'
  | 'patients:view'
  | 'patients:create'
  | 'patients:edit'
  | 'patients:delete'
  | 'patients:view_assigned'
  | 'appointments:view'
  | 'appointments:create'
  | 'appointments:edit'
  | 'appointments:delete'
  | 'appointments:view_own'
  | 'triage:view'
  | 'triage:create'
  | 'triage:review'
  | 'triage:override'
  | 'triage:view_assigned'
  | 'assistant:view'
  | 'assistant:use'
  | 'medical-records:view'
  | 'medical-records:create'
  | 'medical-records:edit'
  | 'medical-records:delete'
  | 'medical-records:view_own'
  | 'analytics:view'
  | 'analytics:admin'
  | 'care-team:view'
  | 'care-team:manage'
  | 'settings:view'
  | 'settings:admin'
  | 'settings:profile'
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'audit-logs:view'

export const rolePermissions: Record<UserRole, Permission[]> = {
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

export const routePermissions: Record<string, Permission[]> = {
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
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

export function getAllowedRoutes(role: UserRole): string[] {
  return Object.entries(routePermissions)
    .filter(([, perms]) => hasAnyPermission(role, perms))
    .map(([route]) => route)
}