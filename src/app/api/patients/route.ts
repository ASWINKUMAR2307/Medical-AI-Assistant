import { NextRequest, NextResponse } from 'next/server'
import { getPatients, createPatient } from '@/actions/patients'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const assignedDoctorId = searchParams.get('assignedDoctorId') || ''

    const result = await getPatients({ page, limit, search, status, assignedDoctorId })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const patient = await createPatient({
      ...data,
      workspaceId: session.user.workspaceId || 'workspace-main',
      dateOfBirth: new Date(data.dateOfBirth),
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}