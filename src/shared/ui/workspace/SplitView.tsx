import type { CSSProperties, ReactNode } from "react";
import "./SplitView.css";

interface SplitViewProps {
    readonly first: ReactNode;
    readonly second: ReactNode;
    readonly initialRatio?: number;
}

// Fast fördelning i första etappen. Avdelaren blir justerbar senare.
export function SplitView({ first, second, initialRatio = 0.55 }: SplitViewProps) {
    const ratio = Math.min(0.8, Math.max(0.2, initialRatio));
    const style = { "--workspace-ratio": `${ratio * 100}fr`,
        "--workspace-rest": `${(1 - ratio) * 100}fr` } as CSSProperties;

    return (
        <div className="workspace-split" style={style}>
            <div>{first}</div>
            <div>{second}</div>
        </div>
    );
}
