import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { initiatePesapalPayment } from '@/lib/pesapal'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/lib/firebase'
import { AuthModal } from '@/components/shared/AuthModal'
import { Check } from 'lucide-react'

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    priceUGX: 25000,
    period: '/month',
    features: ['Full Knowledge Base access', 'Premium Opportunity Alerts', 'Member-only resources', 'Priority WhatsApp support'],
  },
  {
    id: 'annual',
    label: 'Annual',
    priceUGX: 240000,
    period: '/year',
    badge: 'Save 20%',
    features: ['Everything in Monthly', '2 free advisory sessions', 'Exclusive training discounts', 'Business directory listing'],
  },
]

export function Subscribe() {
  const { user } = useAuth()
  const [selected, setSelected] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authOpen, setAuthOpen] = useState(false)

  async function handleSubscribe() {
    if (!user) { setAuthOpen(true); return }
    setLoading(true)
    setError('')
    try {
      const plan = PLANS.find(p => p.id === selected)!
      const subRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        userId: user.uid,
        userEmail: user.email,
        type: 'subscription',
        plan: selected,
        totalUGX: plan.priceUGX,
        status: 'pending',
        createdAt: serverTimestamp(),
      })

      const months = selected === 'annual' ? 12 : 1
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + months)

      const pesapalRes = await initiatePesapalPayment({
        amount: plan.priceUGX,
        currency: 'UGX',
        description: `AElevate ${plan.label} Membership`,
        callbackUrl: `${window.location.origin}/payment/callback?type=subscription&plan=${selected}`,
        billingEmail: user.email ?? '',
        billingFirstName: user.displayName?.split(' ')[0] ?? 'Member',
        billingLastName: user.displayName?.split(' ')[1] ?? '',
        reference: subRef.id,
      })

      window.location.href = pesapalRes.redirectUrl
    } catch (err) {
      console.error(err)
      setError('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#1A2744', marginBottom: 12 }}>
            AElevate Premium
          </h1>
          <p style={{ fontFamily: 'DM Sans', color: '#6B7A8D', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Unlock full access to Uganda's most comprehensive small business resource hub.
          </p>
        </div>

        {/* Plan selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: '2.5rem' }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id as 'monthly' | 'annual')}
              style={{
                background: 'white', borderRadius: 20, padding: '2rem',
                border: selected === plan.id ? '2px solid #F5A623' : '2px solid #e5e7eb',
                cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s',
                boxShadow: selected === plan.id ? '0 8px 32px rgba(245,166,35,0.12)' : '0 2px 12px rgba(26,39,68,0.06)',
              }}
            >
              {plan.badge && (
                <span style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#F5A623', color: '#1A2744', borderRadius: 100,
                  padding: '0.2rem 0.875rem', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.78rem',
                }}>
                  {plan.badge}
                </span>
              )}
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.25rem', color: '#1A2744', marginBottom: 8 }}>
                {plan.label}
              </h3>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', color: '#F5A623' }}>
                  UGX {plan.priceUGX.toLocaleString()}
                </span>
                <span style={{ fontFamily: 'DM Sans', color: '#6B7A8D', fontSize: '0.875rem' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <Check size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#374151' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#dc2626', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#F5A623', border: 'none', borderRadius: 12,
              padding: '1rem 2.5rem', fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem',
              color: '#1A2744', cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Redirecting…' : `💳 Subscribe — ${PLANS.find(p => p.id === selected)?.label}`}
          </button>
          <div style={{ fontFamily: 'DM Sans', fontSize: '0.8rem', color: '#9ca3af', marginTop: 10 }}>
            Secure payment via Pesapal · Cancel anytime
          </div>
        </div>
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); handleSubscribe() }} />}
    </div>
  )
}
