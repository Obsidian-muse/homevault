import { z } from 'zod'

/* ------------------------------------------------------------------ */
/*  Auth                                                                */
/* ------------------------------------------------------------------ */

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof loginSchema>

/* ------------------------------------------------------------------ */
/*  Homes                                                               */
/* ------------------------------------------------------------------ */

export const homeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  address: z.string().trim().min(1, 'Address is required').max(200),
  city: z.string().trim().min(1, 'City is required').max(120),
  type: z.string().trim().min(1, 'Type is required').max(60),
  image: z.string().trim().url().optional().nullable(),
  yearBuilt: z.coerce.number().int().min(1600).max(2100).optional().nullable(),
})
export type HomeInput = z.infer<typeof homeSchema>
export const homeUpdateSchema = homeSchema.partial()

/* ------------------------------------------------------------------ */
/*  Rooms                                                               */
/* ------------------------------------------------------------------ */

export const ROOM_TYPES = [
  'Bedroom',
  'Bathroom',
  'Kitchen',
  'Living Room',
  'Dining Room',
  'Garage',
  'Basement',
  'Attic',
  'Office',
  'Outdoor',
  'Other',
] as const

export const roomSchema = z.object({
  homeId: z.string().cuid('A valid homeId is required'),
  name: z.string().trim().min(1, 'Name is required').max(120),
  type: z.enum(ROOM_TYPES),
})
export type RoomInput = z.infer<typeof roomSchema>
export const roomUpdateSchema = roomSchema.partial().extend({
  homeId: z.string().cuid().optional(),
})

/* ------------------------------------------------------------------ */
/*  Assets                                                              */
/* ------------------------------------------------------------------ */

export const ASSET_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const

export const assetSchema = z.object({
  homeId: z.string().cuid('A valid homeId is required'),
  roomId: z.string().cuid('A valid roomId is required'),
  name: z.string().trim().min(1, 'Name is required').max(150),
  category: z.string().trim().min(1, 'Category is required').max(80),
  brand: z.string().trim().max(80).optional().nullable(),
  model: z.string().trim().max(80).optional().nullable(),
  condition: z.enum(ASSET_CONDITIONS).default('Good'),
  serialNumber: z.string().trim().max(120).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  purchasePrice: z.coerce.number().min(0).optional().nullable(),
  currentValue: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
})
export type AssetInput = z.infer<typeof assetSchema>
export const assetUpdateSchema = assetSchema.partial()

/* ------------------------------------------------------------------ */
/*  Warranties                                                         */
/* ------------------------------------------------------------------ */

export const WARRANTY_STATUSES = ['Active', 'Expiring Soon', 'Expired'] as const

export const warrantySchema = z.object({
  assetId: z.string().cuid('A valid assetId is required'),
  provider: z.string().trim().min(1, 'Provider is required').max(120),
  policyNumber: z.string().trim().max(120).optional().nullable(),
  coverage: z.string().trim().max(200).optional().nullable(),
  startDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  notes: z.string().trim().max(2000).optional().nullable(),
})
export type WarrantyInput = z.infer<typeof warrantySchema>
export const warrantyUpdateSchema = warrantySchema.partial()

/* ------------------------------------------------------------------ */
/*  Maintenance                                                        */
/* ------------------------------------------------------------------ */

export const MAINTENANCE_TYPES = ['Inspection', 'Repair', 'Cleaning', 'Replacement', 'Service'] as const

export const maintenanceSchema = z.object({
  assetId: z.string().cuid('A valid assetId is required'),
  type: z.enum(MAINTENANCE_TYPES),
  date: z.coerce.date(),
  cost: z.coerce.number().min(0).default(0),
  provider: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  nextDueDate: z.coerce.date().optional().nullable(),
})
export type MaintenanceInput = z.infer<typeof maintenanceSchema>
export const maintenanceUpdateSchema = maintenanceSchema.partial()

/* ------------------------------------------------------------------ */
/*  Profile                                                             */
/* ------------------------------------------------------------------ */

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  image: z.string().trim().url().optional().nullable(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).max(72).optional(),
})
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
