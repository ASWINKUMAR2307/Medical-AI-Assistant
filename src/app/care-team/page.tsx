'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, User, Stethoscope, Mail, Phone, Calendar, Shield, UserCheck, UserX, MoreVertical, Eye, Edit, Trash2, HeartPulse, Briefcase, GraduationCap, Award, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  phone: string | null
  role: string
  department: string | null
  specialization: string | null
  licenseNumber: string | null
  avatarUrl: string | null
  isActive: boolean
  availability: boolean
  maxAppointmentsPerDay: number
  createdAt: string
  stats: {
    patients: number
    consultations: number
    appointmentsToday: number
  }
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  DOCTOR: 'bg-blue-100 text-blue-800',
  CLINICIAN: 'bg-green-100 text-green-800',
  NURSE: 'bg-pink-100 text-pink-800',
  CARE_COORDINATOR: 'bg-amber-100 text-amber-800',
}

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="w-3.5 h-3.5" />,
  DOCTOR: <Stethoscope className="w-3.5 h-3.5" />,
  CLINICIAN: <UserCheck className="w-3.5 h-3.5" />,
  NURSE: <HeartPulse className="w-3.5 h-3.5" />,
  CARE_COORDINATOR: <Briefcase className="w-3.5 h-3.5" />,
}

export default function CareTeamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialSearch = searchParams.get('search') || ''
  const initialRole = searchParams.get('role') || ''
  const initialDepartment = searchParams.get('department') || ''
  const initialStatus = searchParams.get('status') || ''

  useEffect(() => {
    setPage(initialPage)
    setSearch(initialSearch)
    setRole(initialRole)
    setDepartment(initialDepartment)
    setStatus(initialStatus)
  }, [initialPage, initialSearch, initialRole, initialDepartment, initialStatus])

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          search,
          role,
          department,
          status,
        })
        const response = await fetch(`/api/care-team?${params}`)
        if (response.ok) {
          const data = await response.json()
          setMembers(data.members)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch care team:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [page, search, role, department, status])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    updateUrl()
  }

  const handleRoleChange = (value: string) => {
    setRole(value)
    setPage(1)
    updateUrl()
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    setPage(1)
    updateUrl()
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
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
    if (role) params.set('role', role)
    if (department) params.set('department', department)
    if (status) params.set('status', status)
    router.push(`/care-team?${params.toString()}`)
  }

  const getRoleBadge = (role: string) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
      {roleIcons[role]}
      {role.replace('_', ' ')}
    </span>
  )

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    return format(date, 'MMM d, yyyy')
  }

  const roles = [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'CLINICIAN', label: 'Clinician' },
    { value: 'NURSE', label: 'Nurse' },
    { value: 'CARE_COORDINATOR', label: 'Care Coordinator' },
  ]

  const departments = [
    { value: '', label: 'All Departments' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Internal Medicine', label: 'Internal Medicine' },
    { value: 'Surgery', label: 'Surgery' },
    { value: 'Radiology', label: 'Radiology' },
    { value: 'General', label: 'General' },
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Care Team</h1>
            <p className="text-gray-500 mt-1">Manage clinical staff and care providers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2 rounded transition-colors', viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100')}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2 rounded transition-colors', viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100')}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <Link href="/care-team/new">
              <Button>
                <Plus className="w-4 h-4" />
                Add member
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {members.filter(m => m.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <Stethoscope className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {members.filter(m => m.role === 'DOCTOR').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Appts Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {members.reduce((sum, m) => sum + m.stats.appointmentsToday, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, specialization..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                >
                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[130px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading care team...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No team members found</h3>
                <p className="text-gray-500 mt-2">Add your first team member to get started</p>
                <Link href="/care-team/new" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-4 h-4" />
                  Add member
                </Link>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                              {getInitials(member.name)}
                            </div>
                          )}
                          <div className={cn(
                            'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white',
                            member.isActive ? 'bg-green-500' : 'bg-gray-400'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
                            {getRoleBadge(member.role)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{member.email}</p>
                          {member.department && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {member.department}
                            </p>
                          )}
                          {member.specialization && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <GraduationCap className="w-3 h-3" />
                              {member.specialization}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <User className="w-3.5 h-3.5" />
                              {member.stats.patients}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {member.stats.consultations}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Link
                          href={`/care-team/${member.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/care-team/${member.id}/edit`}
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
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                {getInitials(member.name)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(member.role)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {member.department ? (
                              <>
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {member.department}
                              </>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {member.specialization ? (
                              <>
                                <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                                {member.specialization}
                              </>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {member.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {member.stats.patients}
                            </div>
                            <div className="flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {member.stats.consultations}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {member.stats.appointmentsToday}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                            member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          )}>
                            {member.isActive ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{formatDate(member.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/care-team/${member.id}`}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View profile"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/care-team/${member.id}/edit`}
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}