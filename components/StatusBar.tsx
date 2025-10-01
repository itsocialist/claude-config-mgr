"use client"
import React from 'react'
import { Settings, CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: Date
}

interface StatusBarProps {
  className?: string
}

export default function StatusBar({ className = '' }: StatusBarProps) {
  const router = useRouter()
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  // Auto-dismiss toasts after 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setToasts(prev => prev.filter(t =>
        new Date().getTime() - t.timestamp.getTime() < 5000
      ))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Listen for custom toast events
  React.useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { type, message } = event.detail
      const toast: ToastMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message,
        timestamp: new Date()
      }
      setToasts(prev => [...prev, toast])
    }

    window.addEventListener('app-toast' as any, handleToast)
    return () => window.removeEventListener('app-toast' as any, handleToast)
  }, [])

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getToastBg = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    }
  }

  const openSettings = () => {
    router.push('/settings')
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="container mx-auto px-6 py-2 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Toast Messages Area */}
          <div className="flex-1 flex flex-col gap-1">
            {toasts.length === 0 ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">Ready</span>
            ) : (
              toasts.map(toast => (
                <div
                  key={toast.id}
                  className={`flex items-center gap-2 px-3 py-1 rounded border ${getToastBg(toast.type)}
                    animate-in fade-in slide-in-from-bottom-1 duration-200`}
                >
                  {getToastIcon(toast.type)}
                  <span className="text-sm">{toast.message}</span>
                </div>
              ))
            )}
          </div>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openSettings}
            className="ml-4"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Global toast function
export const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  window.dispatchEvent(new CustomEvent('app-toast', {
    detail: { type, message }
  }))
}