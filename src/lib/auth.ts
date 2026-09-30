import NextAuth from 'next-auth'
import { getAuthOptions } from './auth-config'
import { PrismaClient } from '../generated/prisma/client'
import { getServerSession } from 'next-auth'

const handler = NextAuth(getAuthOptions())

export const { handlers, signIn, signOut } = handler
export const auth = () => getServerSession(getAuthOptions())

export type SessionUser = {
  id: string
  email: string
  name: string
  role: PrismaClient extends { UserRole: infer R } ? R : never
  department?: string
  workspaceId?: string
}