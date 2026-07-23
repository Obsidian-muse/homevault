import type { WarrantyStatus } from '@prisma/client'

const EXPIRING_SOON_WINDOW_DAYS = 30

/** Derives Active / Expiring Soon / Expired from an expiry date, relative to now. */
export function computeWarrantyStatus(expiryDate: Date): WarrantyStatus {
  const now = new Date()
  const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) return 'Expired'
  if (daysRemaining <= EXPIRING_SOON_WINDOW_DAYS) return 'ExpiringSoon'
  return 'Active'
}

export function daysRemaining(expiryDate: Date): number {
  const now = new Date()
  return Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}
