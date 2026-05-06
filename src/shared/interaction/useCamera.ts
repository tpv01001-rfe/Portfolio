import { useState, useRef } from "react";
import { screenToWorld } from "./viewportMath";
import { type CameraState } from "./viewportTypes";

export function useCamera() {

    const INITIAL_CAMERA: CameraState = {
        x: 0,
        y: 0,
        zoom: 1,
    };

    const cameraRef = useRef<CameraState>(INITIAL_CAMERA);
    const [camera, setCamera] = useState<CameraState>(INITIAL_CAMERA);

    const commit = () => {
        setCamera({ ...cameraRef.current });
    };

    const panBy = (dx: number, dy: number) => {
        cameraRef.current.x += dx / cameraRef.current.zoom;
        cameraRef.current.y += dy / cameraRef.current.zoom;
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

    const jumpToMiniMapPoint = (
        worldX: number,
        worldY: number,
        canvasWidth: number,
        canvasHeight: number
    ) => {
        cameraRef.current.x =
            canvasWidth / 2 - worldX * cameraRef.current.zoom;

        cameraRef.current.y =
            canvasHeight / 2 - worldY * cameraRef.current.zoom;

        commit();
    };

    return {
        camera,
        cameraRef,
        panBy,
        zoomAt,
        commit,
        reset,
        jumpToMiniMapPoint
    };
}