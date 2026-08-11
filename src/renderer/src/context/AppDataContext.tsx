import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type {
  Category,
  DataFile,
  MenuItem,
  NewOrderPayload,
  Order,
  OrderLineItem,
  Settings
} from '@shared/types'

interface AppDataContextValue {
  loading: boolean
  settings: Settings | null
  categories: Category[]
  items: MenuItem[]
  orders: Order[]
  upsertCategory: (category: Category) => Promise<void>
  upsertItem: (item: MenuItem) => Promise<void>
  setItemActive: (id: string, active: boolean) => Promise<void>
  createOrder: (payload: NewOrderPayload) => Promise<Order>
  updateOrder: (id: string, lineItems: OrderLineItem[]) => Promise<Order>
  updateSettings: (partial: Partial<Settings>) => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DataFile | null>(null)

  useEffect(() => {
    window.api.loadData().then((fresh) => {
      setData(fresh)
      setLoading(false)
    })
  }, [])

  const upsertCategory = useCallback(async (category: Category) => {
    const categories = await window.api.upsertCategory(category)
    setData((prev) => (prev ? { ...prev, categories } : prev))
  }, [])

  const upsertItem = useCallback(async (item: MenuItem) => {
    const items = await window.api.upsertItem(item)
    setData((prev) => (prev ? { ...prev, items } : prev))
  }, [])

  const setItemActive = useCallback(async (id: string, active: boolean) => {
    const items = await window.api.setItemActive(id, active)
    setData((prev) => (prev ? { ...prev, items } : prev))
  }, [])

  const createOrder = useCallback(async (payload: NewOrderPayload) => {
    const order = await window.api.createOrder(payload)
    setData((prev) => (prev ? { ...prev, orders: [...prev.orders, order] } : prev))
    return order
  }, [])

  const updateOrder = useCallback(async (id: string, lineItems: OrderLineItem[]) => {
    const subtotal = lineItems.reduce((sum, line) => sum + line.lineTotal, 0)
    const updated = await window.api.updateOrder({ id, lineItems, subtotal, total: subtotal })
    setData((prev) =>
      prev ? { ...prev, orders: prev.orders.map((o) => (o.id === updated.id ? updated : o)) } : prev
    )
    return updated
  }, [])

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const settings = await window.api.updateSettings(partial)
    setData((prev) => (prev ? { ...prev, settings } : prev))
  }, [])

  const value: AppDataContextValue = {
    loading,
    settings: data?.settings ?? null,
    categories: data?.categories ?? [],
    items: data?.items ?? [],
    orders: data?.orders ?? [],
    upsertCategory,
    upsertItem,
    setItemActive,
    createOrder,
    updateOrder,
    updateSettings
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
