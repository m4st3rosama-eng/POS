import { ipcMain, app } from 'electron'
import { v4 as uuid } from 'uuid'
import { IPC } from '../shared/ipcChannels'
import { loadData, mutate } from './dataStore'
import { printReceipt } from './printReceipt'
import type {
  Category,
  DataFile,
  MenuItem,
  NewOrderPayload,
  Order,
  Settings,
  UpdateOrderPayload
} from '../shared/types'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.loadData, async (): Promise<DataFile> => {
    return loadData()
  })

  ipcMain.handle(IPC.getAppVersion, (): string => app.getVersion())

  ipcMain.handle(IPC.upsertCategory, async (_event, category: Category): Promise<Category[]> => {
    return mutate((data) => {
      const index = data.categories.findIndex((c) => c.id === category.id)
      if (index >= 0) {
        data.categories[index] = category
      } else {
        data.categories.push(category)
      }
      return data.categories
    })
  })

  ipcMain.handle(IPC.upsertItem, async (_event, item: MenuItem): Promise<MenuItem[]> => {
    return mutate((data) => {
      const now = new Date().toISOString()
      const index = data.items.findIndex((i) => i.id === item.id)
      if (index >= 0) {
        data.items[index] = { ...item, updatedAt: now }
      } else {
        data.items.push({ ...item, createdAt: now, updatedAt: now })
      }
      return data.items
    })
  })

  ipcMain.handle(
    IPC.setItemActive,
    async (_event, id: string, active: boolean): Promise<MenuItem[]> => {
      return mutate((data) => {
        const item = data.items.find((i) => i.id === id)
        if (item) {
          item.active = active
          item.updatedAt = new Date().toISOString()
        }
        return data.items
      })
    }
  )

  ipcMain.handle(IPC.createOrder, async (_event, payload: NewOrderPayload): Promise<Order> => {
    return mutate((data) => {
      const order: Order = {
        id: uuid(),
        receiptNumber: data.settings.nextReceiptNumber,
        createdAt: new Date().toISOString(),
        lineItems: payload.lineItems,
        subtotal: payload.subtotal,
        total: payload.total,
        cashierName: payload.cashierName
      }
      data.orders.push(order)
      data.settings.nextReceiptNumber += 1
      return order
    })
  })

  ipcMain.handle(
    IPC.updateOrder,
    async (_event, payload: UpdateOrderPayload): Promise<Order> => {
      return mutate((data) => {
        const order = data.orders.find((o) => o.id === payload.id)
        if (!order) {
          throw new Error('Sale not found.')
        }
        order.lineItems = payload.lineItems
        order.subtotal = payload.subtotal
        order.total = payload.total
        return order
      })
    }
  )

  ipcMain.handle(IPC.printReceipt, async (_event, orderId: string): Promise<void> => {
    const data = await loadData()
    const order = data.orders.find((o) => o.id === orderId)
    if (!order) {
      throw new Error('Sale not found.')
    }
    await printReceipt(order, data.settings)
  })

  ipcMain.handle(
    IPC.updateSettings,
    async (_event, partial: Partial<Settings>): Promise<Settings> => {
      return mutate((data) => {
        data.settings = { ...data.settings, ...partial }
        return data.settings
      })
    }
  )
}
