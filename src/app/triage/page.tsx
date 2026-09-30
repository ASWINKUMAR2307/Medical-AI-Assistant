'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, AlertTriangle, Clock, User, Stethoscope, MoreVertical, Eye, Edit, CheckCircle, XCircle, AlertCircle as AlertCircleIcon, Flag, Brain } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface TriageCase {
  id: string
  caseId: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
  presentingConcern: string
  symptoms: string[] | string
  aiAssessment: string | null
  aiConfidence: number | null
  riskIndicators: string[] | string
  status: string
  submittedAt: string
  assignedClinicianId: string | null
  assignedClinicianName: string | null
}

function parseJsonArray(value: string[] | string): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }
  return []
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  OVERRIDDEN: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-gray-100 text-gray-800',
}

const assessmentColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800 border-red-200',
  PRIORITY: 'bg-orange-100 text-orange-800 border-orange-200',
  STANDARD: 'bg-blue-100 text-blue-800 border-blue-200',
  SELF_CARE: 'bg-green-100 text-green-800 border-green-200',
}

const assessmentIcons: Record<string, React.ReactNode> = {
  URGENT: <AlertTriangle className="w-3.5 h-3.5" />,
  PRIORITY: <Flag className="w-3.5 h-3.5" />,
  STANDARD: <Clock className="w-3.5 h-3.5" />,
  SELF_CARE: <CheckCircle className="w-3.5 h-3.5" />,
}

export default function TriagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cases, setCases] = useState<TriageCase[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [assessment, setAssessment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || ''
  const initialAssessment = searchParams.get('assessment') || ''

  useEffect(() => {
    setPage(initialPage)
    setSearch(initialSearch)
    setStatus(initialStatus)
    setAssessment(initialAssessment)
  }, [initialPage, initialSearch, initialStatus, initialAssessment])

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '15',
          search,
          status,
          assessment,
        })
        const response = await fetch(`/api/triage?${params}`)
        if (response.ok) {
          const data = await response.json()
          setCases(data.cases)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch triage cases:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [page, search, status, assessment])

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

  const handleAssessmentChange = (value: string) => {
    setAssessment(value)
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
    if (assessment) params.set('assessment', assessment)
    router.push(`/triage?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )

  const getAssessmentBadge = (assessment: string | null) => {
    if (!assessment) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <Clock className="w-3.5 h-3.5" />
        Pending AI
      </span>
    )
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${assessmentColors[assessment] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {assessmentIcons[assessment]}
        {assessment}
        {assessment !== 'SELF_CARE' && <span className="ml-1 px-1.5 py-0.5 rounded bg-white/30 text-xs font-bold">{Math.round((cases.find(c => c.aiAssessment === assessment)?.aiConfidence || 0) * 100)}%</span>}
      </span>
    )
  }

  const formatDateTime = (dateStr: string) => {
    const date = parseISO(dateStr)
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a'),
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Triage</h1>
            <p className="text-gray-500 mt-1">Review and manage AI-assessed triage cases</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-100">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cases.filter(c => c.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Review</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cases.filter(c => c.status === 'IN_REVIEW').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgent (AI)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cases.filter(c => c.aiAssessment === 'URGENT').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
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
                  placeholder="Search triage cases..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="OVERRIDDEN">Overridden</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <select
                  value={assessment}
                  onChange={(e) => handleAssessmentChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All AI Assessments</option>
                  <option value="URGENT">Urgent</option>
                  <option value="PRIORITY">Priority</option>
                  <option value="STANDARD">Standard</option>
                  <option value="SELF_CARE">Self Care</option>
                  <option value="">Pending AI</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading triage cases...</p>
              </div>
            ) : cases.length === 0 ? (
              <div className="p-12 text-center">
                <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No triage cases found</h3>
                <p className="text-gray-500 mt-2">AI triage cases will appear here when submitted</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presenting Concern</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptoms</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Assessment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Indicators</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cases.map((triageCase) => {
                        const { date, time } = formatDateTime(triageCase.submittedAt)
                        return (
                          <tr key={triageCase.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{triageCase.caseId}</div>
                              <div className="text-sm text-gray-500">ID: {triageCase.id.slice(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{triageCase.patientName}</div>
                                  <div className="text-sm text-gray-500">Age: {triageCase.patientAge} • {triageCase.patientGender}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={triageCase.presentingConcern}>
                                {triageCase.presentingConcern}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {parseJsonArray(triageCase.symptoms).slice(0, 3).map((symptom, i) => (
                                  <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                                    {symptom}
                                  </span>
                                ))}
                                {parseJsonArray(triageCase.symptoms).length > 3 && (
                                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded_full">
                                    +{parseJsonArray(triageCase.symptoms).length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getAssessmentBadge(triageCase.aiAssessment)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {parseJsonArray(triageCase.riskIndicators).slice(0, 2).map((risk, i) => (
                                  <span key={i} className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded_full">
                                    {risk}
                                  </span>
                                ))}
                                {parseJsonArray(triageCase.riskIndicators).length > 2 && (
                                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded_full">
                                    +{parseJsonArray(triageCase.riskIndicators).length - 2}
                                  </span>
                                )}
                                {parseJsonArray(triageCase.riskIndicators).length === 0 && (
                                  <span className="text-xs text-gray-400">None</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(triageCase.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">
                                <div>{date}</div>
                                <div className="text-gray-400">{time}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">
                                {triageCase.assignedClinicianName || <span className="text-gray-400">Unassigned</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/triage/${triageCase.id}`}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Review case"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Take action"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
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