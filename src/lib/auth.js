import crypto from 'crypto'

const JWT_TTL_SECONDS = 60 * 60 * 12

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function sign(unsignedToken, secret) {
  return crypto.createHmac('sha256', secret).update(unsignedToken).digest('base64url')
}

export function createAdminToken(secret, now = Math.floor(Date.now() / 1000)) {
  const header = encodeJson({ alg: 'HS256', typ: 'JWT' })
  const payload = encodeJson({
    sub: 'admin',
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  })
  const unsignedToken = `${header}.${payload}`

  return `${unsignedToken}.${sign(unsignedToken, secret)}`
}

export function verifyAdminToken(token, secret, now = Math.floor(Date.now() / 1000)) {
  if (!token || !secret) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [encodedHeader, encodedPayload, signature] = parts
  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, secret)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false
  }

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString())
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())

    return header.alg === 'HS256'
      && header.typ === 'JWT'
      && payload.sub === 'admin'
      && Number.isInteger(payload.iat)
      && Number.isInteger(payload.exp)
      && payload.iat <= now + 60
      && payload.exp > now
  } catch {
    return false
  }
}

export function withAuth(handler) {
  return async (req) => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]
    const secret = process.env.ADMIN_SECRET

    if (!verifyAdminToken(token, secret)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req)
  }
}

export function getCorsHeaders(request) {
  const origin = request.headers.get('origin') || ''
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const allowOrigin = allowed.includes(origin) ? origin : ''

  return {
    ...(allowOrigin && { 'Access-Control-Allow-Origin': allowOrigin }),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function handleOptions(request) {
  return new Response(null, { status: 204, headers: getCorsHeaders(request) })
}
