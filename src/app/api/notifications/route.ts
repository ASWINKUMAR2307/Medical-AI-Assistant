import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Urgent triage review', message: '3 cases need immediate clinician review', time: '5 min ago', unread: true, type: 'triage' },
  { id: '2', title: 'Appointment reminder', message: 'Dr. Rahman has 3 appointments in 30 minutes', time: '1 hour ago', unread: true, type: 'appointment' },
  { id: '3', title: 'New patient registered', message: 'PAT-016 Mohammad Hassan', time: '2 hours ago', unread: false, type: 'patient' },
  { id: '4', title: 'Lab results available', message: 'CBC results for PAT-003 Abdul Karim', time: '4 hours ago', unread: false, type: 'lab' },
  { id: '5', title: 'System maintenance', message: 'Scheduled maintenance tonight 11PM-2AM', time: '1 day ago', unread: false, type: 'system' },
  { id: '6', title: 'New consultation', message: 'Patient PAT-007 assigned to you', time: '2 days ago', unread: false, type: 'triage' },
  { id: '7', title: 'Appointment cancelled', message: 'Patient PAT-012 cancelled tomorrow\'s appointment', time: '3 days ago', unread: false, type: 'appointment' },
  { id: '8', title: 'Prescription ready', message: 'Prescription for PAT-005 ready for pickup', time: '4 days ago', unread: false, type: 'lab' },
]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'all'

    let filteredNotifications = MOCK_NOTIFICATIONS

    if (filter === 'unread') {
      filteredNotifications = MOCK_NOTIFICATIONS.filter(n => n.unread)
    }

    const total = filteredNotifications.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const notifications = filteredNotifications.slice(start, start + limit)

    return NextResponse.json({
      notifications,
      total,
      totalPages,
      page,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}