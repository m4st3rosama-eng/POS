import React from 'react'
import type { Category } from '@shared/types'
import { categoryIcons } from '../assets/categoryIcons'

interface SidebarProps {
  categories: Category[]
  activeCategoryId: string | 'all'
  onSelect: (id: string | 'all') => void
}

export function Sidebar({ categories, activeCategoryId, onSelect }: SidebarProps): React.ReactElement {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col bg-cocoa py-4 text-cream">
      <div className="px-5 pb-4">
        <div className="font-display text-lg font-bold tracking-wide text-goldLight">Café de Glacier</div>
        <div className="text-[11px] uppercase tracking-widest text-cream/50">Point of Sale</div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3">
        {sorted.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              activeCategoryId === category.id ? 'bg-gold text-ink' : 'text-cream/80 hover:bg-white/10'
            }`}
          >
            <img src={categoryIcons[category.iconKey]} alt="" className="h-7 w-7 rounded-md" />
            {category.name}
          </button>
        ))}
      </div>
      <div className="px-3 pt-2">
        <button
          onClick={() => onSelect('all')}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-cream/20 px-3 py-2.5 text-sm font-semibold transition-colors ${
            activeCategoryId === 'all' ? 'bg-gold text-ink' : 'text-cream hover:bg-white/10'
          }`}
        >
          All Items
        </button>
      </div>
    </nav>
  )
}
