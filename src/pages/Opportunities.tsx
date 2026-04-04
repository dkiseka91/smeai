import { useState } from 'react'
import { useOpportunities } from '@/hooks/useFirestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Search } from 'lucide-react'
import type { Opportunity } from '@/types'

const CATEGORIES: { value: Opportunity['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'grant', label: 'Grants' },
  { value: 'scholarship', label: 'Scholarships' },
  { value: 'exhibition', label: 'Exhibitions' },
  { value: 'competition', label: 'Competitions' },
]

const CATEGORY_COLORS: Record<string, string> = {
  grant: '#16a34a',
  scholarship: '#2563eb',
  exhibition: '#9333ea',
  competition: '#F5A623',
}

export function Opportunities() {
  const { opportunities, loading } = useOpportunities()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | Opportunity['category']>('all')

  const filtered = opportunities.filter(o => {
    const matchesCat = category === 'all' || o.category === category
    const matchesSearch = search === '' ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.organisation.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1A2744,#243660)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 16 }}>
            Opportunity <span style={{ color: '#F5A623' }}>Portal</span>
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 580, lineHeight: 1.7 }}>
            Grants, scholarships & exhibitions curated for Ugandan entrepreneurs. Never miss a funding opportunity.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section style={{ background: 'white', padding: '1.5rem', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 64, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search opportunities…"
              style={{
                width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem',
                borderRadius: 10, border: '1.5px solid #e5e7eb',
                fontFamily: 'DM Sans', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value as typeof category)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 100,
                  border: category === cat.value ? '2px solid #F5A623' : '1.5px solid #e5e7eb',
                  background: category === cat.value ? 'rgba(245,166,35,0.1)' : 'white',
                  color: category === cat.value ? '#F5A623' : '#374151',
                  fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section style={{ background: '#f8f9fc', padding: '2.5rem 1.5rem', minHeight: '50vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'DM Sans', color: '#9ca3af' }}>
              {opportunities.length === 0
                ? 'No opportunities listed yet. Check back soon!'
                : 'No opportunities match your search. Try different keywords.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filtered.map(opp => (
                <div key={opp.id} style={{
                  background: 'white', borderRadius: 16, padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(26,39,68,0.06)', border: '1px solid rgba(26,39,68,0.06)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{
                      background: `${CATEGORY_COLORS[opp.category]}18`,
                      color: CATEGORY_COLORS[opp.category],
                      borderRadius: 100, padding: '0.25rem 0.75rem',
                      fontFamily: 'DM Sans', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                    }}>
                      {opp.category}
                    </span>
                    {opp.featured && (
                      <span style={{ fontFamily: 'DM Sans', fontSize: '0.75rem', color: '#F5A623', fontWeight: 600 }}>⭐ Featured</span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#1A2744', marginBottom: 6 }}>
                    {opp.title}
                  </h3>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '0.8rem', color: '#6B7A8D', marginBottom: 8, fontWeight: 600 }}>
                    {opp.organisation}
                  </div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#6B7A8D', lineHeight: 1.6, flex: 1 }}>
                    {opp.description}
                  </p>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'DM Sans', fontSize: '0.78rem', color: '#9ca3af' }}>
                      Deadline: {opp.deadline}
                    </div>
                    <a
                      href={opp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#F5A623', borderRadius: 8, padding: '0.5rem 1rem',
                        fontFamily: 'Syne', fontWeight: 700, fontSize: '0.8rem', color: '#1A2744', textDecoration: 'none',
                      }}
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Premium alerts CTA */}
      <section style={{ background: '#1A2744', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: 12 }}>
            🔔 Never Miss an Opportunity
          </h2>
          <p style={{ fontFamily: 'DM Sans', color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Subscribe to AElevate Premium and get instant alerts for new grants, scholarships, and exhibitions matched to your business.
          </p>
          <a
            href="/knowledge#subscribe"
            style={{
              display: 'inline-block', background: '#F5A623', borderRadius: 10,
              padding: '0.875rem 1.75rem', fontFamily: 'Syne', fontWeight: 700,
              fontSize: '0.95rem', color: '#1A2744', textDecoration: 'none',
            }}
          >
            Subscribe for Premium Alerts
          </a>
        </div>
      </section>
    </div>
  )
}
