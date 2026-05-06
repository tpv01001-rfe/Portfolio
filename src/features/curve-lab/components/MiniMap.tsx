import type { CameraState } from "../../../shared/interaction/viewportTypes";
import { screenToWorld } from "../../../shared/interaction/viewportMath";

type WorldBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type MiniMapProps = {
  camera: CameraState;
  canvasWidth: number;
  canvasHeight: number;
  worldBounds: WorldBounds;
  width?: number;
  height?: number;
  onJumpTo?: (x: number, y: number) => void;
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
  camera,
  canvasWidth,
  canvasHeight,
  worldBounds,
  width = 160,
  height = 90,
  onJumpTo
}: MiniMapProps) {

  const visibleTopLeft = screenToWorld(0, 0, camera, canvasWidth, canvasHeight);

  const visibleBottomRight = screenToWorld(
    canvasWidth,
    canvasHeight,
    camera,
    canvasWidth,
    canvasHeight
  );

  const miniTopLeft = worldToMiniMap(
    visibleTopLeft.x,
    visibleTopLeft.y,
    worldBounds,
    width,
    height
  );

  const miniBottomRight = worldToMiniMap(
    visibleBottomRight.x,
    visibleBottomRight.y,
    worldBounds,
    width,
    height
  );


  const rectX = Math.min(miniTopLeft.x, miniBottomRight.x);
  const rectY = Math.min(miniTopLeft.y, miniBottomRight.y);
  const rectWidth = Math.abs(miniBottomRight.x - miniTopLeft.x);
  const rectHeight = Math.abs(miniBottomRight.y - miniTopLeft.y);


  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const worldX =
      worldBounds.minX +
      (x / width) * (worldBounds.maxX - worldBounds.minX);

    const worldY =
      worldBounds.minY +
      (y / height) * (worldBounds.maxY - worldBounds.minY);

    onJumpTo?.(worldX, worldY);
  };

  return (
    <svg
      className="mini-map"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onClick={handleClick}
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