
import type { Vec2 } from "./vec2";


//Kolumnmatris i arrayform [m00, m10, m01, m11]
export type Mat2 = readonly [
  number, number,
  number, number
];

export function identityMat2(): Mat2 {
  return [
    1, 0,
    0, 1,
  ];
}

export function mat2FromColumns(
  column0: Vec2,
  column1: Vec2
): Mat2 {
  return [
    column0.x, column0.y,
    column1.x, column1.y,
  ];
}


//Rotationsmatris (högeronrinterad, moturs).
// vinkeln i radianer
export function rotationMat2(angle: number): Mat2 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return [
    c, s,
    -s, c,
  ];
}

//En non-uniform skalningsmatris.
export function scalingMat2(
  scaleX: number,
  scaleY: number
): Mat2 {
  return [
    scaleX, 0,
    0, scaleY,
  ];
}

export function multiplyMat2(
  a: Mat2,
  b: Mat2
): Mat2 {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],

    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
  ];
}


export function transformVec2Mat2(
  matrix: Mat2,
  vector: Vec2
): Vec2 {
  return {
    x: matrix[0] * vector.x + matrix[2] * vector.y,
    y: matrix[1] * vector.x + matrix[3] * vector.y,
  };
}


//Determinanten beskriver också den signerade areaskalningen av transformationen.
export function determinantMat2(matrix: Mat2): number {
  return matrix[0] * matrix[3] -
         matrix[2] * matrix[1];
}

export function transposeMat2(matrix: Mat2): Mat2 {
  return [
    matrix[0], matrix[2],
    matrix[1], matrix[3],
  ];
}


//Returnerar null om matrisen är singulär eller nära singulär.
//Toleransen är realtiv till matrisens största komponent.
export function inverseMat2(
  matrix: Mat2,
  epsilon = 1e-12
): Mat2 | null {
  const determinant = determinantMat2(matrix);

  const scale = Math.max(
    Math.abs(matrix[0]),
    Math.abs(matrix[1]),
    Math.abs(matrix[2]),
    Math.abs(matrix[3])
  );

  if (scale === 0) {
    return null;
  }

  if (
    Math.abs(determinant) <=
    epsilon * scale * scale
  ) {
    return null;
  }

  const inverseDeterminant = 1 / determinant;

  return [
     matrix[3] * inverseDeterminant,
    -matrix[1] * inverseDeterminant,
    -matrix[2] * inverseDeterminant,
     matrix[0] * inverseDeterminant,
  ];
}
