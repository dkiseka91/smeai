import { useEffect, useState } from 'react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/lib/firebase'
import { createDoc } from '@/lib/firebase'
import {
  seedArticles, seedOpportunities, seedProducts,
  seedProgrammes, seedToolbox
} from '@/data/index'

const STAT_COLLECTIONS = [
  { label: 'Articles', key: COLLECTIONS.ARTICLES },
  { label: 'Opportunities', key: COLLECTIONS.OPPORTUNITIES },
  { label: 'Products', key: COLLECTIONS.PRODUCTS },
  { label: 'Programmes', key: COLLECTIONS.PROGRAMMES },
  { label: 'Toolbox Items', key: COLLECTIONS.TOOLBOX },
  { label: 'Orders', key: COLLECTIONS.ORDERS },
]

export function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)

  useEffect(() => {
    async function loadCounts() {
      const results = await Promise.all(
        STAT_COLLECTIONS.map(async ({ key }) => {
          const snap = await getCountFromServer(collection(db, key))
          return [key, snap.data().count] as [string, number]
        })
      )
      setCounts(Object.fromEntries(results))
    }
    loadCounts()
  }, [seedDone])

  async function handleSeed() {
    if (!confirm('This will add seed data to Firestore. Proceed?')) return
    setSeeding(true)
    try {
      await Promise.all([
        ...seedArticles.map(d => createDoc(COLLECTIONS.ARTICLES, d)),
        ...seedOpportunities.map(d => createDoc(COLLECTIONS.OPPORTUNITIES, d)),
        ...seedProducts.map(d => createDoc(COLLECTIONS.PRODUCTS, d)),
        ...seedProgrammes.map(d => createDoc(COLLECTIONS.PROGRAMMES, d)),
        ...seedToolbox.map(d => createDoc(COLLECTIONS.TOOLBOX, d)),
      ])
      setSeedDone(true)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#1A2744', marginBottom: '2rem' }}>
        Dashboard
      </h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: '2.5rem' }}>
        {STAT_COLLECTIONS.map(({ label, key }) => (
          <div key={key} style={{
            background: 'white', borderRadius: 14, padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(26,39,68,0.06)', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#F5A623' }}>
              {counts[key] ?? '—'}
            </div>
            <div style={{ fontFamily: 'DM Sans', fontSize: '0.8rem', color: '#6B7A8D', marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Seed */}
      <div style={{ background: 'white', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 8px rgba(26,39,68,0.06)', maxWidth: 520 }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#1A2744', marginBottom: 8 }}>
          Seed Database
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B7A8D', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Populate Firestore with sample data from <code style={{ background: '#f3f4f6', padding: '0.1rem 0.4rem', borderRadius: 4 }}>src/data/index.ts</code>. Safe to run multiple times — each call adds new documents.
        </p>
        {seedDone && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#16a34a' }}>
            ✓ Seed data added successfully.
          </div>
        )}
        <button
          onClick={handleSeed}
          disabled={seeding}
          style={{
            background: seeding ? '#9ca3af' : '#1A2744', border: 'none', borderRadius: 8,
            padding: '0.7rem 1.5rem', fontFamily: 'Syne', fontWeight: 700,
            fontSize: '0.875rem', color: 'white', cursor: seeding ? 'not-allowed' : 'pointer',
          }}
        >
          {seeding ? 'Seeding…' : '➕ Seed Database'}
        </button>
      </div>
    </div>
  )
}
