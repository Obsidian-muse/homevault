import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assetSchema } from '@/lib/validations'
import { requireUser, withErrorHandling, ApiError } from '@/lib/api-auth'
import { getOwnedHome } from '@/lib/ownership'

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const homeId = req.nextUrl.searchParams.get('homeId') ?? undefined
    const roomId = req.nextUrl.searchParams.get('roomId') ?? undefined

    if (homeId) await getOwnedHome(homeId, user.id)

    const assets = await prisma.asset.findMany({
      where: {
        home: { userId: user.id },
        ...(homeId ? { homeId } : {}),
        ...(roomId ? { roomId } : {}),
      },
      include: { room: { select: { name: true } }, warranties: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ assets })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const body = await req.json()
    const data = assetSchema.parse(body)

    await getOwnedHome(data.homeId, user.id)

    const room = await prisma.room.findFirst({ where: { id: data.roomId, homeId: data.homeId } })
    if (!room) throw new ApiError(400, 'Room does not belong to the specified home')

    const asset = await prisma.asset.create({ data })
    return NextResponse.json({ asset }, { status: 201 })
  })
}
