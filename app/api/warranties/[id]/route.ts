import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { warrantyUpdateSchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { getOwnedWarranty, getOwnedAsset } from '@/lib/ownership'
import { computeWarrantyStatus, daysRemaining } from '@/lib/warranty-status'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    const warranty = await getOwnedWarranty(id, user.id)

    return NextResponse.json({
      warranty: { ...warranty, status: computeWarrantyStatus(warranty.expiryDate), daysRemaining: daysRemaining(warranty.expiryDate) },
    })
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedWarranty(id, user.id)

    const body = await req.json()
    const data = warrantyUpdateSchema.parse(body)

    if (data.assetId) await getOwnedAsset(data.assetId, user.id)

    const nextExpiry = data.expiryDate
    const warranty = await prisma.warranty.update({
      where: { id },
      data: {
        ...data,
        ...(nextExpiry ? { status: computeWarrantyStatus(nextExpiry) } : {}),
      },
    })

    return NextResponse.json({ warranty })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedWarranty(id, user.id)

    await prisma.warranty.delete({ where: { id } })
    return NextResponse.json({ success: true })
  })
}
