
import type { NurbsSurface } from
  "../../../../shared/geometry/nurbs/nurbsSurface";

/**
 * Skapar en bikubisk NURBS-yta.
 *
 * Kontrollpunkterna bildar ett rutnät
 * i xy-planet.
 *
 * Höjden z varierar med positionen,
 * vilket ger oss en mjukt böjd yta.
 */
export function createDemoSurface(): NurbsSurface {
  const size = 120;
  const count = 4;

  const controlPoints = Array.from(
    { length: count },
    (_, i) =>
      Array.from({ length: count }, (_, j) => {
        const x =
          (i / (count - 1) - 0.5) * size;

        const y =
          (j / (count - 1) - 0.5) * size;

        // Skapar en mjuk höjdvariation.
        // Mitten får högre kontrollpunkter
        // än ytterkanterna.
        const dx = i - 1.5;
        const dy = j - 1.5;

        const z =
          45 * Math.exp(
            -(dx * dx + dy * dy) / 1.5
          );

        return {
          position: { x, y, z },
          weight: 1,
        };
      })
  );

  return {
    degreeU: 3,
    degreeV: 3,

    // Klampade knotvektorer.
    // Grad 3 och fyra kontrollpunkter
    // ger fyra lika knutar i varje ände.
    knotsU: [0, 0, 0, 0, 1, 1, 1, 1],
    knotsV: [0, 0, 0, 0, 1, 1, 1, 1],

    controlPoints,
  };
}
