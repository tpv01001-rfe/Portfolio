
import type { Barycentric } from "./barycentric";

/**
 * Beräknar perspektivkorrekta barycentriska
 * vikter från skärmrummets barycentriska vikter.
 */
export function perspectiveCorrectWeights(
  bary: Barycentric,
  inverseWA: number,
  inverseWB: number,
  inverseWC: number
): Barycentric | null {
  const a = bary.alpha * inverseWA;
  const b = bary.beta * inverseWB;
  const c = bary.gamma * inverseWC;

  const sum = a + b + c;

  if (!Number.isFinite(sum) || sum <= 0) {
    return null;
  }

  const invSum = 1 / sum;

  return {
    alpha: a * invSum,
    beta: b * invSum,
    gamma: c * invSum,
  };

}
