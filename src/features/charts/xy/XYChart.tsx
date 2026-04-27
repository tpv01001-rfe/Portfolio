import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChartPadding,
  ChartScale,
  ChartSize,
  XYChartProps,
  XYPoint,
  ChartGeometry,
  XYChartTooltipGroup,
  XYChartOverlayNode,
  XYTooltipPoint,
  XYSeries
} from "./types";

import { createChartScale, getNiceDomain } from "./scales";

import { createChartGeometry } from "./geometry";
import { drawChart } from "./draw";
import { getPlotArea, getSeriesArea } from "./layout";
import XYChartHotspot from "../components/XYChartHotspot";
import XYChartTooltip from "../components/XYChartTooltip";


const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 440;


// med default markerStyle
export default function XYChart({
  data = [],
  series = [],
  maxY = 100,
  xTickCount = 8,
  yTickCount = 4,
  markerSize = 7,
  className,
  title,
  markerStyle = {
    mode: "thresholds",
    defaultColor: "#7FFF00",
    thresholds: [
      { min: 50, color: "#F7CA18" },
      { min: 75, color: "#e60000" },
    ],
  },
  onPointSelect,
  onPointHover,
}: XYChartProps) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);

  const [chartSize, setChartSize] = useState<ChartSize>({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [selectedPoint, setSelectedPoint] = useState<XYPoint | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [tooltipGroup, setTooltipGroup] = useState<XYChartTooltipGroup | null>(null);
  const [tooltipActiveId, setTooltipActiveId] = useState<string | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);


  //flera serier
const tooltipPoints = useMemo<XYTooltipPoint[]>(() => {
  if (series.length > 0) {
    return series.flatMap((currentSeries) =>
      currentSeries.data.map((point) => ({
        id: `${currentSeries.id}:${String(point.ID)}`,
        seriesId: currentSeries.id,
        seriesLabel: currentSeries.label,
        color: currentSeries.color,
        markerShape: currentSeries.markerShape,
        xValue: point.X,
        yValue: point.Y,
        raw: point,
      }))
    );
  }

  return data.map((point) => ({
    id: String(point.ID),
    seriesId: "default",
    seriesLabel: "Serie 1",
    color: markerStyle.defaultColor,
    markerShape: "square",
    xValue: point.X,
    yValue: point.Y,
    raw: point,
  }));
}, [data, series, markerStyle.defaultColor]);


const normalizedSeries = useMemo<XYSeries[]>(() => {
  if (series && series.length > 0) {
    return series;
  }

  return [
    {
      id: "default",
      label: "Serie 1",
      color: markerStyle.defaultColor,
      markerShape: "square",
      data: data ?? [],
    },
  ];
}, [data, series, markerStyle.defaultColor]);

const allPoints = useMemo<XYPoint[]>(() => {
  return normalizedSeries.flatMap((currentSeries) => currentSeries.data);
}, [normalizedSeries]);

const sortedData = useMemo(() => {
  return [...allPoints].sort((a, b) => a.X - b.X);
}, [allPoints]);


const sortedData2 = useMemo(() => {
  return [...allPoints].sort((a, b) => a.X - b.X);
}, [allPoints]);

//flera serier

  const xDomain = useMemo(() => {
    if (sortedData.length === 0) {
      return { min: 0, max: 1 };
    }

    const rawMin = Math.min(...sortedData.map((point) => point.X));
    const rawMax = Math.max(...sortedData.map((point) => point.X));

    if (rawMin === rawMax) {
      return { min: rawMin, max: rawMin + 1 };
    }

    const nice = getNiceDomain(rawMin, rawMax, xTickCount);

    return {
      min: nice.min,
      max: nice.max,
    };
  }, [sortedData, xTickCount]);


  const yDomain = useMemo(() => {
    if (sortedData.length === 0) {
      return { min: 0, max: 1 };
    }

    const rawMin = Math.min(...sortedData.map((point) => point.Y));
    const rawMax = Math.max(...sortedData.map((point) => point.Y));

    if (rawMin === rawMax) {
      return { min: rawMin, max: rawMin + 1 };
    }

    const nice = getNiceDomain(rawMin, rawMax, yTickCount);

    return {
      min: nice.min,
      max: nice.max,
    };
  }, [sortedData, yTickCount]);

  const padding = useMemo<ChartPadding>(() => {
    return {
      top: 32,
      right: 24,
      bottom: 44,
      left: 52,
    };
  }, []);


  //Komponent för axlar, grid och ticks 
  const plotArea = useMemo(() => {
    return getPlotArea(
      chartSize.width,
      chartSize.height,
      padding
    )
  }, [chartSize, padding]);


  //Komponent för datapunkter, linjer och markörer. 
  //Ger lite extra space
  const seriesArea = useMemo(() => {
    return getSeriesArea(plotArea, markerSize);
  }, [plotArea, markerSize]);


  //komponent för
  const scale = useMemo(() => {
    return createChartScale({
      xMin: xDomain.min,
      xMax: xDomain.max,
      yMin: yDomain.min,
      yMax: yDomain.max,
      seriesArea,
    });
  }, [xDomain, yDomain, seriesArea]);

  const overlayNodes = useMemo(() => {
    return buildOverlayNodes(
      tooltipPoints,
      scale,
      markerSize
    );
  }, [tooltipPoints, scale, markerSize]);

  const geometry = useMemo<ChartGeometry>(() => {
    return createChartGeometry({
      width: chartSize.width,
      height: chartSize.height,
      padding,
      markerSize,
      xDomain,
      yDomain,
      xTickCount,
      yTickCount,
    });
  }, [
    chartSize.width,
    chartSize.height,
    padding,
    markerSize,
    xDomain,
    yDomain,
    xTickCount,
    yTickCount,
  ]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let frameId = 0;

    const applySize = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      setChartSize((prev) => {
        if (prev.width === width && prev.height === height) {
          return prev;
        }
        return { width, height };
      });
    };

    applySize();

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        applySize();
      });
    });

    observer.observe(stage);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, []);

const normalizedSeries2 = useMemo<XYSeries[]>(() => {
  if (series.length > 0) {
    return series;
  }

  return [
    {
      id: "default",
      label: "Serie 1",
      color: markerStyle.defaultColor,
      markerShape: "square",
      data,
    },
  ];
}, [data, series, markerStyle.defaultColor]);




  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // drawChart({
    //   ctx,
    //   width: chartSize.width,
    //   height: chartSize.height,
    //   geometry,
    //   data: sortedData,
    //   markerSize,
    //   markerStyle,
    // });

  

drawChart({
  ctx,
  width: chartSize.width,
  height: chartSize.height,
  geometry,
  series: normalizedSeries,
  markerSize,
  markerStyle,
});

  }, [chartSize.height, chartSize.width, markerSize, maxY, plotArea, scale, sortedData, xTickCount, yTickCount]);

  const handleHotspotEnter = (node: XYChartOverlayNode) => {
    setHoveredNodeId(node.id);

    setTooltipGroup({
      anchorX: node.x,
      anchorY: node.y,
      stageWidth: chartSize.width,
      stageHeight: chartSize.height,
      points: node.points,
    });

    setTooltipActiveId(
      getInitialTooltipActiveId(node.points, selectedId, null)
    );
  };

  const handleHotspotLeave = () => {
    setHoveredNodeId(null);

    if (!isTooltipHovered) {
      setTooltipGroup(null);
      setTooltipActiveId(null);
    }
  };

  return (
    <div className={["xy-chart", className].filter(Boolean).join(" ")}>
      <div className="xy-chart__meta" />


      <div className="xy-chart__wrapper">
        <div ref={stageRef} className="xy-chart__stage">

          <canvas ref={canvasRef} className="xy-chart__canvas" />

          <svg className="xy-chart__overlay-svg">

            {overlayNodes.map((node) => {
              const containsSelected =
                selectedId !== null &&
                node.points.some((point) => point.id === selectedId);

              return (
                <XYChartHotspot
                  key={node.id}
                  node={node}
                  markerSize={markerSize}
                  isHovered={hoveredNodeId === node.id}
                  isSelected={containsSelected}
                  onHoverStart={handleHotspotEnter}
                  onHoverEnd={handleHotspotLeave}
                  onSelect={(selectedPoint) => {
                    setSelectedId(String(selectedPoint.ID));
                    setSelectedPoint(selectedPoint);
                    onPointSelect?.(selectedPoint);
                  }}
                />
              );
            })}
          </svg>

          {tooltipGroup && (
            <XYChartTooltip
              group={tooltipGroup}
              activeId={tooltipActiveId}
              onActiveChange={setTooltipActiveId}
              onSelect={(tooltipPoint) => {
                setSelectedId(tooltipPoint.id);
                setSelectedPoint(tooltipPoint.raw);
                onPointSelect?.(tooltipPoint.raw);
              }}
              onMouseEnter={() => setIsTooltipHovered(true)}
              onMouseLeave={() => {
                setIsTooltipHovered(false);
                setTooltipGroup(null);
                setTooltipActiveId(null);
              }}
            />
          )}

        </div>
      </div>

      {selectedPoint && (
        <div
          className="xy-chart__modal-backdrop"
          onClick={() => setSelectedPoint(null)}
        >
          <div
            className="xy-chart__modal"
            onClick={(event) => event.stopPropagation()}
          >
          </div>
        </div>
      )}

    </div>
  );
}

function getInitialTooltipActiveId(
  points: XYTooltipPoint[],
  selectedId: string | null,
  focusedId: string | null
): string | null {
  if (selectedId && points.some((point) => point.id === selectedId)) {
    return selectedId;
  }

  if (focusedId && points.some((point) => point.id === focusedId)) {
    return focusedId;
  }

  return points[0]?.id ?? null;
}

function buildOverlayNodes(
  points: XYTooltipPoint[],
  scale: ChartScale,
  markerSize: number
): XYChartOverlayNode[] {
  const groups = new Map<string, XYChartOverlayNode>();

  for (const point of points) {
    const x = scale.xToPx(point.xValue) - markerSize / 2;
    const y = scale.yToPx(point.yValue) - markerSize / 2;

    const key = `${Math.round(x)}:${Math.round(y)}`;
    const existing = groups.get(key);

    if (existing) {
      existing.points.push(point);
    } else {
      groups.set(key, {
        id: key,
        x,
        y,
        points: [point],
      });
    }
  }

  return Array.from(groups.values());
}