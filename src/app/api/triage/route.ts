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
    const assessment = searchParams.get('assessment') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { caseId: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { presentingConcern: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (assessment) {
      if (assessment === 'PENDING') {
        where.aiAssessment = null
      } else {
        where.aiAssessment = assessment
      }
    }

    const [triageCases, total] = await Promise.all([
      prisma.triageCase.findMany({
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
          assignedClinician: {
            select: { name: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.triageCase.count({ where }),
    ])

    const formattedCases = triageCases.map((tc) => ({
      id: tc.id,
      caseId: tc.caseId,
      patientId: tc.patient.id,
      patientName: `${tc.patient.firstName} ${tc.patient.lastName}`,
      patientAge: calculateAge(tc.patient.dateOfBirth),
      patientGender: tc.patient.gender,
      presentingConcern: tc.presentingConcern,
      symptoms: tc.symptoms as string[],
      aiAssessment: tc.aiAssessment,
      aiConfidence: tc.aiConfidence,
      riskIndicators: tc.riskIndicators as string[],
      status: tc.status,
      submittedAt: tc.submittedAt.toISOString(),
      assignedClinicianId: tc.assignedClinicianId,
      assignedClinicianName: tc.assignedClinician?.name || null,
    }))

    return NextResponse.json({
      cases: formattedCases,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching triage cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch triage cases' },
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