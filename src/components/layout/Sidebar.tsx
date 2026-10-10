'use client'

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
  UserCog,
  Building,
  Key,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getAllowedRoutes } from '@/lib/permissions'

const navigationConfig = {
  overview: { name: 'Overview', href: '/overview', icon: LayoutDashboard, permission: 'dashboard:view' },
  patients: { name: 'Patients', href: '/patients', icon: Users, permission: 'patients:view' },
  appointments: { name: 'Appointments', href: '/appointments', icon: Calendar, permission: 'appointments:view' },
  triage: { name: 'AI Triage', href: '/triage', icon: AlertTriangle, permission: 'triage:view' },
  assistant: { name: 'AI Assistant', href: '/assistant', icon: Bot, permission: 'assistant:view' },
  medicalRecords: { name: 'Medical Records', href: '/medical-records', icon: FileText, permission: 'medical-records:view' },
  analytics: { name: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'analytics:view' },
  careTeam: { name: 'Care Team', href: '/care-team', icon: UserCheck, permission: 'care-team:view' },
  settings: { name: 'Settings', href: '/settings', icon: Settings, permission: 'settings:view' },
}

const adminOnlyNav = {
  users: { name: 'User Management', href: '/admin/users', icon: UserCog, permission: 'users:view' },
  auditLogs: { name: 'Audit Logs', href: '/admin/audit-logs', icon: Key, permission: 'audit-logs:view' },
  systemSettings: { name: 'System Settings', href: '/admin/settings', icon: Building, permission: 'settings:admin' },
}

export function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  const allowedRoutes = userRole ? getAllowedRoutes(userRole) : []

  const navigation = Object.entries(navigationConfig)
    .filter(([, config]) => allowedRoutes.includes(config.href))
    .map(([key, config]) => ({ key, ...config }))

  const adminNav = Object.entries(adminOnlyNav)
    .filter(([, config]) => allowedRoutes.includes(config.href))
    .map(([key, config]) => ({ key, ...config }))

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
            {navigation.slice(0, 5).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.key}
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
              CLINICAL
            </div>
            {navigation.slice(5).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.key}
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

            {adminNav.length > 0 && (
              <>
                <div className="pt-4 mt-2 border-t border-slate-800" />
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ADMINISTRATION
                </div>
                {adminNav.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-purple-600/20 text-purple-300 border-l-3 border-purple-500'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-purple-400' : 'text-slate-400')} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </>
            )}

            <div className="pt-4 mt-2 border-t border-slate-800" />
          </nav>

          <div className="p-3 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
              <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200">Need assistance?</p>
                <p className="text-xs text-slate-400">Visit the help center or contact your system administrator.</p>
              </div>
            </div>
            {userRole && (
              <div className="mt-3 p-2 rounded-lg bg-slate-800/30">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Your Role</p>
                <p className="text-sm font-medium text-slate-100 capitalize">{userRole.toLowerCase().replace('_', ' ')}</p>
              </div>
            )}
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