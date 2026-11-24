import type { SurfaceMaterial } from "../../../shared/graphics3d/lighting";
import type { ContourPath3D } from "../../../shared/graphics3d/depthTestedContours";
import type { PatternWheel } from "../model/patternWheel";
import { createWheelContour } from "./wheelContour";

/**
 * Mässingsliknande Blinn–Phong-material.
 * Värdena är linjära RGB-komponenter.
 */
export const brassMaterial: SurfaceMaterial = {
  color: {
    r: 0.55,
    g: 0.31,
    b: 0.075,
  },
  specularColor: {
    r: 1,
    g: 0.82,
    b: 0.46,
  },
  ambient: 0.22,
  diffuse: 0.72,
  specular: 0.45,
  shininess: 48,
};

/**
 * Fyra synliga formkanter:
 * - ytterkonturen på fram- och baksida
 * - centrumhålet på fram- och baksida
 *
 * Inga trianguleringskanter följer med.
 */
export function createWheelContourPaths(
  wheel: PatternWheel,
  boreDiameterMm = 3,
  segmentsPerRevolution = 384,
): readonly ContourPath3D[] {
  const contour = createWheelContour(wheel, {
    segmentsPerRevolution,
  });

  const halfThickness = wheel.thicknessMm / 2;
  const boreRadius = boreDiameterMm / 2;
  const holeSegments = Math.max(
    32,
    Math.ceil(segmentsPerRevolution / 4)
  );

  const hole = Array.from(
    { length: holeSegments },
    (_, index) => {
      const angle = 2 * Math.PI * index / holeSegments;

      return {
        x: boreRadius * Math.cos(angle),
        y: boreRadius * Math.sin(angle),
      };
    }
  );

  return [contour.points, hole].flatMap((points) => [
    {
      points: points.map((point) => ({
        ...point,
        z: halfThickness,
      })),
      closed: true,
      faceNormal: { x: 0, y: 0, z: 1 },
      facePoint: { x: 0, y: 0, z: halfThickness },
    },
    {
      points: points.map((point) => ({
        ...point,
        z: -halfThickness,
      })),
      closed: true,
      faceNormal: { x: 0, y: 0, z: -1 },
      facePoint: { x: 0, y: 0, z: -halfThickness },
    },
  ]);
}
