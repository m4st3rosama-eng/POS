import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipcChannels'
import type {
  Category,
  DataFile,
  MenuItem,
  NewOrderPayload,
  Order,
  Settings,
  UpdateOrderPayload
} from '../shared/types'

const api = {
  loadData: (): Promise<DataFile> => ipcRenderer.invoke(IPC.loadData),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC.getAppVersion),
  upsertCategory: (category: Category): Promise<Category[]> =>
    ipcRenderer.invoke(IPC.upsertCategory, category),
  upsertItem: (item: MenuItem): Promise<MenuItem[]> => ipcRenderer.invoke(IPC.upsertItem, item),
  setItemActive: (id: string, active: boolean): Promise<MenuItem[]> =>
    ipcRenderer.invoke(IPC.setItemActive, id, active),
  createOrder: (payload: NewOrderPayload): Promise<Order> =>
    ipcRenderer.invoke(IPC.createOrder, payload),
  updateOrder: (payload: UpdateOrderPayload): Promise<Order> =>
    ipcRenderer.invoke(IPC.updateOrder, payload),
  printReceipt: (orderId: string): Promise<void> => ipcRenderer.invoke(IPC.printReceipt, orderId),
  updateSettings: (partial: Partial<Settings>): Promise<Settings> =>
    ipcRenderer.invoke(IPC.updateSettings, partial)
}

export type PosApi = typeof api

contextBridge.exposeInMainWorld('api', api)
