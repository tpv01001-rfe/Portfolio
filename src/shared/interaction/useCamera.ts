import { useState, useRef } from "react";
import { screenToWorld } from "./viewportMath";
import { type CameraState } from "./viewportTypes";

export function useCamera() {
  const cameraRef = useRef<CameraState>({
    x: 400,
    y: 200,
    zoom: 1,
  });

  const [camera, setCamera] = useState(cameraRef.current);

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
    cameraRef.current = { x: 400, y: 200, zoom: 1 };
    commit();
  };

  return {
    camera,
    cameraRef,
    panBy,
    zoomAt,
    commit,
    reset,
  };
}