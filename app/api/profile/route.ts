import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { profileUpdateSchema } from '@/lib/validations'
import { requireUser, withErrorHandling, ApiError } from '@/lib/api-auth'

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    })
    if (!profile) throw new ApiError(404, 'User not found')
    return NextResponse.json({ user: profile })
  })
}

export async function PATCH(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const body = await req.json()
    const data = profileUpdateSchema.parse(body)

    const updates: { name?: string; image?: string | null; passwordHash?: string } = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.image !== undefined) updates.image = data.image

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new ApiError(400, 'Current password is required to set a new password')
      }
      const existing = await prisma.user.findUnique({ where: { id: user.id } })
      if (!existing) throw new ApiError(404, 'User not found')

      const valid = await bcrypt.compare(data.currentPassword, existing.passwordHash)
      if (!valid) throw new ApiError(400, 'Current password is incorrect')

      updates.passwordHash = await bcrypt.hash(data.newPassword, 12)
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: { id: true, name: true, email: true, image: true },
    })

    return NextResponse.json({ user: updated })
  })
}
