import React, { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { getDailySales, getMonthlySales, formatDateKey } from '../lib/aggregations'
import { formatCurrency } from '../lib/currency'
import { TopBar, TabButton, SummaryStat } from '../components/ui/ScreenChrome'
import { ReceiptModal } from '../components/ReceiptModal'
import { EditOrderModal } from '../components/EditOrderModal'
import type { Order, OrderLineItem } from '@shared/types'

type Tab = 'daily' | 'monthly'

interface SalesScreenProps {
  onBack: () => void
}

export function SalesScreen({ onBack }: SalesScreenProps): React.ReactElement {
  const { orders, settings, items, updateOrder } = useAppData()
  const [tab, setTab] = useState<Tab>('daily')
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()))
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const currencySymbol = settings?.currencySymbol ?? 'Rs.'

  const daily = useMemo(
    () => getDailySales(orders, new Date(`${selectedDate}T00:00:00`)),
    [orders, selectedDate]
  )
  const monthly = useMemo(() => getMonthlySales(orders, year, month), [orders, year, month])

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  })

  function shiftMonth(delta: number): void {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-parchment">
      <TopBar title="Sales" onBack={onBack} />
      <div className="shrink-0 border-b border-black/10 bg-cream px-6">
        <div className="flex gap-1">
          <TabButton active={tab === 'daily'} onClick={() => setTab('daily')}>
            Daily
          </TabButton>
          <TabButton active={tab === 'monthly'} onClick={() => setTab('monthly')}>
            Monthly
          </TabButton>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'daily' ? (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
              />
              <div className="flex gap-6 text-right">
                <SummaryStat label="Orders" value={String(daily.orderCount)} />
                <SummaryStat label="Revenue" value={formatCurrency(daily.totalRevenue, currencySymbol)} />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-white shadow-card">
              {daily.orders.length === 0 ? (
                <div className="p-8 text-center text-sm text-ink/40">No sales recorded for this day.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-parchment text-left text-xs uppercase tracking-wide text-ink/50">
                    <tr>
                      <th className="px-4 py-2">Receipt #</th>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Items</th>
                      <th className="px-4 py-2 text-right">Total</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.orders.map((order) => (
                      <tr key={order.id} className="border-t border-black/5">
                        <td className="px-4 py-2 font-medium">#{order.receiptNumber}</td>
                        <td className="px-4 py-2 text-ink/60">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2 text-ink/60">
                          {order.lineItems.map((l) => `${l.nameSnapshot} ×${l.qty}`).join(', ')}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {formatCurrency(order.total, currencySymbol)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => setReceiptOrder(order)}
                            className="mr-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-cocoa hover:bg-black/5"
                          >
                            Receipt
                          </button>
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-cocoa hover:bg-black/5"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => shiftMonth(-1)}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  ‹
                </button>
                <div className="min-w-[10rem] text-center text-sm font-semibold text-ink">{monthLabel}</div>
                <button
                  onClick={() => shiftMonth(1)}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  ›
                </button>
              </div>
              <div className="flex gap-6 text-right">
                <SummaryStat label="Orders" value={String(monthly.orderCount)} />
                <SummaryStat label="Revenue" value={formatCurrency(monthly.totalRevenue, currencySymbol)} />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-white shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-parchment text-left text-xs uppercase tracking-wide text-ink/50">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Orders</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.days.filter((d) => d.orderCount > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-ink/40">
                        No sales recorded this month.
                      </td>
                    </tr>
                  ) : (
                    monthly.days
                      .filter((d) => d.orderCount > 0)
                      .map((d) => (
                        <tr key={d.dateKey} className="border-t border-black/5">
                          <td className="px-4 py-2 font-medium">{d.dateKey}</td>
                          <td className="px-4 py-2 text-ink/60">{d.orderCount}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            {formatCurrency(d.totalRevenue, currencySymbol)}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {receiptOrder && settings && (
        <ReceiptModal order={receiptOrder} settings={settings} onClose={() => setReceiptOrder(null)} />
      )}
      {editingOrder && settings && (
        <EditOrderModal
          order={editingOrder}
          items={items}
          settings={settings}
          onCancel={() => setEditingOrder(null)}
          onSave={async (lineItems: OrderLineItem[]) => {
            await updateOrder(editingOrder.id, lineItems)
            setEditingOrder(null)
          }}
        />
      )}
    </div>
  )
}
