import { useState } from "react";
import XYChartLab from "../features/charts/labs/XYChartLab";
import PieChartLab from "../features/charts/labs/PieChartLab";
import ChartTypePicker from "../features/charts/components/ChartTypePicker";

type ChartKind = "xy" | "pie";

export function ChartsLabPage() {
  const [chartKind, setChartKind] = useState<ChartKind>("xy");

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-hero__eyebrow">Charts Module</p>
        <h1 className="dashboard-hero__title">Charts Lab</h1>
        <p className="dashboard-hero__description">
          Responsive and interactive charts with clickable areas.
        </p>
      </section>

<section className="charts-lab-section">
  <div className="charts-lab-panel">
    {chartKind === "xy" && <XYChartLab />}
    {chartKind === "pie" && <PieChartLab />}

    <div className="charts-lab-footer">
      <ChartTypePicker
        value={chartKind}
        onChange={setChartKind}
        options={[
          { id: "xy", label: "XY" },
          { id: "pie", label: "Pie" },
        ]}
      />
    </div>
  </div>
</section>
    </div>
  );
}