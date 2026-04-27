import type { XYPoint } from "../xy/types";

type ChartPointInfoProps = {
  selectedPoint: XYPoint | null;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function ChartPointInfo({
  selectedPoint,
  isCollapsed,
  onToggleCollapsed,
}: ChartPointInfoProps) {
  return (
    <div
      className={[
        "chart-point-info",
        isCollapsed ? "chart-point-info--collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="chart-point-info__toggle"
        onClick={onToggleCollapsed}
        aria-label={isCollapsed ? "Expand point info" : "Collapse point info"}
      >
        {isCollapsed ? "▸" : "▾"}
      </button>

      {!isCollapsed && (
        <div className="chart-point-info__content">
          {selectedPoint ? (
            <>
              <span className="chart-point-info__pill">
                ID {String(selectedPoint.ID)}
              </span>

              <span className="chart-point-info__pill">
                X {selectedPoint.X}
              </span>

              <span className="chart-point-info__pill">
                Y {selectedPoint.Y}
              </span>
            </>
          ) : (
            <span className="chart-point-info__empty">
              No selection
            </span>
          )}
        </div>
      )}
    </div>
  );
}