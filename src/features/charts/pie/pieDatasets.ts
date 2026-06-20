import rawPieDatasets from "../data/pie-dataset.json";
import type { PieDataset } from "./types";


export const pieDatasets: PieDataset[] =
  rawPieDatasets.datasets.map((dataset) => ({
    id: String(dataset.id),

    label: String(dataset.label),

    slices: dataset.slices.map((slice) => ({
      id: String(slice.id),

      label: String(slice.label),

      value: Number(slice.value),

    })),
  }));
