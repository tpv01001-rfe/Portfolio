import type { Point2 } from "../math/point";

export interface Size2D {
  readonly width: number;
  readonly height: number;
}

export interface Viewport2D {
  /** Världskoordinaten i vyns mitt. */
  readonly center: Point2;

  /** CSS-pixlar per världsenhet. Måste vara större än noll. */
  readonly scale: number;
}

export function worldToScreen(
  point: Point2,
  viewport: Viewport2D,
  size: Size2D,
): Point2 {
  return {
    x: size.width / 2 + (point.x - viewport.center.x) * viewport.scale,
    y: size.height / 2 - (point.y - viewport.center.y) * viewport.scale,
  };
}

export function screenToWorld(
  point: Point2,
  viewport: Viewport2D,
  size: Size2D,
): Point2 {
  return {
    x: viewport.center.x + (point.x - size.width / 2) / viewport.scale,
    y: viewport.center.y - (point.y - size.height / 2) / viewport.scale,
  };
}

/** Flytta vyn ett antal CSS-pixlar. */
export function panViewport(
  viewport: Viewport2D,
  dx: number,
  dy: number,
): Viewport2D {
  return {
    ...viewport,
    center: {
      x: viewport.center.x - dx / viewport.scale,
      y: viewport.center.y + dy / viewport.scale,
    },
  };
}

/** Zooma runt en fixerad punkt på skärmen. */
export function zoomViewport(
  viewport: Viewport2D,
  size: Size2D,
  anchor: Point2,
  factor: number,
  minScale = 0.1,
  maxScale = 10000,
): Viewport2D {
  if (!(factor > 0) || !Number.isFinite(factor)) {
    return viewport;
  }

  const scale = Math.max(
    minScale,
    Math.min(maxScale, viewport.scale * factor),
  );

  const worldAnchor = screenToWorld(anchor, viewport, size);

  return {
    center: {
      x: worldAnchor.x - (anchor.x - size.width / 2) / scale,
      y: worldAnchor.y + (anchor.y - size.height / 2) / scale,
    },
    scale,
  };
}
