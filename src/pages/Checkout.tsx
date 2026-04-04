import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { db, COLLECTIONS } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { initiatePesapalPayment } from '@/lib/pesapal'
import type { CartItem } from '@/types'

function formatUGX(n: number) {
  return `UGX ${n.toLocaleString()}`
}

interface CheckoutProps {
  items: CartItem[]
  total: number
  onSuccess: () => void
}

export function Checkout({ items, total }: CheckoutProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: user?.email ?? '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    navigate('/shop')
    return null
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const orderDoc = await addDoc(
        collection(db, COLLECTIONS.ORDERS),
        { userId: user?.uid ?? 'guest', userEmail: form.email, items, totalUGX: total, status: 'pending', createdAt: serverTimestamp() }
      )

      // Initiate Pesapal
      const pesapalRes = await initiatePesapalPayment({
        amount: total,
        currency: 'UGX',
        description: `AElevate Shop Order — ${items.length} item(s)`,
        callbackUrl: `${window.location.origin}/payment/callback`,
        billingEmail: form.email,
        billingPhone: form.phone,
        billingFirstName: form.firstName,
        billingLastName: form.lastName,
        reference: orderDoc.id,
      })

      // Redirect to Pesapal
      window.location.href = pesapalRes.redirectUrl
    } catch (err) {
      console.error(err)
      setError('Payment initiation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#1A2744', marginBottom: '2rem' }}>
          Checkout
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Billing form */}
          <div style={{ background: 'white', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(26,39,68,0.06)' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#1A2744', marginBottom: '1.25rem' }}>
              Your Details
            </h2>
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(['firstName', 'lastName', 'email', 'phone'] as const).map(field => (
                <div key={field}>
                  <label style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                    {field === 'firstName' ? 'First Name' : field === 'lastName' ? 'Last Name' : field === 'email' ? 'Email' : 'Phone (optional)'}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    required={field !== 'phone'}
                    style={{
                      width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
                      border: '1.5px solid #e5e7eb', fontFamily: 'DM Sans', fontSize: '0.9rem',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              {error && (
                <div style={{ background: '#fef2f2', borderRadius: 8, padding: '0.75rem', fontFamily: 'DM Sans', fontSize: '0.85rem', color: '#dc2626' }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.875rem', background: loading ? '#9ca3af' : '#F5A623',
                  border: 'none', borderRadius: 10, fontFamily: 'Syne', fontWeight: 700,
                  fontSize: '0.95rem', color: '#1A2744', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
                }}
              >
                {loading ? 'Redirecting to Pesapal…' : '💳 Pay Now via Pesapal'}
              </button>
              <div style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: '0.78rem', color: '#9ca3af' }}>
                Secure payment via Pesapal · Mobile Money & Cards accepted
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div style={{ background: 'white', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(26,39,68,0.06)' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#1A2744', marginBottom: '1.25rem' }}>
              Order Summary
            </h2>
            {items.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: '0.9rem', color: '#374151' }}>
                  {item.product.name} × {item.quantity}
                </span>
                <span style={{ fontFamily: 'DM Sans', fontSize: '0.9rem', fontWeight: 600, color: '#1A2744' }}>
                  {formatUGX(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#1A2744' }}>Total</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: '#F5A623' }}>
                {formatUGX(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
