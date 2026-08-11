import React from 'react'
import type { MenuItem } from '@shared/types'
import { getItemImageSrc } from '../assets/categoryIcons'
import { formatCurrency } from '../lib/currency'

interface ItemCardProps {
  item: MenuItem
  currencySymbol: string
  onAdd: (item: MenuItem) => void
}

export function ItemCard({ item, currencySymbol, onAdd }: ItemCardProps): React.ReactElement {
  return (
    <button
      onClick={() => onAdd(item)}
      className="group flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-parchment">
        <img src={getItemImageSrc(item.imageRef)} alt={item.name} className="h-full w-full object-cover" />
        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-lg font-bold text-ink shadow-card transition-colors group-hover:bg-goldLight">
          +
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</div>
        <div className="text-sm font-bold text-gold">{formatCurrency(item.price, currencySymbol)}</div>
        {item.note && <div className="text-[11px] text-ink/50">{item.note}</div>}
      </div>
    </button>
  )
}
