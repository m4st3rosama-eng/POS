import type { Order } from '@shared/types'

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameLocalDay(iso: string, date: Date): boolean {
  const d = new Date(iso)
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  )
}

export interface DailySalesSummary {
  dateKey: string
  orderCount: number
  totalRevenue: number
  orders: Order[]
}

export function getDailySales(orders: Order[], date: Date): DailySalesSummary {
  const dayOrders = orders
    .filter((o) => isSameLocalDay(o.createdAt, date))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const totalRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0)
  return {
    dateKey: formatDateKey(date),
    orderCount: dayOrders.length,
    totalRevenue,
    orders: dayOrders
  }
}

export interface MonthlyDayBucket {
  day: number
  dateKey: string
  orderCount: number
  totalRevenue: number
}

export interface MonthlySalesSummary {
  year: number
  month: number
  totalRevenue: number
  orderCount: number
  days: MonthlyDayBucket[]
}

export function getMonthlySales(orders: Order[], year: number, month: number): MonthlySalesSummary {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: MonthlyDayBucket[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return { day, dateKey: formatDateKey(new Date(year, month, day)), orderCount: 0, totalRevenue: 0 }
  })

  let totalRevenue = 0
  let orderCount = 0
  for (const order of orders) {
    const d = new Date(order.createdAt)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const bucket = days[d.getDate() - 1]
      bucket.orderCount += 1
      bucket.totalRevenue += order.total
      totalRevenue += order.total
      orderCount += 1
    }
  }

  return { year, month, totalRevenue, orderCount, days }
}

export interface ItemReportRow {
  itemId: string
  name: string
  qtySold: number
  revenue: number
}

export function getItemReport(orders: Order[]): ItemReportRow[] {
  const map = new Map<string, ItemReportRow>()
  for (const order of orders) {
    for (const line of order.lineItems) {
      const existing = map.get(line.itemId)
      if (existing) {
        existing.qtySold += line.qty
        existing.revenue += line.lineTotal
      } else {
        map.set(line.itemId, {
          itemId: line.itemId,
          name: line.nameSnapshot,
          qtySold: line.qty,
          revenue: line.lineTotal
        })
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}
