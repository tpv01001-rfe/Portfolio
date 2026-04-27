export type XYPoint = {
  ID: string;
  X: number;
  Y: number;
};

export type XYDataset2 = {
  id: string;
  label: string;
  points: XYPoint[];
};

export type XYDataset = {
  id: string;
  label: string;
  data?: XYPoint[];
  series?: XYSeries[];
};

export type XYMarkerShape = "square" | "circle" | "triangle" | "diamond";

export type XYSeries = {
  id: string;
  label: string;
  color: string;
  markerShape: XYMarkerShape;
  data: XYPoint[];
};

export type XYDatasetFile = {
  datasets: XYDataset[];
};


export type XYChartProps = {
  data?: XYPoint[];
  series?: XYSeries[];
  maxY?: number;
  xTickCount?: number;
  yTickCount?: number;
  markerSize?: number;
  className?: string;
  title?: string;
  markerStyle?: {
    mode: "thresholds";
    defaultColor: string;
    thresholds: { min: number; color: string }[];
  };
  //markerStyle?: MarkerStyleConfig;
  onPointSelect?: (point: XYPoint) => void;
  onPointHover?: (point: XYPoint | null) => void;
};

export type XYTooltipPoint = {
  id: string;
  seriesId: string;
  seriesLabel: string;
  xValue: number;
  yValue: number;
  color?: string;
  markerShape: XYMarkerShape;
  raw: XYPoint;
};

export type XYChartTooltipGroup = {
  anchorX: number;
  anchorY: number;
  stageWidth: number;
  stageHeight: number;
  points: XYTooltipPoint[];
};

export type XYChartOverlayNode = {
  id: string;
  x: number;
  y: number;
  points: XYTooltipPoint[];
};

export type ChartSize = {
  width: number;
  height: number;
};

export type ChartPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type PlotArea = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type MarkerArea = {
  id: string;
  coords: string;
  point: XYPoint;
};

export type AxisLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: "x" | "y";
};

export type ChartScale = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xToPx: (value: number) => number;
  yToPx: (value: number) => number;
};

export type AxisPositions = {
  yAxisX: number;
  xAxisY: number;
  xZeroInDomain: boolean;
  yZeroInDomain: boolean;
};

//--------------------- Nivå klickbara ytor
export type MarkerThreshold = {
  min: number;
  color: string;
};

export type MarkerColorMode = "thresholds" | "single";

export type MarkerStyleConfig = {
  mode?: MarkerColorMode;
  defaultColor?: string;
  thresholds?: MarkerThreshold[];
};

export type ChartGeometry = {
  plotArea: PlotArea;
  seriesArea: PlotArea;
  scale: ChartScale;
  axisPositions: AxisPositions;
  xTicks: number[];
  yTicks: number[];
};
