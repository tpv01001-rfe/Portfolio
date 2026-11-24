import type { Vec3 } from "./vec3";

/** Vikter för barycentrisk interpolation. */
export type BarycentricWeights = {
  alpha: number;
  beta: number;
  gamma: number;
};

/** Interpolerar tre Vec3-värden med barycentriska vikter. */
export function interpolateBarycentricVec3(
  a: Vec3,
  b: Vec3,
  c: Vec3,
  weights: BarycentricWeights
): Vec3 {
  return {
    x: weights.alpha * a.x + weights.beta * b.x + weights.gamma * c.x,
    y: weights.alpha * a.y + weights.beta * b.y + weights.gamma * c.y,
    z: weights.alpha * a.z + weights.beta * b.z + weights.gamma * c.z,
  };
}
