'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  iconBg?: string
  subValue?: string
  subLabel?: string
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg = 'bg-blue-100',
  subValue,
  subLabel,
}: MetricCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-4">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 text-sm font-medium', isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500')}>
                {isPositive && <TrendingUp className="w-4 h-4" />}
                {isNegative && <TrendingDown className="w-4 h-4" />}
                {!isPositive && !isNegative && <Minus className="w-4 h-4" />}
                <span>{Math.abs(change || 0)}%</span>
                {changeLabel && <span className="text-gray-500 font-normal">{changeLabel}</span>}
              </div>
            )}
          </div>
          {(subValue || subLabel) && (
            <p className="mt-2 text-sm text-gray-500">
              {subValue && <span className="font-medium text-gray-900">{subValue}</span>}
              {subValue && subLabel && <span> </span>}
              {subLabel}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-lg flex-shrink-0 ml-4', iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}