import { useToolbox } from '@/hooks/useFirestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Download, Eye } from 'lucide-react'

function formatUGX(n: number) {
  return n === 0 ? 'Free' : `UGX ${n.toLocaleString()}`
}

const TYPE_ICONS: Record<string, string> = {
  template: '📄',
  guide: '📚',
  tool: '🔧',
  checklist: '✅',
}

export function Toolbox() {
  const { items, loading } = useToolbox()

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1A2744,#243660)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 16 }}>
            Entrepreneur's <span style={{ color: '#F5A623' }}>Toolbox</span>
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 580, lineHeight: 1.7 }}>
            Templates, guides, checklists, and digital tools — built for Ugandan small businesses.
          </p>
        </div>
      </section>

      {/* Items */}
      <section style={{ background: '#f8f9fc', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {loading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'DM Sans', color: '#9ca3af' }}>
              Tools and templates coming soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  background: 'white', borderRadius: 16, padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(26,39,68,0.06)', border: '1px solid rgba(26,39,68,0.06)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'rgba(245,166,35,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
                    }}>
                      {TYPE_ICONS[item.type] ?? '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'DM Sans', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize', marginBottom: 4 }}>
                        {item.type}
                      </div>
                      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#1A2744' }}>
                        {item.title}
                      </h3>
                    </div>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.875rem', color: '#F5A623', flexShrink: 0 }}>
                      {formatUGX(item.price)}
                    </span>
                  </div>

                  <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B7A8D', lineHeight: 1.6, flex: 1 }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                    {item.previewUrl && (
                      <a
                        href={item.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '0.6rem',
                          fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#374151', textDecoration: 'none',
                        }}
                      >
                        <Eye size={14} /> Preview
                      </a>
                    )}
                    {item.fileUrl && item.price === 0 ? (
                      <a
                        href={item.fileUrl}
                        download
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          background: '#F5A623', borderRadius: 8, padding: '0.6rem',
                          fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: '#1A2744', textDecoration: 'none',
                        }}
                      >
                        <Download size={14} /> Download Free
                      </a>
                    ) : item.price > 0 ? (
                      <button
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          background: '#F5A623', border: 'none', borderRadius: 8, padding: '0.6rem',
                          fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: '#1A2744', cursor: 'pointer',
                        }}
                      >
                        💳 Buy — {formatUGX(item.price)}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
