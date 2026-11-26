import type { ReactNode } from "react";
import "./Workspace.css";

interface WorkspaceProps {
    readonly toolbar: ReactNode;
    readonly children: ReactNode;
    readonly panel?: ReactNode;
}

// Panelen ligger ovanpå arbetsytan, inte i dess dokumentflöde.
export function Workspace({ toolbar, children, panel }: WorkspaceProps) {
    return (
        <div className="workspace">
            {toolbar}
            <div className="workspace__stage">
                {children}
                {panel && <aside className="workspace__panel">{panel}</aside>}
            </div>
        </div>
    );
}
