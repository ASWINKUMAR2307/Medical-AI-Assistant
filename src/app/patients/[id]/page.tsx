'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, formatDateTime, getStatusColor, calculateAge, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  FileText,
  AlertTriangle,
  User,
  Heart,
  Shield,
  Activity,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface PatientDetail {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
  email: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  bloodType: string | null
  allergies: string | null
  medicalHistory: string | null
  status: string
  assignedDoctorId: string | null
  assignedDoctorName: string
  assignedDoctorSpecialization: string | null
  lastConsultation: string | null
  age: number
  consultations: Array<{
    id: string
    consultationId: string
    startedAt: string
    endedAt: string | null
    chiefComplaint: string
    diagnosis: string | null
    treatmentPlan: string | null
    doctorName: string
  }>
  medicalRecords: Array<{
    id: string
    recordId: string
    type: string
    title: string
    description: string | null
    createdAt: string
    clinicianName: string
  }>
  appointments: Array<{
    id: string
    appointmentId: string
    scheduledAt: string
    duration: number
    status: string
    reason: string | null
    doctorName: string
  }>
  triageCases: Array<{
    id: string
    caseId: string
    submittedAt: string
    presentingConcern: string
    aiAssessment: string | null
    status: string
    assignedClinicianName: string | null
  }>
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'records' | 'appointments' | 'triage'>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/patients/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setPatient(data)
        } else if (response.status === 404) {
          router.push('/patients')
        }
      } catch (error) {
        console.error('Failed to fetch patient:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [params.id, router])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Patient not found</h1>
          <Link href="/patients" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Back to patients
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'consultations', label: 'Consultations', icon: Stethoscope, count: patient.consultations.length },
    { id: 'records', label: 'Medical Records', icon: FileText, count: patient.medicalRecords.length },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: patient.appointments.length },
    { id: 'triage', label: 'Triage History', icon: AlertTriangle, count: patient.triageCases.length },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/patients"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Back to patients"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {patient.firstName} {patient.lastName}
                <span className="text-sm font-normal text-gray-500">{patient.patientId}</span>
              </h1>
              <p className="text-gray-500">{patient.age} years old • {patient.gender}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/patients/${patient.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600"
              aria-label="Delete patient"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-700">{getInitials(patient.firstName + ' ' + patient.lastName)}</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">{patient.age} years • {patient.gender}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Patient ID</span>
                      <span className="font-medium">{patient.patientId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date of Birth</span>
                      <span className="font-medium">{formatDate(patient.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Blood Type</span>
                      <span className="font-medium">{patient.bloodType || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(patient.status)
                      )}>
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                  {patient.emergencyContactName && (
                    <div className="pt-2 border-t border-gray-200 flex items-center gap-3 text-sm">
                      <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{patient.emergencyContactName}</p>
                        <p className="text-gray-500">{patient.emergencyContactPhone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clinical Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Stethoscope className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Assigned Doctor</p>
                      <p className="text-gray-500">{patient.assignedDoctorName}</p>
                    </div>
                  </div>
                  {patient.assignedDoctorSpecialization && (
                    <p className="text-sm text-gray-500 pl-8">{patient.assignedDoctorSpecialization}</p>
                  )}
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    {patient.allergies && (
                      <div className="flex items-start gap-3 text-sm text-red-600">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Allergies</p>
                          <p>{patient.allergies}</p>
                        </div>
                      </div>
                    )}
                    {patient.medicalHistory && (
                      <div className="flex items-start gap-3 text-sm">
                        <Heart className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Medical History</p>
                          <p className="text-gray-500">{patient.medicalHistory}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Activity className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Last Consultation</p>
                        <p className="text-gray-500">{patient.lastConsultation ? formatDate(patient.lastConsultation) : 'No consultations yet'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.consultations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No consultations recorded</p>
                  ) : (
                    <div className="space-y-4">
                      {patient.consultations.slice(0, 5).map((consultation) => (
                        <Link
                          key={consultation.id}
                          href={`/consultations/${consultation.id}`}
                          className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{consultation.chiefComplaint}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDateTime(consultation.startedAt)} • Dr. {consultation.doctorName}
                              </p>
                              {consultation.diagnosis && (
                                <p className="text-sm text-gray-600 mt-1">Diagnosis: {consultation.diagnosis}</p>
                              )}
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  const upcomingAppointments = patient.appointments.filter(a => 
                    ['SCHEDULED', 'CONFIRMED'].includes(a.status) && new Date(a.scheduledAt) > new Date()
                  ).slice(0, 5)
                  
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <Link
                          key={appointment.id}
                          href={`/appointments/${appointment.id}`}
                          className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{appointment.reason || 'Appointment'}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDateTime(appointment.scheduledAt)} • {appointment.duration} min
                              </p>
                              <p className="text-sm text-gray-600 mt-1">Dr. {appointment.doctorName}</p>
                            </div>
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(appointment.status.toLowerCase())
                            )}>
                              {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consultation ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chief Complaint</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnosis</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patient.consultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(consultation.startedAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{consultation.consultationId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{consultation.chiefComplaint}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{consultation.diagnosis || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Dr. {consultation.doctorName}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          consultation.endedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {consultation.endedAt ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Record ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clinician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patient.medicalRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(record.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.recordId}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {record.type.charAt(0) + record.type.slice(1).toLowerCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.clinicianName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Appointment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patient.appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(appointment.scheduledAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{appointment.appointmentId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{appointment.reason || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Dr. {appointment.doctorName}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(appointment.status.toLowerCase())
                        )}>
                          {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase().replace('_', '-')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{appointment.duration} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'triage' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              AI triage is informational and must be reviewed by a qualified clinician.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Presenting Concern</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Assessment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patient.triageCases.map((triage) => (
                    <tr key={triage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(triage.submittedAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{triage.caseId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{triage.presentingConcern}</td>
                      <td className="px-6 py-4">
                        {triage.aiAssessment && (
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            triage.aiAssessment === 'URGENT' && 'bg-red-100 text-red-700',
                            triage.aiAssessment === 'PRIORITY' && 'bg-orange-100 text-orange-700',
                            triage.aiAssessment === 'STANDARD' && 'bg-blue-100 text-blue-700',
                            triage.aiAssessment === 'SELF_CARE' && 'bg-green-100 text-green-700'
                          )}>
                            {triage.aiAssessment.charAt(0) + triage.aiAssessment.slice(1).toLowerCase().replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(triage.status.toLowerCase())
                        )}>
                          {triage.status.charAt(0) + triage.status.slice(1).toLowerCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{triage.assignedClinicianName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete patient</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete {patient.firstName} {patient.lastName}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={async () => {
                  try {
                    await fetch(`/api/patients/${patient.id}`, { method: 'DELETE' })
                    router.push('/patients')
                  } catch (error) {
                    console.error('Failed to delete patient:', error)
                  }
                }}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}