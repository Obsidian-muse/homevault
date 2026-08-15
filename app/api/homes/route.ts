import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { homeSchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser()

    const homes = await prisma.home.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { rooms: true, assets: true } },
        assets: { select: { currentValue: true, purchasePrice: true } },
      },
    })

    const shaped = homes.map((h: (typeof homes)[number]) => {
      const value = h.assets.reduce(
        (sum: number, a: { currentValue: number | null; purchasePrice: number | null }) =>
          sum + (a.currentValue ?? a.purchasePrice ?? 0),
        0
      )
      const { assets, _count, ...rest } = h
      return {
        ...rest,
        roomCount: _count.rooms,
        assetCount: _count.assets,
        value,
      }
    })

    return NextResponse.json({ homes: shaped })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const body = await req.json()
    const data = homeSchema.parse(body)

    const home = await prisma.home.create({
      data: { ...data, userId: user.id },
    })

    return NextResponse.json({ home }, { status: 201 })
  })
}
