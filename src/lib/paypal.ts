const PAYPAL_API_BASE = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  production: 'https://api-m.paypal.com',
}

// ─── Fail‑fast: 空值或占位符直接拒绝 ───────────────────────────────
function validateCredentials(clientId: string, clientSecret: string): void {
  if (!clientId || clientId.startsWith('your-') || clientId.trim() === '') {
    throw new Error('PAYPAL_CLIENT_ID is not configured')
  }
  if (!clientSecret || clientSecret.startsWith('your-') || clientSecret.trim() === '') {
    throw new Error('PAYPAL_CLIENT_SECRET is not configured')
  }
}

// ─── Types ──────────────────────────────────────────────────────────────

export interface PayPalOrderResponse {
  id: string
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
  intent: string
  purchase_units: Array<{
    amount: { currency_code: string; value: string }
    custom_id?: string
    description?: string
    payments?: {
      captures?: Array<{
        id: string
        status: string
        amount: { currency_code: string; value: string }
      }>
    }
  }>
  links: Array<{ href: string; rel: string; method: string }>
}

export interface PayPalCaptureResponse {
  id: string
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED'
  intent: string
  purchase_units: Array<{
    amount: { currency_code: string; value: string }
    custom_id?: string
    payments: {
      captures: Array<{
        id: string
        status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED'
        amount: { currency_code: string; value: string }
        create_time: string
        update_time: string
      }>
    }
  }>
  links: Array<{ href: string; rel: string; method: string }>
}

// ─── Token caching (per-isolate lifetime, matches Workers semantics) ────

let tokenCache: { token: string; expires: number } | null = null

async function getAccessToken(clientId: string, clientSecret: string, mode: 'sandbox' | 'production'): Promise<string> {
  if (tokenCache && tokenCache.expires > Date.now()) {
    return tokenCache.token
  }

  const base = PAYPAL_API_BASE[mode]
  const auth = btoa(`${clientId}:${clientSecret}`)

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal auth failed: ${res.status} ${err}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }

  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

// ─── Public API ─────────────────────────────────────────────────────────

export async function createPayPalOrder(
  clientId: string,
  clientSecret: string,
  mode: 'sandbox' | 'production',
  params: {
    amount: string
    currency?: string
    description?: string
    customId?: string
    returnUrl?: string
    cancelUrl?: string
  },
): Promise<PayPalOrderResponse> {
  validateCredentials(clientId, clientSecret)
  const base = PAYPAL_API_BASE[mode]
  const token = await getAccessToken(clientId, clientSecret, mode)

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: params.currency ?? 'USD',
            value: params.amount,
          },
          description: params.description,
          custom_id: params.customId,
        },
      ],
      application_context: {
        brand_name: 'CloudDreamer',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal create order failed: ${res.status} ${err}`)
  }

  return res.json() as Promise<PayPalOrderResponse>
}

export async function capturePayPalOrder(
  clientId: string,
  clientSecret: string,
  mode: 'sandbox' | 'production',
  orderId: string,
): Promise<PayPalCaptureResponse> {
  validateCredentials(clientId, clientSecret)
  const base = PAYPAL_API_BASE[mode]
  const token = await getAccessToken(clientId, clientSecret, mode)

  const res = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal capture failed: ${res.status} ${err}`)
  }

  return res.json() as Promise<PayPalCaptureResponse>
}

export async function getPayPalOrder(
  clientId: string,
  clientSecret: string,
  mode: 'sandbox' | 'production',
  orderId: string,
): Promise<PayPalOrderResponse> {
  validateCredentials(clientId, clientSecret)
  const base = PAYPAL_API_BASE[mode]
  const token = await getAccessToken(clientId, clientSecret, mode)

  const res = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`PayPal get order failed: ${res.status}`)
  return res.json() as Promise<PayPalOrderResponse>
}