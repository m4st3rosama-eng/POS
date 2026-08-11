import React, { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { Sidebar } from '../components/Sidebar'
import { SearchBar } from '../components/SearchBar'
import { ItemGrid } from '../components/ItemGrid'
import { CartPanel } from '../components/CartPanel'
import { ReceiptModal } from '../components/ReceiptModal'
import { StatusBar } from '../components/StatusBar'
import { Toast } from '../components/ui/Toast'
import { cartSubtotal, type CartLine } from '../lib/cart'
import type { MenuItem, Order } from '@shared/types'

export type View = 'pos' | 'sales' | 'reports' | 'menu'

const CASHIER_NAME = 'Admin'

interface POSScreenProps {
  onNavigate: (view: View) => void
}

export function POSScreen({ onNavigate }: POSScreenProps): React.ReactElement {
  const { categories, items, settings, createOrder } = useAppData()

  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all'>('all')
  const [search, setSearch] = useState('')
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const currencySymbol = settings?.currencySymbol ?? 'Rs.'

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items
      .filter((item) => item.active)
      .filter((item) => activeCategoryId === 'all' || item.categoryId === activeCategoryId)
      .filter((item) => !query || item.name.toLowerCase().includes(query))
  }, [items, activeCategoryId, search])

  function handleAdd(item: MenuItem): void {
    setCartLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id)
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { item, qty: 1 }]
    })
  }

  function handleIncrement(itemId: string): void {
    setCartLines((prev) => prev.map((l) => (l.item.id === itemId ? { ...l, qty: l.qty + 1 } : l)))
  }

  function handleDecrement(itemId: string): void {
    setCartLines((prev) =>
      prev.map((l) => (l.item.id === itemId ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)
    )
  }

  function handleRemove(itemId: string): void {
    setCartLines((prev) => prev.filter((l) => l.item.id !== itemId))
  }

  function handleClear(): void {
    setCartLines([])
  }

  async function handleCheckout(): Promise<void> {
    if (cartLines.length === 0 || !settings) return
    setCheckingOut(true)
    try {
      const subtotal = cartSubtotal(cartLines)
      const order = await createOrder({
        lineItems: cartLines.map((l) => ({
          itemId: l.item.id,
          nameSnapshot: l.item.name,
          unitPrice: l.item.price,
          qty: l.qty,
          lineTotal: l.item.price * l.qty
        })),
        subtotal,
        total: subtotal,
        cashierName: CASHIER_NAME
      })
      setReceiptOrder(order)
      setCartLines([])
      setToast(`Sale #${order.receiptNumber} recorded`)
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Could not complete sale.')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar categories={categories} activeCategoryId={activeCategoryId} onSelect={setActiveCategoryId} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-4 border-b border-black/10 bg-cream px-6 py-4">
          <SearchBar value={search} onChange={setSearch} />
          <nav className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => onNavigate('sales')}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-cocoa hover:bg-black/5"
            >
              Sales
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-cocoa hover:bg-black/5"
            >
              Reports
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-cocoa hover:bg-black/5"
            >
              Menu Management
            </button>
          </nav>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <ItemGrid items={visibleItems} currencySymbol={currencySymbol} onAdd={handleAdd} />
        </main>
        <StatusBar cashierName={CASHIER_NAME} />
      </div>
      <CartPanel
        lines={cartLines}
        currencySymbol={currencySymbol}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onClear={handleClear}
        onCheckout={handleCheckout}
        checkingOut={checkingOut}
      />
      {receiptOrder && settings && (
        <ReceiptModal order={receiptOrder} settings={settings} onClose={() => setReceiptOrder(null)} />
      )}
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
