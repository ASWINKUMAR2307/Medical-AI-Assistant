'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Patient, Prisma } from '@/generated/prisma/client'

export async function getPatients({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  assignedDoctorId = '',
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
  assignedDoctorId?: string
} = {}) {
  const where: Prisma.PatientWhereInput = {
    status: status ? status : 'active',
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { patientId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(assignedDoctorId && { assignedDoctorId }),
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
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
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ])

  return {
    patients: patients.map((patient) => ({
      id: patient.id,
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      status: patient.status,
      assignedDoctorId: patient.assignedDoctorId,
      assignedDoctorName: patient.assignedDoctor?.user?.name || 'Unassigned',
      lastConsultation: patient.consultations[0]?.startedAt || null,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    })),
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      assignedDoctor: {
        include: { user: { select: { name: true, email: true, specialization: true } } },
      },
      consultations: {
        orderBy: { startedAt: 'desc' },
        include: { doctor: { select: { name: true } } },
      },
      medicalRecords: {
        orderBy: { createdAt: 'desc' },
        include: { clinician: { select: { name: true } } },
      },
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        include: { doctor: { include: { user: { select: { name: true } } } } },
      },
      triageCases: {
        orderBy: { submittedAt: 'desc' },
      },
    },
  })

  if (!patient) return null

  return {
    ...patient,
    age: calculateAge(patient.dateOfBirth),
  }
}

export async function createPatient(data: {
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  phone?: string
  email?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  workspaceId: string
  assignedDoctorId?: string
}) {
  const patient = await prisma.patient.create({ data })

  await prisma.auditLog.create({
    data: {
      actorId: 'system',
      action: 'CREATE',
      entity: 'Patient',
      entityId: patient.id,
      metadata: { patientId: patient.patientId },
    },
  })

  revalidatePath('/patients')
  return patient
}

export async function updatePatient(id: string, data: Partial<{
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  phone: string
  email: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  bloodType: string
  allergies: string
  medicalHistory: string
  status: string
  assignedDoctorId: string
}>) {
  const patient = await prisma.patient.update({
    where: { id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      actorId: 'system',
      action: 'UPDATE',
      entity: 'Patient',
      entityId: patient.id,
      metadata: { updatedFields: Object.keys(data) },
    },
  })

  revalidatePath('/patients')
  revalidatePath(`/patients/${id}`)
  return patient
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      actorId: 'system',
      action: 'DELETE',
      entity: 'Patient',
      entityId: id,
    },
  })

  revalidatePath('/patients')
  return { success: true }
}

export async function getDoctorsForAssignment() {
  const doctors = await prisma.doctor.findMany({
    where: { availability: true },
    include: { user: { select: { id: true, name: true, specialization: true } } },
    orderBy: { user: { name: 'asc' } },
  })

  return doctors.map((d) => ({
    id: d.id,
    name: d.user.name,
    specialization: d.user.specialization,
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