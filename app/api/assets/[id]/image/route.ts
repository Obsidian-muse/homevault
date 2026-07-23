import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser, withErrorHandling, ApiError } from '@/lib/api-auth'
import { getOwnedAsset } from '@/lib/ownership'
import { replaceAssetImage, deleteAssetImage } from '@/lib/cloudinary'

interface Params {
  params: Promise<{ id: string }>
}

const uploadSchema = z.object({
  // A data URI (data:image/png;base64,...) from the client's <input type="file">,
  // or a remote https URL. Cloudinary accepts either directly.
  image: z
    .string()
    .refine((v) => v.startsWith('data:image/') || v.startsWith('https://'), {
      message: 'image must be a base64 data URI or an https URL',
    }),
})

export async function POST(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    const asset = await getOwnedAsset(id, user.id)

    const body = await req.json()
    const { image } = uploadSchema.parse(body)

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new ApiError(500, 'Cloudinary is not configured on this server')
    }

    const uploaded = await replaceAssetImage(image, asset.imagePublicId)

    const updated = await prisma.asset.update({
      where: { id },
      data: { imageUrl: uploaded.url, imagePublicId: uploaded.publicId },
    })

    return NextResponse.json({ asset: updated })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    const asset = await getOwnedAsset(id, user.id)

    if (asset.imagePublicId) {
      await deleteAssetImage(asset.imagePublicId)
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: { imageUrl: null, imagePublicId: null },
    })

    return NextResponse.json({ asset: updated })
  })
}
