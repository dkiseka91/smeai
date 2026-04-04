import { X, Trash2, Plus, Minus } from 'lucide-react'
import type { CartItem } from '@/types'

interface CartDrawerProps {
  items: CartItem[]
  total: number
  onClose: () => void
  onRemove: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
  onCheckout: () => void
}

function formatUGX(amount: number) {
  return `UGX ${amount.toLocaleString()}`
}

export function CartDrawer({ items, total, onClose, onRemove, onUpdateQty, onCheckout }: CartDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)' }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
        width: '100%', maxWidth: 400,
        background: 'white', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6',
        }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: '#1A2744' }}>
            Your Cart ({items.length})
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af', fontFamily: 'DM Sans' }}>
              Your cart is empty
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} style={{
                display: 'flex', gap: 12, paddingBottom: '1rem', marginBottom: '1rem',
                borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 10,
                  background: '#f3f4f6', flexShrink: 0, overflow: 'hidden',
                }}>
                  {item.product.imageUrl && (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.9rem', color: '#1A2744' }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#F5A623', fontWeight: 600 }}>
                    {formatUGX(item.product.price)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <button onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                      style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={12} />
                    </button>
                    <span style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                      style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => onRemove(item.product.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', marginLeft: 'auto' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 600, color: '#374151' }}>Total</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: '#1A2744' }}>
                {formatUGX(total)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              style={{
                width: '100%', padding: '0.875rem', background: '#F5A623',
                border: 'none', borderRadius: 10, fontFamily: 'Syne', fontWeight: 700,
                fontSize: '0.95rem', color: '#1A2744', cursor: 'pointer',
              }}
            >
              💳 Secure Checkout via Pesapal
            </button>
            <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'DM Sans', fontSize: '0.75rem', color: '#9ca3af' }}>
              Payments powered by Pesapal · Mobile Money & Cards accepted
            </div>
          </div>
        )}
      </div>
    </>
  )
}
