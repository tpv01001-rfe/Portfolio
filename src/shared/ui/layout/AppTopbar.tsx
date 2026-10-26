import type { ActiveView } from "./navigation";
import { getViewTitle } from "./navigation";

type AppTopbarProps = {
  activeView: ActiveView;
};

export function AppTopbar({ activeView }: AppTopbarProps) {
  const title = getViewTitle(activeView);

  const subtitleMap: Record<ActiveView, string> = {
    overview: "Olika typer av applikationer för experiment och lärande",
    "curve-lab": "Interaktiva parametriska kurvor",
    "charts-lab": "Olika diagram med klickbara ytor",
    "company-intelligence": "Företagsinformation, nyckeltal och Leafletkarta",
  };

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-topbar__eyebrow">Portfolio</p>
        <h2 className="dashboard-topbar__title">{title}</h2>
        <p className="dashboard-topbar__subtitle">
          {subtitleMap[activeView]}
        </p>
      </div>
    </header>
  );
}