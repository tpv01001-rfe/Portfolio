
import type {
  AxisLine,
  //AxisPositions,
  ChartScale,
  ChartGeometry,
  MarkerStyleConfig,
  PlotArea,
  XYMarkerShape,
  XYPoint,
} from "./types";
import { formatTickLabel } from "./format";
import { getMarkerFill } from "./markers";

type MarkerDrawFn = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => void;

type DrawSeries = {
  id: string;
  label: string;
  color: string;
  markerShape: XYMarkerShape;
  data: XYPoint[];
};

//type DrawChartArgs = {
//   ctx: CanvasRenderingContext2D;
//   width: number;
//   height: number;
//   geometry: ChartGeometry;
//   series: DrawSeries[];
//   markerSize: number;
//   markerStyle: MarkerStyleConfig;
// };

const markerDrawers: Record<XYMarkerShape, MarkerDrawFn> = {
  square: (ctx, x, y, size) => {
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  },

  circle: (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  },

  triangle: (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.lineTo(x - size / 2, y + size / 2);
    ctx.closePath();
    ctx.fill();
  },

  diamond: (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size / 2, y);
    ctx.lineTo(x, y + size / 2);
    ctx.lineTo(x - size / 2, y);
    ctx.closePath();
    ctx.fill();
  },
};

export function drawChart(args: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  geometry: ChartGeometry;
  series: DrawSeries[];
  markerSize: number;
  markerStyle?: MarkerStyleConfig;
}) {
  const {
    ctx,
    width,
    height,
    geometry,
    series,
    markerSize,
    markerStyle,
  } = args;

  const {
    plotArea,
    scale,
    axisPositions,
    xTicks,
    yTicks,
  } = geometry;

  clearCanvas(ctx, width, height);
  drawChartSurface(ctx, width, height);
  drawGrid(ctx, plotArea, scale, xTicks, yTicks);

  const xAxis: AxisLine = {
    x1: plotArea.left,
    y1: axisPositions.xAxisY,
    x2: plotArea.right,
    y2: axisPositions.xAxisY,
    orientation: "x",
  };

  const yAxis: AxisLine = {
    x1: axisPositions.yAxisX,
    y1: plotArea.top,
    x2: axisPositions.yAxisX,
    y2: plotArea.bottom,
    orientation: "y",
  };

  drawAxis(ctx, xAxis, "rgba(230, 235, 240, 0.95)");
  drawAxis(ctx, yAxis, "rgba(230, 235, 240, 0.95)");

  drawXAxisTicks(ctx, scale, plotArea, xTicks);
  drawYAxisTicks(ctx, scale, plotArea, yTicks);

  drawAxisTitles(ctx, width, height, plotArea);

  const safeSeries = Array.isArray(series) ? series : [];

  for (const currentSeries of safeSeries) {
    drawSeriesLine(ctx, currentSeries.data, scale, currentSeries.color);

    for (const point of currentSeries.data) {
      const x = scale.xToPx(point.X);
      const y = scale.yToPx(point.Y);

      const markerColor = getMarkerFill(point.Y, markerStyle);

      drawMarker(
        ctx,
        x,
        y,
        markerSize,
        markerColor,
        currentSeries.markerShape
      );
    }
  }
}
export function drawChart2(args: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  geometry: ChartGeometry;
  series: DrawSeries[];
  markerSize: number;
  markerStyle?: MarkerStyleConfig;
}) {
  const {
    ctx,
    width,
    height,
    geometry,
    series,
    markerSize,
  } = args;

  const {
    plotArea,
    scale,
    axisPositions,
    xTicks,
    yTicks,
  } = geometry;

  clearCanvas(ctx, width, height);
  drawChartSurface(ctx, width, height);
  drawGrid(ctx, plotArea, scale, xTicks, yTicks);

  const xAxis: AxisLine = {
    x1: plotArea.left,
    y1: axisPositions.xAxisY,
    x2: plotArea.right,
    y2: axisPositions.xAxisY,
    orientation: "x",
  };

  const yAxis: AxisLine = {
    x1: axisPositions.yAxisX,
    y1: plotArea.top,
    x2: axisPositions.yAxisX,
    y2: plotArea.bottom,
    orientation: "y",
  };

  drawAxis(ctx, xAxis, "rgba(230, 235, 240, 0.95)");
  drawAxis(ctx, yAxis, "rgba(230, 235, 240, 0.95)");

  drawXAxisTicks(ctx, scale, plotArea, xTicks);
  drawYAxisTicks(ctx, scale, plotArea, yTicks);

  drawAxisTitles(ctx, width, height, plotArea);

  for (const currentSeries of series) {
    drawSeriesLine(ctx, currentSeries.data, scale, currentSeries.color);

    for (const point of currentSeries.data) {
      const x = scale.xToPx(point.X);
      const y = scale.yToPx(point.Y);

      drawMarker(
        ctx,
        x,
        y,
        markerSize,
        currentSeries.color,
        currentSeries.markerShape
      );
    }
  }
}
function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
}

function drawChartSurface(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "rgb(243, 243, 243)";
  ctx.fillRect(0, 0, width, height);
}


function drawGrid(
  ctx: CanvasRenderingContext2D,
  plotArea: PlotArea,
  scale: ChartScale,
  xTicks: number[],
  yTicks: number[]
) {
  ctx.save();
  ctx.lineWidth = 1;

  for (const tick of xTicks) {
    const x = scale.xToPx(tick);

    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(180, 190, 200, 0.35)";
    ctx.moveTo(x, plotArea.top);
    ctx.lineTo(x, plotArea.bottom);
    ctx.stroke();
  }

  for (const tick of yTicks) {
    const y = scale.yToPx(tick);

    ctx.beginPath();
    if (tick === 0) {
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(220, 230, 240, 0.6)";
    } else {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(180, 190, 200, 0.35)";
    }

    ctx.moveTo(plotArea.left, y);
    ctx.lineTo(plotArea.right, y);
    ctx.stroke();
  }

  ctx.restore();
}


function drawAxis(
  ctx: CanvasRenderingContext2D,
  axis: AxisLine,
  strokeStyle: string
) {
  ctx.save();

  ctx.beginPath();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 2;

  ctx.moveTo(axis.x1, axis.y1);
  ctx.lineTo(axis.x2, axis.y2);

  ctx.stroke();
  ctx.restore();
}


function drawXAxisTicks(
  ctx: CanvasRenderingContext2D,
  scale: ChartScale,
  plotArea: PlotArea,
  ticks: number[]
) {
  ctx.save();

  ctx.strokeStyle = "rgba(200, 210, 220, 0.9)";
  ctx.fillStyle = "rgba(180, 190, 205, 0.9)";
  ctx.lineWidth = 1;
  ctx.font = '11px "Inter", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (const tick of ticks) {
    const x = scale.xToPx(tick);
    const y = plotArea.bottom;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 6);
    ctx.stroke();

    const isFirstTick = tick === ticks[0];
    const isLastTick = tick === ticks[ticks.length - 1];

    let labelX = x;

    if (isFirstTick) {
      labelX += 8;
    } else if (isLastTick) {
      labelX -= 8;
    }

    ctx.fillText(formatTickLabel(tick), labelX, y + 8);
  }

  ctx.restore();
}

function drawYAxisTicks(
  ctx: CanvasRenderingContext2D,
  scale: ChartScale,
  plotArea: PlotArea,
  ticks: number[]
) {
  ctx.save();

  ctx.strokeStyle = "rgba(200, 210, 220, 0.9)";
  ctx.fillStyle = "rgba(180, 190, 205, 0.9)";
  ctx.lineWidth = 1;
  ctx.font = '11px "Inter", system-ui, sans-serif';
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (const tick of ticks) {
    const y = scale.yToPx(tick);
    const x = plotArea.left;

    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillText(formatTickLabel(tick), x - 10, y);
  }

  ctx.restore();
}

function drawAxisTitles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  plotArea: PlotArea
) {
  ctx.save();
  ctx.fillStyle = "rgba(70, 80, 92, 0.95)";
  ctx.font = '12px "Inter", system-ui, sans-serif';

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("X Axis", plotArea.left + plotArea.width / 2, height - 16);

  ctx.translate(16, plotArea.top + plotArea.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Y Axis", 0, 0);

  ctx.restore();
}

function drawSeriesLine(
  ctx: CanvasRenderingContext2D,
  data: XYPoint[],
  scale: ChartScale,
  color: string
) {
  if (data.length < 2) return;

  const sorted = [...data].sort((a, b) => a.X - b.X);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  sorted.forEach((point, index) => {
    const x = scale.xToPx(point.X);
    const y = scale.yToPx(point.Y);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
  ctx.restore();
}


function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  shape: XYMarkerShape
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  markerDrawers[shape](ctx, x, y, size);
  ctx.restore();
}

