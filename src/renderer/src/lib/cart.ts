import type { MenuItem } from '@shared/types'

export interface CartLine {
  item: MenuItem
  qty: number
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.item.price * line.qty, 0)
}
