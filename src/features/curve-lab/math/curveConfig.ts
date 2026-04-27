
import type { CurveParams } from "../model/curveParams";
import type {BuildConfigInput} from "../model/buildConfigInput";


export function buildCurveConfig(input: BuildConfigInput): CurveParams {
  const { curveType, radius, R, lissajous } = input;

  switch (curveType) {

    case "cycloid":
      return {
        type: "cycloid",
        params: { r: radius }
      };

    case "epicycloid":
      return {
        type: "epicycloid",
        params: { r: radius, R }
      };

    case "hypocycloid":
      return {
        type: "hypocycloid",
        params: { r: radius, R }
      };

    case "lissajous":
      if (!lissajous) {
        throw new Error("Missing lissajous params");
      }

      return {
        type: "lissajous",
        params: lissajous
      };

    default:
      throw new Error("Unknown curve type");
  }
}
