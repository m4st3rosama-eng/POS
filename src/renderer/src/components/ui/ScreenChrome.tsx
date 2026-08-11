import React from 'react'

export function TopBar({ title, onBack }: { title: string; onBack: () => void }): React.ReactElement {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-black/10 bg-cocoa px-6 py-4 text-cream">
      <button
        onClick={onBack}
        className="rounded-lg border border-cream/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
      >
        ← Back
      </button>
      <h1 className="font-display text-lg font-semibold">{title}</h1>
    </header>
  )
}

export function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active ? 'border-gold text-ink' : 'border-transparent text-ink/40 hover:text-ink/70'
      }`}
    >
      {children}
    </button>
  )
}

export function SummaryStat({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-ink/40">{label}</div>
      <div className="text-lg font-bold text-ink">{value}</div>
    </div>
  )
}
