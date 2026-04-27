import { useEffect, useRef } from "react";

type Size = {
  width: number;
  height: number;
};

function resizeCanvasToContainer(
  canvas: HTMLCanvasElement,
  container: HTMLDivElement
): Size {
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const displayWidth = Math.round(rect.width);
  const displayHeight = Math.round(rect.height);

  const bufferWidth = Math.round(displayWidth * dpr);
  const bufferHeight = Math.round(displayHeight * dpr);

  if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
    canvas.width = bufferWidth;
    canvas.height = bufferHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  return {
    width: displayWidth,
    height: displayHeight,
  };
}

export function useCanvasResize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef<Size>({ width: 800, height: 400 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) return;

    let frameId = 0;

    const applySize = () => {
      const { width, height } = resizeCanvasToContainer(canvas, wrapper);
      sizeRef.current = { width, height };
    };

    applySize();

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(applySize);
    });

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [canvasRef]);

  return {
    wrapperRef,
    sizeRef,
  };
}