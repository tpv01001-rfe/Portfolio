import type { ChartGeometry, ChartPadding } from "./types";
import { getPlotArea, getSeriesArea } from "./layout";
import { createChartScale, generateTicks, getAxisPositions } from "./scales";

type CreateChartGeometryArgs = {
  width: number;
  height: number;
  padding: ChartPadding;
  markerSize: number;
  xDomain: {
    min: number;
    max: number;
  };
  yDomain: {
    min: number;
    max: number;
  };
  xTickCount: number;
  yTickCount: number;
};

export function createChartGeometry({
  width,
  height,
  padding,
  markerSize,
  xDomain,
  yDomain,
  xTickCount,
  yTickCount,
}: CreateChartGeometryArgs): ChartGeometry {
  const plotArea = getPlotArea(width, height, padding);
  const seriesArea = getSeriesArea(plotArea, markerSize);

  const scale = createChartScale({
    xMin: xDomain.min,
    xMax: xDomain.max,
    yMin: yDomain.min,
    yMax: yDomain.max,
    seriesArea,
  });

  const axisPositions = getAxisPositions(scale, plotArea);

  const xTicks = generateTicks(scale.xMin, scale.xMax, xTickCount);
  const yTicks = generateTicks(scale.yMin, scale.yMax, yTickCount);

  return {
    plotArea,
    seriesArea,
    scale,
    axisPositions,
    xTicks,
    yTicks,
  };
}