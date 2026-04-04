import { useState, useEffect, useCallback } from 'react'
import { fetchCollection, orderBy, COLLECTIONS } from '@/lib/firebase'
import type { Article } from '@/types'
import { CrudManager, type FieldDef } from './CrudManager'

const FIELDS: FieldDef[] = [
  { key: 'title',    label: 'Title',     type: 'text',     required: true },
  { key: 'excerpt',  label: 'Excerpt',   type: 'textarea', required: true },
  { key: 'body',     label: 'Body',      type: 'textarea', required: true },
  { key: 'author',   label: 'Author',    type: 'text',     required: true },
  { key: 'category', label: 'Category',  type: 'text',     required: true },
  { key: 'imageUrl', label: 'Image URL', type: 'url' },
  { key: 'featured', label: 'Featured',  type: 'boolean' },
  { key: 'published',label: 'Published', type: 'boolean' },
]

export function ArticlesManager({ showToast }: { showToast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchCollection<Article>(COLLECTIONS.ARTICLES, [orderBy('createdAt', 'desc')])
      .then(setArticles).finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <CrudManager
      title="Articles"
      collectionName={COLLECTIONS.ARTICLES}
      items={articles}
      fields={FIELDS}
      loading={loading}
      onRefresh={load}
      showToast={showToast}
      renderRow={item => (
        <div>
          <div style={{ fontWeight: 600, color: '#1A2744' }}>{item.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 }}>
            {item.category} · {item.featured ? '⭐ Featured' : ''} · {item.published ? '✅ Published' : '🔒 Draft'}
          </div>
        </div>
      )}
    />
  )
}
