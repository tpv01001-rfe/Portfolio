import type { MarkerStyleConfig } from "./types";

//kan sätt olika färger för t.ex varninsnivåer
export function getMarkerFill(value: number, markerStyle?: MarkerStyleConfig) {
  const mode = markerStyle?.mode ?? "single";
  const defaultColor = markerStyle?.defaultColor ?? "#7FFF00";

  if (mode === "single") {
    return defaultColor;
  }

  const thresholds = [...(markerStyle?.thresholds ?? [])].sort(
    (a, b) => a.min - b.min
  );

  let fill = defaultColor;

  for (const threshold of thresholds) {
    if (value >= threshold.min) {
      fill = threshold.color;
    }
  }
  return fill;
}

