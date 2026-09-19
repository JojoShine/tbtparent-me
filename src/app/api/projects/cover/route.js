import path from 'path'
import { minioClient, MINIO_BUCKET, ensureBucket } from '@/lib/minio'
import { withAuth } from '@/lib/auth'

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export const POST = withAuth(async request => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ error: 'No image provided' }, { status: 400 })
    }
    if (!IMAGE_TYPES.has(file.type)) {
      return Response.json({ error: 'Unsupported image type' }, { status: 400 })
    }

    await ensureBucket()
    const safeName = path.basename(file.name || 'cover.png').replace(/[^a-zA-Z0-9._-]/g, '-')
    const objectName = `projects/covers/${Date.now()}-${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await minioClient.putObject(MINIO_BUCKET, objectName, buffer, undefined, {
      'Content-Type': file.type,
    })

    const objectPath = `${MINIO_BUCKET}/${objectName}`
    return Response.json({
      cover_url: `/api/archive/files?path=${encodeURIComponent(objectPath)}`,
    })
  } catch (error) {
    console.error('Project cover upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
})
