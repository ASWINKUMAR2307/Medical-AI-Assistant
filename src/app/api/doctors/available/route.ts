import { NextRequest, NextResponse } from 'next/server'
import { getDoctorsForAssignment } from '@/actions/patients'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctors = await getDoctorsForAssignment()
    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}