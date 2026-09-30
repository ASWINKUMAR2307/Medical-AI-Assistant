import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const date = searchParams.get('date') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { appointmentId: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { doctor: { user: { name: { contains: search, mode: 'insensitive' } } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      where.scheduledAt = { gte: startDate, lte: endDate }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          doctor: {
            select: {
              id: true,
              user: { select: { name: true } },
              specialization: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ])

    const formattedAppointments = appointments.map((apt) => ({
      id: apt.id,
      appointmentId: apt.appointmentId,
      patientId: apt.patient.id,
      patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
      patientAge: calculateAge(apt.patient.dateOfBirth),
      patientGender: apt.patient.gender,
      doctorId: apt.doctor.id,
      doctorName: apt.doctor.user.name,
      doctorSpecialization: apt.doctor.specialization,
      scheduledAt: apt.scheduledAt.toISOString(),
      duration: apt.duration,
      status: apt.status,
      reason: apt.reason,
      notes: apt.notes,
    }))

    return NextResponse.json({
      appointments: formattedAppointments,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      patientId,
      doctorId,
      scheduledAt,
      duration = 30,
      reason,
      notes,
      createdById,
    } = body

    if (!patientId || !doctorId || !scheduledAt || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: 'workspace-main' },
    })

    const appointmentCount = await prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date(scheduledAt).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(scheduledAt).setHours(23, 59, 59, 999)),
        },
        doctorId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    })

    if (appointmentCount >= doctor.maxAppointmentsPerDay) {
      return NextResponse.json(
        { error: 'Doctor has reached maximum appointments for this day' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        workspaceId: workspace?.id || 'workspace-main',
        scheduledAt: new Date(scheduledAt),
        duration,
        reason,
        notes,
        createdById,
        status: 'SCHEDULED',
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
        doctor: {
          select: { user: { select: { name: true } }, specialization: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        appointmentId: appointment.appointmentId,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        doctorName: appointment.doctor.user.name,
        scheduledAt: appointment.scheduledAt.toISOString(),
        duration: appointment.duration,
        status: appointment.status,
      },
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

function calculateAge(dateOfBirth: Date): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}