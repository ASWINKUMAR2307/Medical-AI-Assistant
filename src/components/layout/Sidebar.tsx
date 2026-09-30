'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Calendar,
  AlertTriangle,
  Bot,
  FileText,
  BarChart3,
  UserCheck,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  ArrowRight,
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'AI Triage', href: '/triage', icon: AlertTriangle },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
  { name: 'Medical Records', href: '/medical-records', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Care Team', href: '/care-team', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={onToggle}
        className={cn(
          'fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg border border-gray-200',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-800">
            <Link href="/overview" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">MEDIASSIST AI</h1>
                <p className="text-xs text-slate-400">Clinical Operations</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              WORKSPACE
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border-l-3 border-blue-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            <div className="pt-4 mt-2 border-t border-slate-800" />
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              MANAGEMENT
            </div>
            {navigation.slice(6).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border-l-3 border-blue-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
              <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200">Need assistance?</p>
                <p className="text-xs text-slate-400">Visit the help center or contact your system administrator.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onToggle}
        aria-hidden="true"
      />
    </>
  )
}