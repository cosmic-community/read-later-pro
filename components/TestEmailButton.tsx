'use client'

import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'

interface TestEmailButtonProps {
  userEmail?: string
  userId?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function TestEmailButton({ 
  userEmail = 'test@example.com',
  userId,
  variant = 'secondary',
  size = 'md',
  className = ''
}: TestEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleSendTestEmail = async () => {
    setIsLoading(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          testUserId: userId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email')
      }

      setLastResult({
        success: true,
        message: result.message,
        details: result.details
      })

      // Clear success message after 5 seconds
      setTimeout(() => {
        setLastResult(null)
      }, 5000)

    } catch (error) {
      console.error('Error sending test email:', error)
      setLastResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email'
      })

      // Clear error message after 5 seconds
      setTimeout(() => {
        setLastResult(null)
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn btn-primary'
      case 'ghost':
        return 'btn btn-ghost'
      default:
        return 'btn btn-secondary'
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSendTestEmail}
        disabled={isLoading}
        className={`${getVariantClasses()} ${getSizeClasses()} ${className} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Send test email to ${userEmail}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Send Test Email
          </>
        )}
      </button>

      {/* Status Message */}
      {lastResult && (
        <div className={`text-sm p-2 rounded-md ${
          lastResult.success 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="font-medium">{lastResult.message}</div>
          {lastResult.success && lastResult.details && (
            <div className="mt-1 text-xs opacity-75">
              Sent to: {lastResult.details.recipient} • 
              Articles: {lastResult.details.articleCount} • 
              ID: {lastResult.details.messageId}
            </div>
          )}
        </div>
      )}
    </div>
  )
}