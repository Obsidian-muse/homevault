'use client'

import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, Environment, RoundedBox, ContactShadows } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Sofa, ChefHat, UtensilsCrossed, Car, BedDouble, Bed, Bath, Monitor } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Theme tokens (kept in sync with app/globals.css dark theme)        */
/* ------------------------------------------------------------------ */
const PRIMARY = '#4f8cff'
const VIOLET = '#8b7cff'
const SUCCESS = '#10b981'
const WARNING = '#f59e0b'
const DANGER = '#ef4444'
const CARD_ELEVATED = '#171a21'

/* ------------------------------------------------------------------ */
/*  House layout constants                                             */
/* ------------------------------------------------------------------ */
const FLOOR_H = 2.35 // interior height of each storey
const SLAB = 0.12 // floor/ceiling slab thickness
const QUAD_W = 4 // quadrant width (x)
const QUAD_D = 3 // quadrant depth (z)
const UPPER_Y = FLOOR_H + SLAB // y of upper floor surface

type RoomId = 'living' | 'kitchen' | 'dining' | 'garage' | 'master' | 'guest' | 'bathroom' | 'office'

interface RoomDef {
  id: RoomId
  name: string
  floor: 0 | 1
  cx: number
  cz: number
  hasLeftWall: boolean
  hasBackWall: boolean
  icon: typeof Sofa
  accent: string
  floorColor: string
  assetCount: number
  warrantyCount: number
  maintenanceCount: number
}

const ROOMS: RoomDef[] = [
  {
    id: 'living',
    name: 'Living Room',
    floor: 0,
    cx: -2,
    cz: 1.5,
    hasLeftWall: true,
    hasBackWall: false,
    icon: Sofa,
    accent: VIOLET,
    floorColor: '#2b2f3a',
    assetCount: 5,
    warrantyCount: 3,
    maintenanceCount: 1,
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    floor: 0,
    cx: -2,
    cz: -1.5,
    hasLeftWall: true,
    hasBackWall: true,
    icon: ChefHat,
    accent: PRIMARY,
    floorColor: '#d9d3c7',
    assetCount: 6,
    warrantyCount: 4,
    maintenanceCount: 1,
  },
  {
    id: 'dining',
    name: 'Dining Room',
    floor: 0,
    cx: 2,
    cz: -1.5,
    hasLeftWall: false,
    hasBackWall: true,
    icon: UtensilsCrossed,
    accent: PRIMARY,
    floorColor: '#5a4331',
    assetCount: 3,
    warrantyCount: 2,
    maintenanceCount: 0,
  },
  {
    id: 'garage',
    name: 'Garage',
    floor: 0,
    cx: 2,
    cz: 1.5,
    hasLeftWall: false,
    hasBackWall: false,
    icon: Car,
    accent: WARNING,
    floorColor: '#45484f',
    assetCount: 3,
    warrantyCount: 1,
    maintenanceCount: 2,
  },
  {
    id: 'master',
    name: 'Master Bedroom',
    floor: 1,
    cx: -2,
    cz: 1.5,
    hasLeftWall: true,
    hasBackWall: false,
    icon: BedDouble,
    accent: VIOLET,
    floorColor: '#4a3a2c',
    assetCount: 4,
    warrantyCount: 3,
    maintenanceCount: 1,
  },
  {
    id: 'guest',
    name: 'Guest Bedroom',
    floor: 1,
    cx: -2,
    cz: -1.5,
    hasLeftWall: true,
    hasBackWall: true,
    icon: Bed,
    accent: PRIMARY,
    floorColor: '#3f3324',
    assetCount: 2,
    warrantyCount: 2,
    maintenanceCount: 0,
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    floor: 1,
    cx: 2,
    cz: -1.5,
    hasLeftWall: false,
    hasBackWall: true,
    icon: Bath,
    accent: PRIMARY,
    floorColor: '#c7d6de',
    assetCount: 2,
    warrantyCount: 1,
    maintenanceCount: 1,
  },
  {
    id: 'office',
    name: 'Home Office',
    floor: 1,
    cx: 2,
    cz: 1.5,
    hasLeftWall: false,
    hasBackWall: false,
    icon: Monitor,
    accent: VIOLET,
    floorColor: '#33384a',
    assetCount: 4,
    warrantyCount: 3,
    maintenanceCount: 1,
  },
]

interface AssetDef {
  id: string
  name: string
  subtitle: string
  room: RoomId
  purchaseDate: string
  expiresOn: string
  status: 'active' | 'expiring' | 'expired'
  condition: string
  local: [number, number, number]
}

const ASSETS: AssetDef[] = [
  {
    id: 'tv',
    name: 'Smart TV',
    subtitle: 'Samsung QLED 55"',
    room: 'living',
    purchaseDate: '12 Mar 2023',
    expiresOn: '12 Mar 2026',
    status: 'active',
    condition: 'Excellent',
    local: [-1.9, 1.05, -0.8],
  },
  {
    id: 'fridge',
    name: 'Refrigerator',
    subtitle: 'French Door 22 cu.ft',
    room: 'kitchen',
    purchaseDate: '02 Jan 2021',
    expiresOn: '02 Jan 2024',
    status: 'expired',
    condition: 'Fair',
    local: [-1.6, 0.8, -1.15],
  },
  {
    id: 'car',
    name: 'Family SUV',
    subtitle: '2022 Model',
    room: 'garage',
    purchaseDate: '18 Jul 2022',
    expiresOn: '18 Jul 2027',
    status: 'active',
    condition: 'Excellent',
    local: [0.1, 0.45, 0.2],
  },
  {
    id: 'washer',
    name: 'Washing Machine',
    subtitle: 'Front Load 9kg',
    room: 'bathroom',
    purchaseDate: '05 Sep 2024',
    expiresOn: '05 Sep 2026',
    status: 'expiring',
    condition: 'Good',
    local: [1.3, 0.55, -1.15],
  },
  {
    id: 'desktop',
    name: 'Desktop Setup',
    subtitle: 'Workstation + Monitor',
    room: 'office',
    purchaseDate: '22 Aug 2023',
    expiresOn: '22 Aug 2025',
    status: 'expiring',
    condition: 'Excellent',
    local: [0.5, 0.85, -0.6],
  },
]

const statusColor = (s: AssetDef['status']) => (s === 'active' ? SUCCESS : s === 'expiring' ? WARNING : DANGER)

/* ------------------------------------------------------------------ */
/*  Furniture primitives                                                */
/* ------------------------------------------------------------------ */
function Sofa3D({ position, rotation = 0, color = '#3d4356' }: { position: [number, number, number]; rotation?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} castShadow>
      <RoundedBox args={[1.7, 0.32, 0.75]} radius={0.05} smoothness={2} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[1.7, 0.42, 0.18]} radius={0.06} smoothness={2} position={[0, 0.42, -0.29]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.4, 0.75]} radius={0.05} smoothness={2} position={[-0.76, 0.36, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.4, 0.75]} radius={0.05} smoothness={2} position={[0.76, 0.36, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
    </group>
  )
}

function CoffeeTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.7, 0.05, 0.45]} radius={0.02} position={[0, 0.24, 0]} castShadow>
        <meshStandardMaterial color="#8a6244" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      {[
        [-0.3, -0.18],
        [0.3, -0.18],
        [-0.3, 0.18],
        [0.3, 0.18],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#3a2a20" />
        </mesh>
      ))}
    </group>
  )
}

function WallTV({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.9, 0.5, 0.04]} radius={0.02} castShadow>
        <meshStandardMaterial color="#0a0b0f" roughness={0.2} metalness={0.4} emissive={PRIMARY} emissiveIntensity={0.25} />
      </RoundedBox>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.06, 0.2, 0.06]} />
        <meshStandardMaterial color="#20232c" />
      </mesh>
    </group>
  )
}

function Fridge({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.65, 1.55, 0.6]} radius={0.04} position={[0, 0.78, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#c7ccd6" roughness={0.35} metalness={0.5} />
      </RoundedBox>
      <mesh position={[0.28, 1.1, 0.31]}>
        <boxGeometry args={[0.03, 0.35, 0.03]} />
        <meshStandardMaterial color="#8a8f9c" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0.28, 0.55, 0.31]}>
        <boxGeometry args={[0.03, 0.5, 0.03]} />
        <meshStandardMaterial color="#8a8f9c" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  )
}

function KitchenCounter({ position, length = 2.2 }: { position: [number, number, number]; length?: number }) {
  return (
    <group position={position}>
      <RoundedBox args={[length, 0.85, 0.55]} radius={0.02} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e7e2d6" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[length + 0.04, 0.05, 0.58]} radius={0.02} position={[0, 0.87, 0]} castShadow>
        <meshStandardMaterial color="#2b2f3a" roughness={0.2} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.87, 0.16]}>
        <boxGeometry args={[0.35, 0.02, 0.24]} />
        <meshStandardMaterial color="#161820" />
      </mesh>
    </group>
  )
}

function Microwave({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.45, 0.28, 0.35]} />
      <meshStandardMaterial color="#1b1d24" roughness={0.3} metalness={0.4} emissive={PRIMARY} emissiveIntensity={0.08} />
    </mesh>
  )
}

function DiningTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.3, 0.06, 0.85]} radius={0.02} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#6b4a34" roughness={0.45} />
      </RoundedBox>
      {[
        [-0.55, -0.3],
        [0.55, -0.3],
        [-0.55, 0.3],
        [0.55, 0.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.21, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
          <meshStandardMaterial color="#4a3324" />
        </mesh>
      ))}
    </group>
  )
}

function Chair({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.36, 0.05, 0.36]} radius={0.02} position={[0, 0.24, 0]} castShadow>
        <meshStandardMaterial color="#5a4a68" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.36, 0.4, 0.05]} radius={0.02} position={[0, 0.45, -0.17]} castShadow>
        <meshStandardMaterial color="#5a4a68" roughness={0.6} />
      </RoundedBox>
    </group>
  )
}

function GarageCar({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} castShadow>
      <RoundedBox args={[1.9, 0.42, 0.9]} radius={0.08} position={[0, 0.32, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d4a24c" roughness={0.3} metalness={0.5} />
      </RoundedBox>
      <RoundedBox args={[1.0, 0.34, 0.82]} radius={0.1} position={[-0.05, 0.63, 0]} castShadow>
        <meshStandardMaterial color="#171a21" roughness={0.15} metalness={0.3} transparent opacity={0.85} />
      </RoundedBox>
      {[
        [-0.65, -0.42],
        [0.65, -0.42],
        [-0.65, 0.42],
        [0.65, 0.42],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.16, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.16, 16]} />
          <meshStandardMaterial color="#111318" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.96, 0.4, 0]}>
        <boxGeometry args={[0.05, 0.15, 0.6]} />
        <meshStandardMaterial color="#fff7e0" emissive="#fff7e0" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function ToolCabinet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.7, 1.1, 0.4]} radius={0.03} position={[0, 0.55, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3a3f4d" roughness={0.5} metalness={0.2} />
      </RoundedBox>
      {[0.28, 0.55, 0.82].map((y, i) => (
        <mesh key={i} position={[0, y, 0.21]}>
          <boxGeometry args={[0.62, 0.02, 0.02]} />
          <meshStandardMaterial color="#171a21" />
        </mesh>
      ))}
    </group>
  )
}

function BedFurniture({
  position,
  rotation = 0,
  size = 'double',
}: {
  position: [number, number, number]
  rotation?: number
  size?: 'double' | 'single'
}) {
  const w = size === 'double' ? 1.5 : 0.95
  return (
    <group position={position} rotation={[0, rotation, 0]} castShadow>
      <RoundedBox args={[w, 0.24, 2.0]} radius={0.04} position={[0, 0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#5a4331" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[w - 0.06, 0.18, 1.9]} radius={0.05} position={[0, 0.33, 0]} castShadow>
        <meshStandardMaterial color="#e8e4da" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[w * 0.42, 0.1, 0.32]} radius={0.04} position={[-w * 0.22, 0.46, -0.75]} castShadow>
        <meshStandardMaterial color="#f5f2ec" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[w * 0.42, 0.1, 0.32]} radius={0.04} position={[w * 0.22, 0.46, -0.75]} castShadow>
        <meshStandardMaterial color="#f5f2ec" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[w + 0.06, 0.6, 0.08]} radius={0.03} position={[0, 0.5, -1.02]} castShadow>
        <meshStandardMaterial color="#3a2a20" roughness={0.5} />
      </RoundedBox>
    </group>
  )
}

function Wardrobe({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.55, 1.7, 0.55]} radius={0.03} position={[0, 0.85, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#4a3324" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.85, 0.28]}>
        <boxGeometry args={[0.02, 1.6, 0.02]} />
        <meshStandardMaterial color="#1c1410" />
      </mesh>
    </group>
  )
}

function DeskFurniture({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.95, 0.04, 0.55]} radius={0.01} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color="#6b4a34" roughness={0.4} />
      </RoundedBox>
      {[
        [-0.42, -0.22],
        [0.42, -0.22],
        [-0.42, 0.22],
        [0.42, 0.22],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.21, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.42, 6]} />
          <meshStandardMaterial color="#2b2f3a" />
        </mesh>
      ))}
    </group>
  )
}

function WashingMachine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.55, 0.6, 0.55]} radius={0.03} position={[0, 0.3, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e9edf2" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      <mesh position={[0, 0.3, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 20]} />
        <meshStandardMaterial color="#171a21" roughness={0.1} metalness={0.6} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

function WaterHeater({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.95, 16]} />
      <meshStandardMaterial color="#c8ccd4" roughness={0.35} metalness={0.5} />
    </mesh>
  )
}

function DesktopSetup({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[1.1, 0.04, 0.55]} radius={0.01} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#20232c" roughness={0.35} metalness={0.2} />
      </RoundedBox>
      {[
        [-0.48, -0.22],
        [0.48, -0.22],
        [-0.48, 0.22],
        [0.48, 0.22],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.21, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.42, 6]} />
          <meshStandardMaterial color="#171a21" />
        </mesh>
      ))}
      <RoundedBox args={[0.55, 0.32, 0.03]} radius={0.02} position={[0, 0.68, -0.18]} castShadow>
        <meshStandardMaterial color="#0a0b0f" emissive={VIOLET} emissiveIntensity={0.3} metalness={0.3} roughness={0.2} />
      </RoundedBox>
      <mesh position={[0.4, 0.46, 0.15]}>
        <boxGeometry args={[0.2, 0.12, 0.25]} />
        <meshStandardMaterial color="#e9edf2" roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Per-room furniture arrangements                                     */
/* ------------------------------------------------------------------ */
function RoomFurniture({ id }: { id: RoomId }) {
  switch (id) {
    case 'living':
      return (
        <>
          <WallTV position={[-1.85, 1.0, -0.8]} rotation={Math.PI / 2} />
          <Sofa3D position={[-0.3, 0, -0.8]} rotation={-Math.PI / 2} />
          <CoffeeTable position={[-1.05, 0, -0.8]} />
        </>
      )
    case 'kitchen':
      return (
        <>
          <KitchenCounter position={[0.1, 0, -1.15]} length={2.6} />
          <Fridge position={[-1.6, 0, -1.15]} />
          <Microwave position={[0.5, 0.87, -1.18]} />
        </>
      )
    case 'dining':
      return (
        <>
          <DiningTable position={[0.2, 0, -0.3]} />
          <Chair position={[0.2, 0, -0.85]} rotation={Math.PI} />
          <Chair position={[0.2, 0, 0.25]} rotation={0} />
          <Chair position={[-0.55, 0, -0.3]} rotation={Math.PI / 2} />
          <Chair position={[0.95, 0, -0.3]} rotation={-Math.PI / 2} />
        </>
      )
    case 'garage':
      return (
        <>
          <GarageCar position={[0.0, 0, 0.3]} rotation={0.08} />
          <ToolCabinet position={[1.55, 0, -1.0]} />
        </>
      )
    case 'master':
      return (
        <>
          <BedFurniture position={[-1.15, 0, 0.3]} rotation={Math.PI / 2} size="double" />
          <Wardrobe position={[-1.65, 0, -1.05]} rotation={Math.PI / 2} />
          <WallTV position={[0.9, 1.0, 0.6]} rotation={-Math.PI / 2} />
        </>
      )
    case 'guest':
      return (
        <>
          <BedFurniture position={[-0.55, 0, -0.75]} rotation={0} size="single" />
          <DeskFurniture position={[-1.65, 0, 0.7]} rotation={Math.PI / 2} />
        </>
      )
    case 'bathroom':
      return (
        <>
          <WashingMachine position={[1.3, 0, -1.15]} />
          <WaterHeater position={[0.35, 0.48, -1.2]} />
        </>
      )
    case 'office':
      return (
        <>
          <DesktopSetup position={[0.4, 0, -0.6]} rotation={0} />
        </>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/*  Room shell (floor tint, hover glow, hit box, walls)                 */
/* ------------------------------------------------------------------ */
function RoomShell({
  def,
  isHovered,
  onHoverRoom,
}: {
  def: RoomDef
  isHovered: boolean
  onHoverRoom: (id: RoomId | null) => void
}) {
  const glowRef = useRef<THREE.MeshStandardMaterial>(null)
  const baseY = def.floor === 0 ? 0 : UPPER_Y

  useFrame((_, delta) => {
    if (glowRef.current) {
      const target = isHovered ? 0.45 : 0
      glowRef.current.opacity = THREE.MathUtils.damp(glowRef.current.opacity, target, 6, delta)
    }
  })

  const handleEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHoverRoom(def.id)
  }
  const handleLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHoverRoom(null)
  }

  return (
    <group position={[def.cx, baseY, def.cz]}>
      {/* floor tint */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[QUAD_W - 0.06, QUAD_D - 0.06]} />
        <meshStandardMaterial color={def.floorColor} roughness={0.8} />
      </mesh>

      {/* hover glow overlay */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[QUAD_W - 0.1, QUAD_D - 0.1]} />
        <meshStandardMaterial
          ref={glowRef}
          color={def.accent}
          emissive={def.accent}
          emissiveIntensity={1}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* interaction volume */}
      <mesh
        position={[0, FLOOR_H / 2, 0]}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onPointerMove={(e) => e.stopPropagation()}
        visible={false}
      >
        <boxGeometry args={[QUAD_W, FLOOR_H, QUAD_D]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {isHovered && (
        <pointLight position={[0, 1.4, 0]} intensity={3} distance={5} color={def.accent} decay={2} />
      )}

      {/* exterior walls (only on the two non-open sides) */}
      {def.hasLeftWall && (
        <group position={[-QUAD_W / 2 + 0.05, FLOOR_H / 2, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[0.1, FLOOR_H, QUAD_D]} />
            <meshStandardMaterial color={CARD_ELEVATED} roughness={0.7} />
          </mesh>
          <mesh position={[0.06, FLOOR_H / 2 - 0.03, 0]}>
            <boxGeometry args={[0.03, 0.04, QUAD_D - 0.4]} />
            <meshStandardMaterial color={def.accent} emissive={def.accent} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
      )}
      {def.hasBackWall && (
        <group position={[0, FLOOR_H / 2, -QUAD_D / 2 + 0.05]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[QUAD_W, FLOOR_H, 0.1]} />
            <meshStandardMaterial color={CARD_ELEVATED} roughness={0.7} />
          </mesh>
          <mesh position={[0, FLOOR_H / 2 - 0.03, 0.06]}>
            <boxGeometry args={[QUAD_W - 0.4, 0.04, 0.03]} />
            <meshStandardMaterial color={def.accent} emissive={def.accent} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
      )}

      <RoomFurniture id={def.id} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Asset markers (small hover targets with tooltip data)               */
/* ------------------------------------------------------------------ */
function AssetMarker({
  asset,
  isHovered,
  onHover,
}: {
  asset: AssetDef
  isHovered: boolean
  onHover: (a: AssetDef | null) => void
}) {
  const def = ROOMS.find((r) => r.id === asset.room)!
  const baseY = def.floor === 0 ? 0 : UPPER_Y
  const color = statusColor(asset.status)
  const world: [number, number, number] = [
    def.cx + asset.local[0],
    baseY + asset.local[1],
    def.cz + asset.local[2],
  ]

  return (
    <mesh
      position={world}
      onPointerEnter={(e) => {
        e.stopPropagation()
        onHover(asset)
      }}
      onPointerLeave={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
      scale={isHovered ? 1.3 : 1}
    >
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHovered ? 0.9 : 0.4} />
      {isHovered && <pointLight intensity={1.2} distance={2} color={color} decay={2} />}
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene                                                               */
/* ------------------------------------------------------------------ */
function HouseGroup({
  hoveredRoom,
  setHoveredRoom,
  hoveredAsset,
  setHoveredAsset,
}: {
  hoveredRoom: RoomId | null
  setHoveredRoom: (id: RoomId | null) => void
  hoveredAsset: AssetDef | null
  setHoveredAsset: (a: AssetDef | null) => void
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime()
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.06
    }
  })

  return (
    <group ref={groupRef} position={[0, -1.1, 0]}>
      {/* foundation slab */}
      <mesh position={[0, -SLAB / 2, 0]} receiveShadow>
        <boxGeometry args={[8.2, SLAB, 6.2]} />
        <meshStandardMaterial color="#14161c" roughness={0.9} />
      </mesh>

      {/* mid slab between floors */}
      <mesh position={[0, FLOOR_H + SLAB / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.05, SLAB, 6.05]} />
        <meshStandardMaterial color="#e7e4dc" roughness={0.6} />
      </mesh>
      <mesh position={[0, FLOOR_H + SLAB - 0.005, 0]}>
        <boxGeometry args={[8.1, 0.02, 6.1]} />
        <meshStandardMaterial color={PRIMARY} emissive={PRIMARY} emissiveIntensity={1.2} toneMapped={false} transparent opacity={0.7} />
      </mesh>

      {/* quadrant seam lines for extra separation */}
      <mesh position={[0, 0.011, 0]}>
        <boxGeometry args={[0.03, 0.005, 6]} />
        <meshStandardMaterial color="#0a0b0f" />
      </mesh>
      <mesh position={[0, 0.011, -3]}>
        <boxGeometry args={[8, 0.005, 0.03]} />
        <meshStandardMaterial color="#0a0b0f" />
      </mesh>
      <mesh position={[0, UPPER_Y + 0.011, 0]}>
        <boxGeometry args={[0.03, 0.005, 6]} />
        <meshStandardMaterial color="#0a0b0f" />
      </mesh>

      {ROOMS.map((def) => (
        <RoomShell key={def.id} def={def} isHovered={hoveredRoom === def.id} onHoverRoom={setHoveredRoom} />
      ))}

      {ASSETS.map((a) => (
        <AssetMarker key={a.id} asset={a} isHovered={hoveredAsset?.id === a.id} onHover={setHoveredAsset} />
      ))}
    </group>
  )
}

function SmartHomeScene({
  hoveredRoom,
  setHoveredRoom,
  hoveredAsset,
  setHoveredAsset,
}: {
  hoveredRoom: RoomId | null
  setHoveredRoom: (id: RoomId | null) => void
  hoveredAsset: AssetDef | null
  setHoveredAsset: (a: AssetDef | null) => void
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame(() => {
    if (cameraRef.current) {
      const t = Date.now() * 0.00025
      cameraRef.current.position.x = 7.5 + Math.sin(t) * 0.35
      cameraRef.current.position.y = 5.8 + Math.cos(t * 0.7) * 0.2
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[7.5, 5.8, 8.5]} fov={38} />
      <OrbitControls
        target={[0, 0.6, 0]}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI * 0.48}
        minPolarAngle={Math.PI * 0.28}
      />

      <ambientLight intensity={0.55} color="#dfe6ff" />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.1}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} color={VIOLET} />
      <directionalLight position={[4, 2, -6]} intensity={0.3} color={PRIMARY} />

      {/* <Environment preset="city" /> */}
      <fog attach="fog" args={['#0f1115', 12, 24]} />

      <HouseGroup
        hoveredRoom={hoveredRoom}
        setHoveredRoom={setHoveredRoom}
        hoveredAsset={hoveredAsset}
        setHoveredAsset={setHoveredAsset}
      />

      <ContactShadows position={[0, -1.16, 0]} opacity={0.5} scale={14} blur={2.2} far={4} color="#000000" />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Exported component                                                  */
/* ------------------------------------------------------------------ */
export function SmartHome3D() {
  const [hoveredRoom, setHoveredRoom] = useState<RoomId | null>(null)
  const [hoveredAsset, setHoveredAsset] = useState<AssetDef | null>(null)

  const hoveredRoomDef = useMemo(() => ROOMS.find((r) => r.id === hoveredRoom) ?? null, [hoveredRoom])
  const totalAssets = useMemo(() => ROOMS.reduce((sum, r) => sum + r.assetCount, 0), [])
  const statusCounts = useMemo(
    () => ({
      active: ASSETS.filter((a) => a.status === 'active').length,
      expiring: ASSETS.filter((a) => a.status === 'expiring').length,
      expired: ASSETS.filter((a) => a.status === 'expired').length,
    }),
    []
  )

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full max-w-6xl">
        {/* ambient neon glow behind the card, matching the reference art */}
        <div className="pointer-events-none absolute -inset-6 -z-10">
          <div className="absolute left-1/2 top-[55%] size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/25 blur-[100px]" />
          <div className="absolute left-[15%] top-[20%] size-[45%] rounded-full bg-primary/20 blur-[90px]" />
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card-elevated to-card shadow-2xl">
          <Canvas shadows style={{ background: 'linear-gradient(to bottom, #11131a 0%, #1d212b 100%)' }}>
            <SmartHomeScene
              hoveredRoom={hoveredRoom}
              setHoveredRoom={setHoveredRoom}
              hoveredAsset={hoveredAsset}
              setHoveredAsset={setHoveredAsset}
            />
          </Canvas>

          {/* top-left caption, mirrors the reference composite */}
          <div className="pointer-events-none absolute left-5 top-5">
            <div className="text-sm font-medium text-foreground/90">Hover Over Rooms</div>
            <div className="text-xs text-primary">View Details</div>
          </div>
        </div>

        {/* Room / asset hover panel, top-right (matches reference "Living Room" card) */}
        <div className="pointer-events-none absolute right-6 top-6 z-10">
          <AnimatePresence>
            {hoveredRoomDef && (
              <motion.div
                key={hoveredRoomDef.id}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="glass-strong min-w-[190px] rounded-xl border border-border/50 p-4 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-7 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${hoveredRoomDef.accent}26`, color: hoveredRoomDef.accent }}
                  >
                    <hoveredRoomDef.icon className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{hoveredRoomDef.name}</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">Assets</span>
                    <span className="font-medium text-foreground">{hoveredRoomDef.assetCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">Warranties</span>
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <span className="size-1.5 rounded-full bg-success" />
                      {hoveredRoomDef.warrantyCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">Maintenance</span>
                    <span className="font-medium text-foreground">{hoveredRoomDef.maintenanceCount}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Asset tooltip, bottom-left (matches reference "Smart TV" card) */}
        <div className="absolute bottom-6 left-6 z-10">
          <AnimatePresence mode="wait">
            {hoveredAsset ? (
              <motion.div
                key={hoveredAsset.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="glass-strong min-w-[210px] rounded-xl border border-border/50 p-4 shadow-xl backdrop-blur-sm"
              >
                <div className="text-sm font-semibold text-foreground">{hoveredAsset.name}</div>
                <div className="text-xs text-muted-foreground">{hoveredAsset.subtitle}</div>
                <div className="mt-2.5 space-y-1 text-xs">
                  <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">Purchase Date</span>
                    <span className="text-foreground">{hoveredAsset.purchaseDate}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">Warranty Status</span>
                    <span className="flex items-center gap-1.5 capitalize text-foreground">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: statusColor(hoveredAsset.status) }}
                      />
                      {hoveredAsset.status}
                    </span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">Expires On</span>
                    <span className="text-foreground">{hoveredAsset.expiresOn}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="text-foreground">{hoveredAsset.condition}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-strong rounded-xl border border-border/50 p-4 shadow-xl backdrop-blur-sm"
              >
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Hover Over Assets
                </div>
                <div className="mt-1 text-sm text-primary">View Information</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Total assets + warranty legend, bottom-right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong absolute bottom-6 right-6 z-10 rounded-xl border border-border/50 p-4 backdrop-blur-sm"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Assets</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{totalAssets}</div>
          <div className="mt-3 flex gap-3 border-t border-border/50 pt-3">
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-success" />
              <span className="text-xs text-foreground">{statusCounts.active}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-warning" />
              <span className="text-xs text-foreground">{statusCounts.expiring}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-destructive" />
              <span className="text-xs text-foreground">{statusCounts.expired}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
