import { buildSeedData } from '../shared/seedMenu'
import type { DataFile } from '../shared/types'

/** Populates categories/items on a fresh data file. No-op if menu data already exists. Returns whether it seeded. */
export function seedMenuIfEmpty(data: DataFile): boolean {
  if (data.categories.length > 0 || data.items.length > 0) return false
  const { categories, items } = buildSeedData()
  data.categories = categories
  data.items = items
  return true
}
