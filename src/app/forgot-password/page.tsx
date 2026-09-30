'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Loader2, Mail, Stethoscope, Key, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setFormError(null)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setFormError(result.error || 'Failed to send reset email')
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
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to login</span>
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MEDIASSIST AI</h1>
          <p className="text-sm text-gray-500 mt-1">Clinical Operations</p>
          <p className="text-xs text-gray-400 mt-2">Dhaka Care Network</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Reset email sent</h2>
              <p className="text-sm text-gray-500 mt-2">
                If an account exists for that email, you will receive password reset instructions shortly.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Forgot password?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email and we&apos;ll send you reset instructions
                </p>
              </div>

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
                      Sending...
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Secure access to clinical operations dashboard</p>
        </div>
      </div>
    </div>
  )
}