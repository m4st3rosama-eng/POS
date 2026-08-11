import React, { useEffect, useState } from 'react'

interface StatusBarProps {
  cashierName: string
}

export function StatusBar({ cashierName }: StatusBarProps): React.ReactElement {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="flex shrink-0 items-center justify-between border-t border-black/10 bg-ink px-5 py-2 text-xs text-cream/70">
      <span>Cashier: {cashierName}</span>
      <span>{now.toLocaleString()}</span>
      <span className="flex items-center gap-1.5 font-medium text-goldLight">
        <span className="h-2 w-2 rounded-full bg-goldLight" /> Offline Mode
      </span>
    </footer>
  )
}
