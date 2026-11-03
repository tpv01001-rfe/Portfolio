import type { Vec3 } from "./vec3";

export type Vec4 = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export function addVec4(a: Vec4, b: Vec4): Vec4 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
    w: a.w + b.w,
  };
}

//subtraherar b från a
export function subtractVec4(a: Vec4, b: Vec4): Vec4 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
    w: a.w - b.w,
  };
}

export function scaleVec4(v: Vec4, scalar: number): Vec4 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
    w: v.w * scalar,
  };
}

export function dotVec4(a: Vec4, b: Vec4): number {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z +
    a.w * b.w
  );
}

export function lengthSquaredVec4(v: Vec4): number {
  return dotVec4(v, v);
}

export function lengthVec4(v: Vec4): number {
  return Math.hypot(v.x, v.y, v.z, v.w);
}


export function normalizeVec4(v: Vec4): Vec4 {
  const length = lengthVec4(v);

  if (length === 0) {
    return { x: 0, y: 0, z: 0, w: 0 };
  }

  return scaleVec4(v, 1 / length);
}

export function distanceVec4(a: Vec4, b: Vec4): number {
  return lengthVec4(subtractVec4(a, b));
}

/**
 * Converts a homogeneous 4D point to Cartesian 3D coordinates.
 *
 * Homogeneous coordinates (x, y, z, w) represent the Cartesian
 * point (x/w, y/w, z/w), provided w is nonzero.
 *
 * Returns null when w is too close to zero for a reliable division.
 */
export function toCartesianVec3(
  v: Vec4,
  epsilon = 1e-10
): Vec3 | null {
  if (Math.abs(v.w) <= epsilon) {
    return null;
  }

  return {
    x: v.x / v.w,
    y: v.y / v.w,
    z: v.z / v.w,
  };
}

/**
 * Linearly interpolates between a and b.
 *
 * t = 0 returns a.
 * t = 1 returns b.
 *
 * Values outside [0, 1] perform linear extrapolation.
 */
export function lerpVec4(a: Vec4, b: Vec4, t: number): Vec4 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
    w: a.w + (b.w - a.w) * t,
  };
}
