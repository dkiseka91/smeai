import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const bg = type === 'error' ? '#dc2626' : type === 'info' ? '#1A2744' : '#16a34a'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        background: bg,
        color: 'white',
        padding: '0.875rem 1.25rem',
        borderRadius: 12,
        fontFamily: 'DM Sans',
        fontSize: '0.9rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        maxWidth: 360,
        animation: 'fadeUp 0.2s ease',
      }}
    >
      {message}
    </div>
  )
}
