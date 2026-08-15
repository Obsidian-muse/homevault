// These values match the Prisma `RoomType` enum member names exactly (see
// prisma/schema.prisma). Some members are `@map()`-ed to a DB label with a
// space (e.g. LivingRoom -> "Living Room"), but the Prisma Client — and every
// value we send to it — always uses the no-space member name. Use
// `roomTypeLabel()` below to render the human-friendly version.
export type RoomType =
  | 'Bedroom'
  | 'Bathroom'
  | 'Kitchen'
  | 'LivingRoom'
  | 'DiningRoom'
  | 'Garage'
  | 'Basement'
  | 'Attic'
  | 'Office'
  | 'Outdoor'
  | 'Other'

export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor'
export type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expired'
export type MaintenanceType = 'Inspection' | 'Repair' | 'Cleaning' | 'Replacement' | 'Service'

/** Prisma-safe RoomType value -> its human-readable display label. */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  Bedroom: 'Bedroom',
  Bathroom: 'Bathroom',
  Kitchen: 'Kitchen',
  LivingRoom: 'Living Room',
  DiningRoom: 'Dining Room',
  Garage: 'Garage',
  Basement: 'Basement',
  Attic: 'Attic',
  Office: 'Office',
  Outdoor: 'Outdoor',
  Other: 'Other',
}

/** Renders a Prisma-safe RoomType value (e.g. "LivingRoom") for display (e.g. "Living Room"). */
export function roomTypeLabel(type: string): string {
  return ROOM_TYPE_LABELS[type as RoomType] ?? type
}

/* ------------------------------------------------------------------ */
/*  Shapes returned by the /api/* route handlers                       */
/* ------------------------------------------------------------------ */

export interface HomeDTO {
  id: string
  name: string
  address: string
  city: string
  type: string
  image: string | null
  yearBuilt: number | null
  roomCount: number
  assetCount: number
  value: number
}

export interface RoomDTO {
  id: string
  homeId: string
  name: string
  type: RoomType
  assetCount: number
  value: number
}

export interface AssetDTO {
  id: string
  homeId: string
  roomId: string
  name: string
  category: string
  brand: string | null
  model: string | null
  condition: AssetCondition
  serialNumber: string | null
  purchaseDate: string | null
  purchasePrice: number | null
  currentValue: number | null
  notes: string | null
  imageUrl: string | null
  imagePublicId: string | null
  room?: { id?: string; name: string; type?: RoomType }
  home?: { id: string; name: string }
  warranties?: WarrantyDTO[]
  maintenance?: MaintenanceDTO[]
}

export interface WarrantyDTO {
  id: string
  assetId: string
  provider: string
  policyNumber: string | null
  coverage: string | null
  startDate: string
  expiryDate: string
  status: 'Active' | 'ExpiringSoon' | 'Expired'
  daysRemaining: number
  notes: string | null
  asset?: { id: string; name: string }
}

export interface MaintenanceDTO {
  id: string
  assetId: string
  type: MaintenanceType
  date: string
  cost: number
  provider: string | null
  notes: string | null
  nextDueDate: string | null
  asset?: { id: string; name: string }
}

export interface DashboardStats {
  totalHomes: number
  totalRooms: number
  totalAssets: number
  activeWarranties: number
  upcomingMaintenance: number
  totalValue: number
}

/** Normalizes the DB's `ExpiringSoon` enum value to the display label used across the UI. */
export function warrantyStatusLabel(status: string): WarrantyStatus {
  if (status === 'ExpiringSoon') return 'Expiring Soon'
  return status as WarrantyStatus
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
