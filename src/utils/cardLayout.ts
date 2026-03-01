import seedrandom from 'seedrandom'
import type { Placement } from '../context/AppContext'

const MAX_SIZE_RATIO = 0.35
/** Minimum symbol diameter as fraction of card diameter. */
const MIN_SIZE_RATIO = 0.22

/** For dense cards, allow slightly smaller so they fit; clamped by MIN_SIZE_RATIO. */
function getMinSizeRatio(symbolsPerCard: number): number {
  if (symbolsPerCard >= 12) return 0.12
  if (symbolsPerCard >= 8) return 0.18
  return 0.22
}

/** Size tier scale multipliers for gameplay variation. */
const TIER_GIANT_LOW = 1.6
const TIER_MEDIUM = 1.0
const TIER_SMALL_LOW = 0.7
const TIER_GIANT_HIGH = 1.5
const TIER_BIG = 1.2
const TIER_MEDIUM_HIGH = 0.9
const TIER_SMALL_HIGH = 0.65

/**
 * Returns an array of scale multipliers for N symbols (tiered sizing).
 * - N <= 6: 1× Giant (1.6), rest random mix of Medium (1.0) and Small (0.7).
 * - N > 6: 1× Giant (1.5), 2× Big (1.2), 3× Medium (0.9), rest Small (0.65).
 */
function distributeSizes(count: number, rng: () => number): number[] {
  const scales: number[] = []
  if (count <= 6) {
    scales.push(TIER_GIANT_LOW)
    for (let i = 1; i < count; i++) {
      scales.push(rng() < 0.5 ? TIER_MEDIUM : TIER_SMALL_LOW)
    }
  } else {
    scales.push(TIER_GIANT_HIGH)
    scales.push(TIER_BIG, TIER_BIG)
    scales.push(TIER_MEDIUM_HIGH, TIER_MEDIUM_HIGH, TIER_MEDIUM_HIGH)
    for (let i = 6; i < count; i++) {
      scales.push(TIER_SMALL_HIGH)
    }
  }
  return scales
}

function shuffleWithSeed<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ─── Force-Directed Physics Simulation (Graph-based layout) ─────────────────

interface PhysicsNode {
  imageIndex: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  minRadius: number
  maxRadius: number
  /** Mass for physics: larger nodes push smaller ones into gaps (mass ∝ radius²). */
  mass: number
}

const SIMULATION_ITERATIONS = 80
const GRAVITY_STRENGTH = 0.018
const REPULSION_STRENGTH = 0.4
const BOUNDARY_STRENGTH = 0.35
const PADDING = 4
const DAMPING = 0.82
const DT = 1
const BREATHE_SHRINK = 0.99
const BREATHE_GROW = 1.01
const STRESS_THRESHOLD = 0.5

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1)
}

function normalize(x: number, y: number): { x: number; y: number } | null {
  const d = Math.hypot(x, y)
  if (d < 1e-6) return null
  return { x: x / d, y: y / d }
}

/**
 * Compute layout for one card using **Force-Directed Physics Simulation**.
 * Nodes are attracted to the center, repel each other when overlapping, and
 * stay inside the card. Dynamic "breathing" resizes nodes by stress.
 * Coordinates are in "circle space" (center 0,0), radius = circleRadius.
 */
export function computeCardLayout(
  cardIndices: number[],
  circleRadius: number,
  cardIndex: number,
  symbolsPerCard: number
): Placement[] {
  const rng = seedrandom(`card-${cardIndex}`)
  const order = shuffleWithSeed([...cardIndices], rng)
  const padding = circleRadius * 0.06
  const safeRadius = circleRadius - padding
  const effectiveMinRatio = Math.max(MIN_SIZE_RATIO, getMinSizeRatio(symbolsPerCard))
  const globalMinRadius = circleRadius * effectiveMinRatio
  const globalMaxRadius = circleRadius * MAX_SIZE_RATIO

  // Tiered sizing: one scale per symbol, shuffled, then targetRadius = baseRadius * scale
  const baseRadius = circleRadius * 0.26
  const sizeScales = shuffleWithSeed(distributeSizes(order.length, rng), rng)

  // 1) Setup: init nodes with tiered target radius and mass (mass ∝ radius²)
  const nodes: PhysicsNode[] = order.map((imageIndex, i) => {
    const spread = safeRadius * 0.25
    const x = (rng() * 2 - 1) * spread
    const y = (rng() * 2 - 1) * spread
    const scale = sizeScales[i]
    const targetRadius = Math.max(
      globalMinRadius,
      Math.min(globalMaxRadius, baseRadius * scale)
    )
    const mass = targetRadius * targetRadius
    return {
      imageIndex,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: targetRadius,
      minRadius: targetRadius,
      maxRadius: targetRadius,
      mass,
    }
  })

  // 2) Physics loop
  for (let iter = 0; iter < SIMULATION_ITERATIONS; iter++) {
    const stressByNode: number[] = nodes.map(() => 0)

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      let ax = 0
      let ay = 0

      // A) Center gravity (attraction to 0,0)
      const dist = Math.hypot(n.x, n.y)
      if (dist > 1e-6) {
        const force = dist * GRAVITY_STRENGTH
        ax += (-n.x / dist) * force
        ay += (-n.y / dist) * force
      }

      // B) Collision repulsion (every pair). Force ∝ other radius; a = F/mass so small nodes move more.
      const refMass = baseRadius * baseRadius
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j]
        const d = distance(n.x, n.y, m.x, m.y)
        const minDist = n.radius + m.radius + PADDING
        if (d < minDist && d > 1e-6) {
          const overlap = minDist - d
          const dir = normalize(m.x - n.x, m.y - n.y)!
          const totalR = n.radius + m.radius
          const forceOnN = (overlap * REPULSION_STRENGTH * m.radius) / totalR
          const forceOnM = (overlap * REPULSION_STRENGTH * n.radius) / totalR
          const accelN = (forceOnN * refMass) / n.mass
          const accelM = (forceOnM * refMass) / m.mass
          ax -= dir.x * accelN
          ay -= dir.y * accelN
          m.vx += dir.x * accelM
          m.vy += dir.y * accelM
          stressByNode[i] += overlap
          stressByNode[j] += overlap
        }
      }

      // C) Boundary constraint
      const distFromCenter = Math.hypot(n.x, n.y)
      if (distFromCenter > safeRadius - n.radius) {
        const push = distFromCenter - (safeRadius - n.radius)
        if (distFromCenter > 1e-6) {
          const strength = push * BOUNDARY_STRENGTH
          ax -= (n.x / distFromCenter) * strength
          ay -= (n.y / distFromCenter) * strength
        }
      }

      n.vx += ax * DT
      n.vy += ay * DT
      n.vx *= DAMPING
      n.vy *= DAMPING
      n.x += n.vx * DT
      n.y += n.vy * DT
    }

    // D) Dynamic resizing ("breathing"): high stress → shrink, low stress → grow
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (stressByNode[i] > STRESS_THRESHOLD) {
        n.radius = Math.max(n.minRadius, n.radius * BREATHE_SHRINK)
      } else {
        n.radius = Math.min(n.maxRadius, n.radius * BREATHE_GROW)
      }
    }
  }

  // 3) Final render: convert to Placement[] (x, y, width, height, rotation)
  const placements: Placement[] = nodes.map((n) => {
    const size = n.radius * 2
    const w = size * (0.94 + rng() * 0.12)
    const h = size * (0.94 + rng() * 0.12)
    const rotation = rng() * 360
    return {
      imageIndex: n.imageIndex,
      x: n.x,
      y: n.y,
      width: w,
      height: h,
      rotation,
    }
  })

  return placements
}

const PREVIEW_RADIUS = 100

export function computeAllLayouts(
  cardData: number[][],
  symbolsPerCard: number
): Placement[][] {
  return cardData.map((indices, cardIndex) =>
    computeCardLayout(indices, PREVIEW_RADIUS, cardIndex, symbolsPerCard)
  )
}
