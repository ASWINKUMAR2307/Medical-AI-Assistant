'use server'

import { prisma } from '@/lib/db'
import { TriagePriority, TriageStatus, AppointmentStatus } from '@/generated/prisma/client'
import { auth } from '@/lib/auth'

interface DashboardMetrics {
  totalPatients: { value: number; change: number }
  consultations: { value: number; change: number }
  awaitingReview: { value: number; change: number }
  activeDoctors: { value: number; total: number; percentage: number }
  consultationActivity: { labels: string[]; consultations: number[]; completed: number[] }
  triageDistribution: {
    urgent: { value: number; percentage: number }
    priority: { value: number; percentage: number }
    standard: { value: number; percentage: number }
    selfCare: { value: number; percentage: number }
    totalAssessments: number
  }
  recentPatients: Array<{
    id: string
    patientId: string
    name: string
    age: number
    lastConsultation: string | null
    status: string
    assignedDoctor: string
  }>
  myPatients?: number
  myConsultations?: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const isAdmin = userRole === 'ADMIN'
  const isDoctor = userRole === 'DOCTOR'

  let patientWhere: Record<string, any> = { status: 'active' }
  let consultationWhere: Record<string, any> = { startedAt: { gte: sevenDaysAgo } }
  let doctorWhere: Record<string, any> = { availability: true }

  if (isDoctor && userId) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } })
    if (doctor) {
      patientWhere = { ...patientWhere, assignedDoctorId: doctor.id }
      consultationWhere = { ...consultationWhere, doctorId: userId }
    }
  }

  const [
    totalPatients,
    totalPatientsPrev,
    consultationsThisWeek,
    consultationsPrevWeek,
    awaitingReview,
    activeDoctors,
    totalDoctors,
    consultationActivity,
    triageDistribution,
    recentPatients,
  ] = await Promise.all([
    prisma.patient.count({ where: patientWhere }),
    prisma.patient.count({
      where: {
        ...patientWhere,
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    prisma.consultation.count({ where: consultationWhere }),
    prisma.consultation.count({
      where: {
        ...consultationWhere,
        startedAt: { gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000), lt: sevenDaysAgo },
      },
    }),
    prisma.triageCase.count({
      where: { status: { in: [TriageStatus.PENDING, TriageStatus.IN_REVIEW] } },
    }),
    prisma.doctor.count({ where: doctorWhere }),
    prisma.doctor.count(),
    getConsultationActivity(isDoctor ? userId : undefined),
    getTriageDistribution(),
    getRecentPatients(isDoctor ? userId : undefined),
  ])

  const patientChange = totalPatientsPrev > 0
    ? ((totalPatients - totalPatientsPrev) / totalPatientsPrev) * 100
    : 0

  const consultationChange = consultationsPrevWeek > 0
    ? ((consultationsThisWeek - consultationsPrevWeek) / consultationsPrevWeek) * 100
    : 0

  const metrics: DashboardMetrics = {
    totalPatients: { value: totalPatients, change: Math.round(patientChange * 10) / 10 },
    consultations: { value: consultationsThisWeek, change: Math.round(consultationChange * 10) / 10 },
    awaitingReview: { value: awaitingReview, change: 0 },
    activeDoctors: { value: activeDoctors, total: totalDoctors, percentage: totalDoctors > 0 ? Math.round((activeDoctors / totalDoctors) * 100) : 0 },
    consultationActivity,
    triageDistribution,
    recentPatients,
  }

  if (isDoctor) {
    return {
      ...metrics,
      myPatients: totalPatients,
      myConsultations: consultationsThisWeek,
    }
  }

  return metrics
}

async function getConsultationActivity(doctorId?: string) {
  const now = new Date()
  const labels = []
  const consultationsData = []
  const completedData = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))

    const where = { startedAt: { gte: date, lt: nextDate } }
    if (doctorId) {
      Object.assign(where, { doctorId })
    }

    const [consultations, completed] = await Promise.all([
      prisma.consultation.count({ where }),
      prisma.consultation.count({ where: { ...where, endedAt: { not: null } } }),
    ])

    consultationsData.push(consultations)
    completedData.push(completed)
  }

  return { labels, consultations: consultationsData, completed: completedData }
}

async function getTriageDistribution() {
  const distribution = await Promise.all([
    prisma.triageCase.count({ where: { aiAssessment: TriagePriority.URGENT } }),
    prisma.triageCase.count({ where: { aiAssessment: TriagePriority.PRIORITY } }),
    prisma.triageCase.count({ where: { aiAssessment: TriagePriority.STANDARD } }),
    prisma.triageCase.count({ where: { aiAssessment: TriagePriority.SELF_CARE } }),
  ])

  const total = distribution.reduce((a, b) => a + b, 0)
  const totalAssessments = await prisma.triageCase.count({ where: { aiAssessment: { not: null } } })

  return {
    urgent: { value: distribution[0], percentage: total > 0 ? Math.round((distribution[0] / total) * 100) : 0 },
    priority: { value: distribution[1], percentage: total > 0 ? Math.round((distribution[1] / total) * 100) : 0 },
    standard: { value: distribution[2], percentage: total > 0 ? Math.round((distribution[2] / total) * 100) : 0 },
    selfCare: { value: distribution[3], percentage: total > 0 ? Math.round((distribution[3] / total) * 100) : 0 },
    totalAssessments,
  }
}

async function getRecentPatients(doctorId?: string) {
  const where: any = { status: 'active' }
  if (doctorId) {
    const doctor = await prisma.doctor.findUnique({ where: { userId: doctorId } })
    if (doctor) where.assignedDoctorId = doctor.id
  }

  const patients = await prisma.patient.findMany({
    where,
    include: {
      assignedDoctor: {
        include: { user: { select: { name: true } } },
      },
      consultations: {
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: { startedAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return patients.map((patient) => ({
    id: patient.id,
    patientId: patient.patientId,
    name: `${patient.firstName} ${patient.lastName}`,
    age: calculateAge(patient.dateOfBirth),
    lastConsultation: patient.consultations[0]?.startedAt?.toISOString() || null,
    status: patient.status,
    assignedDoctor: patient.assignedDoctor?.user?.name || 'Unassigned',
  }))
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