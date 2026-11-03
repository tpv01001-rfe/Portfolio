
import { useEffect, useId, useState } from "react";
import type {
  ActiveView,
  NavigationGroup as NavigationGroupType,
} from "./navigation";

type Props = {
  group: NavigationGroupType;
  activeView: ActiveView;
  isSidebarCollapsed: boolean;
  onNavigate: (view: ActiveView) => void;
  onExpandSidebar: () => void;
};

export function NavigationGroup({
  group,
  activeView,
  isSidebarCollapsed,
  onNavigate,
  onExpandSidebar,
}: Props) {
  const [expanded, setExpanded] = useState(
    group.children.some(item => item.id === activeView)
  );

  const contentId = useId();

  const hasActiveChild = group.children.some(
    item => item.id === activeView
  );

  // Visa den aktiva posten när navigationen byts utifrån.
  useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true);
    }
  }, [hasActiveChild, activeView]);

  function handleToggle() {
    if (isSidebarCollapsed) {
      setExpanded(true);
      onExpandSidebar();
    } else {
      setExpanded(value => !value);
    }
  }

  return (
    <div className="navigation-group">
      <button
        type="button"
        className={[
          "dashboard-sidebar__nav-item",
          hasActiveChild
            ? "navigation-group__has-active-child"
            : "",
        ].filter(Boolean).join(" ")}
        onClick={handleToggle}
        aria-expanded={!isSidebarCollapsed && expanded}
        aria-controls={contentId}
        title={isSidebarCollapsed ? group.label : undefined}
      >
        <span className="dashboard-sidebar__nav-icon">
          {group.icon}
        </span>

        {!isSidebarCollapsed && (
          <>
            <span className="dashboard-sidebar__nav-label">
              {group.label}
            </span>
            <span
              className="navigation-group__chevron"
              aria-hidden="true"
            >
              {expanded ? "▾" : "▸"}
            </span>
          </>
        )}
      </button>

      <div
        id={contentId}
        className="navigation-group__children"
        hidden={isSidebarCollapsed || !expanded}
      >
        {group.children.map(item => (
          <button
            key={item.id}
            type="button"
            className={[
              "dashboard-sidebar__nav-item",
              "navigation-group__child",
              item.id === activeView
                ? "dashboard-sidebar__nav-item--active"
                : "",
            ].filter(Boolean).join(" ")}
            onClick={() => onNavigate(item.id)}
          >
            <span className="dashboard-sidebar__nav-icon">
              {item.icon}
            </span>
            <span className="dashboard-sidebar__nav-label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
