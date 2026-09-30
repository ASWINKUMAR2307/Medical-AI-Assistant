'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  User, Bell, Shield, Palette, Database, Globe, Key, Moon, Sun, Monitor,
  Mail, Phone, Save, Loader2, CheckCircle, AlertCircle, Info, Eye, EyeOff,
  Trash2, Download, Upload, Settings as SettingsIcon, LayoutDashboard,
  Users, Stethoscope, FileText, BarChart3, UserCheck, HelpCircle, LogOut,
  CreditCard, WifiOff, Zap, Lock, AlertTriangle, Archive, Clock, Calendar
} from 'lucide-react'

interface SettingsSection {
  id: string
  label: string
  icon: React.ReactNode
  component: React.ReactNode
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
  { id: 'clinical', label: 'Clinical', icon: <Stethoscope className="w-5 h-5" /> },
  { id: 'integrations', label: 'Integrations', icon: <WifiOff className="w-5 h-5" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'advanced', label: 'Advanced', icon: <SettingsIcon className="w-5 h-5" /> },
]

const ProfileTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Manage your personal profile and contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
              AS
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 text-blue-600" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Ashik Rahman</h3>
            <p className="text-gray-500">Senior Clinician • Cardiology</p>
            <p className="text-sm text-gray-400 mt-1">ashik.rahman@mediassist.ai</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" defaultValue="Ashik Rahman" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue="ashik.rahman@mediassist.ai" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" defaultValue="+880-17-XXXX-XXXX" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Cardiology</option>
              <option>Emergency</option>
              <option>Neurology</option>
              <option>Pediatrics</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Professional Details</CardTitle>
        <CardDescription>License, specialization, and credentials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input type="text" defaultValue="MD-BD-001234" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input type="text" defaultValue="Cardiology" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input type="number" defaultValue="12" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
            <input type="text" defaultValue="MBBS, FCPS (Cardiology)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea rows={3} defaultValue="Senior cardiologist with 12+ years of experience in interventional cardiology and heart failure management." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </CardContent>
    </Card>
  </div>
)

const NotificationsTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>Configure when you receive email notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: 'New triage case assigned', description: 'When a triage case is assigned to you for review', enabled: true },
          { label: 'Triage case updates', description: 'Status changes on triage cases you are following', enabled: true },
          { label: 'Appointment reminders', description: 'Daily summary and 30-minute reminders', enabled: true },
          { label: 'Patient updates', description: 'New patients assigned or status changes', enabled: false },
          { label: 'Weekly analytics report', description: 'Weekly performance and analytics summary', enabled: true },
          { label: 'System announcements', description: 'Important system updates and maintenance', enabled: true },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <button
              className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', item.enabled ? 'bg-blue-600' : 'bg-gray-200')}
              role="switch"
              aria-checked={item.enabled}
            >
              <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', item.enabled ? 'translate-x-6' : 'translate-x-1')} />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>In-App Notifications</CardTitle>
        <CardDescription>Configure real-time notifications within the application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: 'Urgent triage alerts', description: 'Immediate notification for URGENT priority cases', enabled: true },
          { label: 'Appointment changes', description: 'Cancellations, rescheduling, confirmations', enabled: true },
          { label: 'Chat messages', description: 'Messages from AI Assistant or colleagues', enabled: true },
          { label: 'System alerts', description: 'Critical system notifications', enabled: true },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <button
              className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', item.enabled ? 'bg-blue-600' : 'bg-gray-200')}
              role="switch"
              aria-checked={item.enabled}
            >
              <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', item.enabled ? 'translate-x-6' : 'translate-x-1')} />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
)

const SecurityTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your password regularly for security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button><Key className="w-4 h-4 mr-2" /> Update Password</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Add an extra layer of security to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900">Authenticator App</p>
            <p className="text-sm text-gray-500">Use Google Authenticator, Authy, or similar</p>
          </div>
          <Button variant="outline"><Shield className="w-4 h-4 mr-2" /> Enable 2FA</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Manage your active login sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'Dhaka, Bangladesh', current: true, lastActive: 'Now' },
            { device: 'Safari on iPhone', location: 'Dhaka, Bangladesh', current: false, lastActive: '2 hours ago' },
            { device: 'Firefox on Mac', location: 'Chittagong, Bangladesh', current: false, lastActive: '1 day ago' },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{session.device} {session.current && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Current</span>}</p>
                  <p className="text-sm text-gray-500">{session.location} • {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">Revoke</Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300">
            <LogOut className="w-4 h-4 mr-2" /> Revoke All Other Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)

const AppearanceTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Choose your preferred color theme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Light', icon: Sun, description: 'Always use light mode' },
            { id: 'dark', label: 'Dark', icon: Moon, description: 'Always use dark mode' },
            { id: 'system', label: 'System', icon: Monitor, description: 'Match your system setting' },
          ].map((theme) => (
            <button
              key={theme.id}
              className={cn(
                'p-6 border-2 rounded-xl transition-all text-left',
                'border-gray-200 hover:border-blue-300'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <theme.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{theme.label}</p>
                  <p className="text-sm text-gray-500">{theme.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Density</CardTitle>
        <CardDescription>Adjust the spacing and compactness of the interface</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'comfortable', label: 'Comfortable', description: 'Default spacing' },
            { id: 'compact', label: 'Compact', description: 'More content on screen' },
            { id: 'spacious', label: 'Spacious', description: 'More breathing room' },
          ].map((density) => (
            <button key={density.id} className={cn('p-6 border-2 rounded-xl transition-all text-left', 'border-gray-200 hover:border-blue-300')}>
              <p className="font-medium text-gray-900">{density.label}</p>
              <p className="text-sm text-gray-500 mt-1">{density.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Sidebar</CardTitle>
        <CardDescription>Configure sidebar behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-900">Collapse sidebar by default</p>
            <p className="text-sm text-gray-500">Keep sidebar collapsed on desktop</p>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900">Show tooltips on collapsed sidebar</p>
            <p className="text-sm text-gray-500">Display labels when hovering collapsed items</p>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
          </button>
        </div>
      </CardContent>
    </Card>
  </div>
)

const ClinicalTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Clinical Preferences</CardTitle>
        <CardDescription>Configure your clinical workflow preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Consultation Duration</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="15">15 minutes</option>
              <option value="30" selected>30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Triage Threshold</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="standard">Standard (AI suggestion)</option>
              <option value="conservative">Conservative (higher threshold)</option>
              <option value="aggressive">Aggressive (lower threshold)</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Auto-save consultation notes', description: 'Automatically save draft notes every 30 seconds', enabled: true },
            { label: 'Show AI confidence scores', description: 'Display AI confidence percentages in triage', enabled: true },
            { label: 'Require review for all AI triage', description: 'Mandate clinician review before finalizing', enabled: true },
            { label: 'Enable voice dictation', description: 'Use speech-to-text for clinical notes', enabled: false },
            { label: 'Auto-complete medical terms', description: 'Suggest medical terminology while typing', enabled: true },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <button
                className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', item.enabled ? 'bg-blue-600' : 'bg-gray-200')}
                role="switch"
                aria-checked={item.enabled}
              >
                <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', item.enabled ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Prescription Defaults</CardTitle>
        <CardDescription>Set default values for prescriptions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Duration</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="7">7 days</option>
              <option value="14" selected>14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Refills</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="0">No refills</option>
              <option value="1">1 refill</option>
              <option value="2" selected>2 refills</option>
              <option value="3">3 refills</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pharmacy</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Dhaka Medical Pharmacy</option>
              <option>Square Pharmacy</option>
              <option>Popular Pharmacy</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

const IntegrationsTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Connected Services</CardTitle>
        <CardDescription>Manage third-party integrations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: 'OpenAI', description: 'AI Assistant and triage assessment', status: 'connected', icon: Zap },
            { name: 'Twilio', description: 'SMS notifications and alerts', status: 'disconnected', icon: Mail },
            { name: 'SendGrid', description: 'Email delivery service', status: 'connected', icon: Mail },
            { name: 'Google Calendar', description: 'Appointment synchronization', status: 'disconnected', icon: Calendar },
            { name: 'FHIR Server', description: 'Health data interoperability', status: 'disconnected', icon: Database },
            { name: 'WhatsApp Business', description: 'Patient communication', status: 'disconnected', icon: Phone },
          ].map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <integration.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{integration.name}</p>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                )}>
                  {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
                <Button variant="outline" size="sm">
                  {integration.status === 'connected' ? 'Manage' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

const BillingTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: 'Free', features: ['Up to 5 users', 'Basic triage', '100 consultations/mo', 'Email support'], current: false },
            { name: 'Professional', price: '৳9,999/mo', features: ['Up to 25 users', 'Advanced AI triage', 'Unlimited consultations', 'Priority support', 'Analytics'], current: true, popular: true },
            { name: 'Enterprise', price: 'Custom', features: ['Unlimited users', 'Custom AI models', 'SSO & audit logs', 'Dedicated support', 'SLA guarantee'], current: false },
          ].map((plan, index) => (
            <div key={index} className={cn(
              'relative p-6 border-2 rounded-xl',
              plan.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{plan.price}</p>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.current ? 'outline' : 'primary'}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Manage your billing payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/2026</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </div>
      </CardContent>
    </Card>
  </div>
)

const AdvancedTab = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Export or delete your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Export Data</p>
            <p className="text-sm text-gray-500">Download all your data in JSON format</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export JSON</Button>
            <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Import Data</p>
            <p className="text-sm text-gray-500">Import data from a previous export</p>
          </div>
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Import</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="border-red-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-red-900">Danger Zone</CardTitle>
            <CardDescription className="text-red-700">Irreversible actions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <p className="font-medium text-red-900">Delete Account</p>
            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
          </div>
          <Button variant="danger" className="bg-red-600 hover:bg-red-700 border-red-600">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabComponents: Record<string, React.ReactNode> = {
    profile: <ProfileTab />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    appearance: <AppearanceTab />,
    clinical: <ClinicalTab />,
    integrations: <IntegrationsTab />,
    billing: <BillingTab />,
    advanced: <AdvancedTab />,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your preferences and configuration</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                Changes saved
              </div>
            )}
            <Button onClick={handleSave} disabled={saved}>
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-52 flex-shrink-0" aria-label="Settings categories">
            <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <span className={cn('flex-shrink-0', activeTab === tab.id ? 'text-blue-600' : 'text-gray-400')}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 text-sm">Need help?</p>
                  <p className="text-xs text-blue-700">Visit our help center or contact support for assistance with settings.</p>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-1 min-w-0">
            {tabComponents[activeTab]}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}