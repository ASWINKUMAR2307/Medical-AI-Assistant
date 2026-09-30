'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, ChevronLeft, ChevronRight, Download, BarChart3, TrendingUp, TrendingDown, Users, Stethoscope, Clock, AlertTriangle, FileText, Pill, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format, parseISO, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'

interface AnalyticsData {
  overview: {
    totalPatients: number
    totalConsultations: number
    avgConsultationDuration: number
    patientSatisfaction: number
    triageCases: number
    urgentTriage: number
  }
  consultationTrend: { date: string; consultations: number; completed: number }[]
  triageDistribution: { name: string; value: number; color: string }[]
  doctorPerformance: { name: string; consultations: number; avgDuration: number; patients: number }[]
  departmentStats: { department: string; patients: number; consultations: number; triageCases: number }[]
  monthlyGrowth: { month: string; patients: number; consultations: number }[]
  appointmentStatus: { status: string; count: number; color: string }[]
  medicationStats: { name: string; prescribed: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() })
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'operational' | 'financial'>('overview')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        })
        const response = await fetch(`/api/analytics?${params}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(Math.round(change * 10) / 10), isPositive: change >= 0 }
  }

  const MetricCard = ({ title, value, change, icon, iconBg, trend }: {
    title: string
    value: string | number
    change?: { value: number; isPositive: boolean }
    icon: React.ReactNode
    iconBg: string
    trend?: 'up' | 'down' | 'neutral'
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                {change.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={cn('text-sm font-medium', change.isPositive ? 'text-green-600' : 'text-red-600')}>
                  {change.value}% vs last period
                </span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Clinical and operational analytics</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}><CardContent className="p-6 h-24 animate-pulse bg-gray-100 rounded-xl" /></Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Unable to load analytics</h3>
        </div>
      </DashboardLayout>
    )
  }

  const { overview, consultationTrend, triageDistribution, doctorPerformance, departmentStats, monthlyGrowth, appointmentStatus, medicationStats } = data

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Clinical and operational insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
              </span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'clinical', label: 'Clinical', icon: Stethoscope },
            { id: 'operational', label: 'Operational', icon: Target },
            { id: 'financial', label: 'Financial', icon: Pill },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Patients"
                value={formatNumber(overview.totalPatients)}
                change={getChange(overview.totalPatients, overview.totalPatients * 0.85)}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                iconBg="bg-blue-100"
              />
              <MetricCard
                title="Consultations"
                value={formatNumber(overview.totalConsultations)}
                change={getChange(overview.totalConsultations, overview.totalConsultations * 0.92)}
                icon={<Stethoscope className="w-6 h-6 text-green-600" />}
                iconBg="bg-green-100"
              />
              <MetricCard
                title="Avg. Duration"
                value={`${overview.avgConsultationDuration} min`}
                change={getChange(overview.avgConsultationDuration, overview.avgConsultationDuration * 1.05)}
                icon={<Clock className="w-6 h-6 text-purple-600" />}
                iconBg="bg-purple-100"
              />
              <MetricCard
                title="Triage Cases"
                value={formatNumber(overview.triageCases)}
                change={getChange(overview.triageCases, overview.triageCases * 0.78)}
                icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
                iconBg="bg-amber-100"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={consultationTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), 'MMM d')} stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={2} dot={false} name="Scheduled" />
                        <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} name="Completed" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Triage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={triageDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {triageDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={doctorPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="consultations" fill="#3b82f6" name="Consultations" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="patients" fill="#10b981" name="Unique Patients" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentStats.map((dept, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{dept.department}</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{dept.patients}</p>
                            <p className="text-xs text-gray-500">Patients</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{dept.consultations}</p>
                            <p className="text-xs text-gray-500">Consultations</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-amber-600">{dept.triageCases}</p>
                            <p className="text-xs text-gray-500">Triage Cases</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'clinical' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="patients" fill="#3b82f6" name="New Patients" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="consultations" fill="#10b981" name="Consultations" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="status"
                          label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        >
                          {appointmentStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Medications Prescribed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicationStats.slice(0, 10).map((med, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                          <span className="font-medium text-gray-900">{med.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${(med.prescribed / medicationStats[0]?.prescribed) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">{med.prescribed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clinical Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-3xl font-bold text-green-600">94.2%</p>
                      <p className="text-sm text-gray-500">Patient Satisfaction</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-3xl font-bold text-blue-600">87.5%</p>
                      <p className="text-sm text-gray-500">Follow-up Compliance</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-3xl font-bold text-purple-600">92.1%</p>
                      <p className="text-sm text-gray-500">Documentation Complete</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-3xl font-bold text-amber-600">12.3%</p>
                      <p className="text-sm text-gray-500">Readmission Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'operational' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Doctor Availability</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Room Utilization</span>
                      <span className="font-medium text-blue-600">72%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Equipment Usage</span>
                      <span className="font-medium text-purple-600">65%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Avg. Wait Time</span>
                      <span className="font-medium text-amber-600">14 min</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-blue-600">23.5</p>
                    <p className="text-sm text-gray-500">Avg. Patients/Day</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-green-600">18.2</p>
                    <p className="text-sm text-gray-500">Consultations/Day</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-purple-600">94%</p>
                    <p className="text-sm text-gray-500">On-time Start Rate</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-red-600">3.2%</p>
                    <p className="text-sm text-gray-500">No-show Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">৳2.4M</p>
                    <p className="text-sm text-gray-500">This Month</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">৳18.7M</p>
                    <p className="text-sm text-gray-500">YTD</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `৳${(v/100000).toFixed(0)}L`} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(v) => [`৳${v.toLocaleString()}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="patients" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { service: 'Consultations', revenue: 1250000, percentage: 52 },
                    { service: 'Lab Tests', revenue: 580000, percentage: 24 },
                    { service: 'Procedures', revenue: 320000, percentage: 13 },
                    { service: 'Medications', revenue: 180000, percentage: 8 },
                    { service: 'Other', revenue: 70000, percentage: 3 },
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900">{item.service}</span>
                        <span className="text-gray-600">৳{item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}