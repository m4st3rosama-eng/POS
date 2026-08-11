import React, { useState } from 'react'
import type { Order, Settings } from '@shared/types'
import { formatCurrency } from '../lib/currency'
import { Button } from './ui/Button'

interface ReceiptModalProps {
  order: Order
  settings: Settings
  onClose: () => void
}

export function ReceiptModal({ order, settings, onClose }: ReceiptModalProps): React.ReactElement {
  const [printing, setPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createdAt = new Date(order.createdAt)

  async function handlePrint(): Promise<void> {
    setPrinting(true)
    setError(null)
    try {
      await window.api.printReceipt(order.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not print receipt.')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="flex-1 overflow-y-auto p-6 text-black">
          <div className="text-center">
            <div className="text-base font-bold">{settings.cafeName}</div>
            {settings.address && <div className="text-[11px] text-black/70">{settings.address}</div>}
            {settings.phone && <div className="text-[11px] text-black/70">{settings.phone}</div>}
          </div>
          <div className="my-3 border-t border-dashed border-black/30" />
          <div className="flex justify-between text-xs">
            <span>Receipt #{order.receiptNumber}</span>
            <span>{createdAt.toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-black/60">{createdAt.toLocaleTimeString()}</div>
          <div className="my-3 border-t border-dashed border-black/30" />
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="pb-1 text-left font-semibold">Item</th>
                <th className="pb-1 text-right font-semibold">Qty</th>
                <th className="pb-1 text-right font-semibold">Amt</th>
              </tr>
            </thead>
            <tbody>
              {order.lineItems.map((line) => (
                <tr key={line.itemId}>
                  <td className="py-0.5 text-left align-top">{line.nameSnapshot}</td>
                  <td className="py-0.5 text-right align-top">{line.qty}</td>
                  <td className="py-0.5 text-right align-top">
                    {formatCurrency(line.lineTotal, settings.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="my-3 border-t border-dashed border-black/30" />
          <div className="flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(order.total, settings.currencySymbol)}</span>
          </div>
          {settings.receiptFooterNote && (
            <>
              <div className="my-3 border-t border-dashed border-black/30" />
              <div className="text-center text-xs text-black/60">{settings.receiptFooterNote}</div>
            </>
          )}
        </div>
        {error && <p className="px-6 pb-2 text-xs font-medium text-red-700">{error}</p>}
        <div className="flex gap-3 border-t border-black/10 bg-cream p-4">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={handlePrint} disabled={printing} className="flex-1">
            {printing ? 'Opening print dialog…' : 'Print Receipt'}
          </Button>
        </div>
      </div>
    </div>
  )
}
