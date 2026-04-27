import type { ReactNode } from "react";
import type { ActiveView } from "./navigation";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

type AppShellProps = {
  activeView: ActiveView;
  isSidebarCollapsed: boolean;
  onNavigate: (view: ActiveView) => void;
  onToggleSidebar: () => void;
  children: ReactNode;
};

export function AppShell({
  activeView,
  isSidebarCollapsed,
  onNavigate,
  onToggleSidebar,
  children,
}: AppShellProps) {
  return (
    <div className="dashboard-shell">
      <AppSidebar
        activeView={activeView}
        isSidebarCollapsed={isSidebarCollapsed}
        onNavigate={onNavigate}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="dashboard-main">
        <AppTopbar activeView={activeView} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}