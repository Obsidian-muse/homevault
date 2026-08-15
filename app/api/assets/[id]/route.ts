import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assetUpdateSchema } from '@/lib/validations'
import { requireUser, withErrorHandling, ApiError } from '@/lib/api-auth'
import { getOwnedAsset } from '@/lib/ownership'
import { deleteAssetImage } from '@/lib/cloudinary'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedAsset(id, user.id)

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, name: true, type: true } },
        home: { select: { id: true, name: true } },
        warranties: { orderBy: { expiryDate: 'asc' } },
        maintenance: { orderBy: { date: 'desc' } },
      },
    })

    return NextResponse.json({ asset })
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    const existing = await getOwnedAsset(id, user.id)

    const body = await req.json()
    const data = assetUpdateSchema.parse(body)

    if (data.roomId) {
      const room = await prisma.room.findFirst({
        where: { id: data.roomId, homeId: data.homeId ?? existing.homeId },
      })
      if (!room) throw new ApiError(400, 'Room does not belong to the specified home')
    }

    const asset = await prisma.asset.update({ where: { id }, data })
    return NextResponse.json({ asset })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    const asset = await getOwnedAsset(id, user.id)

    if (asset.imagePublicId) {
      await deleteAssetImage(asset.imagePublicId).catch(() => undefined)
    }

    await prisma.asset.delete({ where: { id } })
    return NextResponse.json({ success: true })
  })
}
