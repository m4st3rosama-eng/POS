import React from 'react'
import type { MenuItem } from '@shared/types'
import { ItemCard } from './ItemCard'

interface ItemGridProps {
  items: MenuItem[]
  currencySymbol: string
  onAdd: (item: MenuItem) => void
}

export function ItemGrid({ items, currencySymbol, onAdd }: ItemGridProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-ink/40">No items found.</div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} currencySymbol={currencySymbol} onAdd={onAdd} />
      ))}
    </div>
  )
}
