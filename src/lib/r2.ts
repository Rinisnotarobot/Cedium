import '@tanstack/react-start/server-only'

import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const BUCKET_NAME = process.env.R2_BUCKET_NAME!
export const PUBLIC_URL = process.env.R2_PUBLIC_URL!

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 10 * 1024 * 1024

const FILE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}

function generateAvatarKey(userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `avatars/${userId}/${timestamp}-${random}`
}

function generateImageKey(userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `images/${userId}/${timestamp}-${random}`
}

export function validateFileType(buffer: Buffer, mimeType: string): boolean {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return false
  }

  const signature = FILE_SIGNATURES[mimeType]
  if (!signature) {
    return true
  }

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false
    }
  }

  if (mimeType === 'image/webp') {
    if (buffer.length < 12 || buffer[8] !== 0x57 || buffer[9] !== 0x45 || buffer[10] !== 0x42 || buffer[11] !== 0x50) {
      return false
    }
  }

  return true
}

export async function uploadAvatar(
  userId: string,
  file: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const key = generateAvatarKey(userId)
  const extension = contentType.split('/')[1]

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${key}.${extension}`,
    Body: file,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  })

  await r2Client.send(command)

  const url = `${PUBLIC_URL}/${key}.${extension}`
  return { key, url }
}

export async function uploadImage(
  userId: string,
  file: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const key = generateImageKey(userId)
  const extension = contentType.split('/')[1]

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${key}.${extension}`,
    Body: file,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  })

  await r2Client.send(command)

  const url = `${PUBLIC_URL}/${key}.${extension}`
  return { key, url }
}

export async function deleteAvatar(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_URL)) {
    return
  }

  const key = url.replace(`${PUBLIC_URL}/`, '')

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

export async function deleteImages(urls: string[]): Promise<void> {
  const r2Urls = urls.filter(url => url.startsWith(PUBLIC_URL))

  if (r2Urls.length === 0) {
    return
  }

  const command = new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: r2Urls.map(url => ({
        Key: url.replace(`${PUBLIC_URL}/`, ''),
      })),
    },
  })

  await r2Client.send(command)
}