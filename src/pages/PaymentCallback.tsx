import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { checkPesapalStatus } from '@/lib/pesapal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

// This page only displays the result of a payment.
// All Firestore writes (order status, subscription upgrade) are handled
// exclusively by the IPN webhook in Cloud Functions, which uses the admin SDK.
export function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verify() {
      const orderTrackingId = searchParams.get('OrderTrackingId')
      const merchantRef = searchParams.get('OrderMerchantReference')
      const type = searchParams.get('type')

      if (!orderTrackingId || !merchantRef) {
        setStatus('failed')
        setMessage('Invalid payment response. Please contact support.')
        return
      }

      try {
        const result = await checkPesapalStatus(orderTrackingId)

        if (result.status === 'COMPLETED') {
          setStatus('success')
          setMessage(
            type === 'subscription'
              ? 'Your AElevate Premium membership is now active!'
              : 'Your order has been confirmed! You will receive a follow-up shortly.'
          )
        } else {
          setStatus('failed')
          setMessage('Payment was not completed. Please try again.')
        }
      } catch {
        setStatus('failed')
        setMessage('Could not verify payment. Please contact support if you were charged.')
      }
    }
    verify()
  }, [searchParams])

  if (status === 'checking') return <LoadingSpinner fullPage />

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(26,39,68,0.1)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          {status === 'success' ? '🎉' : '❌'}
        </div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', color: '#1A2744', marginBottom: 12 }}>
          {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        <p style={{ fontFamily: 'DM Sans', color: '#6B7A8D', lineHeight: 1.7, marginBottom: '2rem' }}>
          {message}
        </p>
        <button
          onClick={() => navigate(status === 'success' ? '/' : '/shop')}
          style={{
            background: '#F5A623', border: 'none', borderRadius: 10,
            padding: '0.875rem 2rem', fontFamily: 'Syne', fontWeight: 700,
            fontSize: '0.95rem', color: '#1A2744', cursor: 'pointer',
          }}
        >
          {status === 'success' ? 'Back to Home' : 'Try Again'}
        </button>
      </div>
    </div>
  )
}
