export const IPC = {
  loadData: 'app:loadData',
  getAppVersion: 'app:getAppVersion',
  upsertCategory: 'menu:upsertCategory',
  upsertItem: 'menu:upsertItem',
  setItemActive: 'menu:setItemActive',
  createOrder: 'sales:createOrder',
  updateOrder: 'sales:updateOrder',
  printReceipt: 'sales:printReceipt',
  updateSettings: 'settings:update'
} as const
