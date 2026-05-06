/*
import { useState, useRef } from "react";
import { screenToWorld } from "./viewportMath";


export function useViewport() {
    const viewportRef = useRef({ panX: 0, panY: 0, zoom: 1 });
    const [viewport, setViewport] = useState(viewportRef.current);

    const commit = () => setViewport({ ...viewportRef.current });

    const panBy = (dx: number, dy: number) => {
        viewportRef.current.panX += dx;
        viewportRef.current.panY += dy;
    };

    const zoomAt = (mx: number, my: number, w: number, h: number, factor: number) => {
        const v = viewportRef.current;

        const world = screenToWorld(mx, my, v, w, h);

        v.zoom *= factor;

        v.panX = mx - w / 2 - world.x * v.zoom;
        v.panY = my - h / 2 - world.y * v.zoom;
    };

    const reset = () => {
        viewportRef.current = { panX: 0, panY: 0, zoom: 1 };
        commit();
    };

    return {
        viewport,        // UI
        viewportRef,     // rendering
        panBy,
        zoomAt,
        commit,
        reset,
    };
}
    */