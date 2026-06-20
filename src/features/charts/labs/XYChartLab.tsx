import { useState } from "react";
import XYChart from "../xy/XYChart";
import { xyDatasets } from "../xy/xyDatasets";
import type { XYPoint } from "../xy/types";
import DatasetPicker from "../components/DatasetPicker";
import ChartPointInfo from "../components/ChartPointInfo";

export default function XYChartLab() {
  const [selectedDatasetId, setSelectedDatasetId] = useState(
    xyDatasets[0]?.id ?? ""
  );

  const activeDataset =
    xyDatasets.find((dataset) => dataset.id === selectedDatasetId) ??
    xyDatasets[0];

  const [selectedPoint, setSelectedPoint] = useState<XYPoint | null>(null);
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);

  return (
    <>
      <div className="charts-lab-toolbar">
        <div className="charts-lab-toolbar__left">
          <DatasetPicker
            datasets={xyDatasets}
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
    </>
  );
}