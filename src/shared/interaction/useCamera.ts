import { useState, useRef } from "react";
import { screenToWorld } from "./viewportMath";
import { type CameraState } from "./viewportTypes";

export function useCamera() {

    const INITIAL_CAMERA: CameraState = {
        x: 0,
        y: 0,
        zoom: 1,
    };

    type WorldBounds = {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    }

    const cameraRef = useRef<CameraState>(INITIAL_CAMERA);
    const [camera, setCamera] = useState<CameraState>(INITIAL_CAMERA);

    const commit = () => {
        setCamera({ ...cameraRef.current });
    };

    const panBy = (dx: number, dy: number) => {
        cameraRef.current.x -= dx / cameraRef.current.zoom;
        cameraRef.current.y -= dy / cameraRef.current.zoom;
    };

    const zoomAt = (
        screenX: number,
        screenY: number,
        width: number,
        height: number,
        factor: number
    ) => {
        const before = screenToWorld(
            screenX,
            screenY,
            cameraRef.current,
            width,
            height
        );

        cameraRef.current.zoom *= factor;

        const after = screenToWorld(
            screenX,
            screenY,
            cameraRef.current,
            width,
            height
        );

        cameraRef.current.x += before.x - after.x;
        cameraRef.current.y += before.y - after.y;
    };

    const reset = () => {
        cameraRef.current = { ...INITIAL_CAMERA };//skap nytt 
        commit();
    };

    //function fitBounds(bounds, width: number, height: number, padding = 40) {
    const fitBounds = (
        bounds: WorldBounds,
        width: number,
        height: number,
        factor = 0.5,
        padding = 40
    ) => {
        const worldWidth = bounds.maxX - bounds.minX;
        const worldHeight = bounds.maxY - bounds.minY;

        const zoomX = (width - padding * 2) / worldWidth;
        const zoomY = (height - padding * 2) / worldHeight;

        const zoom = Math.min(zoomX, zoomY) * factor;

        cameraRef.current = {
            x: (bounds.minX + bounds.maxX) / 2,
            y: (bounds.minY + bounds.maxY) / 2,
            zoom,
        };

        commit();
    };

    //const centerOn = (x: number, y: number)
    const centerOn = (x: number, y: number) => {
        cameraRef.current.x = x;
        cameraRef.current.y = y;
        commit();
    };

    return {
        camera,
        cameraRef,
        panBy,
        zoomAt,
        commit,
        reset,
        centerOn,
        fitBounds
    };
}