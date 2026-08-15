import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { roomSchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { getOwnedHome } from '@/lib/ownership'

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const homeId = req.nextUrl.searchParams.get('homeId') ?? undefined

    if (homeId) await getOwnedHome(homeId, user.id)

    const rooms = await prisma.room.findMany({
      where: { home: { userId: user.id }, ...(homeId ? { homeId } : {}) },
      include: {
        home: { select: { name: true } },
        _count: { select: { assets: true } },
        assets: { select: { currentValue: true, purchasePrice: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = rooms.map((r: (typeof rooms)[number]) => {
      const value = r.assets.reduce(
        (sum: number, a: { currentValue: number | null; purchasePrice: number | null }) =>
          sum + (a.currentValue ?? a.purchasePrice ?? 0),
        0
      )
      return { ...r, assetCount: r._count.assets, value, assets: undefined, _count: undefined }
    })

    return NextResponse.json({ rooms: shaped })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const body = await req.json()
    const data = roomSchema.parse(body)

    await getOwnedHome(data.homeId, user.id)

    const room = await prisma.room.create({ data })
    return NextResponse.json({ room }, { status: 201 })
  })
}
