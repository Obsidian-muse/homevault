import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'alex@homevault.dev' },
    update: {},
    create: {
      name: 'Alex Harper',
      email: 'alex@homevault.dev',
      passwordHash,
    },
  })

  console.log(`Seeding data for ${user.email} (password: password123)`)

  // Wipe this user's existing data so the seed is repeatable.
  await prisma.home.deleteMany({ where: { userId: user.id } })

  const skyline = await prisma.home.create({
    data: {
      userId: user.id,
      name: 'Skyline Residence',
      address: '2400 Highland Ave',
      city: 'San Francisco, CA',
      type: 'Modern Villa',
      image: '/homes/villa.png',
      yearBuilt: 2019,
    },
  })

  const lakeview = await prisma.home.create({
    data: {
      userId: user.id,
      name: 'Lakeview Cottage',
      address: '87 Birchwood Ln',
      city: 'Portland, OR',
      type: 'Cottage',
      image: '/homes/cottage.png',
      yearBuilt: 2011,
    },
  })

  const metro = await prisma.home.create({
    data: {
      userId: user.id,
      name: 'Metro Loft',
      address: '19 Canyon St, Unit 12',
      city: 'Austin, TX',
      type: 'Apartment',
      image: '/homes/loft.png',
      yearBuilt: 2021,
    },
  })

  const bedroom = await prisma.room.create({ data: { homeId: skyline.id, name: 'Primary Bedroom', type: 'Bedroom' } })
  const kitchen = await prisma.room.create({ data: { homeId: skyline.id, name: 'Chef Kitchen', type: 'Kitchen' } })
  const greatRoom = await prisma.room.create({ data: { homeId: skyline.id, name: 'Great Room', type: 'LivingRoom' } })
  const office = await prisma.room.create({ data: { homeId: skyline.id, name: 'Home Office', type: 'Office' } })
  const garage = await prisma.room.create({ data: { homeId: skyline.id, name: 'Three-Car Garage', type: 'Garage' } })
  await prisma.room.create({ data: { homeId: skyline.id, name: 'Guest Bath', type: 'Bathroom' } })

  const loftBedroom = await prisma.room.create({ data: { homeId: lakeview.id, name: 'Loft Bedroom', type: 'Bedroom' } })
  const cottageKitchen = await prisma.room.create({ data: { homeId: lakeview.id, name: 'Cottage Kitchen', type: 'Kitchen' } })

  await prisma.room.create({ data: { homeId: metro.id, name: 'Studio Living', type: 'LivingRoom' } })
  await prisma.room.create({ data: { homeId: metro.id, name: 'Balcony', type: 'Outdoor' } })

  const fridge = await prisma.asset.create({
    data: {
      homeId: skyline.id,
      roomId: kitchen.id,
      name: 'Smart Refrigerator',
      brand: 'Samsung',
      category: 'Appliance',
      condition: 'Excellent',
      serialNumber: 'SN-RF29-88213',
      purchaseDate: new Date('2023-03-12'),
      purchasePrice: 3299,
      currentValue: 2600,
      imageUrl: '/assets/fridge.png',
    },
  })

  const tv = await prisma.asset.create({
    data: {
      homeId: skyline.id,
      roomId: greatRoom.id,
      name: 'OLED Television 65"',
      brand: 'LG',
      category: 'Electronics',
      condition: 'Excellent',
      serialNumber: 'SN-C3-44192',
      purchaseDate: new Date('2022-11-04'),
      purchasePrice: 2499,
      currentValue: 1800,
      imageUrl: '/assets/tv.png',
    },
  })

  const espresso = await prisma.asset.create({
    data: {
      homeId: skyline.id,
      roomId: kitchen.id,
      name: 'Espresso Machine',
      brand: 'Breville',
      category: 'Appliance',
      condition: 'Good',
      serialNumber: 'SN-BES-99210',
      purchaseDate: new Date('2021-06-21'),
      purchasePrice: 899,
      currentValue: 500,
      imageUrl: '/assets/espresso.png',
    },
  })

  const chair = await prisma.asset.create({
    data: {
      homeId: skyline.id,
      roomId: office.id,
      name: 'Ergonomic Desk Chair',
      brand: 'Herman Miller',
      category: 'Furniture',
      condition: 'Excellent',
      serialNumber: 'SN-AER-12093',
      purchaseDate: new Date('2024-01-09'),
      purchasePrice: 1650,
      currentValue: 1500,
      imageUrl: '/assets/chair.png',
    },
  })

  const vacuum = await prisma.asset.create({
    data: {
      homeId: skyline.id,
      roomId: greatRoom.id,
      name: 'Robotic Vacuum',
      brand: 'iRobot',
      category: 'Appliance',
      condition: 'Good',
      serialNumber: 'SN-J7-55021',
      purchaseDate: new Date('2023-09-15'),
      purchasePrice: 799,
      currentValue: 450,
      imageUrl: '/assets/vacuum.png',
    },
  })

  const charger = await prisma.asset.create({
    data: {
      homeId: skyline.id,
      roomId: garage.id,
      name: 'Electric SUV Charger',
      brand: 'Tesla',
      category: 'Equipment',
      condition: 'Excellent',
      serialNumber: 'SN-WC3-77410',
      purchaseDate: new Date('2023-05-30'),
      purchasePrice: 1450,
      currentValue: 1300,
      imageUrl: '/assets/charger.png',
    },
  })

  await prisma.asset.create({
    data: {
      homeId: skyline.id,
      roomId: bedroom.id,
      name: 'King Platform Bed',
      brand: 'Thuma',
      category: 'Furniture',
      condition: 'Excellent',
      serialNumber: 'SN-TB-33110',
      purchaseDate: new Date('2022-02-18'),
      purchasePrice: 1195,
      currentValue: 1000,
      imageUrl: '/assets/bed.png',
    },
  })

  const washer = await prisma.asset.create({
    data: {
      homeId: lakeview.id,
      roomId: cottageKitchen.id,
      name: 'Front-Load Washer',
      brand: 'Bosch',
      category: 'Appliance',
      condition: 'Good',
      serialNumber: 'SN-WAT-20981',
      purchaseDate: new Date('2020-10-02'),
      purchasePrice: 1099,
      currentValue: 600,
      imageUrl: '/assets/washer.png',
    },
  })

  await prisma.warranty.createMany({
    data: [
      {
        assetId: fridge.id,
        provider: 'Samsung Care+',
        coverage: 'Parts & Labor',
        startDate: new Date('2023-03-12'),
        expiryDate: new Date('2026-03-12'),
        status: 'Active',
      },
      {
        assetId: tv.id,
        provider: 'LG Premium',
        coverage: 'Panel & Electronics',
        startDate: new Date('2022-11-04'),
        expiryDate: new Date('2025-11-04'),
        status: 'ExpiringSoon',
      },
      {
        assetId: chair.id,
        provider: 'Herman Miller 12yr',
        coverage: 'Full Structural',
        startDate: new Date('2024-01-09'),
        expiryDate: new Date('2036-01-09'),
        status: 'Active',
      },
      {
        assetId: vacuum.id,
        provider: 'iRobot Protect',
        coverage: 'Manufacturer',
        startDate: new Date('2023-09-15'),
        expiryDate: new Date('2025-09-15'),
        status: 'Active',
      },
      {
        assetId: espresso.id,
        provider: 'Breville Standard',
        coverage: 'Manufacturer',
        startDate: new Date('2021-06-21'),
        expiryDate: new Date('2023-06-21'),
        status: 'Expired',
      },
      {
        assetId: charger.id,
        provider: 'Tesla Warranty',
        coverage: 'Parts & Labor',
        startDate: new Date('2023-05-30'),
        expiryDate: new Date('2027-05-30'),
        status: 'Active',
      },
    ],
  })

  await prisma.maintenanceRecord.createMany({
    data: [
      {
        assetId: fridge.id,
        type: 'Cleaning',
        date: new Date('2025-08-02'),
        cost: 0,
        provider: 'Self',
        notes: 'Replaced water filter and cleaned condenser coils.',
      },
      {
        assetId: charger.id,
        type: 'Inspection',
        date: new Date('2025-07-18'),
        cost: 120,
        provider: 'Volt Electric',
        notes: 'Annual safety inspection, all connections verified.',
      },
      {
        assetId: washer.id,
        type: 'Repair',
        date: new Date('2025-06-11'),
        cost: 245,
        provider: 'Bosch Service',
        notes: 'Replaced drain pump and door seal.',
      },
      {
        assetId: tv.id,
        type: 'Service',
        date: new Date('2025-09-28'),
        cost: 0,
        provider: 'LG Technician',
        notes: 'Firmware calibration and panel check scheduled.',
        nextDueDate: new Date('2025-09-28'),
      },
      {
        assetId: vacuum.id,
        type: 'Replacement',
        date: new Date('2025-10-05'),
        cost: 79,
        provider: 'Self',
        notes: 'Replace brushes and HEPA filter.',
        nextDueDate: new Date('2025-10-05'),
      },
      {
        assetId: espresso.id,
        type: 'Cleaning',
        date: new Date('2025-10-12'),
        cost: 0,
        provider: 'Self',
        notes: 'Descaling cycle due.',
        nextDueDate: new Date('2025-10-12'),
      },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
