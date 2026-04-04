const ADVISORY_SERVICES = [
  { title: 'Business Diagnosis', desc: 'We analyse your current business model, financials, and operations to identify growth blockers and quick wins.', icon: '🔍' },
  { title: 'Strategic Planning', desc: 'Develop a practical 90-day or annual growth plan tailored to Uganda\'s market realities.', icon: '🗺️' },
  { title: 'Financial Advisory', desc: 'Budgeting, cash flow management, investment readiness, and access to finance coaching.', icon: '💰' },
  { title: 'Marketing & Digital', desc: 'Uganda-specific marketing strategies: WhatsApp marketing, local partnerships and community outreach.', icon: '📣' },
  { title: 'Legal & Compliance', desc: 'Business registration, tax compliance (URA), and regulatory guidance for Ugandan SMEs.', icon: '⚖️' },
  { title: 'Investor Readiness', desc: 'Pitch deck preparation, financial modelling, and connecting you with relevant funding sources.', icon: '🚀' },
]

export function Advisory() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1A2744,#243660)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 16 }}>
            Expert Business <span style={{ color: '#F5A623' }}>Advisory</span>
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 580, lineHeight: 1.7 }}>
            One-on-one guidance from experienced advisors who understand Uganda's business landscape.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section style={{ background: '#f8f9fc', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#1A2744', marginBottom: '2.5rem', textAlign: 'center' }}>
            Our Advisory Services
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {ADVISORY_SERVICES.map(svc => (
              <div key={svc.title} style={{
                background: 'white', borderRadius: 16, padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(26,39,68,0.06)', border: '1px solid rgba(26,39,68,0.06)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{svc.icon}</div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem', color: '#1A2744', marginBottom: 8 }}>
                  {svc.title}
                </h3>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B7A8D', lineHeight: 1.6 }}>
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section style={{ background: '#1A2744', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', color: 'white', marginBottom: 12 }}>
            Book Your Advisory Session
          </h2>
          <p style={{ fontFamily: 'DM Sans', color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Start with a free 15-minute discovery call. We'll match you with the right advisor for your business.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            <a
              href="https://wa.me/256786259854?text=Hi%2C%20I%27d%20like%20to%20book%20an%20advisory%20session"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#25D366', borderRadius: 10, padding: '0.875rem 1.75rem',
                fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: 'white', textDecoration: 'none',
              }}
            >
              💬 Book on WhatsApp
            </a>
            <a
              href="mailto:elevatebusinesssolutions96@gmail.com?subject=Advisory%20Session%20Booking"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10, padding: '0.875rem 1.75rem',
                fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: 'white', textDecoration: 'none',
              }}
            >
              ✉ Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
