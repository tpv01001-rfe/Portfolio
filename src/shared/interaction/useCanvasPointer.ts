
import { type RefObject, useEffect, useRef } from "react";

type ViewportApi = {
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
  viewportApi: ViewportApi;
};

export function useCanvasPointer({
  canvasRef,
  viewportApi,
}: UseCanvasPointerArgs) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();

      viewportApi.zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        canvas.width,
        canvas.height,
        e.deltaY > 0 ? 0.9 : 1.1
      );

      viewportApi.commit();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef, viewportApi]);
}
