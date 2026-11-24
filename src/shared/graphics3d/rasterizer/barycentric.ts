
import type { Vec2 } from "../../math/vec2";

import {
  subtractVec2,
  determinantVec2,
} from "../../math/vec2";

export type Barycentric = {
  alpha: number;
  beta: number;
  gamma: number;
};

export function barycentricCoordinates(
  p: Vec2,
  a: Vec2,
  b: Vec2,
  c: Vec2
): Barycentric | null {
  // Utgå från hörnet C.
  const ca = subtractVec2(a, c);
  const cb = subtractVec2(b, c);
  const cp = subtractVec2(p, c);

  // Dubbla den orienterade triangelarean.
  const denominator = determinantVec2(ca, cb);

  // Degenererad triangel.
  if (Math.abs(denominator) < 1e-12) {
    return null;
  }

  // Cramers regel.
  const alpha =
    determinantVec2(cp, cb) / denominator;

  const beta =
    determinantVec2(ca, cp) / denominator;

  const gamma = 1 - alpha - beta;

  return { alpha, beta, gamma };
}

/**
 * Kontrollerar om en punkt ligger inuti
 * eller på kanten av triangeln.
 */
export function isInsideTriangle(
  barycentric: Barycentric,
  epsilon = 1e-10
): boolean {
  const { alpha, beta, gamma } = barycentric;

  return (
    alpha >= -epsilon &&
    beta >= -epsilon &&
    gamma >= -epsilon
  );
}
