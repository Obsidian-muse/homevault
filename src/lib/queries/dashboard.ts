import { prisma } from "@/lib/prisma";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
const DAYS_7 = 7 * 24 * 60 * 60 * 1000;

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const in30Days = new Date(now.getTime() + DAYS_30);
  const in7Days = new Date(now.getTime() + DAYS_7);

  const roomFilter = { home: { userId } };

  const [
    totalAssets,
    activeWarranties,
    expiringSoon,
    maintenanceDue,
    recentAssets,
  ] = await Promise.all([
    // Total Assets
    prisma.asset.count({ where: { room: roomFilter } }),

    // Active Warranties: status ACTIVE and not yet expired
    prisma.warranty.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gt: now },
        asset: { room: roomFilter },
      },
    }),

    // Expiring Soon: active warranties expiring within 30 days
    prisma.warranty.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gte: now, lte: in30Days },
        asset: { room: roomFilter },
      },
    }),

    // Maintenance Due: records with a next due date within the next 7 days (or overdue)
    prisma.maintenanceRecord.count({
      where: {
        nextDueDate: { lte: in7Days },
        asset: { room: roomFilter },
      },
    }),

    // Recent Assets (last 5, most recently added)
    prisma.asset.findMany({
      where: { room: roomFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        condition: true,
        currentValue: true,
        createdAt: true,
        room: { select: { name: true, home: { select: { name: true } } } },
        warranty: { select: { status: true } },
      },
    }),
  ]);

  return {
    totalAssets,
    activeWarranties,
    expiringSoon,
    maintenanceDue,
    recentAssets: recentAssets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      condition: asset.condition,
      roomName: asset.room.name,
      homeName: asset.room.home.name,
      currentValue: asset.currentValue ? Number(asset.currentValue) : null,
      warrantyStatus: asset.warranty?.status ?? null,
      createdAt: asset.createdAt,
    })),
  };
}
