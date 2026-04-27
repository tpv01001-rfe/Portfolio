import { useState } from "react";
import XYChart from "../features/charts/xy/XYChart";
import rawDatasets from "../features/charts/data/xy-datasets.json";
import type { XYPoint, XYDataset, XYMarkerShape } from "../features/charts/xy/types";
import DatasetPicker from "../features/charts/components/DatasetPicker";
import ChartPointInfo from "../features/charts/components/ChartPointInfo";

export function ChartsLabPage() {
  const normalizedDatasets: XYDataset[] = rawDatasets.datasets.map((dataset) => ({
    id: String(dataset.id),
    label: String(dataset.label),
    data: dataset.data
      ? dataset.data.map((point) => ({
          X: Number(point.X),
          Y: Number(point.Y),
          ID: String(point.ID),
        }))
      : undefined,
    series: dataset.series
      ? dataset.series.map((series) => ({
          id: String(series.id),
          label: String(series.label),
          color: String(series.color),
          markerShape: series.markerShape as XYMarkerShape,
          data: series.data.map((point) => ({
            X: Number(point.X),
            Y: Number(point.Y),
            ID: String(point.ID),
          })),
        }))
      : undefined,
  }));

  const [selectedDatasetId, setSelectedDatasetId] = useState(
    normalizedDatasets[0]?.id ?? ""
  );

  const activeDataset =
    normalizedDatasets.find((dataset) => dataset.id === selectedDatasetId) ??
    normalizedDatasets[0];

  //const [hoveredPoint, setHoveredPoint] = useState<XYPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<XYPoint | null>(null);
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-hero__eyebrow">Charts Module</p>
        <h1 className="dashboard-hero__title">Charts Lab</h1>
        <p className="dashboard-hero__description">
          Reponsive and interactive charts with clickable areas.
        </p>
      </section>

      <section className="charts-lab-section">
        <div className="charts-lab-panel">
          <div className="charts-lab-toolbar">
            <div className="charts-lab-toolbar__left">
              <DatasetPicker
                datasets={normalizedDatasets}
                value={selectedDatasetId}
                onChange={setSelectedDatasetId}
              />
            </div>

            <ChartPointInfo
              selectedPoint={selectedPoint}
              isCollapsed={isInfoCollapsed}
              onToggleCollapsed={() => setIsInfoCollapsed((prev) => !prev)}
            />
          </div>

          <div className="charts-lab-canvas-shell">
            {activeDataset && (
              <XYChart
                data={activeDataset.data}
                series={activeDataset.series}
                title={activeDataset.label}
                //onPointHover={setHoveredPoint}
                onPointSelect={setSelectedPoint}
                markerStyle={{
                  mode: "thresholds",
                  defaultColor: "#dde1e4",
                  thresholds: [
                    { min: -25, color: "#6d0e0b" },
                    { min: -5, color: "#9b0f0a" },
                    { min: 15, color: "#60fa60" },
                    { min: 30, color: "#60a5fa" },
                    { min: 60, color: "#f59e0b" },
                    { min: 85, color: "#ef4444" },
                  ],
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}