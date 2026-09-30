import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const department = searchParams.get('department') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (department) {
      where.department = department
    }

    if (status) {
      where.isActive = status === 'active'
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          doctorProfile: {
            select: {
              id: true,
              specialization: true,
              licenseNumber: true,
              availability: true,
              maxAppointmentsPerDay: true,
            },
          },
          assignedAppointments: {
            where: {
              scheduledAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
              status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            },
            select: { id: true },
          },
          consultations: {
            where: { startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            select: { id: true, patientId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const formattedMembers = users.map((user) => {
      const uniquePatients = new Set(user.consultations.map(c => c.patientId)).size
      return {
        id: user.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        specialization: user.specialization || user.doctorProfile?.specialization,
        licenseNumber: user.licenseNumber || user.doctorProfile?.licenseNumber,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        availability: user.doctorProfile?.availability ?? true,
        maxAppointmentsPerDay: user.doctorProfile?.maxAppointmentsPerDay ?? 20,
        createdAt: user.createdAt.toISOString(),
        stats: {
          patients: uniquePatients,
          consultations: user.consultations.length,
          appointmentsToday: user.assignedAppointments.length,
        },
      }
    })

    return NextResponse.json({
      members: formattedMembers,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching care team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch care team' },
      { status: 500 }
    )
  }
}