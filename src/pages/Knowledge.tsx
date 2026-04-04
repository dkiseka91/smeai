import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArticles } from '@/hooks/useFirestore'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { AuthModal } from '@/components/shared/AuthModal'
import { Lock } from 'lucide-react'

export function Knowledge() {
  const { articles, loading } = useArticles()
  const { user, isPremium } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const navigate = useNavigate()

  const featured = articles.filter(a => a.featured)
  const regular = articles.filter(a => !a.featured)

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1A2744,#243660)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 16 }}>
            Uganda Business <span style={{ color: '#F5A623' }}>Intelligence</span>
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 580, lineHeight: 1.7 }}>
            Practical, Uganda-specific business knowledge, guides, and market intelligence.
          </p>
        </div>
      </section>

      {/* Subscription banner for non-premium */}
      {!isPremium && (
        <div style={{ background: '#F5A623', padding: '1rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, color: '#1A2744' }}>
              🔒 Some articles are member-only. Subscribe for full access.
            </div>
            <button
              onClick={() => navigate('/subscribe')}
              style={{
                background: '#1A2744', border: 'none', borderRadius: 8,
                padding: '0.5rem 1.25rem', fontFamily: 'Syne', fontWeight: 700,
                fontSize: '0.875rem', color: 'white', cursor: 'pointer',
              }}
            >
              Subscribe for Full Access
            </button>
          </div>
        </div>
      )}

      {/* Articles */}
      <section style={{ background: '#f8f9fc', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {loading ? (
            <LoadingSpinner />
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'DM Sans', color: '#9ca3af' }}>
              Articles coming soon!
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.25rem', color: '#1A2744', marginBottom: '1.5rem' }}>
                    ⭐ Featured Articles
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: '3rem' }}>
                    {featured.map(a => <ArticleCard key={a.id} article={a} isPremium={isPremium} onLockClick={() => !user ? setAuthOpen(true) : navigate('/subscribe')} />)}
                  </div>
                </>
              )}
              {regular.length > 0 && (
                <>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.25rem', color: '#1A2744', marginBottom: '1.5rem' }}>
                    All Articles
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {regular.map(a => <ArticleCard key={a.id} article={a} isPremium={isPremium} onLockClick={() => !user ? setAuthOpen(true) : navigate('/subscribe')} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}

function ArticleCard({ article, isPremium, onLockClick }: {
  article: import('@/types').Article
  isPremium: boolean
  onLockClick: () => void
}) {
  const isLocked = !isPremium

  return (
    <div style={{
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(26,39,68,0.06)', border: '1px solid rgba(26,39,68,0.06)',
    }}>
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
      )}
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{
            background: 'rgba(245,166,35,0.12)', color: '#F5A623',
            borderRadius: 100, padding: '0.2rem 0.65rem',
            fontFamily: 'DM Sans', fontSize: '0.75rem', fontWeight: 600,
          }}>
            {article.category}
          </span>
          {article.featured && <span style={{ fontSize: '0.75rem', color: '#F5A623' }}>⭐</span>}
        </div>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#1A2744', marginBottom: 8 }}>
          {article.title}
        </h3>
        <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B7A8D', lineHeight: 1.6, marginBottom: 16 }}>
          {article.excerpt}
        </p>
        {isLocked ? (
          <button
            onClick={onLockClick}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.65rem',
              fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.85rem', color: '#374151', cursor: 'pointer',
            }}
          >
            <Lock size={14} /> Full article — members only
          </button>
        ) : (
          <button style={{
            width: '100%', background: '#F5A623', border: 'none', borderRadius: 8, padding: '0.65rem',
            fontFamily: 'Syne', fontWeight: 700, fontSize: '0.875rem', color: '#1A2744', cursor: 'pointer',
          }}>
            Read Article →
          </button>
        )}
      </div>
    </div>
  )
}
