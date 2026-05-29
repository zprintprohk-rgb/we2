const PAYPAL_API_BASE = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  production: 'https://api-m.paypal.com',
}

// ─── CRC32 (用于 PayPal Webhook 签名验证) ────────────────────────────

const CRC32_TABLE = new Int32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC32_TABLE[n] = c
}

function crc32(str: string): string {
  let crc = 0xffffffff
  for (let i = 0; i < str.length; i++) {
    crc = CRC32_TABLE[(crc ^ str.charCodeAt(i)) & 0xff]! ^ (crc >>> 8)
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).toUpperCase()
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

/** 验证 PayPal Webhook 签名，防伪造请求。返回 true 表示签名有效。 */
export async function verifyPayPalWebhook(
  webhookId: string,
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const transmissionId = headers.get("paypal-transmission-id")
  const certUrl = headers.get("paypal-cert-url")
  const authAlgo = headers.get("paypal-auth-algo")
  const transmissionSig = headers.get("paypal-transmission-sig")
  const transmissionTime = headers.get("paypal-transmission-time")

  if (!transmissionId || !certUrl || !authAlgo || !transmissionSig || !transmissionTime) {
    return false
  }

  // 仅接受来自 PayPal 官方域的证书 URL
  const certOrigin = new URL(certUrl).origin
  if (!certOrigin.endsWith(".paypal.com") && certOrigin !== "https://api.paypal.com") {
    return false
  }

  try {
    // 1. 下载 PayPal 公钥证书
    const certRes = await fetch(certUrl)
    if (!certRes.ok) return false
    const pem = await certRes.text()

    // 2. 解析 PEM → ArrayBuffer
    const pemBody = pem
      .replace("-----BEGIN CERTIFICATE-----", "")
      .replace("-----END CERTIFICATE-----", "")
      .replace(/\s/g, "")
    const der = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0)).buffer

    // 3. 导入公钥
    const publicKey = await crypto.subtle.importKey(
      "spki",
      der,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    )

    // 4. 构建待验证字符串
    const crc = crc32(rawBody)
    const expectedSig = `${transmissionId}|${transmissionTime}|${webhookId}|${crc}`

    // 5. 解码签名 (Base64 → ArrayBuffer)
    const sigBytes = Uint8Array.from(atob(transmissionSig), (c) => c.charCodeAt(0))

    // 6. 验证
    return crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      sigBytes,
      new TextEncoder().encode(expectedSig),
    )
  } catch {
    return false
  }
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