import { type Curve } from "../model/curve";



export function createEpicycloid(r: number, R: number): Curve {
  const Rr = R + r;
  const k = Rr / r;

  return {
    getPoint: (t) => getEpiCycloidPoint(t, r, k),

    getCenter: (t) => ({
      x: Rr * Math.cos(t),
      y: Rr * Math.sin(t)
    })
  };
}



function getEpiCycloidPoint(t: number, r: number, k: number) {
  return {
    x: r*(k)*Math.cos(t)-r*Math.cos((k)*t),
    y: r*(k)*Math.sin(t)-r*Math.sin((k)*t)
    //x: (R+r)*Math.cos(t)-r*Math.cos(((R+r)/r)*t),
    //y: (R+r)*Math.sin(t)-r*Math.sin(((R+r)/r)*t)
  };
}