import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import type { UserRole } from '@/generated/prisma/enums'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.role || !hasPermission(session.user.role as UserRole, 'audit-logs:view')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const action = searchParams.get('action') || ''
  const entity = searchParams.get('entity') || ''

  const where: Record<string, any> = {}
  
  if (search) {
    where.OR = [
      { actor: { name: { contains: search, mode: 'insensitive' } } },
      { actor: { email: { contains: search, mode: 'insensitive' } } },
      { entityId: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (action) {
    where.action = action
  }
  
  if (entity) {
    where.entity = entity
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({
    logs,
    total,
    totalPages: Math.ceil(total / limit),
  })
}