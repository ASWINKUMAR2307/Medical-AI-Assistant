'use client'

import { ReactNode } from 'react'
import { Permission } from '@/lib/permissions'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({ permission, permissions, requireAll = false, fallback = null, children }: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions()

  const hasAccess = useMemo(() => {
    if (permission) return can(permission)
    if (permissions && permissions.length > 0) {
      return requireAll ? canAll(permissions) : canAny(permissions)
    }
    return true
  }, [permission, permissions, requireAll, can, canAny, canAll])

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

import { useMemo } from 'react'