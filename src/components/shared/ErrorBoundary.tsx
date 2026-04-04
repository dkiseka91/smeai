import React from 'react'

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error)
    return { hasError: true, message }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('AElevate ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const isFirebaseConfig = this.state.message.toLowerCase().includes('api-key') ||
      this.state.message.toLowerCase().includes('apikey') ||
      this.state.message.toLowerCase().includes('firebase') ||
      this.state.message.toLowerCase().includes('invalid app')

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1A2744', padding: '2rem',
      }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '2.5rem', maxWidth: 520, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', border: '2.5px solid #F5A623',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5A623' }}>V</span>
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#1A2744' }}>AElevate</span>
          </div>

          {isFirebaseConfig ? (
            <>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.25rem', color: '#1A2744', marginBottom: 12 }}>
                Firebase Setup Required
              </h2>
              <p style={{ fontFamily: 'DM Sans', color: '#6B7A8D', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.9rem' }}>
                Firebase is not configured. Create a <code style={{ background: '#f3f4f6', padding: '0.1rem 0.4rem', borderRadius: 4 }}>.env</code> file
                in the project root with your Firebase credentials:
              </p>
              <pre style={{
                background: '#f8f9fc', border: '1px solid #e5e7eb', borderRadius: 10,
                padding: '1rem', fontFamily: 'monospace', fontSize: '0.78rem',
                color: '#374151', overflowX: 'auto', lineHeight: 1.7,
              }}>{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_ADMIN_EMAILS=your@email.com`}</pre>
              <p style={{ fontFamily: 'DM Sans', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1rem' }}>
                Get these values from Firebase Console → Project Settings → Your apps
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.25rem', color: '#dc2626', marginBottom: 12 }}>
                Something went wrong
              </h2>
              <p style={{ fontFamily: 'DM Sans', color: '#6B7A8D', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '1rem' }}>
                The application encountered an unexpected error.
              </p>
              <pre style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
                padding: '1rem', fontFamily: 'monospace', fontSize: '0.78rem',
                color: '#dc2626', overflowX: 'auto', whiteSpace: 'pre-wrap',
              }}>
                {this.state.message}
              </pre>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '1.25rem', background: '#F5A623', border: 'none', borderRadius: 8,
                  padding: '0.65rem 1.5rem', fontFamily: 'Syne', fontWeight: 700,
                  fontSize: '0.875rem', color: '#1A2744', cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
            </>
          )}
        </div>
      </div>
    )
  }
}
