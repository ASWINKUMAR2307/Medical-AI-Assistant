import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/generated/prisma/client'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      specialization,
      licenseNumber,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['ADMIN', 'DOCTOR', 'CLINICIAN', 'NURSE', 'CARE_COORDINATOR']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate doctor-specific fields
    if (role === 'DOCTOR') {
      if (!specialization || !licenseNumber) {
        return NextResponse.json(
          { error: 'Specialization and license number are required for doctors' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Get default workspace
    const workspace = await prisma.workspace.findFirst({
      where: { id: 'workspace-main' },
    })

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: role as UserRole,
        department,
        specialization,
        licenseNumber,
        workspaceId: workspace?.id,
        isActive: true,
      },
    })

    // If doctor, create doctor profile
    if (role === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          workspaceId: workspace?.id || 'workspace-main',
          specialization: specialization || 'General',
          licenseNumber: licenseNumber || 'TEMP',
          availability: true,
          maxAppointmentsPerDay: 20,
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}