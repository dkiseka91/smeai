import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Lightbulb, ShoppingBag, Target, Users, Wrench } from 'lucide-react'

const SERVICES = [
  { icon: BookOpen, title: 'Training Academy', desc: 'Practical business skills for Ugandan entrepreneurs', path: '/training' },
  { icon: Lightbulb, title: 'Expert Advisory', desc: 'One-on-one guidance from experienced business mentors', path: '/advisory' },
  { icon: Target, title: 'Opportunity Portal', desc: 'Grants, scholarships & exhibitions curated for you', path: '/opportunities' },
  { icon: ShoppingBag, title: 'Impact Shop', desc: 'Support Ugandan artisans & youth trainees', path: '/shop' },
  { icon: Wrench, title: "Entrepreneur's Toolbox", desc: 'Templates, guides & digital tools to run your business', path: '/toolbox' },
  { icon: Users, title: 'Knowledge Base', desc: 'Uganda-specific business intelligence & articles', path: '/knowledge' },
]

const STATS = [
  { value: '500+', label: 'Businesses Supported' },
  { value: '120+', label: 'Training Graduates' },
  { value: '45+', label: 'Opportunities Listed' },
  { value: '98%', label: 'Client Satisfaction' },
]

export function Home() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1A2744 0%, #243660 60%, #1A2744 100%)',
        padding: '5rem 1.5rem 4rem',
        position: 'relative', overflow: 'hidden',
        minHeight: '80vh', display: 'flex', alignItems: 'center',
      }}>
        {/* Decorative pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #F5A623 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: 720 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)',
              borderRadius: 100, padding: '0.4rem 1rem', marginBottom: '1.5rem',
            }}>
              <span style={{ fontFamily: 'DM Sans', fontSize: '0.8rem', color: '#F5A623' }}>
                Uganda's Small Business Success Hub
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Syne', fontWeight: 800,
              fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              color: 'white', lineHeight: 1.1, marginBottom: '1.5rem',
            }}>
              Elevate Your Business.{' '}
              <span style={{ color: '#F5A623' }}>Transform</span>{' '}
              Your Community.
            </h1>

            <p style={{
              fontFamily: 'DM Sans', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: '2.5rem',
              maxWidth: 580,
            }}>
              AElevate provides Ugandan small business owners with training, advisory services,
              funding opportunities, and the tools they need to grow and thrive.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                onClick={() => navigate('/training')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#F5A623', border: 'none', borderRadius: 10,
                  padding: '0.875rem 1.75rem', fontFamily: 'Syne', fontWeight: 700,
                  fontSize: '0.95rem', color: '#1A2744', cursor: 'pointer',
                }}
              >
                Explore Programmes <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/opportunities')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: 10, padding: '0.875rem 1.75rem',
                  fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem',
                  color: 'white', cursor: 'pointer',
                }}
              >
                Find Opportunities
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#F5A623', padding: '2rem 1.5rem' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16,
        }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#1A2744' }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: 'rgba(26,39,68,0.75)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section style={{ background: '#f8f9fc', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#1A2744' }}>
              Everything You Need to Grow
            </h2>
            <p style={{ fontFamily: 'DM Sans', color: '#6B7A8D', marginTop: 12, fontSize: '1.05rem' }}>
              One platform for Uganda's small business owners
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {SERVICES.map(({ icon: Icon, title, desc, path }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                onClick={() => navigate(path)}
                style={{
                  background: 'white', borderRadius: 16, padding: '1.75rem',
                  boxShadow: '0 2px 12px rgba(26,39,68,0.06)',
                  border: '1px solid rgba(26,39,68,0.06)', cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(26,39,68,0.12)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(26,39,68,0.06)')}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(245,166,35,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <Icon size={24} color="#F5A623" />
                </div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem', color: '#1A2744', marginBottom: 8 }}>
                  {title}
                </h3>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B7A8D', lineHeight: 1.6 }}>
                  {desc}
                </p>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#F5A623' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600 }}>Learn more</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1A2744', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', marginBottom: 16 }}>
            Not sure which service you need?
          </h2>
          <p style={{ fontFamily: 'DM Sans', color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            WhatsApp us for a free 15-minute discovery call. We'll match you with the right support for your business stage.
          </p>
          <a
            href="https://wa.me/256786259854?text=Hi%20AElevate%2C%20I%27d%20like%20a%20free%20discovery%20call"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#25D366', border: 'none', borderRadius: 10,
              padding: '0.875rem 1.75rem', fontFamily: 'Syne', fontWeight: 700,
              fontSize: '0.95rem', color: 'white', textDecoration: 'none',
            }}
          >
            💬 WhatsApp Us Now
          </a>
        </div>
      </section>
    </div>
  )
}
