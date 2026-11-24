import type { Vec3 } from "../math/vec3";
import type { Framebuffer } from "./rasterizer";
import { projectPoint3D } from "./projection";

// Använd samma matriser och projektionsfunktion som trianglarna.
// Mat4-typen härleds från projektionsfunktionens andra parameter.
type ProjectionMatrix = Parameters<typeof projectPoint3D>[1];
type ProjectionViewport = Parameters<typeof projectPoint3D>[2];

export interface ContourPath3D {
  readonly points: readonly Vec3[];
  readonly closed?: boolean;
  // Om konturen hör till en plan yta kan baksidan döljas.
  readonly faceNormal?: Vec3;
  readonly facePoint?: Vec3;
}

const EDGE_COLOR = {
  r: 54,
  g: 36,
  b: 18,
};

const DEPTH_BIAS = 0.00015;

/**
 * Skriver en tunn konturlinje efter Phong-passeringen.
 *
 * Djupbufferten används enbart för att avgöra synlighet.
 * Vi skriver inte nytt djup: linjerna ska inte påverka
 * efterföljande geometripass.
 */
export function drawDepthTestedContours(
  framebuffer: Framebuffer,
  paths: readonly ContourPath3D[],
  matrix: ProjectionMatrix,
  viewport: ProjectionViewport,
): void {
  const { width, height, depth, color } = framebuffer;

  for (const path of paths) {
    const points = path.points.map((point) =>
      projectPoint3D(point, matrix, viewport)
    );

    const segmentCount = path.closed
      ? points.length
      : points.length - 1;

    for (let i = 0; i < segmentCount; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];

      if (!a || !b) {
        continue;
      }

      const dx = b.x - a.x;
      const dy = b.y - a.y;

      // Max ett pixelsteg per prov, så små taggsegment
      // får en sammanhängande kontur.
      const steps = Math.max(
        1,
        Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)))
      );

      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const x = Math.round(a.x + t * dx);
        const y = Math.round(a.y + t * dy);

        if (
          x < 0 ||
          y < 0 ||
          x >= width ||
          y >= height
        ) {
          continue;
        }

        const zA = (a.depth + 1) / 2;
        const zB = (b.depth + 1) / 2;
        const z = zA + t * (zB - zA);

        if (!Number.isFinite(z) || z < 0 || z > 1) {
          continue;
        }

        const index = y * width + x;

        if (z > depth[index] + DEPTH_BIAS) {
          continue;
        }

        const offset = index * 4;

        color[offset] = EDGE_COLOR.r;
        color[offset + 1] = EDGE_COLOR.g;
        color[offset + 2] = EDGE_COLOR.b;
        color[offset + 3] = 255;
      }
    }
  }
}
