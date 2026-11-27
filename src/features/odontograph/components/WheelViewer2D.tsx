import CheckboxControl from "../../../shared/ui/controls/CheckboxControl";
import { Viewport } from "../../../shared/ui/workspace/Viewport";
import { useCallback, useMemo, useState } from "react";
import { Canvas2D } from "../../../shared/graphics2d/Canvas2D";
import type { Canvas2DRenderContext } from "../../../shared/graphics2d/canvas2DTypes";
import type { Viewport2D } from "../../../shared/graphics2d/viewport2D";
import { createWheelContour } from "../geometry/wheelContour";
import type { PatternWheel } from "../model/patternWheel";

interface WheelViewer2DProps {
  readonly wheel: PatternWheel;
  readonly title: string;
}

/**
 * Visar samma kontur som används när hjulets 3D-nät skapas.
 * All geometri ligger i millimeter; Canvas2D sköter koordinatsystemet.
 */
export function WheelViewer2D({ wheel, title }: WheelViewer2DProps) {
  const [viewport, setViewport] = useState<Viewport2D>({
    center: { x: 0, y: 0 },
    scale: 18,
  });

  const [showPoints, setShowPoints] = useState(false);

  const contour = useMemo(() => {
    try {
      return createWheelContour(wheel);
    } catch {
      return null;
    }
  }, [wheel]);

  const render = useCallback(
    ({ ctx, viewport: currentViewport }: Canvas2DRenderContext) => {
      if (!contour || contour.points.length === 0) {
        return;
      }

      const points = contour.points;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let index = 1; index < points.length; index++) {
        ctx.lineTo(points[index].x, points[index].y);
      }

      ctx.closePath();
      ctx.fillStyle = "rgba(64, 199, 194, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "#40c7c2";
      ctx.lineWidth = 1.5 / currentViewport.scale;
      ctx.stroke();

      if (!showPoints) {
        return;
      }

      ctx.fillStyle = "#f2b86a";
      const radius = 2.5 / currentViewport.scale;

      for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [contour, showPoints],
  );

  return (
    <Viewport
      title={title}
      actions={(
        <CheckboxControl
          label="Konturpunkter"
          checked={showPoints}
          onChange={setShowPoints}
        />
      )}
      footer="Panorera / zooma · mm"
    >
      <Canvas2D
        viewport={viewport}
        onViewportChange={setViewport}
        render={render}
        showGrid
        minScale={2}
        maxScale={3000}
        style={{ width: "100%", height: "100%" }}
      />
    </Viewport>
  );
}
