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

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>(defaultView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  // useEffect(() => {
  //   if (curveType) {
  //     document.body.dataset.curveType = curveType;
  //   }
  // }, [curveType]);


  let page: React.ReactNode = null;

  switch (activeView) {
    case "overview":
      page = (
        <DashboardPage
          onOpenCurveLab={() => setActiveView("curve-lab")}
          onOpenChartsLab={() => setActiveView("charts-lab")}
        />
      );
      break;

    case "curve-lab":
      page = <CurveLabScreen />;
      break;

    case "charts-lab":
      page = <ChartsLabPage />;
      break;
  }

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