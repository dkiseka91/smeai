import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
}

interface AuthModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, displayName)
      }
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(AUTH_ERRORS[code] ?? 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(13,24,50,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20, width: '100%', maxWidth: 440,
          overflow: 'hidden', boxShadow: '0 24px 64px rgba(13,24,50,0.35)',
          animation: 'fadeUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1A2744,#243660)', padding: '2rem 2rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #F5A623',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5A623' }}>V</span>
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: 'white' }}>AElevate</span>
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
            {mode === 'login' ? 'Sign in to access your AElevate account' : 'Join Uganda\'s Small Business Hub'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem' }}>
          {mode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600, color: '#1A2744', display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                  border: '1.5px solid #e5e7eb', fontFamily: 'DM Sans', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
                placeholder="Your full name"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600, color: '#1A2744', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontFamily: 'DM Sans', fontSize: '0.9rem',
                outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600, color: '#1A2744', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontFamily: 'DM Sans', fontSize: '0.9rem',
                outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '0.75rem 1rem', marginBottom: '1rem',
              fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: 10,
              background: loading ? '#9ca3af' : '#F5A623', border: 'none',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#1A2744',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#1A2744',
                textDecoration: 'underline',
              }}
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
