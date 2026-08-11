import { v4 as uuid } from 'uuid'
import type { Category, MenuItem } from './types'

interface SeedCategory {
  key: string
  name: string
}

interface SeedItem {
  name: string
  categoryKey: string
  price: number
  isVariablePriceDefault?: boolean
  note?: string
}

/** Order mirrors the café's own sidebar layout (coffee/drinks/sweets first, kitchen items after). */
export const SEED_CATEGORIES: SeedCategory[] = [
  { key: 'coffee', name: 'Coffee' },
  { key: 'drinks', name: 'Drinks' },
  { key: 'cakes', name: 'Cakes' },
  { key: 'cookies', name: 'Cookies' },
  { key: 'appetizers', name: 'Appetizers' },
  { key: 'breakfast', name: 'Breakfast' },
  { key: 'parathas', name: 'Parathas' },
  { key: 'main', name: 'Main' },
  { key: 'tea', name: 'Tea' },
  { key: 'traditional', name: 'Traditional' },
  { key: 'bread', name: 'Bread' }
]

/** Transcribed from the café's printed menu. Prices in PKR (Rs.). */
export const SEED_ITEMS: SeedItem[] = [
  // Coffee
  { name: 'Caramel Macchiato', categoryKey: 'coffee', price: 600 },
  { name: 'Old School Cold Coffee', categoryKey: 'coffee', price: 550 },
  { name: 'Hot Cocoa', categoryKey: 'coffee', price: 500 },
  { name: 'Cappuccino', categoryKey: 'coffee', price: 450 },
  { name: 'Black Coffee', categoryKey: 'coffee', price: 400 },
  // Drinks
  { name: 'Mint Margarita', categoryKey: 'drinks', price: 350 },
  { name: 'Apricot Juice', categoryKey: 'drinks', price: 250 },
  { name: 'Cold Drinks', categoryKey: 'drinks', price: 170 },
  { name: 'Water (Small)', categoryKey: 'drinks', price: 100 },
  { name: 'Water (Large)', categoryKey: 'drinks', price: 140 },
  // Cakes
  { name: 'Plain Cake', categoryKey: 'cakes', price: 200 },
  { name: 'Walnut Cake', categoryKey: 'cakes', price: 350 },
  { name: 'Chocolate Walnut', categoryKey: 'cakes', price: 400 },
  { name: 'Brownies', categoryKey: 'cakes', price: 300 },
  // Cookies
  { name: 'Classic Chocolate Chip', categoryKey: 'cookies', price: 350 },
  { name: 'Double Chocolate', categoryKey: 'cookies', price: 400 },
  // Appetizers
  { name: 'Crispy Wings (6 pcs)', categoryKey: 'appetizers', price: 650 },
  { name: 'Dynamite Wings (6 pcs)', categoryKey: 'appetizers', price: 700 },
  { name: 'Fries', categoryKey: 'appetizers', price: 350 },
  { name: 'Peri Peri Fries', categoryKey: 'appetizers', price: 400 },
  { name: 'Mix Pakoray', categoryKey: 'appetizers', price: 400 },
  { name: 'Potato Wedges (8 pcs)', categoryKey: 'appetizers', price: 450 },
  // Breakfast
  { name: 'Pancakes', categoryKey: 'breakfast', price: 450 },
  { name: 'Paratha', categoryKey: 'breakfast', price: 100 },
  { name: 'Omelette', categoryKey: 'breakfast', price: 250 },
  { name: 'Fried Egg', categoryKey: 'breakfast', price: 150 },
  { name: 'Bread (per slice)', categoryKey: 'breakfast', price: 30 },
  { name: 'Boiled Egg', categoryKey: 'breakfast', price: 100 },
  // Parathas
  { name: 'Simple Paratha', categoryKey: 'parathas', price: 100 },
  { name: 'Alu Paratha', categoryKey: 'parathas', price: 250 },
  { name: 'Walnut Paratha', categoryKey: 'parathas', price: 300 },
  // Main
  { name: 'Chicken Malai Skewers (3 sticks)', categoryKey: 'main', price: 750 },
  { name: 'Chicken Chowmein (Single)', categoryKey: 'main', price: 450 },
  { name: 'Chicken Chowmein (Full)', categoryKey: 'main', price: 1200 },
  {
    name: 'Chicken Karahi (Half)',
    categoryKey: 'main',
    price: 1500,
    isVariablePriceDefault: true,
    note: '35-40 min wait'
  },
  {
    name: 'Chicken Karahi (Full)',
    categoryKey: 'main',
    price: 3000,
    isVariablePriceDefault: true,
    note: '35-40 min wait'
  },
  {
    name: 'Mutton Karahi',
    categoryKey: 'main',
    price: 3500,
    isVariablePriceDefault: true,
    note: '35-40 min wait'
  },
  {
    name: 'Yak / Beef Karahi',
    categoryKey: 'main',
    price: 3200,
    isVariablePriceDefault: true,
    note: '35-40 min wait'
  },
  // Tea
  { name: 'Milk Tea', categoryKey: 'tea', price: 150 },
  { name: 'Mountain Tea', categoryKey: 'tea', price: 100 },
  // Traditional
  { name: 'Chapshoro', categoryKey: 'traditional', price: 500 },
  // Bread
  { name: 'Naan', categoryKey: 'bread', price: 50 },
  { name: 'Roti', categoryKey: 'bread', price: 50 }
]

export function buildSeedData(): { categories: Category[]; items: MenuItem[] } {
  const categories: Category[] = SEED_CATEGORIES.map((c, index) => ({
    id: uuid(),
    name: c.name,
    iconKey: c.key,
    sortOrder: index
  }))

  const categoryIdByKey = new Map(categories.map((c, i) => [SEED_CATEGORIES[i].key, c.id]))
  const now = new Date().toISOString()

  const items: MenuItem[] = SEED_ITEMS.map((item) => ({
    id: uuid(),
    name: item.name,
    categoryId: categoryIdByKey.get(item.categoryKey)!,
    price: item.price,
    imageRef: item.categoryKey,
    active: true,
    isVariablePriceDefault: item.isVariablePriceDefault,
    note: item.note,
    createdAt: now,
    updatedAt: now
  }))

  return { categories, items }
}
