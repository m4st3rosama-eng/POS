import React from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps): React.ReactElement {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search item..."
        className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
      />
    </div>
  )
}
