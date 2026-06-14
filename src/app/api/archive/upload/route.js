import { minioClient, MINIO_BUCKET, ensureBucket } from '@/lib/minio'
import { withAuth } from '@/lib/auth'

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    await ensureBucket()

    // 生成文件名
    const timestamp = Date.now()
    const originalName = file.name || 'image.png'
    const ext = originalName.split('.').pop() || 'png'
    const filename = `archive/${timestamp}-${originalName}`

    // 转换为 Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // 上传到 MinIO
    await minioClient.putObject(MINIO_BUCKET, filename, buffer, undefined, {
      'Content-Type': file.type || 'image/png',
    })

    // 返回文件路径
    return Response.json({ 
      success: true, 
      path: `${MINIO_BUCKET}/${filename}`,
      url: `/api/archive/files?path=${encodeURIComponent(`${MINIO_BUCKET}/${filename}`)}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
})
