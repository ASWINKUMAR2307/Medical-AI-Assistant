import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getDashboardMetrics } from '@/actions/dashboard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ConsultationActivityChart } from '@/components/dashboard/ConsultationActivityChart'
import { TriageDistributionChart } from '@/components/dashboard/TriageDistributionChart'
import { RecentPatients } from '@/components/dashboard/RecentPatients'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertTriangle, FileText, Plus, ChevronRight, Users, Stethoscope, UserCheck, ClipboardList, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function OverviewPage() {
  const session = await auth()
  const userName = session?.user?.name || 'User'
  const userRole = session?.user?.role
  const metrics = await getDashboardMetrics()
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  const isAdmin = userRole === 'ADMIN'
  const isDoctor = userRole === 'DOCTOR'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}, {userName}</h1>
            <p className="text-gray-500 mt-1">
              {isAdmin
                ? 'System overview and administrative controls.'
                : isDoctor
                ? 'Your clinical dashboard and patient overview.'
                : 'Your clinical workspace overview.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin/users">
                <Button variant="outline" size="sm">
                  <UserCheck className="w-4 h-4" />
                  Manage Users
                </Button>
              </Link>
            )}
            {(isAdmin || isDoctor) && (
              <Link href="/appointments/new">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  New Appointment
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/patients/new">
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4" />
                  Add Patient
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isDoctor && metrics.myPatients !== undefined && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Your Clinical Summary</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You have <span className="font-medium">{metrics.myPatients}</span> assigned patients and <span className="font-medium">{metrics.myConsultations}</span> consultations this week.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isDoctor && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">Clinical review queue needs attention</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {metrics.awaitingReview.value} case{metrics.awaitingReview.value !== 1 ? 's' : ''} awaiting clinician review.
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
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isDoctor ? (
            <>
              <MetricCard
                title="My Patients"
                value={(metrics.myPatients || 0).toLocaleString()}
                change={0}
                changeLabel="Assigned to you"
                icon={<Users className="w-6 h-6 text-blue-600" />}
                iconBg="bg-blue-100"
              />
              <MetricCard
                title="This Week's Consultations"
                value={metrics.myConsultations || 0}
                change={metrics.consultations.change}
                changeLabel="vs last week"
                icon={<Stethoscope className="w-6 h-6 text-green-600" />}
                iconBg="bg-green-100"
              />
              <MetricCard
                title="Pending Triage"
                value={metrics.awaitingReview.value}
                change={0}
                changeLabel="Requires review"
                icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
                iconBg="bg-amber-100"
              />
              <MetricCard
                title="Upcoming Appointments"
                value={metrics.activeDoctors.value}
                subValue={`${metrics.activeDoctors.percentage}% doctor availability`}
                icon={<Activity className="w-6 h-6 text-purple-600" />}
                iconBg="bg-purple-100"
              />
            </>
          ) : (
            <>
              <MetricCard
                title="Total Patients"
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
                title="Awaiting Review"
                value={metrics.awaitingReview.value}
                change={0}
                changeLabel="Queue"
                subValue="Clinician action required"
                icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
                iconBg="bg-amber-100"
              />
              <MetricCard
                title="Active Doctors"
                value={`${metrics.activeDoctors.value} / ${metrics.activeDoctors.total}`}
                subValue={`${metrics.activeDoctors.percentage}% availability`}
                icon={<UserCheck className="w-6 h-6 text-purple-600" />}
                iconBg="bg-purple-100"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsultationActivityChart data={metrics.consultationActivity} />
          {isDoctor ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/triage"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Review Triage Cases</p>
                      <p className="text-sm text-gray-500">{metrics.awaitingReview.value} cases pending review</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </Link>
                  <Link
                    href="/patients"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View My Patients</p>
                      <p className="text-sm text-gray-500">{(metrics.myPatients || 0)} patients assigned</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </Link>
                  <Link
                    href="/appointments"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Manage Appointments</p>
                      <p className="text-sm text-gray-500">View and schedule consultations</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <TriageDistributionChart data={metrics.triageDistribution} />
          )}
        </div>

        <RecentPatients patients={metrics.recentPatients} />
      </div>
    </DashboardLayout>
  )
}