'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { ArrowLeft, User, Calendar, Phone, Mail, MapPin, Shield, Heart, AlertTriangle, Droplet, Pill } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  assignedDoctorId: z.string().optional(),
})

type PatientForm = z.infer<typeof patientSchema>

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = ['Male', 'Female', 'Other']

export default function NewPatientPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; specialization: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'Male',
    },
  })

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors/available')
        if (response.ok) {
          const data = await response.json()
          setDoctors(data)
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error)
      } finally {
        setIsDoctorsLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const onSubmit = async (data: PatientForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const patient = await response.json()
        router.push(`/patients/${patient.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create patient')
      }
    } catch (error) {
      console.error('Failed to create patient:', error)
      alert('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/patients"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Back to patients"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New patient</h1>
            <p className="text-gray-500">Create a new patient record</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter the patient's basic demographic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('firstName')}
                      id="firstName"
                      type="text"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      )}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('lastName')}
                      id="lastName"
                      type="text"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      )}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('dateOfBirth')}
                      id="dateOfBirth"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                      )}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    {...register('gender')}
                    className={cn(
                      'w-full px-4 py-2.5 border rounded-lg text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      errors.gender ? 'border-red-300' : 'border-gray-300'
                    )}
                  >
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood type
                </label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    {...register('bloodType')}
                    id="bloodType"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Phone, email, and address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('phone')}
                      id="phone"
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+880-1X-XXXX-XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      )}
                      placeholder="patient@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <textarea
                    {...register('address')}
                    id="address"
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="House 123, Road 45, Dhaka 1200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Person to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact name
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('emergencyContactName')}
                      id="emergencyContactName"
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('emergencyContactPhone')}
                      id="emergencyContactPhone"
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+880-1X-XXXX-XXXX"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Allergies, medical history, and assigned doctor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    {...register('allergies')}
                    id="allergies"
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Penicillin, Sulfa drugs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical history
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    {...register('medicalHistory')}
                    id="medicalHistory"
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Hypertension, Type 2 Diabetes, Previous MI"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="assignedDoctorId" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned doctor
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    {...register('assignedDoctorId')}
                    id="assignedDoctorId"
                    disabled={isDoctorsLoading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Select a doctor (optional)</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} ({doctor.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link href="/patients">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Create patient
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}