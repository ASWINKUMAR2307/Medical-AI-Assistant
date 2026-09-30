'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PatientTable } from '@/components/patients/PatientTable'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
  email: string | null
  lastConsultation: string | null
  status: string
  assignedDoctorName: string
}

export default function PatientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [patients, setPatients] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || ''

  useEffect(() => {
    setPage(initialPage)
    setSearch(initialSearch)
    setStatus(initialStatus)
  }, [initialPage, initialSearch, initialStatus])

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          search,
          status,
        })
        const response = await fetch(`/api/patients?${params}`)
        if (response.ok) {
          const data = await response.json()
          setPatients(data.patients)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [page, search, status])

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
    router.push(`/patients?${params.toString()}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500 mt-1">Manage patient records</p>
          </div>
          <Link href="/patients/new">
            <Button>
              <Plus className="w-4 h-4" />
              New patient
            </Button>
          </Link>
        </div>

        <PatientTable
          patients={patients}
          total={total}
          page={page}
          totalPages={totalPages}
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPageChange={handlePageChange}
        />
      </div>
    </DashboardLayout>
  )
}