'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

interface TriageDistributionChartProps {
  data: {
    urgent: { value: number; percentage: number }
    priority: { value: number; percentage: number }
    standard: { value: number; percentage: number }
    selfCare: { value: number; percentage: number }
    totalAssessments: number
  }
}

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981']
const LABELS = ['Urgent review', 'Priority', 'Standard', 'Self-care info']

export function TriageDistributionChart({ data }: TriageDistributionChartProps) {
  const chartData = [
    { name: 'Urgent review', value: data.urgent.value, percentage: data.urgent.percentage, color: COLORS[0] },
    { name: 'Priority', value: data.priority.value, percentage: data.priority.percentage, color: COLORS[1] },
    { name: 'Standard', value: data.standard.value, percentage: data.standard.percentage, color: COLORS[2] },
    { name: 'Self-care info', value: data.selfCare.value, percentage: data.selfCare.percentage, color: COLORS[3] },
  ]

  const hasData = chartData.some((d) => d.value > 0)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Triage distribution</h3>
          <p className="text-sm text-gray-500">AI-assigned review priorities</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hasData ? chartData : [{ name: 'No data', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percentage }) => `${name} ${percentage}%`}
                labelLine={false}
              >
                {hasData ? chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                )) : (
                  <Cell fill="#e5e7eb" />
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{data.totalAssessments}</p>
              <p className="text-sm text-gray-500">Assessments</p>
            </div>
          </div>
        </div>

        <div className="flex-1 ml-6 space-y-3">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{entry.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"
                    style={{ width: '100%' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${entry.percentage}%`,
                        backgroundColor: entry.color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{entry.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        AI triage is informational and must be reviewed by a qualified clinician.
      </p>
    </div>
  )
}