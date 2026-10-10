'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Bell, Check, ChevronLeft, ChevronRight, Filter, AlertTriangle, Calendar, Users, FileText, Settings } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'triage' | 'appointment' | 'patient' | 'lab' | 'system'
}

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(true)

  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialFilter = (searchParams.get('filter') as 'all' | 'unread') || 'all'

  useEffect(() => {
    setPage(initialPage)
    setFilter(initialFilter)
  }, [initialPage, initialFilter])

  useEffect(() => {
    if (page === initialPage && filter === initialFilter) return
  }, [page, filter, initialPage, initialFilter])

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          filter,
        })
        const response = await fetch(`/api/notifications?${params}`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [page, filter])

  const handleFilterChange = (value: 'all' | 'unread') => {
    setFilter(value)
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
    if (filter !== 'all') params.set('filter', filter)
    router.push(`/notifications?${params.toString()}`)
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const unreadCount = notifications.filter(n => n.unread).length

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'triage': return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'appointment': return <Calendar className="w-5 h-5 text-blue-600" />
      case 'patient': return <Users className="w-5 h-5 text-green-600" />
      case 'lab': return <FileText className="w-5 h-5 text-purple-600" />
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">View and manage your notifications</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value as 'all' | 'unread')}
                className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread only ({unreadCount})</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
              <p className="text-gray-500 mt-1">{filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up'}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 transition-colors ${
                    notification.unread ? 'bg-blue-50/50 border-blue-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gray-100 flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={`font-medium text-gray-900 ${notification.unread ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <time className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</time>
                        {notification.unread && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-gray-400 hover:text-blue-600"
                            aria-label="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}