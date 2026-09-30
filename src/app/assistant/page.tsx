'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Send, Bot, User, RefreshCw, Copy, Check, Loader2, Sparkles, FileText, Mic, MicOff, Settings, Trash2, History, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface QuickAction {
  label: string
  prompt: string
  icon: React.ReactNode
}

const quickActions: QuickAction[] = [
  { label: 'Differential Diagnosis', prompt: 'Help me create a differential diagnosis for a patient presenting with...', icon: <FileText className="w-4 h-4" /> },
  { label: 'Drug Interactions', prompt: 'Check for potential drug interactions between...', icon: <Sparkles className="w-4 h-4" /> },
  { label: 'Clinical Guidelines', prompt: 'What are the current clinical guidelines for managing...', icon: <History className="w-4 h-4" /> },
  { label: 'Patient Education', prompt: 'Create patient-friendly explanation for...', icon: <User className="w-4 h-4" /> },
  { label: 'Lab Interpretation', prompt: 'Help interpret these lab results:...', icon: <FileText className="w-4 h-4" /> },
  { label: 'Treatment Planning', prompt: 'Suggest evidence-based treatment plan for...', icon: <Sparkles className="w-4 h-4" /> },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setShowQuickActions(false)
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, history: messages }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let buffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          buffer += chunk
          
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
                if (text) {
                  fullContent += text
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage.id ? { ...msg, content: fullContent } : msg
                  ))
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id ? { ...msg, content: fullContent, isStreaming: false } : msg
      ))
    } catch (error) {
      console.error('Assistant error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id ? { ...msg, content: 'I apologize, but I encountered an error. Please try again.', isStreaming: false } : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const handleNewChat = () => {
    setMessages([])
    setShowQuickActions(true)
    setInput('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-500 mt-1">Clinical decision support powered by AI</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <RefreshCw className="w-4 h-4 mr-1" />
              New Chat
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {showQuickActions && messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  I can assist with clinical decision support, differential diagnoses, drug interactions, treatment planning, and more.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {action.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                          {action.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        message.role === 'user'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                      )}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-3xl px-4 py-3 rounded-2xl',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      )}
                    >
                      <div className="prose prose-sm max-w-none">
                        {message.role === 'assistant' && message.isStreaming ? (
                          <span className="whitespace-pre-wrap">{message.content}<span className="animate-pulse">▌</span></span>
                        ) : (
                          <span className="whitespace-pre-wrap">{message.content}</span>
                        )}
                      </div>
                      <div className={cn('flex items-center gap-2 mt-2 text-xs', message.role === 'user' ? 'text-blue-200' : 'text-gray-400')}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.role === 'assistant' && !message.isStreaming && (
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about clinical decisions, diagnoses, treatments..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[50px] max-h-[150px]"
                  rows={1}
                  disabled={isLoading}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsListening(!isListening)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isListening ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'
                    )}
                    disabled={isLoading}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="h-12"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-2">
              AI responses are for informational purposes only and should not replace clinical judgment. Always verify with current guidelines.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}