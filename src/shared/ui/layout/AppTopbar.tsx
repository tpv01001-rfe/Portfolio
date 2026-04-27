import type { ActiveView } from "./navigation";
import { getViewTitle } from "./navigation";

type AppTopbarProps = {
  activeView: ActiveView;
};

export function AppTopbar({ activeView }: AppTopbarProps) {
  const title = getViewTitle(activeView);

  const subtitleMap: Record<ActiveView, string> = {
    overview: "Active tools, current work, and next experiments",
    "curve-lab": "Parametric curves, animation, and interactive controls",
    "charts-lab": "Interactive diagrams, axes, labels, and click areas",
  };

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-topbar__eyebrow">Tool Workspace</p>
        <h2 className="dashboard-topbar__title">{title}</h2>
        <p className="dashboard-topbar__subtitle">
          {subtitleMap[activeView]}
        </p>
      </div>
    </header>
  );
}