import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios'

admin.initializeApp()
const db = admin.firestore()

// Pesapal API base URLs
const PESAPAL_BASE = 'https://pay.pesapal.com/v3'  // production
// const PESAPAL_BASE = 'https://cybqa.pesapal.com/pesapalv3'  // sandbox

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getPesapalToken(): Promise<string> {
  const key = functions.config().pesapal.consumer_key
  const secret = functions.config().pesapal.consumer_secret

  const res = await axios.post(
    `${PESAPAL_BASE}/api/Auth/RequestToken`,
    { consumer_key: key, consumer_secret: secret },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
  )
  if (!res.data.token) throw new Error('Pesapal auth failed: ' + JSON.stringify(res.data))
  return res.data.token as string
}

async function registerIPN(token: string, ipnUrl: string): Promise<string> {
  const res = await axios.post(
    `${PESAPAL_BASE}/api/URLSetup/RegisterIPN`,
    { url: ipnUrl, ipn_notification_type: 'POST' },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
  )
  return res.data.ipn_id as string
}

// ─── submitOrder ──────────────────────────────────────────────────────────────
// Called from the frontend to initiate a payment

export const pesapalSubmitOrder = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ message: 'Method not allowed' }); return }

  try {
    const {
      amount, currency, description, callbackUrl,
      billingEmail, billingPhone, billingFirstName, billingLastName, reference,
    } = req.body as {
      amount: number; currency: string; description: string; callbackUrl: string
      billingEmail: string; billingPhone?: string
      billingFirstName: string; billingLastName: string; reference: string
    }

    const token = await getPesapalToken()

    // Register IPN endpoint (idempotent — Pesapal deduplicates by URL)
    const ipnUrl = `https://${process.env.FUNCTION_TARGET ?? 'us-central1'}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/pesapalIPN`
    const ipnId = await registerIPN(token, ipnUrl)

    // Submit order
    const orderPayload = {
      id: reference,
      currency,
      amount,
      description,
      callback_url: callbackUrl,
      notification_id: ipnId,
      billing_address: {
        email_address: billingEmail,
        phone_number: billingPhone ?? '',
        first_name: billingFirstName,
        last_name: billingLastName,
      },
    }

    const orderRes = await axios.post(
      `${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`,
      orderPayload,
      { headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
    )

    if (!orderRes.data.redirect_url) {
      throw new Error('No redirect URL from Pesapal: ' + JSON.stringify(orderRes.data))
    }

    res.json({
      orderTrackingId: orderRes.data.order_tracking_id,
      merchantReference: reference,
      redirectUrl: orderRes.data.redirect_url,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    functions.logger.error('pesapalSubmitOrder error', err)
    res.status(500).json({ message })
  }
})

// ─── getStatus ────────────────────────────────────────────────────────────────
// Polled by the callback page to confirm payment

export const pesapalGetStatus = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }

  const { orderTrackingId } = req.query as { orderTrackingId: string }
  if (!orderTrackingId) { res.status(400).json({ message: 'orderTrackingId required' }); return }

  try {
    const token = await getPesapalToken()
    const statusRes = await axios.get(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
    )
    res.json({
      status: statusRes.data.payment_status_description,  // COMPLETED | PENDING | FAILED
      paymentMethod: statusRes.data.payment_method,
      amount: statusRes.data.amount,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    functions.logger.error('pesapalGetStatus error', err)
    res.status(500).json({ message })
  }
})

// ─── IPN webhook ──────────────────────────────────────────────────────────────
// Pesapal POSTs to this URL when payment status changes

export const pesapalIPN = functions.https.onRequest(async (req, res) => {
  const { orderTrackingId, orderMerchantReference, orderNotificationType } = req.query as Record<string, string>

  functions.logger.info('Pesapal IPN received', { orderTrackingId, orderMerchantReference, orderNotificationType })

  try {
    const token = await getPesapalToken()
    const statusRes = await axios.get(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
    )

    const paymentStatus = statusRes.data.payment_status_description as string
    const orderRef = orderMerchantReference

    if (orderRef) {
      const orderDoc = db.collection('orders').doc(orderRef)
      const snap = await orderDoc.get()

      if (snap.exists) {
        await orderDoc.update({
          status: paymentStatus === 'COMPLETED' ? 'paid' : paymentStatus === 'FAILED' ? 'failed' : 'pending',
          pesapalTrackingId: orderTrackingId,
          lastIpnAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        // If subscription payment completed, upgrade user
        const data = snap.data()!
        if (paymentStatus === 'COMPLETED' && data.type === 'subscription' && data.userId && data.plan) {
          const months = data.plan === 'annual' ? 12 : 1
          const expiry = new Date()
          expiry.setMonth(expiry.getMonth() + months)

          await db.collection('users').doc(data.userId).update({
            subscription: 'member',
            subscribedAt: new Date().toISOString(),
            subscriptionExpiry: expiry.toISOString(),
          })
          functions.logger.info(`User ${data.userId} upgraded to member`)
        }
      }
    }

    // Pesapal requires a specific response format
    res.json({
      orderNotificationType,
      orderTrackingId,
      orderMerchantReference,
      status: '200',
    })
  } catch (err: unknown) {
    functions.logger.error('pesapalIPN error', err)
    res.status(500).json({ status: '500' })
  }
})
