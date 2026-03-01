export interface Point {
  x: number
  y: number
}

export interface AABB {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * Four corners of a rectangle centered at (cx, cy) with width w, height h, rotated by angle (degrees).
 */
export function getRotatedRectVertices(
  cx: number,
  cy: number,
  w: number,
  h: number,
  angleDeg: number
): Point[] {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const hw = w / 2
  const hh = h / 2
  return [
    { x: cx + (-hw) * cos - (-hh) * sin, y: cy + (-hw) * sin + (-hh) * cos },
    { x: cx + (hw) * cos - (-hh) * sin, y: cy + (hw) * sin + (-hh) * cos },
    { x: cx + (hw) * cos - (hh) * sin, y: cy + (hw) * sin + (hh) * cos },
    { x: cx + (-hw) * cos - (hh) * sin, y: cy + (-hw) * sin + (hh) * cos },
  ]
}

export function getAABBFromVertices(vertices: Point[]): AABB {
  let minX = vertices[0].x
  let minY = vertices[0].y
  let maxX = vertices[0].x
  let maxY = vertices[0].y
  for (let i = 1; i < vertices.length; i++) {
    minX = Math.min(minX, vertices[i].x)
    minY = Math.min(minY, vertices[i].y)
    maxX = Math.max(maxX, vertices[i].x)
    maxY = Math.max(maxY, vertices[i].y)
  }
  return { minX, minY, maxX, maxY }
}

export function getAABB(cx: number, cy: number, w: number, h: number, angleDeg: number): AABB {
  const vertices = getRotatedRectVertices(cx, cy, w, h, angleDeg)
  return getAABBFromVertices(vertices)
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY
}

export function pointInCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy <= r * r
}

export function verticesInCircle(vertices: Point[], cx: number, cy: number, r: number): boolean {
  return vertices.every((v) => pointInCircle(v.x, v.y, cx, cy, r))
}

// --- Radial (circle-to-circle) collision for circular tokens ---

/** Radius of a circular token from its size (display uses max(w,h) as diameter). */
export function getCircleRadius(width: number, height: number): number {
  return Math.max(width, height) / 2
}

/** Distance between two centers. */
export function radialDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1)
}

/** Overlap factor 0.90 = allow 10% tuck (no collision if distance >= (r1+r2)*0.90). */
const RADIAL_OVERLAP_FACTOR = 0.9

/**
 * True if the two circles overlap beyond the allowed threshold.
 * Collision when: distance < (r1 + r2) * overlapFactor.
 */
export function circlesCollide(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  overlapFactor: number = RADIAL_OVERLAP_FACTOR
): boolean {
  const d = radialDistance(x1, y1, x2, y2)
  return d < (r1 + r2) * overlapFactor
}

/**
 * Returns how much the circles overlap (0 = no overlap). Used to find "least overlap" position.
 */
export function radialOverlapAmount(
  distance: number,
  r1: number,
  r2: number,
  overlapFactor: number = RADIAL_OVERLAP_FACTOR
): number {
  const minDist = (r1 + r2) * overlapFactor
  return Math.max(0, minDist - distance)
}
