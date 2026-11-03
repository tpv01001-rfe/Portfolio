
import type { Vec3 } from "./vec3";
import type { Mat3 } from "./mat3";
import type { Mat4 } from "./mat4";


export type Quaternion = Readonly<{
  x: number;
  y: number;
  z: number;
  w: number;
}>;

/*
rotateVec3Quaternion, quaternionToMat3, quaternionToMat4, 
nlerpQuaternion och slerpQuaternion förutsätter normaliserade 
quaternioner där det är relevant.
*/
export function identityQuaternion(): Quaternion {
  return { x: 0, y: 0, z: 0, w: 1 };
}

export function addQuaternion(
  a: Quaternion,
  b: Quaternion
): Quaternion {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
    w: a.w + b.w,
  };
}

export function scaleQuaternion(
  q: Quaternion,
  scalar: number
): Quaternion {
  return {
    x: q.x * scalar,
    y: q.y * scalar,
    z: q.z * scalar,
    w: q.w * scalar,
  };
}

export function dotQuaternion(
  a: Quaternion,
  b: Quaternion
): number {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z +
    a.w * b.w
  );
}

export function lengthSquaredQuaternion(
  q: Quaternion
): number {
  return dotQuaternion(q, q);
}

export function lengthQuaternion(q: Quaternion): number {
  return Math.hypot(q.x, q.y, q.z, q.w);
}

export function normalizeQuaternion(
  q: Quaternion,
  epsilon = 1e-12
): Quaternion | null {
  const length = lengthQuaternion(q);

  if (
    !Number.isFinite(length) ||
    length <= epsilon
  ) {
    return null;
  }

  return scaleQuaternion(q, 1 / length);
}

//conjugate(w, v) = (w, -v)
export function conjugateQuaternion(
  q: Quaternion
): Quaternion {
  return {
    x: -q.x,
    y: -q.y,
    z: -q.z,
    w: q.w,
  };
}

//q^-1 = conjugate(q) / |q|²
export function inverseQuaternion(
  q: Quaternion,
  epsilon = 1e-12
): Quaternion | null {
  const lengthSquared = lengthSquaredQuaternion(q);

  if (
    !Number.isFinite(lengthSquared) ||
    lengthSquared <= epsilon * epsilon
  ) {
    return null;
  }

  return scaleQuaternion(
    conjugateQuaternion(q),
    1 / lengthSquared
  );
}

//Hamilton product of two quaternions.
//För enhets-quaternions, A * B -> rotatera B först sedan A.
export function multiplyQuaternion(
  a: Quaternion,
  b: Quaternion
): Quaternion {
  return {
    x:
      a.w * b.x +
      a.x * b.w +
      a.y * b.z -
      a.z * b.y,

    y:
      a.w * b.y -
      a.x * b.z +
      a.y * b.w +
      a.z * b.x,

    z:
      a.w * b.z +
      a.x * b.y -
      a.y * b.x +
      a.z * b.w,

    w:
      a.w * b.w -
      a.x * b.x -
      a.y * b.y -
      a.z * b.z,
  };
}


//Skapar en rotationsquaternion från en axel och vinkel.
//Vinkeln anges i radianer och följer högerhandsregeln.
export function quaternionFromAxisAngle(
  axis: Vec3,
  angle: number,
  epsilon = 1e-12
): Quaternion | null {
  const axisLength = Math.hypot(
    axis.x,
    axis.y,
    axis.z
  );

  if (
    !Number.isFinite(axisLength) ||
    axisLength <= epsilon ||
    !Number.isFinite(angle)
  ) {
    return null;
  }

  const halfAngle = angle / 2;
  const s = Math.sin(halfAngle) / axisLength;

  return {
    x: axis.x * s,
    y: axis.y * s,
    z: axis.z * s,
    w: Math.cos(halfAngle),
  };
}

/**
 * Roterar en 3D-vektor med en enhetsquaternion.
 *
 * Förutsätter att q är normaliserad.
 *
 * Motsvarar:
 *
 *   v' = q * (0, v) * conjugate(q)
 *
 * Här används en effektivare vektorformel.
 */
export function rotateVec3Quaternion(
  q: Quaternion,
  v: Vec3
): Vec3 {
  const tx = 2 * (q.y * v.z - q.z * v.y);
  const ty = 2 * (q.z * v.x - q.x * v.z);
  const tz = 2 * (q.x * v.y - q.y * v.x);

  return {
    x: v.x + q.w * tx + q.y * tz - q.z * ty,
    y: v.y + q.w * ty + q.z * tx - q.x * tz,
    z: v.z + q.w * tz + q.x * ty - q.y * tx,
  };
}

//column-major storage and column vectors.
export function quaternionToMat3(q: Quaternion): Mat3 {
  const xx = q.x * q.x;
  const yy = q.y * q.y;
  const zz = q.z * q.z;

  const xy = q.x * q.y;
  const xz = q.x * q.z;
  const yz = q.y * q.z;

  const wx = q.w * q.x;
  const wy = q.w * q.y;
  const wz = q.w * q.z;

  return [
    1 - 2 * (yy + zz),
    2 * (xy + wz),
    2 * (xz - wy),

    2 * (xy - wz),
    1 - 2 * (xx + zz),
    2 * (yz + wx),

    2 * (xz + wy),
    2 * (yz - wx),
    1 - 2 * (xx + yy),
  ];
}

export function quaternionToMat4(q: Quaternion): Mat4 {
  const m = quaternionToMat3(q);

  return [
    m[0], m[1], m[2], 0,
    m[3], m[4], m[5], 0,
    m[6], m[7], m[8], 0,
    0, 0, 0, 1,
  ];
}

//Interpolates linearly between quaternion components,
 //Useful as a cheaper alternative to SLERP.
export function nlerpQuaternion(
  a: Quaternion,
  b: Quaternion,
  t: number
): Quaternion {
  const dot = dotQuaternion(a, b);
  const sign = dot < 0 ? -1 : 1;

  const result: Quaternion = {
    x: a.x + (sign * b.x - a.x) * t,
    y: a.y + (sign * b.y - a.y) * t,
    z: a.z + (sign * b.z - a.z) * t,
    w: a.w + (sign * b.w - a.w) * t,
  };

  return normalizeQuaternion(result) ?? identityQuaternion();
}


 //Spherical linear interpolation.
 //Uses the shortest path on the unit 4D sphere.
 //t = 0 returns a; t = 1 returns b (up to sign).
export function slerpQuaternion(
  a: Quaternion,
  b: Quaternion,
  t: number
): Quaternion {
  let dot = dotQuaternion(a, b);
  let target = b;

  // q and -q represent the same rotation.
  // Choose the shorter arc.
  if (dot < 0) {
    target = scaleQuaternion(b, -1);
    dot = -dot;
  }

  dot = Math.min(1, Math.max(-1, dot));

  // For nearly identical rotations, avoid division
  // by a very small sin(theta).
  if (dot > 0.9995) {
    return nlerpQuaternion(a, target, t);
  }

  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);

  const weightA =
    Math.sin((1 - t) * theta) / sinTheta;

  const weightB =
    Math.sin(t * theta) / sinTheta;

  const result = addQuaternion(
    scaleQuaternion(a, weightA),
    scaleQuaternion(target, weightB)
  );

  return normalizeQuaternion(result) ?? identityQuaternion();
}
