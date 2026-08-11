import React, { useMemo, useState } from 'react'
import type { MenuItem, Order, OrderLineItem, Settings } from '@shared/types'
import { formatCurrency } from '../lib/currency'
import { Button } from './ui/Button'

interface EditOrderModalProps {
  order: Order
  items: MenuItem[]
  settings: Settings
  onSave: (lineItems: OrderLineItem[]) => Promise<void>
  onCancel: () => void
}

export function EditOrderModal({
  order,
  items,
  settings,
  onSave,
  onCancel
}: EditOrderModalProps): React.ReactElement {
  const [lines, setLines] = useState<OrderLineItem[]>(order.lineItems.map((l) => ({ ...l })))
  const [addItemId, setAddItemId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currencySymbol = settings.currencySymbol

  const activeItems = useMemo(
    () => [...items].filter((i) => i.active).sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  function updateQty(itemId: string, qty: number): void {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.itemId !== itemId)
      return prev.map((l) => (l.itemId === itemId ? { ...l, qty, lineTotal: l.unitPrice * qty } : l))
    })
  }

  function handleAddItem(): void {
    const menuItem = items.find((i) => i.id === addItemId)
    if (!menuItem) return
    setLines((prev) => {
      const existing = prev.find((l) => l.itemId === menuItem.id)
      if (existing) {
        return prev.map((l) =>
          l.itemId === menuItem.id ? { ...l, qty: l.qty + 1, lineTotal: l.unitPrice * (l.qty + 1) } : l
        )
      }
      return [
        ...prev,
        {
          itemId: menuItem.id,
          nameSnapshot: menuItem.name,
          unitPrice: menuItem.price,
          qty: 1,
          lineTotal: menuItem.price
        }
      ]
    })
    setAddItemId('')
  }

  const total = lines.reduce((sum, l) => sum + l.lineTotal, 0)

  async function handleSave(): Promise<void> {
    setSaving(true)
    setError(null)
    try {
      await onSave(lines)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-cream shadow-card">
        <div className="border-b border-black/10 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-ink">Edit Sale #{order.receiptNumber}</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 && (
            <div className="py-8 text-center text-sm text-ink/40">No items in this sale.</div>
          )}
          {lines.map((line) => (
            <div key={line.itemId} className="flex items-center gap-3 border-b border-black/5 py-2.5">
              <div className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{line.nameSnapshot}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(line.itemId, line.qty - 1)}
                  aria-label="Decrease quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-parchment text-ink hover:bg-gold/40"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold">{line.qty}</span>
                <button
                  onClick={() => updateQty(line.itemId, line.qty + 1)}
                  aria-label="Increase quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-parchment text-ink hover:bg-gold/40"
                >
                  +
                </button>
              </div>
              <div className="w-20 shrink-0 text-right text-sm font-semibold text-ink">
                {formatCurrency(line.lineTotal, currencySymbol)}
              </div>
            </div>
          ))}

          <div className="mt-4 flex gap-2">
            <select
              value={addItemId}
              onChange={(e) => setAddItemId(e.target.value)}
              className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
            >
              <option value="">Add an item…</option>
              {activeItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} — {formatCurrency(i.price, currencySymbol)}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={handleAddItem} disabled={!addItemId}>
              Add
            </Button>
          </div>
        </div>
        <div className="border-t border-black/10 px-6 py-4">
          <div className="flex items-center justify-between text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatCurrency(total, currencySymbol)}</span>
          </div>
          {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
