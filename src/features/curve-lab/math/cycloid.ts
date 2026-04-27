import { type Curve } from "../model/curve";

export function createCycloid(r: number): Curve {

  return {
    getPoint: (t: number) => ({
      x: r * (t - Math.sin(t)),
      y: r * (1 - Math.cos(t))
    }),

    getCenter: (t: number) => ({
      x: r * t,
      y: r
    })
  };
}



