import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { maintenanceUpdateSchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { getOwnedMaintenance, getOwnedAsset } from '@/lib/ownership'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    const record = await getOwnedMaintenance(id, user.id)
    return NextResponse.json({ record })
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedMaintenance(id, user.id)

    const body = await req.json()
    const data = maintenanceUpdateSchema.parse(body)

    if (data.assetId) await getOwnedAsset(data.assetId, user.id)

    const record = await prisma.maintenanceRecord.update({ where: { id }, data })
    return NextResponse.json({ record })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedMaintenance(id, user.id)

    await prisma.maintenanceRecord.delete({ where: { id } })
    return NextResponse.json({ success: true })
  })
}
