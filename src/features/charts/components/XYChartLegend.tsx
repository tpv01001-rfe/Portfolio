type LegendSeries = {
  id: string;
  label: string;
  color: string;
  markerShape: string;
};

type XYChartLegendProps = {
  series: LegendSeries[];
    hoveredSeriesId: string | null;
  onSeriesHoverStart: (id: string) => void;
  onSeriesHoverEnd: () => void;
};

export default function XYChartLegend({
  series,
  hoveredSeriesId,
  onSeriesHoverStart,
  onSeriesHoverEnd,
}: XYChartLegendProps) {
  if (!series.length) return null;

  return (
    <div className="xy-chart__legend">
  {series.map((item) => (


    <div
  key={item.id}
  className={[
    "xy-chart__legend-item",
    hoveredSeriesId === item.id ? "xy-chart__legend-item--active" : "",
  ]
    .filter(Boolean)
    .join(" ")}
  onMouseEnter={() => onSeriesHoverStart(item.id)}
  onMouseLeave={onSeriesHoverEnd}
>
      <span
        className={`xy-chart__legend-marker xy-chart__legend-marker--${item.markerShape}`}
        style={{ color: item.color }}
      />
      <span className="xy-chart__legend-label">{item.label}</span>
    </div>
    
  ))}
    </div>
  );
}