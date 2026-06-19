export type ChartPalette = {
  id: string;
  label: string;
  colors: string[];
};

export const chartPalettes: ChartPalette[] = [
  {
    id: "default",
    label: "Default",
    colors: [
      "#60a5fa",
      "#f59e0b",
      "#34d399",
      "#f87171",
      "#a78bfa",
      "#f472b6",
      "#22d3ee",
    ],
  },

  {
    id: "pastel",
    label: "Pastel",
    colors: [
      "#93c5fd",
      "#f9a8d4",
      "#86efac",
      "#fde68a",
      "#c4b5fd",
      "#67e8f9",
      "#fca5a5",
    ],
  },

  {
    id: "finance",
    label: "Finance",
    colors: [
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#84cc16",
      "#65a30d",
      "#0f766e",
      "#0891b2",
    ],
  },

  {
    id: "heat",
    label: "Heat",
    colors: [
      "#fef08a",
      "#facc15",
      "#f59e0b",
      "#f97316",
      "#ef4444",
      "#dc2626",
      "#991b1b",
    ],
  },

  {
    id: "monochrome",
    label: "Monochrome",
    colors: [
      "#e5e7eb",
      "#d1d5db",
      "#9ca3af",
      "#6b7280",
      "#4b5563",
      "#374151",
      "#1f2937",
    ],
  },
];