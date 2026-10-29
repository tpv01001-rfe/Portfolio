export type Position = [lng: number, lat: number];

const EPSILON = 1e-10;

function isPointOnSegment(
  point: Position,
  a: Position,
  b: Position
): boolean {
  const [px, py] = point;
  const [ax, ay] = a;
  const [bx, by] = b;

  const dx = bx - ax;
  const dy = by - ay;

  // Kontrollera om punkten ligger på linjen.
  const cross = (px - ax) * dy - (py - ay) * dx;

  if (Math.abs(cross) > EPSILON) {
    return false;
  }

  // Kontrollera om punkten ligger mellan ändpunkterna.
  const dot = (px - ax) * dx + (py - ay) * dy;
  const lengthSquared = dx * dx + dy * dy;

  return dot >= -EPSILON &&
         dot <= lengthSquared + EPSILON;
}

export function pointInPolygon(
  point: Position,
  polygon: Position[]
): boolean {
  if (polygon.length < 3) {
    return false;
  }

  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1;
       i < polygon.length;
       j = i++) {
    const a = polygon[j];
    const b = polygon[i];

    // Punkter på polygonens gräns räknas som innanför.
    if (isPointOnSegment(point, a, b)) {
      return true;
    }

    const [ax, ay] = a;
    const [bx, by] = b;

    // Undersök om en horisontell stråle från punkten
    // korsar polygonkanten.
    const intersects =
      (ay > py) !== (by > py) &&
      px < ((bx - ax) * (py - ay)) / (by - ay) + ax;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}