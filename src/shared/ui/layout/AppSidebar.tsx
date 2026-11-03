
import type { ActiveView } from "./navigation";
import { navItems } from "./navigation";
import { NavigationGroup } from "./NavigationGroup";

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
        isSidebarCollapsed
          ? "dashboard-sidebar--collapsed"
          : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="dashboard-sidebar__header">
        {!isSidebarCollapsed && (
          <div className="dashboard-sidebar__brand">
            <p className="dashboard-sidebar__eyebrow">
              Portfölj
            </p>
            <h1 className="dashboard-sidebar__title">
              Rickard
            </h1>
          </div>
        )}

        <button
          type="button"
          className="dashboard-sidebar__toggle"
          onClick={onToggleSidebar}
          aria-label={
            isSidebarCollapsed
              ? "Expandera sidopanelen"
              : "Fäll ihop sidopanelen"
          }
          title={
            isSidebarCollapsed
              ? "Expandera sidopanelen"
              : "Fäll ihop sidopanelen"
          }
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="dashboard-sidebar__nav">
        {!isSidebarCollapsed && (
          <div className="dashboard-sidebar__section-label">
            &nbsp;
          </div>
        )}

        {navItems.map(entry => {
          if (entry.type === "group") {
            return (
              <NavigationGroup
                key={entry.id}
                group={entry}
                activeView={activeView}
                isSidebarCollapsed={isSidebarCollapsed}
                onNavigate={onNavigate}
                onExpandSidebar={onToggleSidebar}
              />
            );
          }

          const isActive = entry.id === activeView;

          return (
            <button
              key={entry.id}
              type="button"
              className={[
                "dashboard-sidebar__nav-item",
                isActive
                  ? "dashboard-sidebar__nav-item--active"
                  : "",
              ].filter(Boolean).join(" ")}
              onClick={() => onNavigate(entry.id)}
              title={
                isSidebarCollapsed
                  ? entry.label
                  : undefined
              }
            >
              <span className="dashboard-sidebar__nav-icon">
                {entry.icon}
              </span>

              {!isSidebarCollapsed && (
                <span className="dashboard-sidebar__nav-label">
                  {entry.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!isSidebarCollapsed && (
        <div className="dashboard-sidebar__footer">
          <p className="dashboard-sidebar__footer-label">
            På gång
          </p>
          <p className="dashboard-sidebar__footer-text">
            Fler projekt och funktioner tillkommer.
          </p>
        </div>
      )}
    </aside>
  );
}
