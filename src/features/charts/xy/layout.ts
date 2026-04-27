
import type { ChartPadding, PlotArea } from "./types";

export function getPlotArea(
  width: number,
  height: number,
  padding: ChartPadding
): PlotArea {
  const left = padding.left;
  const top = padding.top;
  const right = width - padding.right;
  const bottom = height - padding.bottom;

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

export function getSeriesArea(plotArea: PlotArea, markerSize: number): PlotArea {
  const horizontalInset = markerSize / 2 + 8;
  const topInset = markerSize / 2 + 8;
  const bottomInset = markerSize / 2;

  const left = plotArea.left + horizontalInset;
  const top = plotArea.top + topInset;
  const right = plotArea.right - horizontalInset;
  const bottom = plotArea.bottom - bottomInset;

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

