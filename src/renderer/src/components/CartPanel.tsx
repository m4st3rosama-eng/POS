import React from 'react'
import type { CartLine } from '../lib/cart'
import { cartSubtotal } from '../lib/cart'
import { CartLineItem } from './CartLineItem'
import { formatCurrency } from '../lib/currency'
import { Button } from './ui/Button'

interface CartPanelProps {
  lines: CartLine[]
  currencySymbol: string
  onIncrement: (itemId: string) => void
  onDecrement: (itemId: string) => void
  onRemove: (itemId: string) => void
  onClear: () => void
  onCheckout: () => void
  checkingOut: boolean
}

export function CartPanel({
  lines,
  currencySymbol,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onCheckout,
  checkingOut
}: CartPanelProps): React.ReactElement {
  const subtotal = cartSubtotal(lines)

  return (
    <aside className="flex h-full w-96 shrink-0 flex-col border-l border-black/10 bg-cream">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">Current Order</h2>
        {lines.length > 0 && (
          <button onClick={onClear} className="text-xs font-medium text-ink/40 hover:text-red-600">
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-5">
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-ink/40">
            Tap a menu item to add it to the order.
          </div>
        ) : (
          lines.map((line) => (
            <CartLineItem
              key={line.item.id}
              line={line}
              currencySymbol={currencySymbol}
              onIncrement={() => onIncrement(line.item.id)}
              onDecrement={() => onDecrement(line.item.id)}
              onRemove={() => onRemove(line.item.id)}
            />
          ))
        )}
      </div>
      <div className="border-t border-black/10 px-5 py-4">
        <div className="flex items-center justify-between text-base font-bold text-ink">
          <span>Total</span>
          <span>{formatCurrency(subtotal, currencySymbol)}</span>
        </div>
        <Button
          className="mt-4 w-full py-3 text-base"
          disabled={lines.length === 0 || checkingOut}
          onClick={onCheckout}
        >
          {checkingOut ? 'Processing…' : `Complete Sale · ${formatCurrency(subtotal, currencySymbol)}`}
        </Button>
      </div>
    </aside>
  )
}
