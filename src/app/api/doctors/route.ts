import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')

    const where: Record<string, unknown> = {}
    if (available === 'true') {
      where.availability = true
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            specialization: true,
            email: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    })

    return NextResponse.json({
      doctors: doctors.map((d) => ({
        id: d.id,
        user: {
          name: d.user.name,
          specialization: d.user.specialization,
          email: d.user.email,
        },
        specialization: d.specialization,
        availability: d.availability,
        maxAppointmentsPerDay: d.maxAppointmentsPerDay,
      })),
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}