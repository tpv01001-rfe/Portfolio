import type { CameraState } from "./viewportTypes"

/*
export function screenToWorld2(
    x: number,
    y: number,
    view: ViewportState,
    width: number,
    height: number
) {
    return {
        x: (x - width / 2 - view.panX) / view.zoom,
        y: (y - height / 2 - view.panY) / view.zoom,
    };
}
*/
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: CameraState,
  width: number,
  height: number
) {
  return {
    x: camera.x + (screenX - width / 2) / camera.zoom,
    y: camera.y + (screenY - height / 2) / camera.zoom,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: CameraState,
  width: number,
  height: number
) {
  return {
    x: width / 2 + (worldX - camera.x) * camera.zoom,
    y: height / 2 + (worldY - camera.y) * camera.zoom,
  };
}
/*
export function worldToScreen(
  x: number,
  y: number,
  view: ViewportState,
  width: number,
  height: number
) {
  return {
    x: (x - width / 2) * view.zoom + width / 2 + view.panX,
    y: (y - height / 2) * view.zoom + height / 2 + view.panY,
  };
}
  */