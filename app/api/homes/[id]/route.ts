import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { homeUpdateSchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { getOwnedHome } from '@/lib/ownership'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedHome(id, user.id)

    const home = await prisma.home.findUnique({
      where: { id },
      include: {
        rooms: { include: { _count: { select: { assets: true } } } },
        _count: { select: { rooms: true, assets: true } },
        assets: { select: { currentValue: true, purchasePrice: true } },
      },
    })

    const value = home!.assets.reduce(
      (sum: number, a: { currentValue: number | null; purchasePrice: number | null }) =>
        sum + (a.currentValue ?? a.purchasePrice ?? 0),
      0
    )
    const rooms = home!.rooms.map((r: { _count: { assets: number } }) => ({
      ...r,
      assetCount: r._count.assets,
      _count: undefined,
    }))

    return NextResponse.json({
      home: {
        ...home,
        rooms,
        roomCount: home!._count.rooms,
        assetCount: home!._count.assets,
        value,
        assets: undefined,
        _count: undefined,
      },
    })
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedHome(id, user.id)

    const body = await req.json()
    const data = homeUpdateSchema.parse(body)

    const home = await prisma.home.update({ where: { id }, data })
    return NextResponse.json({ home })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedHome(id, user.id)

    await prisma.home.delete({ where: { id } })
    return NextResponse.json({ success: true })
  })
}
