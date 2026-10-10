'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Search, Filter, ChevronLeft, ChevronRight, FileText, User, Clock, AlertTriangle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
  }
}

export default function AdminAuditLogsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAdmin } = usePermissions()

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-500 mt-2">You don't have permission to view audit logs.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialSearch = searchParams.get('search') || ''
  const initialAction = searchParams.get('action') || ''
  const initialEntity = searchParams.get('entity') || ''

  useEffect(() => {
    setPage(initialPage)
    setSearch(initialSearch)
    setActionFilter(initialAction)
    setEntityFilter(initialEntity)
  }, [initialPage, initialSearch, initialAction, initialEntity])

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          search,
          action: actionFilter,
          entity: entityFilter,
        })
        const response = await fetch(`/api/admin/audit-logs?${params}`)
        if (response.ok) {
          const data = await response.json()
          setLogs(data.logs)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [page, search, actionFilter, entityFilter])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    updateUrl()
  }

  const handleActionChange = (value: string) => {
    setActionFilter(value)
    setPage(1)
    updateUrl()
  }

  const handleEntityChange = (value: string) => {
    setEntityFilter(value)
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
    if (actionFilter) params.set('action', actionFilter)
    if (entityFilter) params.set('entity', entityFilter)
    router.push(`/admin/audit-logs?${params.toString()}`)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'LOGIN': return 'bg-purple-100 text-purple-800'
      case 'LOGOUT': return 'bg-gray-100 text-gray-800'
      case 'REVIEW': return 'bg-amber-100 text-amber-800'
      case 'OVERRIDE': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'User': return <User className="w-4 h-4" />
      case 'Patient': return <User className="w-4 h-4" />
      case 'Appointment': return <FileText className="w-4 h-4" />
      case 'TriageCase': return <AlertTriangle className="w-4 h-4" />
      case 'MedicalRecord': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-500 mt-1">System activity and security audit trail</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {total} total
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => handleActionChange(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="REVIEW">Review</option>
                <option value="OVERRIDE">Override</option>
              </select>
              <select
                value={entityFilter}
                onChange={(e) => handleEntityChange(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All entities</option>
                <option value="User">User</option>
                <option value="Patient">Patient</option>
                <option value="Appointment">Appointment</option>
                <option value="TriageCase">Triage Case</option>
                <option value="MedicalRecord">Medical Record</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Entity ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{log.actor.name}</p>
                            <p className="text-xs text-gray-500">{log.actor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                          {getEntityIcon(log.entity)}
                          {log.entity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono hidden lg:table-cell">
                        {log.entityId.slice(0, 12)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                        {log.ipAddress || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <details className="text-sm text-gray-500">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View details</summary>
                          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}