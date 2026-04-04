// Pesapal integration — all OAuth/secret calls go through Cloud Functions
// This file only handles client-side redirect and status polling

export const PESAPAL_IPN_URL = `${window.location.origin}/api/pesapal/ipn`

export interface PesapalOrderRequest {
  amount: number
  currency: 'UGX'
  description: string
  callbackUrl: string
  billingEmail: string
  billingPhone?: string
  billingFirstName: string
  billingLastName: string
  reference: string // your internal order ID
}

export interface PesapalOrderResponse {
  orderTrackingId: string
  merchantReference: string
  redirectUrl: string
}

// Calls our Cloud Function which holds the consumer key/secret
export async function initiatePesapalPayment(
  order: PesapalOrderRequest
): Promise<PesapalOrderResponse> {
  const fnUrl = `${import.meta.env.VITE_FUNCTIONS_BASE_URL}/pesapalSubmitOrder`
  const res = await fetch(fnUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Payment initiation failed' }))
    throw new Error(err.message ?? 'Payment initiation failed')
  }
  return res.json()
}

// Check transaction status via Cloud Function
export async function checkPesapalStatus(orderTrackingId: string) {
  const fnUrl = `${import.meta.env.VITE_FUNCTIONS_BASE_URL}/pesapalGetStatus`
  const res = await fetch(`${fnUrl}?orderTrackingId=${orderTrackingId}`)
  if (!res.ok) throw new Error('Status check failed')
  return res.json() as Promise<{ status: string; paymentMethod: string }>
}
