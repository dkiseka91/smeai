export function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  const content = (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid #F5A623', borderTopColor: 'transparent',
        margin: '0 auto 16px',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ fontFamily: 'Syne', fontWeight: 700, color: '#F5A623' }}>Loading AElevate…</div>
    </div>
  )

  if (!fullPage) return content

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#1A2744',
    }}>
      {content}
    </div>
  )
}
