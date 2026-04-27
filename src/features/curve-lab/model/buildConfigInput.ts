import type { CurveType } from "./curveTypes";

export type BuildConfigInput = {
  curveType: CurveType;
  radius: number;
  R: number;

  lissajous?: {
    A: number;
    B: number;
    a: number;
    b: number;
    delta: number;
  };
};