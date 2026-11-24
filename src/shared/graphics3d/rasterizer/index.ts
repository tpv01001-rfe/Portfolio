// Framebuffer
export {
  createFramebuffer,
  clearFramebuffer,
  setPixel,
} from "./framebuffer";

// Rasterisering
export {
  rasterizeGouraudTriangle,
  rasterizePhongTriangle,
  createRasterProfile,
} from "./rasterizeTriangle";

// Typer
export type {
  Framebuffer,
  ColorRGBA,
} from "./framebuffer";

export type {
  RasterVertex,
  RasterProfile,
  RasterizationMode,
} from "./rasterizeTriangle";