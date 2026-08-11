import React, { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { generateId } from '../lib/id'
import { formatCurrency } from '../lib/currency'
import { resizeImageToDataUrl } from '../lib/image'
import { getItemImageSrc } from '../assets/categoryIcons'
import { TopBar } from '../components/ui/ScreenChrome'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Toast } from '../components/ui/Toast'
import type { MenuItem } from '@shared/types'

interface MenuManagementScreenProps {
  onBack: () => void
}

interface ItemFormState {
  id: string | null
  name: string
  categoryId: string
  price: string
  /** null = use the category's default icon; a data URL = a custom uploaded photo */
  imageDataUrl: string | null
}

const emptyForm: ItemFormState = { id: null, name: '', categoryId: '', price: '', imageDataUrl: null }

export function MenuManagementScreen({ onBack }: MenuManagementScreenProps): React.ReactElement {
  const { categories, items, settings, upsertItem, setItemActive } = useAppData()
  const [form, setForm] = useState<ItemFormState | null>(null)
  const [pendingToggle, setPendingToggle] = useState<MenuItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const currencySymbol = settings?.currencySymbol ?? 'Rs.'
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  )

  function openNewItemForm(): void {
    setForm({ ...emptyForm, categoryId: sortedCategories[0]?.id ?? '' })
  }

  function openEditItemForm(item: MenuItem): void {
    setForm({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      price: String(item.price),
      imageDataUrl: item.imageRef.startsWith('data:') ? item.imageRef : null
    })
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !form) return
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setForm({ ...form, imageDataUrl: dataUrl })
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Could not load that image.')
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!form) return
    const price = Number(form.price)
    if (!form.name.trim() || !form.categoryId || !Number.isFinite(price) || price < 0) {
      setToast('Please provide a valid name, category, and price.')
      return
    }
    const existing = form.id ? items.find((i) => i.id === form.id) : undefined
    const now = new Date().toISOString()
    const categoryIconKey = sortedCategories.find((c) => c.id === form.categoryId)?.iconKey ?? 'main'
    const item: MenuItem = {
      id: form.id ?? generateId(),
      name: form.name.trim(),
      categoryId: form.categoryId,
      price,
      imageRef: form.imageDataUrl ?? categoryIconKey,
      active: existing?.active ?? true,
      isVariablePriceDefault: existing?.isVariablePriceDefault,
      note: existing?.note,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    }
    await upsertItem(item)
    setToast(form.id ? 'Item updated' : 'Item added')
    setForm(null)
  }

  async function confirmToggle(): Promise<void> {
    if (!pendingToggle) return
    await setItemActive(pendingToggle.id, !pendingToggle.active)
    setToast(pendingToggle.active ? 'Item removed from menu' : 'Item restored to menu')
    setPendingToggle(null)
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-parchment">
      <TopBar title="Menu Management" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink/60">Add items, adjust prices, or remove items from the menu.</p>
            <Button onClick={openNewItemForm}>+ Add Item</Button>
          </div>

          {sortedCategories.map((category) => {
            const categoryItems = items
              .filter((i) => i.categoryId === category.id)
              .sort((a, b) => a.name.localeCompare(b.name))
            if (categoryItems.length === 0) return null
            return (
              <div key={category.id} className="overflow-hidden rounded-xl bg-white shadow-card">
                <div className="border-b border-black/5 px-4 py-2.5 text-sm font-semibold text-ink">
                  {category.name}
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {categoryItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-t border-black/5 ${!item.active ? 'opacity-40' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={getItemImageSrc(item.imageRef)}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-medium text-ink">{item.name}</div>
                              {item.isVariablePriceDefault && (
                                <div className="text-[11px] font-medium text-gold">
                                  Default price — confirm/adjust
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-ink">
                          {formatCurrency(item.price, currencySymbol)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => openEditItemForm(item)}
                            className="mr-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-cocoa hover:bg-black/5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setPendingToggle(item)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              item.active ? 'text-red-700 hover:bg-red-50' : 'text-sage hover:bg-sage/10'
                            }`}
                          >
                            {item.active ? 'Remove' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-ink">
              {form.id ? 'Edit Item' : 'Add Item'}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cocoa/70">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cocoa/70">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                >
                  {sortedCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cocoa/70">
                  Price ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cocoa/70">
                  Item Image
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={getItemImageSrc(
                      form.imageDataUrl ??
                        sortedCategories.find((c) => c.id === form.categoryId)?.iconKey ??
                        'main'
                    )}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-black/10 object-cover"
                  />
                  <div className="flex flex-col items-start gap-2">
                    <label className="cursor-pointer rounded-lg bg-cocoa px-3 py-1.5 text-xs font-semibold text-cream hover:bg-bark">
                      {form.imageDataUrl ? 'Replace Image' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    {form.imageDataUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageDataUrl: null })}
                        className="text-xs font-medium text-ink/50 hover:text-red-600"
                      >
                        Use default category image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button type="submit">{form.id ? 'Save Changes' : 'Add Item'}</Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingToggle}
        title={pendingToggle?.active ? 'Remove item?' : 'Restore item?'}
        message={
          pendingToggle?.active
            ? `"${pendingToggle?.name}" will no longer appear on the ordering screen. Past sales are unaffected.`
            : `"${pendingToggle?.name}" will reappear on the ordering screen.`
        }
        danger={pendingToggle?.active}
        confirmLabel={pendingToggle?.active ? 'Remove' : 'Restore'}
        onConfirm={confirmToggle}
        onCancel={() => setPendingToggle(null)}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
