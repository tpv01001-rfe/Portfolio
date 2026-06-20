

export const DEFAULT_CHART_COLORS = [
  "#60a5fa",
  "#f59e0b",
  "#34d399",
  "#f87171",
  "#a78bfa",
  "#f472b6",
  "#22d3ee",
];
/*
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
*/
//export default function PieChart({
/*
export function buildPieSlices(
  data: PieSliceData[]
): PieSliceRenderModel[]

buildPieSlices(data, palettes.dark)
buildPieSlices(data, palettes.light)

const renderSlices = buildPieSlices(activeDataset.slices);

*/

// const slices = dataset.slices.map((slice, index) => ({
//   ...slice,
//   color:
//     DEFAULT_CHART_COLORS[
//       index % DEFAULT_CHART_COLORS.length
//     ],
// }));