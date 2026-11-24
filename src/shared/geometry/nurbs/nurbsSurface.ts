
import type { Vec3 } from
  "../../math/vec3";

  import {
  findKnotSpan,
  basisFunctions,
} from "./bsplineBasis";

export type NurbsControlPoint = {
  position: Vec3;
  weight: number;
};

export type NurbsSurface = {
  degreeU: number;
  degreeV: number;
  knotsU: number[];
  knotsV: number[];
  controlPoints: NurbsControlPoint[][];
};

export function evaluateNurbsSurface(
  surface: NurbsSurface,
  u: number,
  v: number
): Vec3 {
  const {
    degreeU,
    degreeV,
    knotsU,
    knotsV,
    controlPoints,
  } = surface;

  const countU = controlPoints.length;
  const countV = controlPoints[0].length;

  const spanU = findKnotSpan(
    countU, degreeU, u, knotsU
  );

  const spanV = findKnotSpan(
    countV, degreeV, v, knotsV
  );

  const Nu = basisFunctions(
    spanU, u, degreeU, knotsU
  );

  const Nv = basisFunctions(
    spanV, v, degreeV, knotsV
  );

  let x = 0;
  let y = 0;
  let z = 0;
  let denominator = 0;

  for (let a = 0; a <= degreeU; a++) {
    const i = spanU - degreeU + a;

    for (let b = 0; b <= degreeV; b++) {
      const j = spanV - degreeV + b;

      const cp = controlPoints[i][j];

      const factor =
        Nu[a] * Nv[b] * cp.weight;

      x += factor * cp.position.x;
      y += factor * cp.position.y;
      z += factor * cp.position.z;

      denominator += factor;
    }
  }

  if (Math.abs(denominator) < 1e-12) {
    throw new Error(
      "NURBS-utvärdering: ogiltig viktsumma."
    );
  }

  return {
    x: x / denominator,
    y: y / denominator,
    z: z / denominator,
  };
}
