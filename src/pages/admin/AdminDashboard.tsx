import { useEffect, useState } from 'react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db, COLLECTIONS, createDoc } from '@/lib/firebase'
import {
  seedArticles, seedOpportunities, seedProducts,
  seedProgrammes, seedToolbox
} from '@/data/index'

const STAT_COLLECTIONS = [
  { label: 'Articles',       key: COLLECTIONS.ARTICLES },
  { label: 'Opportunities',  key: COLLECTIONS.OPPORTUNITIES },
  { label: 'Products',       key: COLLECTIONS.PRODUCTS },
  { label: 'Programmes',     key: COLLECTIONS.PROGRAMMES },
  { label: 'Toolbox Items',  key: COLLECTIONS.TOOLBOX },
  { label: 'Orders',         key: COLLECTIONS.ORDERS },
]

export function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCounts() {
      try {
        const results = await Promise.all(
          STAT_COLLECTIONS.map(async ({ key }) => {
            const snap = await getCountFromServer(collection(db, key))
            return [key, snap.data().count] as [string, number]
          })
        )
        setCounts(Object.fromEntries(results))
      } catch (err) {
        console.error('Failed to load counts:', err)
      }
    }
    loadCounts()
  }, [seedDone])

  async function handleSeed() {
    if (!confirm('This will add seed data to Firestore. Proceed?')) return
    setSeeding(true)
    setSeedError(null)
    setSeedDone(false)
    try {
      await Promise.all([
        ...seedArticles.map(d => createDoc(COLLECTIONS.ARTICLES, d)),
        ...seedOpportunities.map(d => createDoc(COLLECTIONS.OPPORTUNITIES, d)),
        ...seedProducts.map(d => createDoc(COLLECTIONS.PRODUCTS, d)),
        ...seedProgrammes.map(d => createDoc(COLLECTIONS.PROGRAMMES, d)),
        ...seedToolbox.map(d => createDoc(COLLECTIONS.TOOLBOX, d)),
      ])
      setSeedDone(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.toLowerCase().includes('permission')) {
        setSeedError(
          'Permission denied. Your account has not been granted admin access in Firestore yet. ' +
          'See the "First-time Admin Setup" instructions below.'
        )
      } else {
        setSeedError(`Seed failed: ${msg}`)
      }
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
      <div style={{ background: 'white', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 8px rgba(26,39,68,0.06)', maxWidth: 560, marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#1A2744', marginBottom: 8 }}>
          Seed Database
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B7A8D', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Populate Firestore with starter content from <code style={{ background: '#f3f4f6', padding: '0.1rem 0.4rem', borderRadius: 4 }}>src/data/index.ts</code>.
          Requires admin access to be set up first (see below).
        </p>
        {seedDone && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#16a34a' }}>
            ✓ Seed data added successfully.
          </div>
        )}
        {seedError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#dc2626', lineHeight: 1.6 }}>
            ⚠ {seedError}
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

      {/* Admin setup instructions */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '1.75rem', maxWidth: 560 }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#92400e', marginBottom: 8 }}>
          ⚙ First-time Admin Setup
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.7, marginBottom: '1rem' }}>
          Before you can seed or manage content, you must add your account to the{' '}
          <code style={{ background: '#fef3c7', padding: '0.1rem 0.3rem', borderRadius: 3 }}>admins</code>{' '}
          Firestore collection. This is a one-time setup that takes ~2 minutes:
        </p>
        <ol style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#78350f', lineHeight: 2.1, paddingLeft: '1.25rem', margin: 0 }}>
          <li>
            <strong>Get your UID —</strong> open{' '}
            <a
              href="https://console.firebase.google.com/project/studio-6626017310-1eeea/authentication/users"
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#b45309', fontWeight: 600 }}
            >
              Firebase Console → Authentication → Users
            </a>
            , click your email row, and copy the <strong>User UID</strong> string
            (e.g. <code style={{ background: '#fef3c7', padding: '0.1rem 0.3rem', borderRadius: 3 }}>WxYz1234abcd…</code>)
          </li>
          <li>
            <strong>Open Firestore —</strong>{' '}
            <a
              href="https://console.firebase.google.com/project/studio-6626017310-1eeea/firestore/data"
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#b45309', fontWeight: 600 }}
            >
              Firebase Console → Firestore Database
            </a>
          </li>
          <li>
            <strong>Create the collection —</strong> click <strong>+ Start collection</strong>,
            set Collection ID to <code style={{ background: '#fef3c7', padding: '0.1rem 0.3rem', borderRadius: 3 }}>admins</code>, then click <strong>Next</strong>
          </li>
          <li>
            <strong>Add your document —</strong> in the Document ID field, <em>paste your UID from step 1</em>{' '}
            (do <em>not</em> click Auto-ID)
          </li>
          <li>
            <strong>Add a field —</strong> Field: <code style={{ background: '#fef3c7', padding: '0.1rem 0.3rem', borderRadius: 3 }}>grantedAt</code> ·
            Type: <strong>string</strong> · Value: today's date, e.g.{' '}
            <code style={{ background: '#fef3c7', padding: '0.1rem 0.3rem', borderRadius: 3 }}>2025-01-01</code>
          </li>
          <li>
            Click <strong>Save</strong>, then come back here and click <strong>Seed Database</strong> again
          </li>
        </ol>
        <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: '#fef3c7', borderRadius: 8, fontFamily: 'DM Sans', fontSize: '0.8rem', color: '#92400e' }}>
          <strong>admins collection already exists?</strong> Skip step 3. Instead, click into the{' '}
          <code style={{ background: '#fde68a', padding: '0.1rem 0.3rem', borderRadius: 3 }}>admins</code>{' '}
          collection → <strong>+ Add document</strong> → follow steps 4–6.
        </div>
      </div>
    </div>
  )
}
