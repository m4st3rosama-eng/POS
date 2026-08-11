import { BrowserWindow } from 'electron'
import type { Order, Settings } from '../shared/types'

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatMoney(amount: number, symbol: string): string {
  return `${symbol} ${Math.round(amount).toLocaleString('en-US')}`
}

function buildReceiptHtml(order: Order, settings: Settings): string {
  const createdAt = new Date(order.createdAt)
  const rows = order.lineItems
    .map(
      (line) => `<tr>
        <td class="name">${escapeHtml(line.nameSnapshot)}</td>
        <td class="num">${line.qty}</td>
        <td class="num">${formatMoney(line.lineTotal, settings.currencySymbol)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: 80mm auto; margin: 4mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", sans-serif; width: 72mm; margin: 0; color: #000; font-size: 12px; }
  .center { text-align: center; }
  .title { font-size: 15px; font-weight: bold; }
  .muted { font-size: 10px; }
  .divider { border-top: 1px dashed #000; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; padding-bottom: 4px; }
  th.num, td.num { text-align: right; }
  td { padding: 2px 0; vertical-align: top; }
  .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; }
  .row { display: flex; justify-content: space-between; font-size: 11px; }
</style>
</head>
<body>
  <div class="center">
    <div class="title">${escapeHtml(settings.cafeName)}</div>
    ${settings.address ? `<div class="muted">${escapeHtml(settings.address)}</div>` : ''}
    ${settings.phone ? `<div class="muted">${escapeHtml(settings.phone)}</div>` : ''}
  </div>
  <div class="divider"></div>
  <div class="row"><span>Receipt #${order.receiptNumber}</span><span>${createdAt.toLocaleDateString()}</span></div>
  <div class="muted">${createdAt.toLocaleTimeString()}</div>
  <div class="divider"></div>
  <table>
    <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Amt</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="divider"></div>
  <div class="total-row"><span>TOTAL</span><span>${formatMoney(order.total, settings.currencySymbol)}</span></div>
  ${
    settings.receiptFooterNote
      ? `<div class="divider"></div><div class="center muted">${escapeHtml(settings.receiptFooterNote)}</div>`
      : ''
  }
</body>
</html>`
}

/**
 * Renders the receipt in a hidden, dedicated window and opens the native print dialog on it.
 * Isolating printing to its own window (rather than printing the main POS window with CSS
 * visibility tricks) avoids the print dialog ever showing blank or racing a React re-render.
 */
export function printReceipt(order: Order, settings: Settings): Promise<void> {
  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({
      show: false,
      width: 400,
      height: 600
    })

    const cleanup = (): void => {
      if (!printWindow.isDestroyed()) printWindow.close()
    }

    printWindow.webContents.once('did-finish-load', () => {
      printWindow.webContents.print({ silent: false, printBackground: true }, (success, reason) => {
        cleanup()
        if (success) {
          resolve()
        } else {
          reject(new Error(reason || 'Print was cancelled.'))
        }
      })
    })

    const html = buildReceiptHtml(order, settings)
    printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`).catch((err) => {
      cleanup()
      reject(err)
    })
  })
}
