import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { roomUpdateSchema } from '@/lib/validations'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { getOwnedRoom, getOwnedHome } from '@/lib/ownership'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    const room = await getOwnedRoom(id, user.id)
    const assets = await prisma.asset.findMany({ where: { roomId: room.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ room: { ...room, assets } })
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedRoom(id, user.id)

    const body = await req.json()
    const data = roomUpdateSchema.parse(body)

    if (data.homeId) await getOwnedHome(data.homeId, user.id)

    const room = await prisma.room.update({ where: { id }, data })
    return NextResponse.json({ room })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const { id } = await params
    await getOwnedRoom(id, user.id)

    await prisma.room.delete({ where: { id } })
    return NextResponse.json({ success: true })
  })
}
