import type {
  Size2D,
  Viewport2D,
} from "./viewport2D";

import type { Point2 } from "../math/point";

export interface Canvas2DRenderContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly viewport: Viewport2D;
  readonly size: Size2D;
  readonly pixelRatio: number;

  /** Omvandlar en punkt i världskoordinater till CSS-pixlar. */
  readonly worldToScreen: (point: Point2) => Point2;
}

export interface Canvas2DOverlayContext {
  readonly viewport: Viewport2D;
  readonly size: Size2D;
  readonly worldToScreen: (point: Point2) => Point2;
  readonly screenToWorld: (point: Point2) => Point2;
}
