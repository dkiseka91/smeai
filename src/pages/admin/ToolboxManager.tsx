import { useState, useEffect, useCallback } from 'react'
import { fetchCollection, orderBy, COLLECTIONS } from '@/lib/firebase'
import type { ToolboxItem } from '@/types'
import { CrudManager, type FieldDef } from './CrudManager'

const FIELDS: FieldDef[] = [
  { key: 'title',       label: 'Title',        type: 'text',    required: true },
  { key: 'description', label: 'Description',  type: 'textarea',required: true },
  { key: 'type',        label: 'Type',         type: 'select',  required: true, options: ['template','guide','tool','checklist'] },
  { key: 'price',       label: 'Price (UGX, 0=free)', type: 'number', required: true },
  { key: 'fileUrl',     label: 'File URL',     type: 'url' },
  { key: 'previewUrl',  label: 'Preview URL',  type: 'url' },
  { key: 'published',   label: 'Published',    type: 'boolean' },
]

export function ToolboxManager({ showToast }: { showToast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [items, setItems] = useState<ToolboxItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchCollection<ToolboxItem>(COLLECTIONS.TOOLBOX, [orderBy('createdAt', 'desc')])
      .then(setItems).finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <CrudManager
      title="Toolbox Items"
      collectionName={COLLECTIONS.TOOLBOX}
      items={items}
      fields={FIELDS}
      loading={loading}
      onRefresh={load}
      showToast={showToast}
      renderRow={item => (
        <div>
          <div style={{ fontWeight: 600, color: '#1A2744' }}>{item.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 }}>
            {item.type} · {item.price === 0 ? 'Free' : `UGX ${item.price.toLocaleString()}`} · {item.published ? 'Published' : 'Draft'}
          </div>
        </div>
      )}
    />
  )
}
