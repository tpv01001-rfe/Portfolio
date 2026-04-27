import type { LissajousParams } from "./curveParams";

export type CurveType =
  | "cycloid"
  | "epicycloid"
  | "hypocycloid"
  | "lissajous";


export type CurveLabActions  = {
  setCurveType: (curveType: CurveType) => void;

  setCycloidSpeed: (speed: number) => void;
  setCycloidRadius: (radius: number) => void;

  setLissajousSpeed: (speed: number) => void;
  setLissajousDrawFull: (drawFull: boolean) => void;

  setLissajousParams: (params: LissajousParams) => void; 
  //fälten i LissajousParams valfria
  patchLissajousParams: (patch: Partial<LissajousParams>) => void;

};

export type CycloidState = {
  speed: number;
  radius: number;
};

export type LissajousState = {
  speed: number;
  drawFull: boolean;
  params: LissajousParams;
};

export type CurveLabState = {
  curveType: CurveType;
  cycloid: CycloidState;
  lissajous: LissajousState;
};