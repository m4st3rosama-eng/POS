export interface Settings {
  cafeName: string
  address?: string
  phone?: string
  currencySymbol: string
  receiptFooterNote?: string
  nextReceiptNumber: number
}

export interface Category {
  id: string
  name: string
  iconKey: string
  sortOrder: number
}

export interface MenuItem {
  id: string
  name: string
  categoryId: string
  price: number
  imageRef: string
  active: boolean
  isVariablePriceDefault?: boolean
  note?: string
  createdAt: string
  updatedAt: string
}

export interface OrderLineItem {
  itemId: string
  nameSnapshot: string
  unitPrice: number
  qty: number
  lineTotal: number
}

export interface Order {
  id: string
  receiptNumber: number
  createdAt: string
  lineItems: OrderLineItem[]
  subtotal: number
  total: number
  cashierName: string
}

export interface DataFile {
  meta: { schemaVersion: number }
  settings: Settings
  categories: Category[]
  items: MenuItem[]
  orders: Order[]
}

export interface NewOrderPayload {
  lineItems: OrderLineItem[]
  subtotal: number
  total: number
  cashierName: string
}

export interface UpdateOrderPayload {
  id: string
  lineItems: OrderLineItem[]
  subtotal: number
  total: number
}
