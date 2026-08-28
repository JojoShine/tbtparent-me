import crypto from 'crypto'
import { createAdminToken, withAuth } from '@/lib/auth'

export const GET = withAuth(async () => Response.json({ success: true }))

export async function POST(request) {
  try {
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
