import crypto from 'crypto'
import { createAdminToken, withAuth } from '@/lib/auth'

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_ATTEMPT_LIMIT = 10
const loginAttempts = globalThis.__adminLoginAttempts || { count: 0, resetAt: 0 }
if (process.env.NODE_ENV !== 'production') globalThis.__adminLoginAttempts = loginAttempts

function consumeLoginAttempt(now = Date.now()) {
  if (now >= loginAttempts.resetAt) {
    loginAttempts.count = 0
    loginAttempts.resetAt = now + LOGIN_WINDOW_MS
  }
  if (loginAttempts.count >= LOGIN_ATTEMPT_LIMIT) return false
  loginAttempts.count += 1
  return true
}

export const GET = withAuth(async () => Response.json({ success: true }))

export async function POST(request) {
  try {
    if (!consumeLoginAttempt()) {
      return Response.json({ error: 'Too many attempts' }, {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((loginAttempts.resetAt - Date.now()) / 1000)) },
      })
    }

    const { secret } = await request.json()
    const adminSecret = process.env.ADMIN_SECRET

    if (!secret || !adminSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenBuf = Buffer.from(secret)
    const secretBuf = Buffer.from(adminSecret)
    if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return Response.json({
      success: true,
      token: createAdminToken(adminSecret),
    })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
