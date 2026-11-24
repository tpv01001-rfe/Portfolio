
import type { Vec3 } from "../math/vec3";
import type { Mat4 } from "../math/mat4";

import { normalizeVec3 } from "../math/vec3";
import { transformVec4Mat4 } from "../math/mat4";

/**
 * Transformerar en normalvektor med en
 * rotationsmatris.
 *
 * w = 0 gör att eventuell translation
 * inte påverkar vektorn.
 *
 * Gäller här för rena rotationer.
 */
export function transformNormal(
  normal: Vec3,
  model: Mat4
): Vec3 {
  const result = transformVec4Mat4(model, {
    ...normal,
    w: 0,
  });

  return normalizeVec3({
    x: result.x,
    y: result.y,
    z: result.z,
  });
}
