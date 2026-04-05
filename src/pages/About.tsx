import { useEffect } from 'react'

export function About() {
  useEffect(() => {
    if (window.location.href.includes('contact')) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#1A2744', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 16 }}>
            About <span style={{ color: '#F5A623' }}>AElevate</span>
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 640, lineHeight: 1.7 }}>
            We exist to bridge the gap between Uganda's small business potential and the resources, knowledge, and networks needed to realise it.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: 'white', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          {[
            { title: 'Our Mission', body: 'To empower Ugandan entrepreneurs with practical tools, knowledge, and connections that drive sustainable business growth and community transformation.' },
            { title: 'Our Vision', body: 'A Uganda where every small business owner has equal access to the resources, mentorship, and opportunities needed to build a thriving enterprise.' },
            { title: 'Our Values', body: 'Integrity. Practicality. Community. We deliver real-world solutions, built for Uganda, by people who understand Uganda\'s business landscape.' },
          ].map(item => (
            <div key={item.title} style={{
              background: '#f8f9fc', borderRadius: 16, padding: '2rem',
              borderTop: '4px solid #F5A623',
            }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.25rem', color: '#1A2744', marginBottom: 12 }}>
                {item.title}
              </h3>
              <p style={{ fontFamily: 'DM Sans', color: '#6B7A8D', lineHeight: 1.7 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background: '#f8f9fc', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#1A2744', marginBottom: '2.5rem', textAlign: 'center' }}>
            Our Team
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24,
          }}>
            {/* Team members will be loaded from Firestore; placeholder shown during setup */}
            {[
              { name: 'Team Member', role: 'CEO & Founder', bio: 'Add team members via the Admin Panel.' },
            ].map(member => (
              <div key={member.name} style={{
                background: 'white', borderRadius: 16, padding: '1.5rem', textAlign: 'center',
                boxShadow: '0 2px 12px rgba(26,39,68,0.06)',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: '#e5e7eb',
                  margin: '0 auto 1rem', border: '3px solid #F5A623',
                }} />
                <h4 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#1A2744', marginBottom: 4 }}>{member.name}</h4>
                <div style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#F5A623', fontWeight: 600, marginBottom: 10 }}>{member.role}</div>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#6B7A8D', lineHeight: 1.6 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ background: '#1A2744', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'white', marginBottom: 12 }}>Get In Touch</h2>
          <p style={{ fontFamily: 'DM Sans', color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Based in Naalya, Uganda. Reach us via WhatsApp, phone, or email.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            <a href="https://wa.me/256786259854" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25D366', borderRadius: 10, padding: '0.75rem 1.5rem', color: 'white', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem' }}>
              💬 WhatsApp Us
            </a>
            <a href="mailto:elevatebusinesssolutions96@gmail.com"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.75rem 1.5rem', color: 'white', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem' }}>
              ✉ Email Us
            </a>
          </div>
          <div style={{ marginTop: '2rem', fontFamily: 'DM Sans', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }}>
            📍 Naalya, Uganda · 📞 +256 786 259854
          </div>
        </div>
      </section>
    </div>
  )
}
