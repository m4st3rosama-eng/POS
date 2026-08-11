export function formatCurrency(amount: number, symbol = 'Rs.'): string {
  return `${symbol} ${Math.round(amount).toLocaleString('en-US')}`
}
