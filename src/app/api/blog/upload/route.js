import { uploadFile, getFileUrl, MINIO_BUCKET, ensureBucket } from '@/lib/minio'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 管理：上传图片到 MinIO
export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const blogId = parseInt(formData.get('blogId'))

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const objectName = await uploadFile(buffer, file.name, file.type)
    const url = getFileUrl(objectName.replace(`${MINIO_BUCKET}/`, ''))

    // 如果关联了博客，保存到 BlogImage
    let blogImage = null
    if (blogId) {
      blogImage = await prisma.blogImage.create({
        data: {
          blogId,
          url,
          filename: file.name,
        },
      })
    }

    return Response.json({ url, blogImage })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
