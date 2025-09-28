// uploads.routes.js
import { Router } from 'express'
import crypto from 'crypto'
import 'dotenv/config'

const r = Router()

const provider = process.env.STORAGE_PROVIDER || 'r2'

let S3Client, PutObjectCommand, getSignedUrl, s3, bucket, buildPublicUrl

if (provider === 'r2') {
  // R2 via S3-compatible SDK (presigned PUTs go to the S3 API endpoint)
  ;({ S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3'))
  ;({ getSignedUrl } = await import('@aws-sdk/s3-request-presigner'))

  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
  bucket = process.env.R2_BUCKET

  // Public GETs should use r2.dev (or your custom domain) – set R2_PUBLIC_BASE accordingly.
  // Fallback uses the S3 API hostname (not public unless you sign GETs).
  const publicBase = process.env.R2_PUBLIC_BASE // e.g. https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev OR https://media.carols.app
  buildPublicUrl = (key) =>
    publicBase
      ? `${publicBase}/${encodeURI(key)}`
      : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${encodeURI(key)}`
} else {
  // Classic S3
  ;({ S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3'))
  ;({ getSignedUrl } = await import('@aws-sdk/s3-request-presigner'))

  s3 = new S3Client({ region: process.env.AWS_REGION })
  bucket = process.env.AWS_BUCKET

  // Public (if object ACL/bucket policy allows) via S3 website/virtual-hosted–style URL
  buildPublicUrl = (key) =>
    `https://${bucket}.s3.amazonaws.com/${encodeURI(key)}`
}

r.post('/presign', async (req, res, next) => {
  try {
    if (!s3 || !bucket) return res.status(400).json({ error: 'Storage not configured' })

    const { fileName = 'file', contentType = 'application/octet-stream', purpose = 'misc' } = req.body
    const safePurpose = String(purpose).replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'misc'
    const key = `${safePurpose}/${Date.now()}-${crypto.randomUUID()}-${fileName}`

    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 })
    const fileUrl = buildPublicUrl(key)

    res.json({ uploadUrl, fileUrl })
  } catch (e) { next(e) }
})

export default r
