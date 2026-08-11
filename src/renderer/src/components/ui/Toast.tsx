import React, { useEffect } from 'react'

interface ToastProps {
  message: string | null
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps): React.ReactElement | null {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-cream shadow-card">
      {message}
    </div>
  )
}
