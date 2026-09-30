'use client'

import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { getStatusColor } from '@/lib/utils'
import { MoreVertical, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  patientId: string
  name: string
  age: number
  lastConsultation: Date | string | null
  status: string
  assignedDoctor: string
}

interface RecentPatientsProps {
  patients: Patient[]
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent patients</h3>
          <p className="text-sm text-gray-500">Latest patient activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Search patients">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Filter patients">
            <Filter className="w-5 h-5" />
          </button>
          <Link
            href="/patients"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hidden sm:inline"
          >
            View all
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
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
                      {patient.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {patient.patientId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {patient.age}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {patient.lastConsultation
                      ? formatDate(patient.lastConsultation)
                      : '—'}
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
                    {patient.assignedDoctor}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        aria-label={`View ${patient.name}`}
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

      <div className="px-6 py-4 border-t border-gray-200">
        <Link
          href="/patients"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          View all patients
        </Link>
      </div>
    </div>
  )
}