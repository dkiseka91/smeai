import { useProgrammes } from '@/hooks/useFirestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

function formatUGX(amount: number) {
  return amount === 0 ? 'Free' : `UGX ${amount.toLocaleString()}`
}

const WHATSAPP_ENROL = (title: string) =>
  `https://wa.me/256786259854?text=Hi%20AElevate%2C%20I%27d%20like%20to%20enrol%20in%20the%20%22${encodeURIComponent(title)}%22%20programme`

export function Training() {
  const { programmes, loading } = useProgrammes()

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1A2744,#243660)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 16 }}>
            Training <span style={{ color: '#F5A623' }}>Academy</span>
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 580, lineHeight: 1.7 }}>
            Practical, Uganda-focused business training for entrepreneurs at every stage. Individual, group, and corporate programmes available.
          </p>
        </div>
      </section>

      {/* Programmes */}
      <section style={{ background: '#f8f9fc', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {loading ? (
            <LoadingSpinner />
          ) : programmes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontFamily: 'DM Sans' }}>
              No programmes listed yet. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {programmes.map(prog => (
                <div key={prog.id} style={{
                  background: 'white', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(26,39,68,0.06)', border: '1px solid rgba(26,39,68,0.06)',
                }}>
                  {prog.imageUrl && (
                    <img src={prog.imageUrl} alt={prog.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{
                        background: 'rgba(245,166,35,0.12)', color: '#F5A623',
                        borderRadius: 100, padding: '0.25rem 0.75rem',
                        fontFamily: 'DM Sans', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {prog.category}
                      </span>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#1A2744', fontSize: '0.9rem' }}>
                        {formatUGX(prog.price)}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#1A2744', marginBottom: 8 }}>
                      {prog.title}
                    </h3>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B7A8D', lineHeight: 1.6, marginBottom: 12 }}>
                      {prog.description}
                    </p>
                    <div style={{ fontFamily: 'DM Sans', fontSize: '0.8rem', color: '#9ca3af', marginBottom: 16 }}>
                      Duration: {prog.duration}
                    </div>
                    {prog.topics.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {prog.topics.map(t => (
                          <span key={t} style={{
                            background: '#f3f4f6', borderRadius: 100,
                            padding: '0.2rem 0.6rem', fontFamily: 'DM Sans', fontSize: '0.75rem', color: '#374151',
                          }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <a
                      href={WHATSAPP_ENROL(prog.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block', textAlign: 'center', background: '#F5A623',
                        borderRadius: 10, padding: '0.75rem', fontFamily: 'Syne', fontWeight: 700,
                        fontSize: '0.9rem', color: '#1A2744', textDecoration: 'none',
                      }}
                    >
                      Enrol Now →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Group training CTA */}
      <section style={{ background: '#1A2744', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', color: 'white', marginBottom: 12 }}>
            Group & Corporate Training
          </h2>
          <p style={{ fontFamily: 'DM Sans', color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            We deliver customised training to teams across Uganda. On-site or online. Contact us to discuss your needs.
          </p>
          <a
            href="https://wa.me/256786259854?text=Hi%20AElevate%2C%20I%27m%20interested%20in%20corporate%20training"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#25D366', borderRadius: 10, padding: '0.875rem 1.75rem',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: 'white', textDecoration: 'none',
            }}
          >
            💬 Enquire on WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
