'use server'

import { prisma } from '@/lib/db'
import { TriagePriority, TriageStatus, AppointmentStatus } from '@/generated/prisma/client'

export async function getDashboardMetrics() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

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
    prisma.patient.count({ where: { status: 'active' } }),
    prisma.patient.count({
      where: {
        status: 'active',
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    prisma.consultation.count({
      where: { startedAt: { gte: sevenDaysAgo } },
    }),
    prisma.consultation.count({
      where: {
        startedAt: { gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000), lt: sevenDaysAgo },
      },
    }),
    prisma.triageCase.count({
      where: { status: { in: [TriageStatus.PENDING, TriageStatus.IN_REVIEW] } },
    }),
    prisma.doctor.count({ where: { availability: true } }),
    prisma.doctor.count(),
    getConsultationActivity(),
    getTriageDistribution(),
    getRecentPatients(),
  ])

  const patientChange = totalPatientsPrev > 0
    ? ((totalPatients - totalPatientsPrev) / totalPatientsPrev) * 100
    : 0

  const consultationChange = consultationsPrevWeek > 0
    ? ((consultationsThisWeek - consultationsPrevWeek) / consultationsPrevWeek) * 100
    : 0

  return {
    totalPatients: { value: totalPatients, change: Math.round(patientChange * 10) / 10 },
    consultations: { value: consultationsThisWeek, change: Math.round(consultationChange * 10) / 10 },
    awaitingReview: { value: awaitingReview, change: 0 },
    activeDoctors: { value: activeDoctors, total: totalDoctors, percentage: totalDoctors > 0 ? Math.round((activeDoctors / totalDoctors) * 100) : 0 },
    consultationActivity,
    triageDistribution,
    recentPatients,
  }
}

async function getConsultationActivity() {
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

    const [consultations, completed] = await Promise.all([
      prisma.consultation.count({
        where: { startedAt: { gte: date, lt: nextDate } },
      }),
      prisma.consultation.count({
        where: { startedAt: { gte: date, lt: nextDate }, endedAt: { not: null } },
      }),
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

async function getRecentPatients() {
  const patients = await prisma.patient.findMany({
    where: { status: 'active' },
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
    lastConsultation: patient.consultations[0]?.startedAt || null,
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