import type { LissajousParams } from "./curveParams";


export type CurveType = RollingCurveType | "lissajous";

export type CurveLabActions = {
  setCurveType: (curveType: CurveType) => void;

  patchRollingCurve: (
    curveType: RollingCurveType,
    patch: Partial<RollingCurveState>
  ) => void;

  setLissajousSpeed: (speed: number) => void;
  setLissajousDrawFull: (drawFull: boolean) => void;
  patchLissajousParams: (patch: Partial<LissajousParams>) => void;
};

export type RollingCurveState = {
  speed: number;
  radius: number;
};

export type LissajousState = {
  speed: number;
  drawFull: boolean;
  params: LissajousParams;
};

export type RollingCurveType =
  | "cycloid"
  | "epicycloid"
  | "hypocycloid";


export type CurveLabState = {
  curveType: CurveType;

  rollingCurves: Record<RollingCurveType, RollingCurveState>;

  lissajous: {
    speed: number;
    drawFull: boolean;
    params: LissajousParams;
  };
};
