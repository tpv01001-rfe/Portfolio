import { type Curve } from "../model/curve";

export function createLissajous(
  A: number,
  B: number,
  a: number,
  b: number,
  delta: number
): Curve {

  return {
    getPoint: (t) => ({
      x: A * Math.sin(a * t + delta),
      y: B * Math.sin(b * t)
    }),

    getCenter: () => ({ x: 0, y: 0 }) 
  };
}