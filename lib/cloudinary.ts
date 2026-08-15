import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const FOLDER = 'homevault/assets'

export interface CloudinaryUploadResult {
  url: string
  publicId: string
}

/**
 * Uploads a base64/data-URI or remote image URL to Cloudinary.
 */
export async function uploadAssetImage(fileDataUri: string): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder: FOLDER,
    resource_type: 'image',
    overwrite: true,
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  })
  return { url: result.secure_url, publicId: result.public_id }
}

/**
 * Replaces an existing asset image: uploads the new one, then deletes the old
 * public id (best-effort — failure to delete the old image never blocks the
 * request since the new image already succeeded).
 */
export async function replaceAssetImage(
  fileDataUri: string,
  previousPublicId?: string | null
): Promise<CloudinaryUploadResult> {
  const uploaded = await uploadAssetImage(fileDataUri)
  if (previousPublicId) {
    await deleteAssetImage(previousPublicId).catch(() => undefined)
  }
  return uploaded
}

export async function deleteAssetImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

export default cloudinary
