'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn, formatDate, getStatusColor } from '@/lib/utils'
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Patient } from '@/actions/patients'

interface PatientTableProps {
  patients: Patient[]
  total: number
  page: number
  totalPages: number
  search: string
  status: string
  onSearchChange: (search: string) => void
  onStatusChange: (status: string) => void
  onPageChange: (page: number) => void
}

export function PatientTable({
  patients,
  total,
  page,
  totalPages,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onPageChange,
}: PatientTableProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Patients</h3>
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search patients..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discharged">Discharged</option>
          </select>
          <Link href="/patients/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              New patient
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Last consultation
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Assigned doctor
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No patients found.
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {patient.firstName} {patient.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {patient.patientId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {calculateAge(patient.dateOfBirth)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell capitalize">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {patient.phone || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {patient.lastConsultation ? formatDate(patient.lastConsultation) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(patient.status)
                      )}
                    >
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {patient.assignedDoctorName}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        aria-label={`View ${patient.firstName} ${patient.lastName}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Link>
                    </div>
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
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}