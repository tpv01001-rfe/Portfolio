
export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

export function subtractVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}


//Vänder en vektors riktning.
export function negateVec3(v: Vec3): Vec3 {
  return scaleVec3(v, -1);
}

export function scaleVec3(v: Vec3, scalar: number): Vec3 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
  };
}


//Speglar en vektor mot ett plan.
//n måste vara en enhetsvektor.
export function reflectVec3(
  v: Vec3,
  n: Vec3
): Vec3 {
  return subtractVec3(
    v,
    scaleVec3(n, 2 * dotVec3(v, n))
  );
}

//a · b = |a| |b| cos(theta)
export function dotVec3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

//|a × b| = |a| |b| sin(theta)
//Useful for surface normals, orientation and geometry.
export function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

//Bra att ha vid längdjämförelser.
export function lengthSquaredVec3(v: Vec3): number {
  return dotVec3(v, v);
}

export function lengthVec3(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

export function normalizeVec3(v: Vec3): Vec3 {
  const length = lengthVec3(v);

  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return scaleVec3(v, 1 / length);
}

export function distanceVec3(a: Vec3, b: Vec3): number {
  return lengthVec3(subtractVec3(a, b));
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}