import type { ViewportState } from "./viewportTypes"

export function screenToWorld(
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

export function worldToScreen(
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