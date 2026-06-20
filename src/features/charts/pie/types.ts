export type PieSlice = {
  id: string;
  label: string;
  value: number;
};

export type PieDataset = {
  id: string;
  label: string;
  slices: PieSlice[];
};

export type PieDatasetFile = {
  datasets: PieDataset[];
};

