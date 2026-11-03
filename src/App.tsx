import "./styles/theme.css";
import "./styles/canvas.css";
import "./styles/controls.css";
import "./styles/XYChart.css";
import "./styles/dashboard.css";
import { useState } from "react";

import { AppShell } from "./shared/ui/layout/AppShell";
import { defaultView, type ActiveView } from "./shared/ui/layout/navigation";
import { DashboardPage } from "./pages/DashboardPage";
import { ChartsLabPage } from "./pages/ChartsLabPage";
import { CurveLabScreen } from "./features/curve-lab/CurveLabScreen";
import { CompanyIntelligencePage } from "./pages/CompanyIntelligencePage";
// import { ExperimentPage } from "./features/experiments/ExperimentPage";
// import {
//   experimentRegistry,
//   type ExperimentId,
// } from "./features/experiments/experimentRegistry";
import { ExperimentPage } from "./features/experiments/ExperimentPage";
import { isExperimentId } from "./features/experiments/experimentRegistry";

// function isExperimentId(view: string): view is ExperimentId {
//   return Object.prototype.hasOwnProperty.call(
//     experimentRegistry,
//     view
//   );
// }

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>(defaultView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  let page: React.ReactNode = null;



if (isExperimentId(activeView)) {
  page = (
    <ExperimentPage
      key={activeView}
      experimentId={activeView}
    />
  );
} else {
  switch (activeView) {
    case "overview":
      page = (
        <DashboardPage
          onOpenCurveLab={() => setActiveView("curve-lab")}
          onOpenChartsLab={() => setActiveView("charts-lab")}
          onOpencompanyIntelligence={() =>
            setActiveView("company-intelligence")
          }
        />
      );
      break;

    case "curve-lab":
      page = <CurveLabScreen />;
      break;

    case "charts-lab":
      page = <ChartsLabPage />;
      break;

    case "company-intelligence":
      page = <CompanyIntelligencePage />;
      break;
  }
}

/*
  switch (activeView) {
    case "overview":
      page = (
        <DashboardPage
          onOpenCurveLab={() => setActiveView("curve-lab")}
          onOpenChartsLab={() => setActiveView("charts-lab")}
          onOpencompanyIntelligence={() => setActiveView("company-intelligence")} 
        />
      );
      break;

    case "curve-lab":
      page = <CurveLabScreen />;
      break;

    case "charts-lab":
      page = <ChartsLabPage />;
      break;

    case "company-intelligence":
      page = <CompanyIntelligencePage />;
      break;  
  }
*/
  return (
    <AppShell
      activeView={activeView}
      isSidebarCollapsed={isSidebarCollapsed}
      onNavigate={setActiveView}
      onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
    >
      {page}
    </AppShell>
  );
}