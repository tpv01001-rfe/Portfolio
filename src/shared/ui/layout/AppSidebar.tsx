import type { ActiveView } from "./navigation";
import { navItems } from "./navigation";

type AppSidebarProps = {
  activeView: ActiveView;
  isSidebarCollapsed: boolean;
  onNavigate: (view: ActiveView) => void;
  onToggleSidebar: () => void;
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
            <p className="dashboard-sidebar__eyebrow">Visual Workspace</p>
            <h1 className="dashboard-sidebar__title">Math Tools</h1>
          </div>
        )}

        <button
          type="button"
          className="dashboard-sidebar__toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="dashboard-sidebar__nav">
        {!isSidebarCollapsed && (
          <div className="dashboard-sidebar__section-label">Tools</div>
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
                {item.id === "overview"
                  ? "◧"
                  : item.id === "curve-lab"
                    ? "◌"
                    : "△"}
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
          <p className="dashboard-sidebar__footer-label">Current direction</p>
          <p className="dashboard-sidebar__footer-text">
            Building a modular workspace for curves, diagrams, and interactive visual tools.
          </p>
        </div>
      )}
    </aside>
  );
}