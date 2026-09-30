'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, FileText, FileText as FileMedical, Pill, FlaskConical, Eye, Edit, MoreVertical, Download, Upload, FolderOpen, Stethoscope, Calendar, User, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface MedicalRecord {
  id: string
  recordId: string
  patientId: string
  patientName: string
  patientAge: number
  type: string
  title: string
  description: string | null
  clinicianName: string
  tags: string[]
  isConfidential: boolean
  createdAt: string
}

const typeColors: Record<string, string> = {
  CONSULTATION: 'bg-blue-100 text-blue-800',
  CLINICAL_NOTE: 'bg-green-100 text-green-800',
  LAB_RESULT: 'bg-purple-100 text-purple-800',
  MEDICATION: 'bg-orange-100 text-orange-800',
  REFERRAL: 'bg-pink-100 text-pink-800',
  DOCUMENT: 'bg-gray-100 text-gray-800',
}

const typeIcons: Record<string, React.ReactNode> = {
  CONSULTATION: <Stethoscope className="w-3.5 h-3.5" />,
  CLINICAL_NOTE: <FileText className="w-3.5 h-3.5" />,
  LAB_RESULT: <FlaskConical className="w-3.5 h-3.5" />,
  MEDICATION: <Pill className="w-3.5 h-3.5" />,
  REFERRAL: <FileMedical className="w-3.5 h-3.5" />,
  DOCUMENT: <FolderOpen className="w-3.5 h-3.5" />,
}

export default function MedicalRecordsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [patientId, setPatientId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialSearch = searchParams.get('search') || ''
  const initialType = searchParams.get('type') || ''
  const initialPatientId = searchParams.get('patientId') || ''

  useEffect(() => {
    setPage(initialPage)
    setSearch(initialSearch)
    setType(initialType)
    setPatientId(initialPatientId)
  }, [initialPage, initialSearch, initialType, initialPatientId])

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '15',
          search,
          type,
          patientId,
        })
        const response = await fetch(`/api/medical-records?${params}`)
        if (response.ok) {
          const data = await response.json()
          setRecords(data.records)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch medical records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [page, search, type, patientId])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    updateUrl()
  }

  const handleTypeChange = (value: string) => {
    setType(value)
    setPage(1)
    updateUrl()
  }

  const handlePatientChange = (value: string) => {
    setPatientId(value)
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
    if (type) params.set('type', type)
    if (patientId) params.set('patientId', patientId)
    router.push(`/medical-records?${params.toString()}`)
  }

  const getTypeBadge = (type: string) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
      {typeIcons[type]}
      {type.replace('_', ' ')}
    </span>
  )

  const formatDateTime = (dateStr: string) => {
    const date = parseISO(dateStr)
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a'),
    }
  }

  const recordTypes = [
    { value: '', label: 'All Types' },
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'CLINICAL_NOTE', label: 'Clinical Note' },
    { value: 'LAB_RESULT', label: 'Lab Result' },
    { value: 'MEDICATION', label: 'Medication' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'DOCUMENT', label: 'Document' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-500 mt-1">Manage patient medical records and documents</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <Link href="/medical-records/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                New record
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
                  placeholder="Search records, patients, titles..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]"
                >
                  {recordTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Patient ID or name"
                  value={patientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading medical records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <FileMedical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No medical records found</h3>
                <p className="text-gray-500 mt-2">Create a new medical record to get started</p>
                <Link href="/medical-records/new" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-4 h-4" />
                  Create record
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinician</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidential</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {records.map((record) => {
                        const { date, time } = formatDateTime(record.createdAt)
                        return (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{record.recordId}</div>
                              <div className="text-sm text-gray-500">ID: {record.id.slice(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              {getTypeBadge(record.type)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900 max-w-xs truncate" title={record.title}>
                                {record.title}
                              </div>
                              {record.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate" title={record.description}>
                                  {record.description}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{record.patientName}</div>
                                  <div className="text-sm text-gray-500">Age: {record.patientAge}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">{record.clinicianName}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {record.tags.slice(0, 3).map((tag, i) => (
                                  <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                                {record.tags.length > 3 && (
                                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    +{record.tags.length - 3}
                                  </span>
                                )}
                                {record.tags.length === 0 && (
                                  <span className="text-xs text-gray-400">No tags</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">
                                <div>{date}</div>
                                <div className="text-gray-400">{time}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {record.isConfidential ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle className="w-3 h-3" />
                                  Confidential
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Standard</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/medical-records/${record.id}`}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View record"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/medical-records/${record.id}/edit`}
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