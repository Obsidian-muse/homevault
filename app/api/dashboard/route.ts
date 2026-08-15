import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, withErrorHandling } from '@/lib/api-auth'
import { computeWarrantyStatus, daysRemaining } from '@/lib/warranty-status'

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser()
    const ownerFilter = { home: { userId: user.id } }
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const [
      totalHomes,
      totalRooms,
      totalAssets,
      allWarranties,
      upcomingMaintenance,
      recentAssets,
      assetValues,
    ] = await Promise.all([
      prisma.home.count({ where: { userId: user.id } }),
      prisma.room.count({ where: ownerFilter }),
      prisma.asset.count({ where: ownerFilter }),
      prisma.warranty.findMany({
        where: { asset: ownerFilter },
        select: { id: true, expiryDate: true, assetId: true, asset: { select: { name: true } } },
      }),
      prisma.maintenanceRecord.findMany({
        where: { asset: ownerFilter, nextDueDate: { not: null, gte: new Date(), lte: in30Days } },
        include: { asset: { select: { id: true, name: true } } },
        orderBy: { nextDueDate: 'asc' },
        take: 10,
      }),
      prisma.asset.findMany({
        where: ownerFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { room: { select: { name: true } }, home: { select: { name: true } } },
      }),
      prisma.asset.findMany({ where: ownerFilter, select: { currentValue: true, purchasePrice: true } }),
    ])

    const withStatus = allWarranties.map((w) => ({
      ...w,
      status: computeWarrantyStatus(w.expiryDate),
    }))
    const activeWarranties = withStatus.filter((w) => w.status === 'Active').length
    const expiringWarranties = withStatus
      .filter((w) => w.status === 'ExpiringSoon')
      .map((w) => ({ ...w, daysRemaining: daysRemaining(w.expiryDate) }))

    const totalValue = assetValues.reduce(
      (sum: number, a: { currentValue: number | null; purchasePrice: number | null }) =>
        sum + (a.currentValue ?? a.purchasePrice ?? 0),
      0
    )

    return NextResponse.json({
      stats: {
        totalHomes,
        totalRooms,
        totalAssets,
        activeWarranties,
        upcomingMaintenance: upcomingMaintenance.length,
        totalValue,
      },
      expiringWarranties,
      upcomingMaintenance,
      recentAssets,
    })
  })
}
