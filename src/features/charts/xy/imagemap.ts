import type { ChartScale, MarkerArea, XYPoint } from "./types";

export function buildMarkerAreas(args: {
  data: XYPoint[];
  markerSize: number;
  scale: ChartScale;
}): MarkerArea[] {
  const { data, markerSize, scale } = args;

  return data.map((point) => {
    const x = scale.xToPx(point.X) - markerSize / 2;
    const y = scale.yToPx(point.Y) - markerSize / 2;

    return {
      id: point.ID,
      point,
      coords: [
        Math.round(x),
        Math.round(y),
        Math.round(x + markerSize),
        Math.round(y + markerSize),
      ].join(","),
    };
  });
}

export function createTransparentPixel() {
  return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
}

