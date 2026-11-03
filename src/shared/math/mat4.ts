
import type { Vec3 } from "./vec3";
import type { Vec4 } from "./vec4";
import type { Mat3 } from "./mat3";

export type Mat4 = readonly [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export function identityMat4(): Mat4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

//Hämtar den linjära 3x3-delen, främst av en affin Mat4.
export function linearPartMat4(matrix: Mat4): Mat3 {
  return [
    matrix[0], matrix[1], matrix[2],
    matrix[4], matrix[5], matrix[6],
    matrix[8], matrix[9], matrix[10],
  ];
}

export function mat4FromColumns(
  c0: Vec4,
  c1: Vec4,
  c2: Vec4,
  c3: Vec4
): Mat4 {
  return [
    c0.x, c0.y, c0.z, c0.w,
    c1.x, c1.y, c1.z, c1.w,
    c2.x, c2.y, c2.z, c2.w,
    c3.x, c3.y, c3.z, c3.w,
  ];
}


export function translationMat4(
  tx: number,
  ty: number,
  tz: number
): Mat4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1,
  ];
}


export function scalingMat4(
  sx: number,
  sy: number,
  sz: number
): Mat4 {
  return [
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1,
  ];
}

export function rotationXMat4(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ];
}

export function rotationYMat4(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ];
}


export function rotationZMat4(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return [
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}


//En affine 3D transformation med en 3x3 matris för den linjära delen och en 3D-vektor för translationen.
export function affineMat4(
  linear: Mat3,
  translation: Vec3
): Mat4 {
  return [
    linear[0], linear[1], linear[2], 0,
    linear[3], linear[4], linear[5], 0,
    linear[6], linear[7], linear[8], 0,
    translation.x, translation.y, translation.z, 1,
  ];
}

export function multiplyMat4(
  a: Mat4,
  b: Mat4
): Mat4 {
  const result = new Array<number>(16);

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;

      for (let k = 0; k < 4; k++) {
        sum +=
          a[k * 4 + row] *
          b[col * 4 + k];
      }

      result[col * 4 + row] = sum;
    }
  }

  return result as unknown as Mat4;
}


export function transformVec4Mat4(
  matrix: Mat4,
  vector: Vec4
): Vec4 {
  return {
    x:
      matrix[0] * vector.x +
      matrix[4] * vector.y +
      matrix[8] * vector.z +
      matrix[12] * vector.w,

    y:
      matrix[1] * vector.x +
      matrix[5] * vector.y +
      matrix[9] * vector.z +
      matrix[13] * vector.w,

    z:
      matrix[2] * vector.x +
      matrix[6] * vector.y +
      matrix[10] * vector.z +
      matrix[14] * vector.w,

    w:
      matrix[3] * vector.x +
      matrix[7] * vector.y +
      matrix[11] * vector.z +
      matrix[15] * vector.w,
  };
}

/**
 * Transformerar en 3D-punkt med homogena koordinater.
 *
 * Punkten (x, y, z) representeras som (x, y, z, 1).
 * Resultatet divideras med den homogena komponenten w.
 *
 * För affina transformationer är w normalt 1.
 * För projektiva transformationer kan w vara ett annat värde.
 *
 * Returnerar null om w är noll eller för nära noll.
 */
export function transformPointMat4(
  matrix: Mat4,
  point: Vec3,
  epsilon = 1e-10
): Vec3 | null {
  const transformed = transformVec4Mat4(matrix, {
    x: point.x,
    y: point.y,
    z: point.z,
    w: 1,
  });

  if (
    !Number.isFinite(transformed.w) ||
    Math.abs(transformed.w) <= epsilon
  ) {
    return null;
  }

  return {
    x: transformed.x / transformed.w,
    y: transformed.y / transformed.w,
    z: transformed.z / transformed.w,
  };
}

/**
 * Transformerar en 3D-riktning med den linjära delen
 * av en affin 3D-transformation.
 *
 * Riktningen representeras homogent som (x, y, z, 0).
 * Därför påverkas den inte av translation.
 *
 * Funktionen förutsätter en affin transformationsmatris.
 */
export function transformDirectionMat4(
  matrix: Mat4,
  direction: Vec3
): Vec3 {
  return {
    x:
      matrix[0] * direction.x +
      matrix[4] * direction.y +
      matrix[8] * direction.z,

    y:
      matrix[1] * direction.x +
      matrix[5] * direction.y +
      matrix[9] * direction.z,

    z:
      matrix[2] * direction.x +
      matrix[6] * direction.y +
      matrix[10] * direction.z,
  };
}


export function transposeMat4(matrix: Mat4): Mat4 {
  return [
    matrix[0], matrix[4], matrix[8], matrix[12],
    matrix[1], matrix[5], matrix[9], matrix[13],
    matrix[2], matrix[6], matrix[10], matrix[14],
    matrix[3], matrix[7], matrix[11], matrix[15],
  ];
}

export function determinantMat4(matrix: Mat4): number {
  const minor3 = (
    r0: number, r1: number, r2: number,
    c0: number, c1: number, c2: number
  ): number => {
    const a = matrix[c0 * 4 + r0];
    const b = matrix[c1 * 4 + r0];
    const c = matrix[c2 * 4 + r0];

    const d = matrix[c0 * 4 + r1];
    const e = matrix[c1 * 4 + r1];
    const f = matrix[c2 * 4 + r1];

    const g = matrix[c0 * 4 + r2];
    const h = matrix[c1 * 4 + r2];
    const i = matrix[c2 * 4 + r2];

    return (
      a * (e * i - f * h) -
      b * (d * i - f * g) +
      c * (d * h - e * g)
    );
  };

  return (
    matrix[0] * minor3(1, 2, 3, 1, 2, 3) -
    matrix[4] * minor3(1, 2, 3, 0, 2, 3) +
    matrix[8] * minor3(1, 2, 3, 0, 1, 3) -
    matrix[12] * minor3(1, 2, 3, 0, 1, 2)
  );
}

/**
 * Beräknar inversen med Gauss-Jordan-elimination
 * och partiell pivotering.
 *
 * Matrisen utökas med identitetsmatrisen:
 *
 *   [A | I]
 *
 * Genom radoperationer omvandlas den till:
 *
 *   [I | A^-1]
 *
 * Vid varje steg väljs den största tillgängliga
 * pivoten i aktuell kolumn för bättre numerisk stabilitet.
 *
 * Returnerar null om matrisen bedöms vara singulär
 * eller om beräkningen ger icke-ändliga värden.
 *
 * epsilon är en relativ pivottolerans.
 */
export function inverseMat4(
  matrix: Mat4,
  epsilon = 1e-12
): Mat4 | null {
  // Augmented matrix [A | I], stored row-major internally.
  const rows = Array.from({ length: 4 }, (_, row) => {
    const values = new Array<number>(8);

    for (let col = 0; col < 4; col++) {
      values[col] = matrix[col * 4 + row];
      values[col + 4] = row === col ? 1 : 0;
    }

    return values;
  });

  // Scale each row to make pivot selection relative.
  const rowScales = rows.map(row =>
    Math.max(
      Math.abs(row[0]),
      Math.abs(row[1]),
      Math.abs(row[2]),
      Math.abs(row[3])
    )
  );

  if (
    rowScales.some(
      scale => scale === 0 || !Number.isFinite(scale)
    )
  ) {
    return null;
  }

  for (let pivot = 0; pivot < 4; pivot++) {
    // Select row with largest scaled pivot.
    let pivotRow = pivot;
    let bestRatio = -1;

    for (let row = pivot; row < 4; row++) {
      const ratio =
        Math.abs(rows[row][pivot]) / rowScales[row];

      if (ratio > bestRatio) {
        bestRatio = ratio;
        pivotRow = row;
      }
    }

    if (
      !Number.isFinite(bestRatio) ||
      bestRatio <= epsilon
    ) {
      return null;
    }

    // Swap pivot row into position.
    if (pivotRow !== pivot) {
      [rows[pivot], rows[pivotRow]] =
        [rows[pivotRow], rows[pivot]];

      [rowScales[pivot], rowScales[pivotRow]] =
        [rowScales[pivotRow], rowScales[pivot]];
    }

    const pivotValue = rows[pivot][pivot];

    // Normalize pivot row.
    for (let col = 0; col < 8; col++) {
      rows[pivot][col] /= pivotValue;
    }

    // Eliminate pivot column in all other rows.
    for (let row = 0; row < 4; row++) {
      if (row === pivot) continue;

      const factor = rows[row][pivot];

      for (let col = 0; col < 8; col++) {
        rows[row][col] -= factor * rows[pivot][col];
      }
    }
  }

  // Extract inverse and convert back to column-major.
  const result = new Array<number>(16);

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      result[col * 4 + row] = rows[row][col + 4];
    }
  }

  if (!result.every(Number.isFinite)) {
    return null;
  }

  return result as unknown as Mat4;
}
