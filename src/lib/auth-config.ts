import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { UserRole } from '../generated/prisma/client'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

// Create Prisma client with SQLite adapter
const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

export function getAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: 'jwt',
      maxAge: 8 * 60 * 60, // 8 hours
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials')
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated')
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!isValid) {
            throw new Error('Invalid credentials')
          }

          await prisma.auditLog.create({
            data: {
              actorId: user.id,
              action: 'LOGIN',
              entity: 'User',
              entityId: user.id,
              metadata: { method: 'credentials' },
            },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            workspaceId: user.workspaceId,
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.role = (user as any).role
          token.department = (user as any).department
          token.workspaceId = (user as any).workspaceId
        }
        return token
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.role = token.role as UserRole
          session.user.department = token.department as string
          session.user.workspaceId = token.workspaceId as string
        }
        return session
      },
    },
  }
}

export type SessionUser = {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  workspaceId?: string
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }

  interface User {
    role: UserRole
    department?: string
    workspaceId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    department?: string
    workspaceId?: string
  }
}