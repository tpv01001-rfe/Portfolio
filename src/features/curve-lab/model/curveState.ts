import type { CurveLabState } from "./curveTypes";

export function createInitialCurveLabState(): CurveLabState {
  return {
    curveType: "lissajous",

    rollingCurves: {
      cycloid: {
        speed: 1,
        radius: 40,
      },
      epicycloid: {
        speed: 0.5,
        radius: 40,
      },
      hypocycloid: {
        speed: 0.5,
        radius: 40,
      },
    },

    lissajous: {
      speed: 1,
      drawFull: false,
      params: {
        A: 120,
        B: 120,
        a: 3,
        b: 2,
        delta: 0,
      },
    },
  };
}
