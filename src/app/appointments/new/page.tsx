'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ArrowLeft, Calendar, Clock, User, Stethoscope, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  scheduledAt: z.string().min(1, 'Date and time is required'),
  duration: z.coerce.number().min(15, 'Minimum 15 minutes').max(240, 'Maximum 4 hours'),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

type AppointmentForm = z.infer<typeof appointmentSchema>

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
}

interface Doctor {
  id: string
  user: { name: string }
  specialization: string
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fetchingData, setFetchingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 30,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true)
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch('/api/patients?limit=100'),
          fetch('/api/doctors?available=true'),
        ])

        if (patientsRes.ok) {
          const data = await patientsRes.json()
          setPatients(data.patients || [])
        }
        if (doctorsRes.ok) {
          const data = await doctorsRes.json()
          setDoctors(data.doctors || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setFetchingData(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (data: AppointmentForm) => {
    setIsLoading(true)
    setFormError(null)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          scheduledAt: new Date(data.scheduledAt).toISOString(),
          createdById: 'current-user-id', // In real app, get from session
        }),
      })

      const result = await response.json()

      if (response.ok) {
        router.push('/appointments')
        router.refresh()
      } else {
        setFormError(result.error || 'Failed to create appointment')
      }
    } catch {
      setFormError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPatientName = (patient: Patient) => {
    const age = calculateAge(patient.dateOfBirth)
    return `${patient.firstName} ${patient.lastName} (${patient.patientId}) - Age ${age}, ${patient.gender}`
  }

  const formatDoctorName = (doctor: Doctor) => {
    return `${doctor.user.name} - ${doctor.specialization}`
  }

  if (fetchingData) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/appointments" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Appointment</h1>
            <p className="text-gray-500 mt-1">Schedule a new appointment for a patient</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Fill in the information below to schedule the appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('patientId')}
                  id="patientId"
                  className={cn(
                    'w-full px-4 py-2.5 border rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    errors.patientId ? 'border-red-300' : 'border-gray-300'
                  )}
                  disabled={isLoading}
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {formatPatientName(patient)}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('doctorId')}
                  id="doctorId"
                  className={cn(
                    'w-full px-4 py-2.5 border rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    errors.doctorId ? 'border-red-300' : 'border-gray-300'
                  )}
                  disabled={isLoading}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {formatDoctorName(doctor)}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('scheduledAt')}
                      id="scheduledAt"
                      type="datetime-local"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.scheduledAt ? 'border-red-300' : 'border-gray-300'
                      )}
                      disabled={isLoading}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  {errors.scheduledAt && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      {...register('duration')}
                      id="duration"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.duration ? 'border-red-300' : 'border-gray-300'
                      )}
                      disabled={isLoading}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for visit
                </label>
                <textarea
                  {...register('reason')}
                  id="reason"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Follow-up consultation, Annual check-up, Specific symptoms..."
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional notes
                </label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information for the doctor..."
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/appointments">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    <ArrowLeft className="w-4 h-4" />
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" isLoading={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Create appointment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}