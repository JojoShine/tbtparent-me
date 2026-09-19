import { minioClient, MINIO_BUCKET } from '@/lib/minio'

const INLINE_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
}

// 获取文件（公开访问）
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) {
    return Response.json({ error: 'No path provided' }, { status: 400 })
  }

  try {
    // 解析 bucket 和 objectName
    const parts = path.split('/')
    const bucket = parts[0]
    const objectName = parts.slice(1).join('/')

    if (bucket !== MINIO_BUCKET) {
      return Response.json({ error: 'Invalid bucket' }, { status: 403 })
    }

    // 从 MinIO 获取文件流和元数据
    await minioClient.statObject(bucket, objectName)
    const stream = await minioClient.getObject(bucket, objectName)
    const ext = objectName.split('.').pop()?.toLowerCase()
    const contentType = INLINE_TYPES[ext]
    const isInline = Boolean(contentType)
    const safeName = encodeURIComponent(objectName.split('/').pop() || 'download')

    return new Response(stream, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': isInline ? 'inline' : `attachment; filename*=UTF-8''${safeName}`,
        'Cache-Control': isInline ? 'public, max-age=31536000' : 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('File fetch error:', error)
    return Response.json({ error: 'File not found' }, { status: 404 })
  }
}
