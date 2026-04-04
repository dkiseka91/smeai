import { useState, useEffect, useCallback } from 'react'
import { fetchCollection, orderBy, COLLECTIONS } from '@/lib/firebase'
import type { Product } from '@/types'
import { CrudManager, type FieldDef } from './CrudManager'

const FIELDS: FieldDef[] = [
  { key: 'name',        label: 'Name',        type: 'text',     required: true },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'price',       label: 'Price (UGX)', type: 'number',   required: true },
  { key: 'category',    label: 'Category',    type: 'text',     required: true },
  { key: 'imageUrl',    label: 'Image URL',   type: 'url' },
  { key: 'impact',      label: 'Impact Note', type: 'text' },
  { key: 'inStock',     label: 'In Stock',    type: 'boolean' },
  { key: 'published',   label: 'Published',   type: 'boolean' },
]

export function ProductsManager({ showToast }: { showToast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchCollection<Product>(COLLECTIONS.PRODUCTS, [orderBy('createdAt', 'desc')])
      .then(setItems).finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <CrudManager
      title="Products"
      collectionName={COLLECTIONS.PRODUCTS}
      items={items}
      fields={FIELDS}
      loading={loading}
      onRefresh={load}
      showToast={showToast}
      renderRow={item => (
        <div>
          <div style={{ fontWeight: 600, color: '#1A2744' }}>{item.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 }}>
            {item.category} · UGX {item.price.toLocaleString()} · {item.inStock ? '✅ In Stock' : '❌ Out of Stock'} · {item.published ? 'Published' : 'Draft'}
          </div>
        </div>
      )}
    />
  )
}
