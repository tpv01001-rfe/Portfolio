

export type CycloidParams = {
  r: number;
};

// export type HypoCycloidParams = {
//   r: number;
//   R: number;
// };

export type RollingCircleParams = {
  r: number;
  R: number;
};

export type LissajousParams = {
  A: number;
  B: number;
  a: number;
  b: number;
  delta: number;
};


//discriminated union
export type CurveParams =
  | { type: "cycloid"; params: CycloidParams }
  | { type: "hypocycloid"; params: RollingCircleParams }
  | { type: "epicycloid"; params: RollingCircleParams }
  | { type: "lissajous"; params: LissajousParams };