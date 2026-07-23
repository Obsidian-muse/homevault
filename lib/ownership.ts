import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-auth'

/** Throws 404 if the home doesn't exist or doesn't belong to this user. */
export async function getOwnedHome(homeId: string, userId: string) {
  const home = await prisma.home.findFirst({ where: { id: homeId, userId } })
  if (!home) throw new ApiError(404, 'Home not found')
  return home
}

/** Throws 404 if the room doesn't exist or its home doesn't belong to this user. */
export async function getOwnedRoom(roomId: string, userId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, home: { userId } },
    include: { home: true },
  })
  if (!room) throw new ApiError(404, 'Room not found')
  return room
}

/** Throws 404 if the asset doesn't exist or its home doesn't belong to this user. */
export async function getOwnedAsset(assetId: string, userId: string) {
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, home: { userId } },
    include: { home: true, room: true },
  })
  if (!asset) throw new ApiError(404, 'Asset not found')
  return asset
}

/** Throws 404 if the warranty doesn't exist or its asset's home doesn't belong to this user. */
export async function getOwnedWarranty(warrantyId: string, userId: string) {
  const warranty = await prisma.warranty.findFirst({
    where: { id: warrantyId, asset: { home: { userId } } },
    include: { asset: true },
  })
  if (!warranty) throw new ApiError(404, 'Warranty not found')
  return warranty
}

/** Throws 404 if the maintenance record doesn't exist or its asset's home doesn't belong to this user. */
export async function getOwnedMaintenance(recordId: string, userId: string) {
  const record = await prisma.maintenanceRecord.findFirst({
    where: { id: recordId, asset: { home: { userId } } },
    include: { asset: true },
  })
  if (!record) throw new ApiError(404, 'Maintenance record not found')
  return record
}
