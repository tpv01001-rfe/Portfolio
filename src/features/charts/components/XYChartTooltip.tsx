import type { XYChartTooltipGroup, XYTooltipPoint } from "../xy/types";

type XYChartTooltipProps = {
  group: XYChartTooltipGroup;
  activeId: string | null;
  onActiveChange: (id: string) => void;
  onSelect: (point: XYTooltipPoint) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function XYChartTooltip({
  group,
  activeId,
  onActiveChange,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: XYChartTooltipProps) {
  const activePoint =
    group.points.find((point) => point.id === activeId) ?? group.points[0];

  if (!activePoint) {
    return null;
  }

const tooltipWidth = 280;
const tooltipHeight = 180;
const gap = 8;
const clearance = 14;

let left = group.anchorX + gap;
let top = group.anchorY + clearance;

// håll inom höger/vänster kant
left = Math.min(left, group.stageWidth - tooltipWidth - gap);
left = Math.max(left, gap);

// om tooltippen täcker den aktiva punkten, lägg den ovanför
const coversActivePoint =
  group.anchorX >= left &&
  group.anchorX <= left + tooltipWidth &&
  group.anchorY >= top &&
  group.anchorY <= top + tooltipHeight;

if (coversActivePoint) {
  top = group.anchorY - tooltipHeight - clearance;
}

// håll inom topp/botten
top = Math.min(top, group.stageHeight - tooltipHeight - gap);
top = Math.max(top, gap);

return (
    <div
  className="xy-chart__tooltip"
  style={{
    transform: `translate(${left}px, ${top}px)`,
  }}
  onMouseEnter={onMouseEnter}
  onMouseLeave={onMouseLeave}
>
      {group.points.length > 1 && (
        <div className="xy-chart__tooltip-list">
          {group.points.map((point) => {
            const isActive = point.id === activePoint.id;

            return (
              <button
                key={point.id}
                type="button"
                className={
                  isActive
                    ? "xy-chart__tooltip-option xy-chart__tooltip-option--active"
                    : "xy-chart__tooltip-option"
                }
                onMouseEnter={() => onActiveChange(point.id)}
                onClick={() => onSelect(point)}
              >
                <span
                  className="xy-chart__tooltip-swatch"
                  style={{ backgroundColor: point.color ?? "currentColor" }}
                />
                <span>{point.seriesLabel}</span>
                <span>{point.id}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="xy-chart__tooltip-detail">
        <div className="xy-chart__tooltip-title">{activePoint.seriesLabel}</div>
        <div>X: {activePoint.xValue}</div>
        <div>Y: {activePoint.yValue}</div>

        {/* <button
          type="button"
          className="xy-chart__tooltip-select-button"
          onClick={() => onSelect(activePoint)}
        >
          Visa mer
        </button> */}
      </div>
    </div>
  );
}