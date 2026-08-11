import React from 'react'
import type { CartLine } from '../lib/cart'
import { formatCurrency } from '../lib/currency'

interface CartLineItemProps {
  line: CartLine
  currencySymbol: string
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
}

export function CartLineItem({
  line,
  currencySymbol,
  onIncrement,
  onDecrement,
  onRemove
}: CartLineItemProps): React.ReactElement {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{line.item.name}</div>
        <div className="text-xs text-ink/50">{formatCurrency(line.item.price, currencySymbol)} each</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          aria-label="Decrease quantity"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-parchment text-ink hover:bg-gold/40"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold">{line.qty}</span>
        <button
          onClick={onIncrement}
          aria-label="Increase quantity"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-parchment text-ink hover:bg-gold/40"
        >
          +
        </button>
      </div>
      <div className="w-20 shrink-0 text-right text-sm font-semibold text-ink">
        {formatCurrency(line.item.price * line.qty, currencySymbol)}
      </div>
      <button onClick={onRemove} aria-label="Remove item" className="text-ink/30 hover:text-red-600">
        ✕
      </button>
    </div>
  )
}
