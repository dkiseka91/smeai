import { useState, useEffect, useCallback } from 'react'
import { fetchCollection, orderBy, COLLECTIONS } from '@/lib/firebase'
import type { Opportunity } from '@/types'
import { CrudManager, type FieldDef } from './CrudManager'

const FIELDS: FieldDef[] = [
  { key: 'title',        label: 'Title',        type: 'text',     required: true },
  { key: 'organisation', label: 'Organisation', type: 'text',     required: true },
  { key: 'description',  label: 'Description',  type: 'textarea', required: true },
  { key: 'category',     label: 'Category',     type: 'select',   required: true, options: ['grant','scholarship','exhibition','competition'] },
  { key: 'deadline',     label: 'Deadline',     type: 'text',     required: true },
  { key: 'link',         label: 'Apply Link',   type: 'url',      required: true },
  { key: 'imageUrl',     label: 'Image URL',    type: 'url' },
  { key: 'featured',     label: 'Featured',     type: 'boolean' },
  { key: 'published',    label: 'Published',    type: 'boolean' },
]

export function OpportunitiesManager({ showToast }: { showToast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [items, setItems] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchCollection<Opportunity>(COLLECTIONS.OPPORTUNITIES, [orderBy('createdAt', 'desc')])
      .then(setItems).finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <CrudManager
      title="Opportunities"
      collectionName={COLLECTIONS.OPPORTUNITIES}
      items={items}
      fields={FIELDS}
      loading={loading}
      onRefresh={load}
      showToast={showToast}
      renderRow={item => (
        <div>
          <div style={{ fontWeight: 600, color: '#1A2744' }}>{item.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 }}>
            {item.organisation} · {item.category} · Deadline: {item.deadline} · {item.published ? '✅ Published' : '🔒 Draft'}
          </div>
        </div>
      )}
    />
  )
}
