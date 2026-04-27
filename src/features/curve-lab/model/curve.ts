
export type Point = {
  x: number;
  y: number;
};

export type Curve = {
  getPoint: (t: number) => Point;
  getCenter: (t: number) => Point;
};

