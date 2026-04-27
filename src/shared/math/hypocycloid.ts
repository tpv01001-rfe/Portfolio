import { type Curve } from "../types/curve";

export function createHypocycloid(r: number, R: number): Curve {

  const Rr = R - r;
  const k = Rr / r;

  return {
    getPoint: (t) => getHypoCycloidPoint(t, r, k),

    getCenter: (t) => ({
      x: Rr * Math.cos(t),
      y: Rr * Math.sin(t)
    })
  };
}

function getHypoCycloidPoint(t: number, r: number, k: number) {
  return {
    x: r*k*Math.cos(t)+r*Math.cos(k*t),
    y: r*k*Math.sin(t)-r*Math.sin(k*t)
  };
}