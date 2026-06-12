import type { Point } from '@/types/canvas';
import type { ConnectionSide, PlacedSymbol, SymbolDefinition } from '@/types/symbols';

/**
 * World-coordinate data for a connection point on a placed symbol.
 * Takes symbol rotation into account so left/right/top/bottom mean the right
 * thing after rotating.
 */
export interface ResolvedConnectionPoint {
  x: number;
  y: number;
  side: ConnectionSide;
}

const ROTATION_MAP: Record<number, Record<ConnectionSide, ConnectionSide>> = {
  0: { top: 'top', right: 'right', bottom: 'bottom', left: 'left' },
  90: { top: 'right', right: 'bottom', bottom: 'left', left: 'top' },
  180: { top: 'bottom', right: 'left', bottom: 'top', left: 'right' },
  270: { top: 'left', right: 'top', bottom: 'right', left: 'bottom' },
};

const normalizeRotation = (rotation: number): 0 | 90 | 180 | 270 => {
  const r = (((rotation % 360) + 360) % 360) as 0 | 90 | 180 | 270;
  if (r === 0 || r === 90 || r === 180 || r === 270) return r;
  return 0;
};

/** Returns the world coordinates and outward direction of a connection point. */
export const resolveConnectionPoint = (
  symbol: PlacedSymbol,
  def: SymbolDefinition,
  connectionPointId: string
): ResolvedConnectionPoint | null => {
  const cp = def.connectionPoints.find((p) => p.id === connectionPointId);
  if (!cp) return null;

  const rot = normalizeRotation(symbol.rotation);
  const { width: w, height: h } = def;

  // Local coordinates (origin = top-left of unrotated bbox)
  let lx = cp.x;
  let ly = cp.y;

  // Rotate the local point around the symbol center (w/2, h/2)
  const cx = w / 2;
  const cy = h / 2;
  let relX = lx - cx;
  let relY = ly - cy;

  // After rotation, the bounding box around origin may also flip — we need
  // to account for that when placing relative to symbol.position.
  let rotatedX = relX;
  let rotatedY = relY;
  let bboxW = w;
  let bboxH = h;

  switch (rot) {
    case 0:
      break;
    case 90:
      rotatedX = -relY;
      rotatedY = relX;
      bboxW = h;
      bboxH = w;
      break;
    case 180:
      rotatedX = -relX;
      rotatedY = -relY;
      break;
    case 270:
      rotatedX = relY;
      rotatedY = -relX;
      bboxW = h;
      bboxH = w;
      break;
  }

  const worldX = symbol.position.x + rotatedX + bboxW / 2;
  const worldY = symbol.position.y + rotatedY + bboxH / 2;

  return {
    x: worldX,
    y: worldY,
    side: ROTATION_MAP[rot][cp.position],
  };
};

const outwardDelta = (side: ConnectionSide): Point => {
  switch (side) {
    case 'top':
      return { x: 0, y: -1 };
    case 'bottom':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
};

const STUB_LENGTH = 12;

/**
 * Orthogonal routing between two connection points.
 * Produces a polyline starting at A, with an outward stub, then one or two
 * right-angle segments, an inward stub, ending at B.
 */
export const routeWire = (
  a: ResolvedConnectionPoint,
  b: ResolvedConnectionPoint
): Point[] => {
  const aOut = outwardDelta(a.side);
  const bOut = outwardDelta(b.side);

  const aStub: Point = { x: a.x + aOut.x * STUB_LENGTH, y: a.y + aOut.y * STUB_LENGTH };
  const bStub: Point = { x: b.x + bOut.x * STUB_LENGTH, y: b.y + bOut.y * STUB_LENGTH };

  const horizontalA = aOut.x !== 0;
  const horizontalB = bOut.x !== 0;

  const points: Point[] = [{ x: a.x, y: a.y }, aStub];

  if (horizontalA && horizontalB) {
    // Both exits horizontal: use a midpoint X to create a Z-bend
    const midX = (aStub.x + bStub.x) / 2;
    points.push({ x: midX, y: aStub.y });
    points.push({ x: midX, y: bStub.y });
  } else if (!horizontalA && !horizontalB) {
    // Both exits vertical: use midpoint Y for Z-bend
    const midY = (aStub.y + bStub.y) / 2;
    points.push({ x: aStub.x, y: midY });
    points.push({ x: bStub.x, y: midY });
  } else if (horizontalA && !horizontalB) {
    // L-bend: horizontal from A then vertical into B
    points.push({ x: bStub.x, y: aStub.y });
  } else {
    // Vertical from A then horizontal into B
    points.push({ x: aStub.x, y: bStub.y });
  }

  points.push(bStub);
  points.push({ x: b.x, y: b.y });

  return simplifyCollinear(points);
};

/** Remove consecutive collinear points to keep the polyline minimal. */
const simplifyCollinear = (points: Point[]): Point[] => {
  if (points.length < 3) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = out[out.length - 1];
    const cur = points[i];
    const next = points[i + 1];
    const sameX = prev.x === cur.x && cur.x === next.x;
    const sameY = prev.y === cur.y && cur.y === next.y;
    if (!sameX && !sameY) out.push(cur);
  }
  out.push(points[points.length - 1]);
  return out;
};

/** Flatten points to a Konva Line-friendly number array. */
export const pointsToArray = (points: Point[]): number[] =>
  points.flatMap((p) => [p.x, p.y]);
