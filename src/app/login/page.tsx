'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Loader2, Eye, EyeOff, Lock, Mail, Stethoscope, UserPlus, Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/overview'
  const error = searchParams.get('error')

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setFormError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('Invalid email or password')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setFormError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MEDIASSIST AI</h1>
          <p className="text-sm text-gray-500 mt-1">Clinical Operations</p>
          <p className="text-xs text-gray-400 mt-2">Dhaka Care Network</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Invalid credentials. Please try again.</span>
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  )}
                  placeholder="admin@mediassist.ai"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn(
                    'w-full pl-10 pr-12 py-2.5 border rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  )}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'transition-colors duration-200',
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link
                href="/forgot-password"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Key className="w-4 h-4" />
                Forgot password?
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Create new user
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Secure access to clinical operations dashboard</p>
        </div>
      </div>
    </div>
  )
}