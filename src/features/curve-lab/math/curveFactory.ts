import { createCycloid } from "./cycloid";
import { createEpicycloid } from "./epicycloid";
import { createHypocycloid } from "./hypocycloid";
import { createLissajous } from "./lissajous";
import type { Curve } from "../model/curve";
import type { CurveParams } from "../model/curveParams";


export function createCurve(config: CurveParams): Curve {

  switch (config.type) {
        case "epicycloid":
      return createEpicycloid(config.params.r, config.params.R);
      
    case "cycloid":
      return createCycloid(config.params.r);

    case "hypocycloid":
      return createHypocycloid(
        config.params.r, config.params.R);

    case "lissajous":
      return createLissajous(
        config.params.A,
        config.params.B,
        config.params.a,
        config.params.b,
        config.params.delta
      );

    default:
      throw new Error("Unknown curve type");
  }
  
}