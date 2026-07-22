import crypto from 'crypto'

export function withAuth(handler) {
  return async (req) => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const secret = process.env.ADMIN_SECRET

    if (!token || !secret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenBuf = Buffer.from(token)
    const secretBuf = Buffer.from(secret)
    if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
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
