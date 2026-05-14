
import { type RefObject, useEffect, useRef } from "react";

type CameraApi = {
  panBy: (dx: number, dy: number) => void;
  zoomAt: (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
    factor: number
  ) => void;
  commit: () => void;
};

type UseCanvasPointerArgs = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraApi: CameraApi;
};

export function useCanvasPointer({
  canvasRef,
  cameraApi,
}: UseCanvasPointerArgs) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

/*
    const handleMouseDown = (e: MouseEvent) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;

      viewportApi.panBy(dx, dy);

      last.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      dragging.current = false;
      viewportApi.commit();
    };
*/

const handlePointerDown = (e: PointerEvent) => {
  dragging.current = true;
  last.current = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
};

const handlePointerMove = (e: PointerEvent) => {
  if (!dragging.current) return;

  const dx = e.clientX - last.current.x;
  const dy = e.clientY - last.current.y;

  cameraApi.panBy(dx, dy);

  last.current = { x: e.clientX, y: e.clientY };
};

const handlePointerUp = (e: PointerEvent) => {
  dragging.current = false;
  cameraApi.commit();

  if (canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }
};
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();

      cameraApi.zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        canvas.width,
        canvas.height,
        e.deltaY > 0 ? 0.9 : 1.1
      );

      cameraApi.commit();
    };
/*
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
 */   
canvas.addEventListener("wheel", handleWheel, { passive: false });

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerUp);

    return () => {
      /*
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
 */     
canvas.removeEventListener("wheel", handleWheel);
      
     canvas.removeEventListener("pointerdown", handlePointerDown);
canvas.removeEventListener("pointermove", handlePointerMove);
canvas.removeEventListener("pointerup", handlePointerUp);
canvas.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [canvasRef]);//, cameraApi]);
}
