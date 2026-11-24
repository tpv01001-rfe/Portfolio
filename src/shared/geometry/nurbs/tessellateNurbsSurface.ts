
import type { TriangleMesh } from "../triangleMesh";

import type { NurbsSurface } from "./nurbsSurface";

import { evaluateNurbsDerivatives } from "./nurbsDerivatives";

/**
 * Ett triangelnät består av:
 *
 * vertices:
 *   Punkter i tredimensionella koordinater.
 *
 * triangles:
 *   Varje triangel innehåller tre index
 *   som refererar till vertices.
 *
 * Vi lagrar alltså varje hörnpunkt en gång
 * och återanvänder den i flera trianglar.
 */

/**
 * Omvandlar en kontinuerlig NURBS-yta
 * till ett triangelnät.
 *
 * segmentsU och segmentsV anger antalet
 * indelningar i respektive parameterriktning.
 */
export function tessellateNurbsSurface(
  surface: NurbsSurface,
  segmentsU = 20,
  segmentsV = 20
): TriangleMesh {
  if (
    !Number.isInteger(segmentsU) ||
    !Number.isInteger(segmentsV) ||
    segmentsU < 1 ||
    segmentsV < 1
  ) {
    throw new RangeError(
      "Antalet segment måste vara positiva heltal."
    );
  }

const vertices: Vec3[] = [];
const normals: Vec3[] = [];
const triangles: [number, number, number][] = [];

  const countU = surface.controlPoints.length;
  const countV = surface.controlPoints[0].length;

  // En NURBS-yta behöver inte ha parameterdomänen
  // [0,1]. Den bestäms av knotvektorerna.
  const uMin = surface.knotsU[surface.degreeU];
  const uMax = surface.knotsU[countU];

  const vMin = surface.knotsV[surface.degreeV];
  const vMax = surface.knotsV[countV];

  // ------------------------------------------------
  // STEG 1: Skapa alla hörnpunkter.
  // ------------------------------------------------
  //
  // Vi går igenom ett rutnät med
  // (segmentsU + 1) * (segmentsV + 1) punkter.
  //
  // Varje punkt motsvarar ett parameterpar (u,v).
  // evaluateNurbsSurface omvandlar detta till
  // en position i tredimensionellt rum.

  for (let i = 0; i <= segmentsU; i++) {
    const u =
      uMin + (uMax - uMin) * (i / segmentsU);

    for (let j = 0; j <= segmentsV; j++) {
      const v =
        vMin + (vMax - vMin) * (j / segmentsV);

      // Beräkna både position och normal direkt
// från den matematiska NURBS-ytan.
//
// Normalen kommer från partialderivatorna,
// inte från trianglarnas plana ytor.
const { position, normal } =
  evaluateNurbsDerivatives(surface, u, v);

vertices.push(position);
normals.push(normal);

    }
  }

  // ------------------------------------------------
  // STEG 2: Skapa trianglarna.
  // ------------------------------------------------
  //
  // Vi har segmentsU * segmentsV rutor.
  //
  // Varje ruta består av fyra hörnpunkter:
  //
  //   a -------- c
  //   |        / |
  //   |      /   |
  //   |    /     |
  //   b -------- d
  //
  // Vi delar rutan längs diagonalen b-c.
  //
  // Triangel 1: a, b, c
  // Triangel 2: b, d, c
  //
  // Samma orientering används över hela nätet.

  const rowLength = segmentsV + 1;

  for (let i = 0; i < segmentsU; i++) {
    for (let j = 0; j < segmentsV; j++) {
      // Vi lagrar v-index snabbast.
      // Därför är index = i * rowLength + j.
      const a = i * rowLength + j;
      const b = a + 1;
      const c = (i + 1) * rowLength + j;
      const d = c + 1;

      triangles.push([a, b, c]);
      triangles.push([b, d, c]);
    }
  }

  return {
    vertices,
    normals,
    triangles,
  };
}
