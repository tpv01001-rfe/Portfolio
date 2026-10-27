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
        <p className="dashboard-hero__eyebrow">Datavisualisering</p>
        <h1 className="dashboard-hero__title">Diagramlabb</h1>
        <p className="dashboard-hero__description">
          Utforska interaktiva diagram med klickbara datapunkter och responsiv layout.
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
          { id: "xy", label: "XY-diagram" },
          { id: "pie", label: "Cirkeldiagram" },
        ]}
      />
    </div>
  </div>
</section>
    </div>
  );
}