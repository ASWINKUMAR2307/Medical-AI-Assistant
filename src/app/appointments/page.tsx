'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Calendar, Clock, User, Stethoscope, MoreVertical, Eye, Edit, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns'

interface Appointment {
  id: string
  appointmentId: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
  doctorId: string
  doctorName: string
  doctorSpecialization: string
  scheduledAt: string
  duration: number
  status: string
  reason: string | null
  notes: string | null
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
}

const statusIcons: Record<string, React.ReactNode> = {
  SCHEDULED: <Clock className="w-3.5 h-3.5" />,
  CONFIRMED: <CheckCircle className="w-3.5 h-3.5" />,
  COMPLETED: <CheckCircle className="w-3.5 h-3.5" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5" />,
  NO_SHOW: <AlertCircle className="w-3.5 h-3.5" />,
}

export default function AppointmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || ''
  const initialDate = searchParams.get('date') || ''
  const initialView = searchParams.get('view') || 'list'

  useEffect(() => {
    setPage(initialPage)
    setSearch(initialSearch)
    setStatus(initialStatus)
    setDateFilter(initialDate)
    setViewMode(initialView as 'list' | 'calendar')
  }, [initialPage, initialSearch, initialStatus, initialDate, initialView])

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '15',
          search,
          status,
          date: dateFilter,
        })
        const response = await fetch(`/api/appointments?${params}`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [page, search, status, dateFilter])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    updateUrl()
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
    updateUrl()
  }

  const handleDateChange = (value: string) => {
    setDateFilter(value)
    setPage(1)
    updateUrl()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      updateUrl()
    }
  }

  const updateUrl = () => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page.toString())
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (dateFilter) params.set('date', dateFilter)
    if (viewMode !== 'list') params.set('view', viewMode)
    router.push(`/appointments?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusIcons[status]}
      {status}
    </span>
  )

  const formatDateTime = (dateStr: string) => {
    const date = parseISO(dateStr)
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a'),
      isToday: isToday(date),
      isTomorrow: isTomorrow(date),
      isPast: isPast(date),
      isFuture: isFuture(date),
    }
  }

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (viewMode === 'calendar') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-500 mt-1">Manage and view appointments</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => { setViewMode('list'); updateUrl(); }}>
                List View
              </Button>
              <Link href="/appointments/new">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  New appointment
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date(today)
                date.setDate(date.getDate() - today.getDay() + i)
                const dayAppointments = appointments.filter(a => {
                  const aptDate = parseISO(a.scheduledAt)
                  return aptDate.toDateString() === date.toDateString()
                })
                return (
                  <div key={i} className="min-h-[100px] border border-gray-100 p-2 relative">
                    <span className={`text-sm font-medium ${date.toDateString() === today.toDateString() ? 'text-blue-600' : 'text-gray-900'}`}>
                      {format(date, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded truncate" title={apt.patientName}>
                          {format(parseISO(apt.scheduledAt), 'h:mm a')} - {apt.patientName}
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayAppointments.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-1">Manage and view appointments</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setViewMode('calendar'); updateUrl(); }}>
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </Button>
            <Link href="/appointments/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                New appointment
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                <p className="text-gray-500 mt-2">Get started by creating a new appointment</p>
                <Link href="/appointments/new" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-4 h-4" />
                  Create appointment
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {appointments.map((appointment) => {
                        const { date, time, isToday, isTomorrow, isPast, isFuture } = formatDateTime(appointment.scheduledAt)
                        return (
                          <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{appointment.appointmentId}</div>
                              <div className="text-sm text-gray-500">ID: {appointment.id.slice(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{appointment.patientName}</div>
                                  <div className="text-sm text-gray-500">Age: {appointment.patientAge} • {appointment.patientGender}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Stethoscope className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{appointment.doctorName}</div>
                                  <div className="text-sm text-gray-500">{appointment.doctorSpecialization}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div>
                                  <div className={`font-medium text-gray-900 ${isToday ? 'text-blue-600' : ''}`}>
                                    {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date}
                                  </div>
                                  <div className="text-sm text-gray-500">{time}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{appointment.duration} min</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(appointment.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 max-w-xs truncate" title={appointment.reason || ''}>
                                {appointment.reason || '—'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/appointments/${appointment.id}`}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/appointments/${appointment.id}/edit`}
                                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="More options"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing page {page} of {totalPages} ({total} total)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}