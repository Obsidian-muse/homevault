import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, withErrorHandling } from '@/lib/api-auth'

export async function DELETE() {
  return withErrorHandling(async () => {
    const user = await requireUser()
    // Cascading deletes on Home -> Room -> Asset -> Warranty/Maintenance
    // clean up everything owned by this user.
    await prisma.user.delete({ where: { id: user.id } })
    return NextResponse.json({ success: true })
  })
}
