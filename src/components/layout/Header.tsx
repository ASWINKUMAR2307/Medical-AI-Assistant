'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Shield,
  X,
} from 'lucide-react'

const workspaceName = process.env.NEXT_PUBLIC_WORKSPACE_NAME || 'Dhaka Care Network'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = [
    { id: '1', title: 'Urgent triage review', message: '3 cases need immediate clinician review', time: '5 min ago', unread: true },
    { id: '2', title: 'Appointment reminder', message: 'Dr. Rahman has 3 appointments in 30 minutes', time: '1 hour ago', unread: true },
    { id: '3', title: 'New patient registered', message: 'PAT-016 Mohammad Hassan', time: '2 hours ago', unread: false },
    { id: '4', title: 'Lab results available', message: 'CBC results for PAT-003 Abdul Karim', time: '4 hours ago', unread: false },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center h-16 px-4 lg:px-6 gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, records, appointments..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Global search"
            />
          </form>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0',
                        notification.unread && 'bg-blue-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                          notification.unread ? 'bg-blue-600' : 'bg-transparent'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium text-gray-900', notification.unread && 'font-semibold')}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-200">
                  <Link
                    href="/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {session?.user?.name ? getInitials(session.user.name) : 'AK'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Ashik Kumar'}</p>
                <p className="text-xs text-gray-500">{session?.user?.role || 'Administrator'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{session?.user?.name || 'Ashik Kumar'}</p>
                  <p className="text-sm text-gray-500">{session?.user?.email || 'admin@mediassist.ai'}</p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  Profile & Settings
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Shield className="w-5 h-5 text-gray-400" />
                  Security
                </Link>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block px-6 py-2 bg-gray-50 border-t border-gray-200">
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link href="/overview" className="text-gray-500 hover:text-gray-700">
            Workspace
          </Link>
          <ChevronDown className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{workspaceName}</span>
        </nav>
      </div>
    </header>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}