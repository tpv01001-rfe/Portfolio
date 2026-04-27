import type { XYPoint } from "../xy/types";
import "../../../styles/controls.css";
import type {XYChartOverlayNode} from "../xy/types";

export type XYChartPoint = {
  id: string;
  seriesId: string;
  seriesLabel: string;
  xValue: number;
  yValue: number;
  color?: string;
  raw?: unknown;
};

type XYChartHotspotProps = {
  node: XYChartOverlayNode;
  markerSize: number;
  isHovered: boolean;
  isSelected: boolean;
  onHoverStart: (node: XYChartOverlayNode) => void;
  onHoverEnd: () => void;
  onSelect: (point: XYPoint) => void;
};


export default function XYChartHotspot({
  node,
  markerSize,
  isHovered,
  isSelected,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: XYChartHotspotProps) {
  const { x, y, points } = node;
  const primaryPoint = points[0];

  return (
    <g>
      <rect
        x={x - 3}
        y={y - 3}
        width={markerSize + 6}
        height={markerSize + 6}
        fill="transparent"
        pointerEvents="all"
        cursor="pointer"
        className="xy-chart__hotspot"
        onMouseEnter={() => onHoverStart(node)}
        onMouseLeave={onHoverEnd}
        onClick={() => {

  if (primaryPoint) {
    onSelect(primaryPoint.raw);
  }
}}
      />

      {isHovered && (
        <rect
          x={x - 3}
          y={y - 3}
          width={markerSize + 3}
          height={markerSize + 3}
          fill="none"
          stroke="rgba(77,227,195,0.9)"
          strokeWidth={1.5}
          pointerEvents="none"
        />
      )}


      {isSelected && (
        <rect
          x={x - 2}
          y={y - 2}
          width={markerSize + 4}
          height={markerSize + 4}
          fill="none"
          stroke="rgba(61, 115, 20, 0.9)"
          strokeWidth={2}
          pointerEvents="none"
        />
      )}

      {points.length > 1 && (
        <text
          x={x + markerSize / 2}
          y={y - 8}
          textAnchor="middle"
          fontSize="10"
          fill="white"
          pointerEvents="none"
        >
          {points.length}
        </text>
      )}
    </g>
  );
}

