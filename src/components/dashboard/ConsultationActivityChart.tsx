'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

interface ConsultationActivityChartProps {
  data: {
    labels: string[]
    consultations: number[]
    completed: number[]
  }
}

export function ConsultationActivityChart({ data }: ConsultationActivityChartProps) {
  const chartData = data.labels.map((label, index) => ({
    date: label,
    consultations: data.consultations[index] || 0,
    completed: data.completed[index] || 0,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Consultation activity</h3>
          <p className="text-sm text-gray-500">Patient consultations across the last 7 days</p>
        </div>
        <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
              formatter={(value: number, name: string) => [value, name === 'consultations' ? 'Consultations' : 'Completed']}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 10 }}
            />
            <Line
              type="monotone"
              dataKey="consultations"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name="Consultations"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
              name="Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}