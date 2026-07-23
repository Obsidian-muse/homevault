import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { warrantySchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { getOwnedAsset } from '@/lib/ownership'
import { computeWarrantyStatus, daysRemaining } from '@/lib/warranty-status'

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const assetId = req.nextUrl.searchParams.get('assetId') ?? undefined

    if (assetId) await getOwnedAsset(assetId, user.id)

    const warranties = await prisma.warranty.findMany({
      where: { asset: { home: { userId: user.id } }, ...(assetId ? { assetId } : {}) },
      include: { asset: { select: { id: true, name: true } } },
      orderBy: { expiryDate: 'asc' },
    })

    const shaped = warranties.map((w: { expiryDate: Date }) => ({
      ...w,
      status: computeWarrantyStatus(w.expiryDate),
      daysRemaining: daysRemaining(w.expiryDate),
    }))

    return NextResponse.json({ warranties: shaped })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const body = await req.json()
    const data = warrantySchema.parse(body)

    await getOwnedAsset(data.assetId, user.id)

    const warranty = await prisma.warranty.create({
      data: { ...data, status: computeWarrantyStatus(data.expiryDate) },
    })

    return NextResponse.json({ warranty }, { status: 201 })
  })
}
