
import type { Vec2 } from "./vec2";
import type { Vec3 } from "./vec3";
import type { Mat2 } from "./mat2";

////Kolumnmatris i arrayform 
//   [m00, m10, m20,
//    m01, m11, m21,
//    m02, m12, m22]
export type Mat3 = readonly [
  number, number, number,
  number, number, number,
  number, number, number
];

export function identityMat3(): Mat3 {
  return [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ];
}


export function mat3FromColumns(
  column0: Vec3,
  column1: Vec3,
  column2: Vec3
): Mat3 {
  return [
    column0.x, column0.y, column0.z,
    column1.x, column1.y, column1.z,
    column2.x, column2.y, column2.z,
  ];
}

export function rotationMat3(angle: number): Mat3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return [
    c, s, 0,
    -s, c, 0,
    0, 0, 1,
  ];
}


export function translationMat3(
  tx: number,
  ty: number
): Mat3 {
  return [
    1, 0, 0,
    0, 1, 0,
    tx, ty, 1,
  ];
}

export function scalingMat3(
  scaleX: number,
  scaleY: number
): Mat3 {
  return [
    scaleX, 0, 0,
    0, scaleY, 0,
    0, 0, 1,
  ];
}


//En affin 2D transformation
//Övre vänstra 2x2-blocket är transformation.
//högra kolumnen är translationen
export function affineMat3(
  linear: Mat2,
  translation: Vec2
): Mat3 {
  return [
    linear[0], linear[1], 0,
    linear[2], linear[3], 0,
    translation.x, translation.y, 1,
  ];
}

//Multiplicerar två 3x3 matriser.
export function multiplyMat3(
  a: Mat3,
  b: Mat3
): Mat3 {
  const result = new Array<number>(9);

  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      result[col * 3 + row] =
        a[0 * 3 + row] * b[col * 3 + 0] +
        a[1 * 3 + row] * b[col * 3 + 1] +
        a[2 * 3 + row] * b[col * 3 + 2];
    }
  }

  return result as unknown as Mat3;
}

export function transformVec3Mat3(
  matrix: Mat3,
  vector: Vec3
): Vec3 {
  return {
    x:
      matrix[0] * vector.x +
      matrix[3] * vector.y +
      matrix[6] * vector.z,

    y:
      matrix[1] * vector.x +
      matrix[4] * vector.y +
      matrix[7] * vector.z,

    z:
      matrix[2] * vector.x +
      matrix[5] * vector.y +
      matrix[8] * vector.z,
  };
}

/**
 * Transformerar en tvådimensionell punkt med homogena koordinater.
 *
 * Punkten (x, y) representeras tillfälligt som (x, y, 1).
 * Matrisen multipliceras med denna homogena punkt.
 *
 * Resultatet (x', y', w') omvandlas sedan tillbaka till
 * kartesiska koordinater genom division med w':
 *
 *   (x'/w', y'/w')
 *
 * För affina transformationer är w' normalt 1.
 * För projektiva transformationer kan w' vara ett annat värde.
 *
 * Returnerar null om w' är noll eller för nära noll,
 * eftersom divisionen då inte ger en tillförlitlig ändlig punkt.
 */
export function transformPointMat3(
  matrix: Mat3,
  point: Vec2,
  epsilon = 1e-10
): Vec2 | null {
  const x =
    matrix[0] * point.x +
    matrix[3] * point.y +
    matrix[6];

  const y =
    matrix[1] * point.x +
    matrix[4] * point.y +
    matrix[7];

  const w =
    matrix[2] * point.x +
    matrix[5] * point.y +
    matrix[8];

  if (!Number.isFinite(w) || Math.abs(w) <= epsilon) {
    return null;
  }

  return {
    x: x / w,
    y: y / w,
  };
}

/**
 * Transformerar en riktning med den linjära delen av
 * en affin 2D-transformation.
 *
 * Riktningen representeras homogent som (x, y, 0).
 * Därför påverkas den inte av translationen.
 *
 * Funktionen förutsätter en affin transformationsmatris.
 * För en generell projektiv matris kan en riktning inte
 * alltid representeras av en vanlig tvådimensionell vektor
 * efter transformationen.
 */
export function transformDirectionMat3(
  matrix: Mat3,
  direction: Vec2
): Vec2 {
  return {
    x:
      matrix[0] * direction.x +
      matrix[3] * direction.y,

    y:
      matrix[1] * direction.x +
      matrix[4] * direction.y,
  };
}

export function determinantMat3(matrix: Mat3): number {
  const a = matrix[0];
  const b = matrix[3];
  const c = matrix[6];

  const d = matrix[1];
  const e = matrix[4];
  const f = matrix[7];

  const g = matrix[2];
  const h = matrix[5];
  const i = matrix[8];

  return (
    a * (e * i - f * h) -
    b * (d * i - f * g) +
    c * (d * h - e * g)
  );
}


export function transposeMat3(matrix: Mat3): Mat3 {
  return [
    matrix[0], matrix[3], matrix[6],
    matrix[1], matrix[4], matrix[7],
    matrix[2], matrix[5], matrix[8],
  ];
}


/*
 * Beräknar inversen av en 3x3-matris.
 *
 * För en affin 2D-transformation:
 *
 *   | B  t |
 *   | 0  1 |
 *
 * beräknas inversen som:
 *
 *   | B^-1  -B^-1*t |
 *   |  0       1    |
 *
 * Detta gör att stora translationsvärden inte påverkar
 * singularitetskontrollen för den linjära delen.
 *
 * För en generell 3x3-matris används kofaktormetoden:
 *
 * 1. Beräkna matrisens nio kofaktorer.
 * 2. Beräkna determinanten genom utveckling efter första raden.
 * 3. Transponera kofaktormatrisen (adjungerad matris).
 * 4. Dividera den adjungerade matrisen med determinanten.
 *
 * Returnerar null om matrisen bedöms vara singulär
 * eller om beräkningen inte ger ändliga tal.
 *
 * epsilon används som relativ tolerans.
 */
export function inverseMat3(
  matrix: Mat3,
  epsilon = 1e-12
): Mat3 | null {
  const a = matrix[0];
  const b = matrix[3];
  const c = matrix[6];

  const d = matrix[1];
  const e = matrix[4];
  const f = matrix[7];

  const g = matrix[2];
  const h = matrix[5];
  const i = matrix[8];

  // Specialfall: affin 2D-transformation.
  if (g === 0 && h === 0 && i === 1) {
    const det = a * e - b * d;

    const scale =
      Math.hypot(a, d) *
      Math.hypot(b, e);

    if (
      !Number.isFinite(det) ||
      !Number.isFinite(scale) ||
      scale === 0 ||
      Math.abs(det) <= epsilon * scale
    ) {
      return null;
    }

    const invDet = 1 / det;

    const m00 = e * invDet;
    const m01 = -b * invDet;
    const m10 = -d * invDet;
    const m11 = a * invDet;

    const tx = -(m00 * c + m01 * f);
    const ty = -(m10 * c + m11 * f);

    const result: Mat3 = [
      m00, m10, 0,
      m01, m11, 0,
      tx, ty, 1,
    ];

    return result.every(Number.isFinite)
      ? result
      : null;
  }

  // Samtliga nio kofaktorer.
  const C00 = e * i - f * h;
  const C01 = f * g - d * i;
  const C02 = d * h - e * g;

  const C10 = c * h - b * i;
  const C11 = a * i - c * g;
  const C12 = b * g - a * h;

  const C20 = b * f - c * e;
  const C21 = c * d - a * f;
  const C22 = a * e - b * d;

  // Determinant genom utveckling efter första raden.
  const determinant =
    a * C00 + b * C01 + c * C02;

  // Produkt av kolumnernas euklidiska längder. För toleranskontroll.
  const scale =
    Math.hypot(a, d, g) *
    Math.hypot(b, e, h) *
    Math.hypot(c, f, i);

  if (
    !Number.isFinite(determinant) ||
    !Number.isFinite(scale) ||
    scale === 0 ||
    Math.abs(determinant) <= epsilon * scale
  ) {
    return null;
  }

  const invDet = 1 / determinant;

  // Transponerad kofaktormatris, lagrad column-major.
  const result: Mat3 = [
    C00 * invDet,
    C01 * invDet,
    C02 * invDet,

    C10 * invDet,
    C11 * invDet,
    C12 * invDet,

    C20 * invDet,
    C21 * invDet,
    C22 * invDet,
  ];

  return result.every(Number.isFinite)
    ? result
    : null;
}

