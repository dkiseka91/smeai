import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios'

admin.initializeApp()
const db = admin.firestore()

// Pesapal API base — switch to production URL before go-live
const PESAPAL_BASE = 'https://cybqa.pesapal.com/pesapalv3'  // sandbox
// const PESAPAL_BASE = 'https://pay.pesapal.com/v3'         // production

// Allowed origins for CORS — add your custom domain here once set up
const ALLOWED_ORIGINS = [
  'http://localhost:5000',
  'http://localhost:5173',
  `https://${process.env.GCLOUD_PROJECT}.web.app`,
  `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
]

function setCors(req: functions.https.Request, res: functions.Response): boolean {
  const origin = req.headers.origin ?? ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.set('Vary', 'Origin')
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return true
  }
  return false
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getPesapalToken(): Promise<string> {
  const key = functions.config().pesapal?.consumer_key
  const secret = functions.config().pesapal?.consumer_secret
  if (!key || !secret) throw new Error('Pesapal credentials not configured.')

  const res = await axios.post(
    `${PESAPAL_BASE}/api/Auth/RequestToken`,
    { consumer_key: key, consumer_secret: secret },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
  )
  if (!res.data.token) throw new Error('Pesapal authentication failed.')
  return res.data.token as string
}

async function registerIPN(token: string): Promise<string> {
  // Construct the IPN URL using the stable Cloud Functions URL format
  const projectId = process.env.GCLOUD_PROJECT
  const region = 'us-central1'
  const ipnUrl = `https://${region}-${projectId}.cloudfunctions.net/pesapalIPN`

  const res = await axios.post(
    `${PESAPAL_BASE}/api/URLSetup/RegisterIPN`,
    { url: ipnUrl, ipn_notification_type: 'GET' },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
  )
  if (!res.data.ipn_id) throw new Error('IPN registration failed.')
  return res.data.ipn_id as string
}

function validateOrderBody(body: Record<string, unknown>): string | null {
  const { amount, currency, description, callbackUrl, billingEmail, billingFirstName, billingLastName, reference } = body
  if (typeof amount !== 'number' || amount <= 0) return 'amount must be a positive number'
  if (currency !== 'UGX') return 'currency must be UGX'
  if (typeof description !== 'string' || !description.trim()) return 'description is required'
  if (typeof callbackUrl !== 'string' || !callbackUrl.startsWith('https://')) return 'callbackUrl must be a valid https URL'
  if (typeof billingEmail !== 'string' || !billingEmail.includes('@')) return 'billingEmail is invalid'
  if (typeof billingFirstName !== 'string' || !billingFirstName.trim()) return 'billingFirstName is required'
  if (typeof billingLastName !== 'string') return 'billingLastName is required'
  if (typeof reference !== 'string' || !/^[a-zA-Z0-9_-]{10,}$/.test(reference)) return 'reference is invalid'
  return null
}

// ─── pesapalSubmitOrder ───────────────────────────────────────────────────────

export const pesapalSubmitOrder = functions.https.onRequest(async (req, res) => {
  if (setCors(req, res)) return
  if (req.method !== 'POST') { res.status(405).json({ message: 'Method not allowed' }); return }

  const validationError = validateOrderBody(req.body)
  if (validationError) {
    res.status(400).json({ message: `Invalid request: ${validationError}` })
    return
  }

  const { amount, currency, description, callbackUrl, billingEmail, billingPhone, billingFirstName, billingLastName, reference } = req.body

  try {
    const token = await getPesapalToken()
    const ipnId = await registerIPN(token)

    const orderRes = await axios.post(
      `${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`,
      {
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
      },
      { headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
    )

    if (!orderRes.data.redirect_url) throw new Error('No redirect URL returned by payment provider.')

    // Validate that the redirect URL is actually from Pesapal
    const redirectHost = new URL(orderRes.data.redirect_url as string).hostname
    if (!redirectHost.endsWith('pesapal.com')) throw new Error('Unexpected redirect domain from payment provider.')

    res.json({
      orderTrackingId: orderRes.data.order_tracking_id,
      merchantReference: reference,
      redirectUrl: orderRes.data.redirect_url,
    })
  } catch (err: unknown) {
    functions.logger.error('pesapalSubmitOrder error', err)
    // Don't leak internal error details to the client
    res.status(500).json({ message: 'Payment initiation failed. Please try again.' })
  }
})

// ─── pesapalGetStatus ─────────────────────────────────────────────────────────

export const pesapalGetStatus = functions.https.onRequest(async (req, res) => {
  if (setCors(req, res)) return
  if (req.method !== 'GET') { res.status(405).json({ message: 'Method not allowed' }); return }

  const { orderTrackingId } = req.query as { orderTrackingId?: string }
  if (!orderTrackingId || !/^[a-zA-Z0-9_-]+$/.test(orderTrackingId)) {
    res.status(400).json({ message: 'Invalid or missing orderTrackingId' })
    return
  }

  try {
    const token = await getPesapalToken()
    const statusRes = await axios.get(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
    )
    res.json({
      status: statusRes.data.payment_status_description,
      paymentMethod: statusRes.data.payment_method,
    })
  } catch (err: unknown) {
    functions.logger.error('pesapalGetStatus error', err)
    res.status(500).json({ message: 'Status check failed. Please try again.' })
  }
})

// ─── pesapalIPN ───────────────────────────────────────────────────────────────
// Pesapal GETs this URL when payment status changes

export const pesapalIPN = functions.https.onRequest(async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query as Record<string, string>

  functions.logger.info('Pesapal IPN received', { OrderTrackingId, OrderMerchantReference, OrderNotificationType })

  if (!OrderTrackingId || !OrderMerchantReference) {
    res.status(400).json({ status: '400', message: 'Missing required IPN parameters' })
    return
  }

  try {
    const token = await getPesapalToken()
    const statusRes = await axios.get(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(OrderTrackingId)}`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
    )

    const paymentStatus = statusRes.data.payment_status_description as string
    const orderDoc = db.collection('orders').doc(OrderMerchantReference)
    const snap = await orderDoc.get()

    if (!snap.exists) {
      functions.logger.warn(`IPN received for unknown order: ${OrderMerchantReference}`)
      // Still respond 200 to Pesapal so it doesn't keep retrying
      res.json({ OrderNotificationType, OrderTrackingId, OrderMerchantReference, status: '200' })
      return
    }

    // Prevent double-processing if already marked paid
    const currentStatus = snap.data()!.status
    if (currentStatus === 'paid') {
      functions.logger.info(`Order ${OrderMerchantReference} already paid, skipping.`)
      res.json({ OrderNotificationType, OrderTrackingId, OrderMerchantReference, status: '200' })
      return
    }

    await orderDoc.update({
      status: paymentStatus === 'COMPLETED' ? 'paid' : paymentStatus === 'FAILED' ? 'failed' : 'pending',
      pesapalTrackingId: OrderTrackingId,
      lastIpnAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Upgrade subscription if this was a subscription payment
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

      // Also add to admins collection if configured as admin
      functions.logger.info(`User ${data.userId} upgraded to member via IPN`)
    }

    res.json({ OrderNotificationType, OrderTrackingId, OrderMerchantReference, status: '200' })
  } catch (err: unknown) {
    functions.logger.error('pesapalIPN error', err)
    res.status(500).json({ status: '500' })
  }
})

// ─── setAdminUser ─────────────────────────────────────────────────────────────
// Callable function to promote a user to admin (call from Firebase console or script)

export const setAdminUser = functions.https.onCall(async (data, context) => {
  // Only existing admins or the initial setup can call this
  const callerUid = context.auth?.uid
  if (!callerUid) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.')

  const callerIsAdmin = await db.collection('admins').doc(callerUid).get()
  if (!callerIsAdmin.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can promote users.')
  }

  const { targetUid } = data as { targetUid: string }
  if (!targetUid) throw new functions.https.HttpsError('invalid-argument', 'targetUid is required.')

  await db.collection('admins').doc(targetUid).set({ grantedAt: admin.firestore.FieldValue.serverTimestamp(), grantedBy: callerUid })
  functions.logger.info(`User ${targetUid} promoted to admin by ${callerUid}`)
  return { success: true }
})
