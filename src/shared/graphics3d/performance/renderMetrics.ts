import type { RasterProfile } from "../rasterizer";

export type RenderMetrics = {
  frameTimeMs: number;
  rasterTimeMs: number;
  fps: number;
  triangleCount: number;
  width: number;
  height: number;
  rasterProfile?: RasterProfile;
};

export function createRenderMetrics(
  frameTimeMs: number,
  triangleCount: number,
  width: number,
  height: number,
  rasterProfile?: RasterProfile,
  rasterTimeMs = 0
): RenderMetrics {
  return {
    frameTimeMs,
    rasterTimeMs,
    fps: frameTimeMs > 0 ? 1000 / frameTimeMs : 0,
    triangleCount,
    width,
    height,
    rasterProfile,
  };
}