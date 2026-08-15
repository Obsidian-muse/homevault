import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { maintenanceSchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { getOwnedAsset } from '@/lib/ownership'

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const assetId = req.nextUrl.searchParams.get('assetId') ?? undefined
    const upcoming = req.nextUrl.searchParams.get('upcoming')

    if (assetId) await getOwnedAsset(assetId, user.id)

    const records = await prisma.maintenanceRecord.findMany({
      where: {
        asset: { home: { userId: user.id } },
        ...(assetId ? { assetId } : {}),
        ...(upcoming === 'true' ? { nextDueDate: { not: null, gte: new Date() } } : {}),
      },
      include: { asset: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ maintenance: records })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const body = await req.json()
    const data = maintenanceSchema.parse(body)

    await getOwnedAsset(data.assetId, user.id)

    const record = await prisma.maintenanceRecord.create({ data })
    return NextResponse.json({ record }, { status: 201 })
  })
}
