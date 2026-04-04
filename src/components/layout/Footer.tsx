import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  {
    title: 'Services',
    links: [
      ['Training Academy', '/training'],
      ['Advisory Services', '/advisory'],
      ['Opportunity Portal', '/opportunities'],
      ['Entrepreneur\'s Toolbox', '/toolbox'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Us', '/about'],
      ['Shop Impact', '/shop'],
      ['Knowledge Base', '/knowledge'],
      ['Contact', '/about#contact'],
    ],
  },
]

export function Footer() {
  return (
    <footer style={{ background: '#0D1832', paddingTop: '4rem', paddingBottom: '1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40,
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #F5A623',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5A623' }}>V</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: 'white' }}>AElevate</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: '0.6rem', color: '#F5A623', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  BUSINESS INNOVATIONS
                </div>
              </div>
            </div>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 16 }}>
              Uganda's Small Business Success Hub for Ugandan Entrepreneurs
            </p>
            <div style={{ fontFamily: 'DM Sans', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
              <div>📍 Naalya, Uganda</div>
              <div style={{ marginTop: 4 }}>📞 +256 786 259854</div>
              <div style={{ marginTop: 4 }}>✉ elevatebusinesssolutions96@gmail.com</div>
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map(section => (
            <div key={section.title}>
              <h5 style={{
                fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem',
                color: '#F5A623', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {section.title}
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.links.map(([label, path]) => (
                  <li key={label} style={{ marginBottom: 10 }}>
                    <Link
                      to={path}
                      style={{
                        fontFamily: 'DM Sans', fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#F5A623')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Integrations */}
          <div>
            <h5 style={{
              fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem',
              color: '#F5A623', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Integrations
            </h5>
            {[
              '🔥 Firebase — Auth & Database',
              '💳 Pesapal — Mobile Money & Cards',
              '💬 WhatsApp — Booking & Support',
            ].map(item => (
              <div key={item} style={{
                fontFamily: 'DM Sans', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)',
                padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8,
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontFamily: 'DM Sans', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
            © 2025 AElevate Business Innovations. All rights reserved. · Naalya, Uganda
          </div>
          <div style={{ fontFamily: 'DM Sans', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
            Powered by Firebase & Pesapal · Built with ❤ for Ugandan Entrepreneurs
          </div>
        </div>
      </div>
    </footer>
  )
}
