'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Loader2, Eye, EyeOff, Lock, Mail, User, Stethoscope, Building2, Shield, Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['ADMIN', 'DOCTOR', 'CLINICIAN', 'NURSE', 'CARE_COORDINATOR'], {
    required_error: 'Role is required',
  }),
  department: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const roles = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'CLINICIAN', label: 'Clinician' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'CARE_COORDINATOR', label: 'Care Coordinator' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CLINICIAN',
    },
  })

  const role = watch('role')
  const showDoctorFields = role === 'DOCTOR'

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setFormError(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: data.role,
          department: data.department,
          specialization: data.specialization,
          licenseNumber: data.licenseNumber,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Auto sign in after registration
        const signInResponse = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        })

        if (signInResponse.ok) {
          router.push('/overview')
          router.refresh()
        } else {
          router.push('/login?registered=true')
        }
      } else {
        setFormError(result.error || 'Registration failed')
      }
    } catch {
      setFormError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
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
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create new account</h2>
            <p className="text-sm text-gray-500 mt-1">Register to access the clinical dashboard</p>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('firstName')}
                    id="firstName"
                    type="text"
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    )}
                    placeholder="John"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('lastName')}
                    id="lastName"
                    type="text"
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    )}
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
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
                  placeholder="doctor@hospital.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                {...register('role')}
                id="role"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-lg text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.role ? 'border-red-300' : 'border-gray-300'
                )}
                disabled={isLoading}
              >
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('department')}
                  id="department"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cardiology, Emergency, etc."
                  disabled={isLoading}
                />
              </div>
            </div>

            {showDoctorFields && (
              <>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('specialization')}
                      id="specialization"
                      type="text"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.specialization ? 'border-red-300' : 'border-gray-300'
                      )}
                      placeholder="Cardiology, Neurology, etc."
                      disabled={isLoading}
                    />
                  </div>
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('licenseNumber')}
                      id="licenseNumber"
                      type="text"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
                      )}
                      placeholder="MD-BD-001234"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  )}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Secure access to clinical operations dashboard</p>
        </div>
      </div>
    </div>
  )
}