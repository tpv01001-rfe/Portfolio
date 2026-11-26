import type { ReactNode } from "react";
import "./ToolBar.css";

export interface WorkspaceTool {
    readonly id: string;
    readonly label: string;
    readonly icon: ReactNode;
}

interface ToolBarProps {
    readonly tools: readonly WorkspaceTool[];
    readonly activeTool: string | null;
    readonly onToolChange: (id: string | null) => void;
}

export function ToolBar({ tools, activeTool, onToolChange }: ToolBarProps) {
    return (
        <nav className="workspace-toolbar" aria-label="Verktyg">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    type="button"
                    title={tool.label}
                    aria-label={tool.label}
                    aria-pressed={activeTool === tool.id}
                    onClick={() => onToolChange(
                        activeTool === tool.id ? null : tool.id
                    )}
                >
                    {tool.icon}
                </button>
            ))}
        </nav>
    );
}
