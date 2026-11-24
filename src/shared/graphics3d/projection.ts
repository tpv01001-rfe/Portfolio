
import type { Vec2 } from "../math/vec2";
import type { Vec3 } from "../math/vec3";
import type { Mat4 } from "../math/mat4";

import { transformVec4Mat4 } from "../math/mat4";

export type Viewport = {
  width: number;
  height: number;
};

export type ProjectedPoint = Vec2 & {
  depth: number;
  inverseW: number;
};

export function projectPoint3D(
  point: Vec3,
  matrix: Mat4,
  viewport: Viewport
): ProjectedPoint | null {
  if (viewport.width <= 0 || viewport.height <= 0) {
    return null;
  }

  const clip = transformVec4Mat4(matrix, {
    x: point.x,
    y: point.y,
    z: point.z,
    w: 1,
  });

  if (
    !Number.isFinite(clip.w) ||
    clip.w <= 1e-10
  ) {
    return null;
  }

  const ndcX = clip.x / clip.w;
  const ndcY = clip.y / clip.w;
  const ndcZ = clip.z / clip.w;

  if (
    !Number.isFinite(ndcX) ||
    !Number.isFinite(ndcY) ||
    !Number.isFinite(ndcZ)
  ) {
    return null;
  }

  // Klipp mot nära och bortre planet.
  if (ndcZ < -1 || ndcZ > 1) {
    return null;
  }

  return {
    x: (ndcX + 1) * viewport.width / 2,
    y: (1 - ndcY) * viewport.height / 2,
    depth: ndcZ,
    inverseW: 1 / clip.w,
  };
}
