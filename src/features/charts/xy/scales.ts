import type { AxisPositions, ChartScale, PlotArea } from "./types";

export function getNiceStep(range: number, targetTickCount: number) {
  if (range <= 0 || targetTickCount <= 0) return 1;

  // Ex: range 83, targetTickCount 5
  //roughStep = hur långt mellan ticks ungefär  83/5=16.6
  //magnitude = vilken tiopotens vi är i        10
  //residual = hur långt in i den tiopotensen   1.66 -> ger niceresiduals 2
  const roughStep = range / targetTickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  const niceSteps = [1, 2, 2.5, 5, 10];

  for (const step of niceSteps) {
    if (residual <= step) {
      return step * magnitude;
    }
  }

  return 10 * magnitude;
}

export function getNiceDomain(min: number, max: number, targetTickCount: number) {
  if (max <= min) {
    return { min, max: min + 1, step: 1 };
  }

  const range = max - min;
  const step = getNiceStep(range, targetTickCount);

  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  return {
    min: niceMin,
    max: niceMax,
    step,
  };
}

export function generateTicks(min: number, max: number, targetTickCount: number) {
  if (max <= min) {
    return [min];
  }

  const { min: niceMin, max: niceMax, step } = getNiceDomain(
    min,
    max,
    targetTickCount
  );

  const ticks: number[] = [];

  for (let value = niceMin; value <= niceMax + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }

  return ticks;
}


export function createChartScale(args: {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  seriesArea: PlotArea;
}) : ChartScale {
  const { xMin, xMax, yMin, yMax, seriesArea } = args;

  const xToPx = (value: number) => {
    const ratio = (value - xMin) / (xMax - xMin);
    return seriesArea.left + ratio * seriesArea.width;
  };

  const yToPx = (value: number) => {
    const ratio = (value - yMin) / (yMax - yMin);
    return seriesArea.bottom - ratio * seriesArea.height;
  };

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    xToPx,
    yToPx,
  };
}

export function getAxisPositions(
  scale: ChartScale,
  plotArea: PlotArea
): AxisPositions {
  const xZeroInDomain = scale.xMin <= 0 && scale.xMax >= 0;
  const yZeroInDomain = scale.yMin <= 0 && scale.yMax >= 0;

  const yAxisX = xZeroInDomain ? scale.xToPx(0) : plotArea.left;
  const xAxisY = yZeroInDomain ? scale.yToPx(0) : plotArea.bottom;

  return {
    yAxisX,
    xAxisY,
    xZeroInDomain,
    yZeroInDomain,
  };
}

