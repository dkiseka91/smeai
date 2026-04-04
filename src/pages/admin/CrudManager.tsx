import { useState } from 'react'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'
import { createDoc, updateDocById, deleteDocById } from '@/lib/firebase'

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'url'
  options?: string[]   // for select
  required?: boolean
}

interface CrudManagerProps<T extends { id: string }> {
  title: string
  collectionName: string
  items: T[]
  fields: FieldDef[]
  loading: boolean
  onRefresh: () => void
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
  renderRow: (item: T) => React.ReactNode
}

export function CrudManager<T extends { id: string }>({
  title, collectionName, items, fields, loading, onRefresh, showToast, renderRow,
}: CrudManagerProps<T>) {
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Partial<T> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const emptyForm = Object.fromEntries(
    fields.map(f => [f.key, f.type === 'boolean' ? false : f.type === 'number' ? 0 : ''])
  ) as Partial<T>

  function openCreate() { setEditItem(emptyForm); setFormOpen(true) }
  function openEdit(item: T) { setEditItem({ ...item }); setFormOpen(true) }
  function closeForm() { setFormOpen(false); setEditItem(null) }

  async function handleSave() {
    if (!editItem) return
    setSaving(true)
    try {
      const { id, ...data } = editItem as T & { id: string }
      if (id && items.find(i => i.id === id)) {
        await updateDocById(collectionName, id, data)
        showToast('Updated successfully')
      } else {
        await createDoc(collectionName, data)
        showToast('Created successfully')
      }
      onRefresh()
      closeForm()
    } catch {
      showToast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return
    setDeleting(id)
    try {
      await deleteDocById(collectionName, id)
      showToast('Deleted')
      onRefresh()
    } catch {
      showToast('Delete failed', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#1A2744' }}>{title}</h1>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: '#F5A623',
            border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem',
            fontFamily: 'Syne', fontWeight: 700, fontSize: '0.875rem', color: '#1A2744', cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(26,39,68,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'DM Sans', color: '#9ca3af' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'DM Sans', color: '#9ca3af' }}>
            No items yet. Click "Add New" to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#374151' }}>
                      {renderRow(item)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => openEdit(item)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem', marginRight: 4 }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.25rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      {formOpen && editItem && (
        <div
          onClick={closeForm}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 20, width: '100%', maxWidth: 560,
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.75rem', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#1A2744' }}>
                {(editItem as T & { id: string }).id && items.find(i => i.id === (editItem as T & { id: string }).id) ? 'Edit' : 'Add'} {title.replace(/s$/, '')}
              </h2>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {fields.map(field => (
                <div key={field.key}>
                  <label style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                    {field.label}{field.required && ' *'}
                  </label>
                  {field.type === 'boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!!(editItem as Record<string, unknown>)[field.key]}
                        onChange={e => setEditItem(prev => ({ ...prev, [field.key]: e.target.checked }) as Partial<T>)}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <span style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#374151' }}>
                        {(editItem as Record<string, unknown>)[field.key] ? 'Yes' : 'No'}
                      </span>
                    </label>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={(editItem as Record<string, unknown>)[field.key] as string ?? ''}
                      onChange={e => setEditItem(prev => ({ ...prev, [field.key]: e.target.value }) as Partial<T>)}
                      required={field.required}
                      rows={4}
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                        border: '1.5px solid #e5e7eb', fontFamily: 'DM Sans', fontSize: '0.875rem',
                        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                      }}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={(editItem as Record<string, unknown>)[field.key] as string ?? ''}
                      onChange={e => setEditItem(prev => ({ ...prev, [field.key]: e.target.value }) as Partial<T>)}
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                        border: '1.5px solid #e5e7eb', fontFamily: 'DM Sans', fontSize: '0.875rem',
                        outline: 'none', boxSizing: 'border-box', background: 'white',
                      }}
                    >
                      <option value="">— Select —</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
                      value={(editItem as Record<string, unknown>)[field.key] as string ?? ''}
                      onChange={e => setEditItem(prev => ({
                        ...prev,
                        [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                      }) as Partial<T>)}
                      required={field.required}
                      style={{
                        width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                        border: '1.5px solid #e5e7eb', fontFamily: 'DM Sans', fontSize: '0.875rem',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '1.25rem 1.75rem', borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: saving ? '#9ca3af' : '#F5A623', border: 'none', borderRadius: 10,
                  padding: '0.75rem', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem',
                  color: '#1A2744', cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                <Check size={16} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={closeForm}
                style={{
                  padding: '0.75rem 1.5rem', background: '#f3f4f6', border: 'none',
                  borderRadius: 10, fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.9rem',
                  color: '#374151', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
