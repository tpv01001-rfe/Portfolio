import type { ActiveView } from "./navigation";
import { navItems } from "./navigation";

type AppSidebarProps = {
  activeView: ActiveView;
  isSidebarCollapsed: boolean;
  onNavigate: (view: ActiveView) => void;
  onToggleSidebar: () => void;
};

const navSymbols: Record<ActiveView, string> = {
  overview: "◧",
  "curve-lab": "∿",
  "charts-lab": "⋮",
  "company-intelligence": "⌖",
};

export function AppSidebar({
  activeView,
  isSidebarCollapsed,
  onNavigate,
  onToggleSidebar,
}: AppSidebarProps) {
  return (
    <aside
      className={[
        "dashboard-sidebar",
        isSidebarCollapsed ? "dashboard-sidebar--collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="dashboard-sidebar__header">
        {!isSidebarCollapsed && (
          <div className="dashboard-sidebar__brand">
            <p className="dashboard-sidebar__eyebrow">Portfölj</p>
            <h1 className="dashboard-sidebar__title">Rickard</h1>
          </div>
        )}

        <button
          type="button"
          className="dashboard-sidebar__toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? "Expandera sidopanelen" : "Fäll ihop sidopanelen"}
          title={isSidebarCollapsed ? "Expandera sidopanelen" : "Fäll ihop sidopanelen"}
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="dashboard-sidebar__nav">
        {!isSidebarCollapsed && (
          <div className="dashboard-sidebar__section-label">&nbsp;</div>
        )}

        {navItems.map((item) => {
          const isActive = item.id === activeView;

          return (
            <button
              key={item.id}
              type="button"
              className={[
                "dashboard-sidebar__nav-item",
                isActive ? "dashboard-sidebar__nav-item--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onNavigate(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <span className="dashboard-sidebar__nav-icon">
                    {navSymbols[item.id]}
              </span>

              {!isSidebarCollapsed && (
                <span className="dashboard-sidebar__nav-label">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!isSidebarCollapsed && (
        <div className="dashboard-sidebar__footer">
          <p className="dashboard-sidebar__footer-label">På gång</p>
          <p className="dashboard-sidebar__footer-text">
            Fler projekt och funktioner tillkommer.
          </p>
        </div>
      )}
    </aside>
  );
}