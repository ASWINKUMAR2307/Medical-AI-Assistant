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
    const type = searchParams.get('type') || ''
    const patientId = searchParams.get('patientId') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { recordId: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientId: { contains: search, mode: 'insensitive' } } },
        { clinician: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (type) {
      where.type = type
    }

    if (patientId) {
      where.patientId = patientId
    }

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            },
          },
          clinician: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.medicalRecord.count({ where }),
    ])

    const formattedRecords = records.map((record) => {
      let tags: string[] = []
      try {
        tags = typeof record.tags === 'string' ? JSON.parse(record.tags) : (record.tags as string[])
      } catch {
        tags = []
      }

      return {
        id: record.id,
        recordId: record.recordId,
        patientId: record.patient.id,
        patientName: `${record.patient.firstName} ${record.patient.lastName}`,
        patientAge: calculateAge(record.patient.dateOfBirth),
        type: record.type,
        title: record.title,
        description: record.description,
        clinicianName: record.clinician.name,
        tags,
        isConfidential: record.isConfidential,
        createdAt: record.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      records: formattedRecords,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching medical records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
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