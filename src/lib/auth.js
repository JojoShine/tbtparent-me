// 简单 API 鉴权中间件
export function withAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || token !== process.env.ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req, res)
  }
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
