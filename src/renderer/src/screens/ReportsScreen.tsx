import React, { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { getItemReport } from '../lib/aggregations'
import { formatCurrency } from '../lib/currency'
import { TopBar, SummaryStat } from '../components/ui/ScreenChrome'

type SortKey = 'qty' | 'revenue'

interface ReportsScreenProps {
  onBack: () => void
}

export function ReportsScreen({ onBack }: ReportsScreenProps): React.ReactElement {
  const { orders, settings } = useAppData()
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const currencySymbol = settings?.currencySymbol ?? 'Rs.'

  const rows = useMemo(() => {
    const report = getItemReport(orders)
    return [...report].sort((a, b) => (sortKey === 'qty' ? b.qtySold - a.qtySold : b.revenue - a.revenue))
  }, [orders, sortKey])

  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0)
  const totalQty = rows.reduce((sum, r) => sum + r.qtySold, 0)
  const bestSellers = useMemo(() => [...rows].sort((a, b) => b.qtySold - a.qtySold).slice(0, 5), [rows])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-parchment">
      <TopBar title="Item Reports" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <SummaryStat label="Items Sold" value={String(totalQty)} />
              <SummaryStat label="Total Revenue" value={formatCurrency(totalRevenue, currencySymbol)} />
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setSortKey('revenue')}
                className={`rounded-lg px-3 py-1.5 font-semibold ${
                  sortKey === 'revenue' ? 'bg-gold text-ink' : 'bg-white text-ink/60'
                }`}
              >
                Sort by Revenue
              </button>
              <button
                onClick={() => setSortKey('qty')}
                className={`rounded-lg px-3 py-1.5 font-semibold ${
                  sortKey === 'qty' ? 'bg-gold text-ink' : 'bg-white text-ink/60'
                }`}
              >
                Sort by Quantity
              </button>
            </div>
          </div>

          {bestSellers.length > 0 && (
            <div className="rounded-xl bg-white p-5 shadow-card">
              <h2 className="mb-3 font-display text-base font-semibold text-ink">Best Sellers</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {bestSellers.map((row, i) => (
                  <div key={row.itemId} className="rounded-lg bg-parchment p-3">
                    <div className="text-[11px] font-semibold text-gold">#{i + 1}</div>
                    <div className="truncate text-sm font-semibold text-ink">{row.name}</div>
                    <div className="text-xs text-ink/50">{row.qtySold} sold</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl bg-white shadow-card">
            {rows.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink/40">No sales recorded yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-parchment text-left text-xs uppercase tracking-wide text-ink/50">
                  <tr>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2 text-right">Qty Sold</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.itemId} className="border-t border-black/5">
                      <td className="px-4 py-2 font-medium">{row.name}</td>
                      <td className="px-4 py-2 text-right text-ink/60">{row.qtySold}</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {formatCurrency(row.revenue, currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
