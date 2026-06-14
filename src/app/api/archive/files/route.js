import { minioClient, MINIO_BUCKET } from '@/lib/minio'

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

    console.log('Fetching file:', { bucket, objectName, expectedBucket: MINIO_BUCKET })

    if (bucket !== MINIO_BUCKET) {
      return Response.json({ error: 'Invalid bucket' }, { status: 403 })
    }

    // 从 MinIO 获取文件流和元数据
    const stat = await minioClient.statObject(bucket, objectName)
    const stream = await minioClient.getObject(bucket, objectName)
    
    // 根据文件扩展名设置 Content-Type
    const ext = objectName.split('.').pop()?.toLowerCase()
    const contentTypeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    }
    const contentType = contentTypeMap[ext] || stat.metaData['content-type'] || 'application/octet-stream'
    
    // 返回文件流，带正确的 Content-Type 和缓存头
    return new Response(stream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 缓存 1 年
      },
    })
  } catch (error) {
    console.error('File fetch error:', error)
    return Response.json({ error: 'File not found' }, { status: 404 })
  }
}
