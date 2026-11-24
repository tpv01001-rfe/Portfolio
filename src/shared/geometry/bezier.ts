import type { Point2, Point3 } from "../math/point";
import { lerpVec2 } from "../math/vec2";
import { lerpVec3 } from "../math/vec3";

/**
 * Beräknar en punkt på en kvadratisk Bézierkurva med de Casteljaus algoritm.
 * p0 och p2 är ändpunkter; p1 är kontrollpunkt.
 * t = 0 ger p0 och t = 1 ger p2.
 * Funktionen tillåter även extrapolering utanför intervallet [0, 1].
 */
export function quadraticBezier2(p0: Point2, p1: Point2, p2: Point2, t: number): Point2 {
  const a = lerpVec2(p0, p1, t);
  const b = lerpVec2(p1, p2, t);
  return lerpVec2(a, b, t);
}

/** Beräknar en punkt på en kubisk Bézierkurva i två dimensioner. */
export function cubicBezier2(p0: Point2, p1: Point2, p2: Point2, p3: Point2, t: number): Point2 {
  const a = lerpVec2(p0, p1, t);
  const b = lerpVec2(p1, p2, t);
  const c = lerpVec2(p2, p3, t);
  const d = lerpVec2(a, b, t);
  const e = lerpVec2(b, c, t);
  return lerpVec2(d, e, t);
}

/** Beräknar en punkt på en kvadratisk Bézierkurva i tre dimensioner. */
export function quadraticBezier3(p0: Point3, p1: Point3, p2: Point3, t: number): Point3 {
  const a = lerpVec3(p0, p1, t);
  const b = lerpVec3(p1, p2, t);
  return lerpVec3(a, b, t);
}

/** Beräknar en punkt på en kubisk Bézierkurva i tre dimensioner. */
export function cubicBezier3(p0: Point3, p1: Point3, p2: Point3, p3: Point3, t: number): Point3 {
  const a = lerpVec3(p0, p1, t);
  const b = lerpVec3(p1, p2, t);
  const c = lerpVec3(p2, p3, t);
  const d = lerpVec3(a, b, t);
  const e = lerpVec3(b, c, t);
  return lerpVec3(d, e, t);
}
