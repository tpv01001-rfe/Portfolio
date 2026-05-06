import type { ViewportState } from "../../../shared/interaction/viewportTypes";
import { screenToWorld } from "../../../shared/interaction/viewportMath";

type WorldBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type MiniMapProps = {
  viewport: ViewportState;
  canvasWidth: number;
  canvasHeight: number;
  worldBounds: WorldBounds;
  width?: number;
  height?: number;
};

function worldToMiniMap(
  x: number,
  y: number,
  bounds: WorldBounds,
  width: number,
  height: number
) {
  return {
    x: ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * width,
    y: ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * height,
  };
}

export function MiniMap({
  viewport,
  canvasWidth,
  canvasHeight,
  worldBounds,
  width = 160,
  height = 90,
}: MiniMapProps) {
  const topLeft = screenToWorld(0, 0, viewport, canvasWidth, canvasHeight);

  const bottomRight = screenToWorld(
    canvasWidth,
    canvasHeight,
    viewport,
    canvasWidth,
    canvasHeight
  );

  const miniTopLeft = worldToMiniMap(
    topLeft.x,
    topLeft.y,
    worldBounds,
    width,
    height
  );

  const miniBottomRight = worldToMiniMap(
    bottomRight.x,
    bottomRight.y,
    worldBounds,
    width,
    height
  );


  /*
    const rectX = miniTopLeft.x;
    const rectY = miniTopLeft.y;
    const rectWidth = miniBottomRight.x - miniTopLeft.x;
    const rectHeight = miniBottomRight.y - miniTopLeft.y;
  */
  const rectX = Math.min(miniTopLeft.x, miniBottomRight.x);
  const rectY = Math.min(miniTopLeft.y, miniBottomRight.y);
  const rectWidth = Math.abs(miniBottomRight.x - miniTopLeft.x);
  const rectHeight = Math.abs(miniBottomRight.y - miniTopLeft.y);

  return (
    <svg
      className="mini-map"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <clipPath id="mini-map-clip">
          <rect x={0} y={0} width={width} height={height} />
        </clipPath>
      </defs>

      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        className="mini-map__background"
      />

      <g clipPath="url(#mini-map-clip)">
        <rect
          x={rectX}
          y={rectY}
          width={rectWidth}
          height={rectHeight}
          className="mini-map__viewport"
        />
      </g>
    </svg>
  );
}