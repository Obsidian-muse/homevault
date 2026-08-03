-- CreateEnum
CREATE TYPE "room_type" AS ENUM ('Bedroom', 'Bathroom', 'Kitchen', 'Living Room', 'Dining Room', 'Garage', 'Basement', 'Attic', 'Office', 'Outdoor', 'Other');

-- CreateEnum
CREATE TYPE "asset_condition" AS ENUM ('Excellent', 'Good', 'Fair', 'Poor');

-- CreateEnum
CREATE TYPE "warranty_status" AS ENUM ('Active', 'Expiring Soon', 'Expired');

-- CreateEnum
CREATE TYPE "maintenance_type" AS ENUM ('Inspection', 'Repair', 'Cleaning', 'Replacement', 'Service');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "image" TEXT,
    "yearBuilt" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "room_type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "condition" "asset_condition" NOT NULL DEFAULT 'Good',
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "notes" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranties" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "policyNumber" TEXT,
    "coverage" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" "warranty_status" NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "maintenance_type" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "provider" TEXT,
    "notes" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "homes_userId_idx" ON "homes"("userId");

-- CreateIndex
CREATE INDEX "rooms_homeId_idx" ON "rooms"("homeId");

-- CreateIndex
CREATE INDEX "assets_homeId_idx" ON "assets"("homeId");

-- CreateIndex
CREATE INDEX "assets_roomId_idx" ON "assets"("roomId");

-- CreateIndex
CREATE INDEX "warranties_assetId_idx" ON "warranties"("assetId");

-- CreateIndex
CREATE INDEX "maintenance_records_assetId_idx" ON "maintenance_records"("assetId");

-- AddForeignKey
ALTER TABLE "homes" ADD CONSTRAINT "homes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "homes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "homes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
