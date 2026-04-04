import { useState, useEffect, useCallback } from 'react'
import { fetchCollection, orderBy, COLLECTIONS } from '@/lib/firebase'
import type { Programme } from '@/types'
import { CrudManager, type FieldDef } from './CrudManager'

const FIELDS: FieldDef[] = [
  { key: 'title',       label: 'Title',         type: 'text',     required: true },
  { key: 'description', label: 'Description',   type: 'textarea', required: true },
  { key: 'duration',    label: 'Duration',       type: 'text',     required: true },
  { key: 'price',       label: 'Price (UGX, 0=free)', type: 'number', required: true },
  { key: 'category',    label: 'Category',       type: 'select',   required: true, options: ['individual','group','corporate'] },
  { key: 'imageUrl',    label: 'Image URL',      type: 'url' },
  { key: 'published',   label: 'Published',      type: 'boolean' },
]

export function ProgrammesManager({ showToast }: { showToast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [items, setItems] = useState<Programme[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchCollection<Programme>(COLLECTIONS.PROGRAMMES, [orderBy('createdAt', 'desc')])
      .then(setItems).finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <CrudManager
      title="Programmes"
      collectionName={COLLECTIONS.PROGRAMMES}
      items={items}
      fields={FIELDS}
      loading={loading}
      onRefresh={load}
      showToast={showToast}
      renderRow={item => (
        <div>
          <div style={{ fontWeight: 600, color: '#1A2744' }}>{item.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 }}>
            {item.category} · {item.duration} · {item.price === 0 ? 'Free' : `UGX ${item.price.toLocaleString()}`} · {item.published ? 'Published' : 'Draft'}
          </div>
        </div>
      )}
    />
  )
}
