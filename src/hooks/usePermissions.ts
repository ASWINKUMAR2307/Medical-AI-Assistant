'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions'
import type { UserRole } from '@/generated/prisma/enums'

export function usePermissions() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole | undefined

  const can = useMemo(() => (permission: Permission): boolean => {
    if (!userRole) return false
    return hasPermission(userRole, permission)
  }, [userRole])

  const canAny = useMemo(() => (permissions: Permission[]): boolean => {
    if (!userRole) return false
    return hasAnyPermission(userRole, permissions)
  }, [userRole])

  const canAll = useMemo(() => (permissions: Permission[]): boolean => {
    if (!userRole) return false
    return hasAllPermissions(userRole, permissions)
  }, [userRole])

  const isAdmin = userRole === 'ADMIN'
  const isDoctor = userRole === 'DOCTOR'
  const isClinician = userRole === 'CLINICIAN'
  const isNurse = userRole === 'NURSE'
  const isCareCoordinator = userRole === 'CARE_COORDINATOR'

  return {
    role: userRole,
    can,
    canAny,
    canAll,
    isAdmin,
    isDoctor,
    isClinician,
    isNurse,
    isCareCoordinator,
    isStaff: ['ADMIN', 'DOCTOR', 'CLINICIAN', 'NURSE', 'CARE_COORDINATOR'].includes(userRole || ''),
  }
}

export function useRoleAccess(allowedRoles: string[]) {
  const { role } = usePermissions()
  return role ? allowedRoles.includes(role) : false
}