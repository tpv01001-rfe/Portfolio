import type { ReactNode } from "react";
import "./Viewport.css";

interface ViewportProps {
    readonly title: string;
    readonly children: ReactNode;
    readonly actions?: ReactNode;
    readonly footer?: ReactNode;
}

export function Viewport({ title, children, actions, footer }: ViewportProps) {
    return (
        <section className="workspace-viewport">
            <header className="workspace-viewport__header">
                <h3>{title}</h3>
                {actions}
            </header>
            <div className="workspace-viewport__body">{children}</div>
            {footer && <footer>{footer}</footer>}
        </section>
    );
}
