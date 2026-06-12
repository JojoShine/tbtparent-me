import * as Minio from 'minio'

const globalForMinio = globalThis

function createMinioClient() {
  return new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
  })
}

export const minioClient = globalForMinio.minioClient || createMinioClient()

if (process.env.NODE_ENV !== 'production') globalForMinio.minioClient = minioClient

export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'tbtparent-me'

// 确保 bucket 存在
export async function ensureBucket() {
  const exists = await minioClient.bucketExists(MINIO_BUCKET)
  if (!exists) {
    await minioClient.makeBucket(MINIO_BUCKET)
  }
}

// 上传文件到 MinIO
export async function uploadFile(file, filename, contentType) {
  await ensureBucket()
  const objectName = `${Date.now()}-${filename}`
  await minioClient.putObject(MINIO_BUCKET, objectName, file, undefined, {
    'Content-Type': contentType,
  })
  return `${MINIO_BUCKET}/${objectName}`
}

// 获取文件 URL
export function getFileUrl(objectName) {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
  const port = process.env.MINIO_PORT || '9000'
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost'
  return `${protocol}://${endpoint}:${port}/${MINIO_BUCKET}/${objectName}`
}

// 删除文件
export async function deleteFile(objectName) {
  await minioClient.removeObject(MINIO_BUCKET, objectName)
}
