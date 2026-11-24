import type { Point2, Point3 } from "../math/point";
import { cubicBezier2, cubicBezier3, quadraticBezier2, quadraticBezier3 } from "./bezier";

/**
 * Samplar en kurva med lika stora steg i parametern t.
 * Båda ändpunkterna ingår. Punkterna är inte nödvändigtvis jämnt fördelade i längd.
 */
export function sampleBezier<T>(evaluate: (t: number) => T, segments: number): T[] {
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError("Antalet segment måste vara ett positivt heltal.");
  }
  const points: T[] = [];
  for (let i = 0; i <= segments; i++) {
    points.push(evaluate(i / segments));
  }
  return points;
}

/** Samplar en kvadratisk Bézierkurva i 2D. */
export function sampleQuadraticBezier2(p0: Point2, p1: Point2, p2: Point2, segments: number): Point2[] {
  return sampleBezier((t) => quadraticBezier2(p0, p1, p2, t), segments);
}

/** Samplar en kubisk Bézierkurva i 2D. */
export function sampleCubicBezier2(p0: Point2, p1: Point2, p2: Point2, p3: Point2, segments: number): Point2[] {
  return sampleBezier((t) => cubicBezier2(p0, p1, p2, p3, t), segments);
}

/** Samplar en kvadratisk Bézierkurva i 3D. */
export function sampleQuadraticBezier3(p0: Point3, p1: Point3, p2: Point3, segments: number): Point3[] {
  return sampleBezier((t) => quadraticBezier3(p0, p1, p2, t), segments);
}

/** Samplar en kubisk Bézierkurva i 3D. */
export function sampleCubicBezier3(p0: Point3, p1: Point3, p2: Point3, p3: Point3, segments: number): Point3[] {
  return sampleBezier((t) => cubicBezier3(p0, p1, p2, p3, t), segments);
}
