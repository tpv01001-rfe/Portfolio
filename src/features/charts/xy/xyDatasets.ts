import rawDatasets from "../data/xy-datasets.json";
import type { XYDataset, XYMarkerShape } from "./types";

export const xyDatasets: XYDataset[] = rawDatasets.datasets.map((dataset) => ({
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