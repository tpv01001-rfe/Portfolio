import type { Point2 } from "./point";

export type Vec2 = {
  x: number;
  y: number;
};

export function orientation2D(
  a: Point2,
  b: Point2,
  c: Point2,
): number {
  const ab = subtractVec2(b, a);
  const ac = subtractVec2(c, a);

  return determinantVec2(ab, ac);
}

export function addVec2(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}


export function subtractVec2(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function scaleVec2(v: Vec2, scalar: number): Vec2 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

export function dotVec2(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

//Bra vid orientateringstester och point-in-polygon algorimer.
//I ett högerorinterat ger ett positivt värde om b ligger moturs från a.
export function determinantVec2(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x;
}


//Bra att ha vid längdjämförelser.
export function lengthSquaredVec2(v: Vec2): number {
  return dotVec2(v, v);
}

export function lengthVec2(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function normalizeVec2(v: Vec2): Vec2 {
  const length = lengthVec2(v);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return scaleVec2(v, 1 / length);
}

export function distanceVec2(a: Vec2, b: Vec2): number {
  return lengthVec2(subtractVec2(a, b));
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}