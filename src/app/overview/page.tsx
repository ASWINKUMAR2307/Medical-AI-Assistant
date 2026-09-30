import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getDashboardMetrics } from '@/actions/dashboard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ConsultationActivityChart } from '@/components/dashboard/ConsultationActivityChart'
import { TriageDistributionChart } from '@/components/dashboard/TriageDistributionChart'
import { RecentPatients } from '@/components/dashboard/RecentPatients'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertTriangle, FileText, Plus, ChevronRight, Users, Stethoscope, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function OverviewPage() {
  const metrics = await getDashboardMetrics()
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}, Ashik</h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s what&apos;s happening across your care network today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4" />
              Export report
            </Button>
            <Link href="/appointments/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                New appointment
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Clinical review queue needs attention</h3>
              <p className="text-sm text-amber-700 mt-1">
                3 cases are marked for urgent clinician review. Review the details before taking action.
              </p>
              <Link
                href="/triage"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                Review cases <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total patients"
            value={metrics.totalPatients.value.toLocaleString()}
            change={metrics.totalPatients.change}
            changeLabel="vs last month"
            icon={<Users className="w-6 h-6 text-blue-600" />}
            iconBg="bg-blue-100"
          />
          <MetricCard
            title="Consultations"
            value={metrics.consultations.value}
            change={metrics.consultations.change}
            changeLabel="vs last week"
            icon={<Stethoscope className="w-6 h-6 text-green-600" />}
            iconBg="bg-green-100"
          />
          <MetricCard
            title="Awaiting review"
            value={metrics.awaitingReview.value}
            change={0}
            changeLabel="Queue"
            subValue="Clinician action required"
            icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
            iconBg="bg-amber-100"
          />
          <MetricCard
            title="Active doctors"
            value={`${metrics.activeDoctors.value} / ${metrics.activeDoctors.total}`}
            subValue={`${metrics.activeDoctors.percentage}% availability`}
            icon={<UserCheck className="w-6 h-6 text-purple-600" />}
            iconBg="bg-purple-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsultationActivityChart data={metrics.consultationActivity} />
          <TriageDistributionChart data={metrics.triageDistribution} />
        </div>

        <RecentPatients patients={metrics.recentPatients} />
      </div>
    </DashboardLayout>
  )
}