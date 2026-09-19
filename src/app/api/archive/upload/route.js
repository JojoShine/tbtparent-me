import path from 'path'
import { minioClient, MINIO_BUCKET, ensureBucket } from '@/lib/minio'
import { withAuth } from '@/lib/auth'

const MAX_UPLOAD_SIZE = 200 * 1024 * 1024
const MEDIA_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
}

function startsWith(buffer, bytes, offset = 0) {
  return bytes.every((byte, index) => buffer[offset + index] === byte)
}

function hasValidSignature(buffer, ext) {
  if (ext === 'jpg' || ext === 'jpeg') return startsWith(buffer, [0xff, 0xd8, 0xff])
  if (ext === 'png') return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (ext === 'gif') return buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a'
  if (ext === 'webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  if (ext === 'mp4' || ext === 'mov') return buffer.subarray(4, 8).toString('ascii') === 'ftyp'
  if (ext === 'webm' || ext === 'mkv') return startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])
  if (ext === 'avi') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 11).toString('ascii') === 'AVI'
  if (ext === 'wmv') return startsWith(buffer, [0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11, 0xa6, 0xd9, 0x00, 0xaa, 0x00, 0x62, 0xce, 0x6c])
  if (ext === 'flv') return buffer.subarray(0, 3).toString('ascii') === 'FLV'
  return false
}

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      return Response.json({ error: 'File is too large' }, { status: 400 })
    }

    const timestamp = Date.now()
    const safeName = path.basename(file.name || 'image.png')
    const ext = safeName.split('.').pop()?.toLowerCase() || ''
    const contentType = MEDIA_TYPES[ext]
    if (!contentType || file.type !== contentType) {
      return Response.json({ error: 'Unsupported media type' }, { status: 400 })
    }
    const filename = `archive/${timestamp}-${safeName}`

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!hasValidSignature(buffer, ext)) {
      return Response.json({ error: 'Invalid media content' }, { status: 400 })
    }

    await ensureBucket()
    await minioClient.putObject(MINIO_BUCKET, filename, buffer, undefined, {
      'Content-Type': contentType,
    })

    return Response.json({ 
      success: true, 
      path: `${MINIO_BUCKET}/${filename}`,
      url: `/api/archive/files?path=${encodeURIComponent(`${MINIO_BUCKET}/${filename}`)}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
})
