import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingCart, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/shared/AuthModal'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Training', path: '/training' },
  { label: 'Advisory', path: '/advisory' },
  { label: 'Opportunities', path: '/opportunities' },
  { label: 'Shop', path: '/shop' },
  { label: 'Toolbox', path: '/toolbox' },
  { label: 'Knowledge', path: '/knowledge' },
  { label: 'About', path: '/about' },
]

interface HeaderProps {
  cartCount?: number
  onCartOpen?: () => void
}

export function Header({ cartCount = 0, onCartOpen }: HeaderProps) {
  const { user, isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,24,50,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 'auto' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #F5A623',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5A623', fontSize: '1rem' }}>V</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, color: 'white', fontSize: '1rem', lineHeight: 1 }}>AElevate</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: '0.55rem', color: '#F5A623', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                BUSINESS INNOVATIONS
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: '1rem' }} className="hidden-mobile">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 500,
                  color: location.pathname === link.path ? '#F5A623' : 'rgba(255,255,255,0.75)',
                  textDecoration: 'none', padding: '0.4rem 0.75rem', borderRadius: 8,
                  transition: 'color 0.2s',
                  borderBottom: location.pathname === link.path ? '2px solid #F5A623' : '2px solid transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Cart */}
            <button
              onClick={onCartOpen}
              style={{
                position: 'relative', background: 'none', border: 'none',
                cursor: 'pointer', color: 'rgba(255,255,255,0.75)', padding: '0.4rem',
              }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#F5A623', color: '#1A2744',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'white',
                  }}
                >
                  <User size={16} />
                  <span style={{ fontFamily: 'DM Sans', fontSize: '0.85rem' }}>{user.email?.split('@')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    minWidth: 180, overflow: 'hidden', zIndex: 200,
                  }}>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '0.75rem 1rem', fontFamily: 'DM Sans', fontSize: '0.875rem',
                          color: '#1A2744', textDecoration: 'none',
                        }}
                      >
                        <Settings size={16} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '0.75rem 1rem', background: 'none', border: 'none',
                        cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#dc2626',
                        borderTop: isAdmin ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                style={{
                  background: '#F5A623', border: 'none', borderRadius: 8,
                  padding: '0.5rem 1rem', fontFamily: 'Syne', fontWeight: 700,
                  fontSize: '0.85rem', color: '#1A2744', cursor: 'pointer',
                }}
              >
                Log In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="show-mobile"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '0.4rem' }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div style={{
            background: '#0D1832', borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '1rem 1.5rem',
          }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block', fontFamily: 'DM Sans', fontSize: '1rem',
                  color: location.pathname === link.path ? '#F5A623' : 'rgba(255,255,255,0.8)',
                  textDecoration: 'none', padding: '0.65rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}
