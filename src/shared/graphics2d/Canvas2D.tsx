import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";

import type {
  Canvas2DOverlayContext,
  Canvas2DRenderContext,
} from "./canvas2DTypes";

import {
  panViewport,
  screenToWorld,
  worldToScreen,
  zoomViewport,
  type Size2D,
  type Viewport2D,
} from "./viewport2D";

import type { Point2 } from "../math/point";

export interface Canvas2DProps {
  readonly viewport: Viewport2D;
  readonly onViewportChange: (next: Viewport2D) => void;
  readonly render: (context: Canvas2DRenderContext) => void;
  readonly overlay?: (context: Canvas2DOverlayContext) => ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly minScale?: number;
  readonly maxScale?: number;
  readonly showGrid?: boolean;
}

interface DragState {
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
}

/**
 * Generell 2D-yta med Canvas för rendering och SVG för interaktion.
 * Världskoordinater har positiv Y uppåt.
 */
export function Canvas2D({
  viewport,
  onViewportChange,
  render,
  overlay,
  className,
  style,
  minScale = 0.1,
  maxScale = 10000,
  showGrid = false,
}: Canvas2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const viewportRef = useRef(viewport);

  const [size, setSize] = useState<Size2D>({
    width: 0,
    height: 0,
  });

  const [pixelRatio, setPixelRatio] = useState(1);

  viewportRef.current = viewport;

  // Observera storleken i CSS-pixlar. Canvas interna pixlar justeras separat.
  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();

      setSize({
        width: rect.width,
        height: rect.height,
      });

      setPixelRatio(window.devicePixelRatio || 1);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || size.width <= 0 || size.height <= 0) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const backingWidth = Math.max(1, Math.round(size.width * pixelRatio));
    const backingHeight = Math.max(1, Math.round(size.height * pixelRatio));

    if (canvas.width !== backingWidth) {
      canvas.width = backingWidth;
    }

    if (canvas.height !== backingHeight) {
      canvas.height = backingHeight;
    }

    // Börja i CSS-pixlar, så att linjebredder fungerar även på HiDPI-skärmar.
    ctx.setTransform(
      backingWidth / size.width,
      0,
      0,
      backingHeight / size.height,
      0,
      0,
    );

    ctx.clearRect(0, 0, size.width, size.height);

    if (showGrid) {
      const gridStep = Math.pow(
        10,
        Math.floor(Math.log10(60 / viewport.scale)),
      );

      const step = gridStep * (
        60 / (gridStep * viewport.scale) > 5 ? 5 : 1
      );

      const lowerLeft = screenToWorld(
        { x: 0, y: size.height },
        viewport,
        size,
      );

      const upperRight = screenToWorld(
        { x: size.width, y: 0 },
        viewport,
        size,
      );

      ctx.save();
      ctx.strokeStyle = "rgba(128, 150, 170, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (
        let x = Math.ceil(lowerLeft.x / step) * step;
        x <= upperRight.x;
        x += step
      ) {
        const screenX = worldToScreen({ x, y: 0 }, viewport, size).x;
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, size.height);
      }

      for (
        let y = Math.ceil(lowerLeft.y / step) * step;
        y <= upperRight.y;
        y += step
      ) {
        const screenY = worldToScreen({ x: 0, y }, viewport, size).y;
        ctx.moveTo(0, screenY);
        ctx.lineTo(size.width, screenY);
      }

      ctx.stroke();
      ctx.restore();
    }

    // Låt renderaren arbeta direkt i världskoordinater.
    ctx.save();
    ctx.translate(size.width / 2, size.height / 2);
    ctx.scale(viewport.scale, -viewport.scale);
    ctx.translate(-viewport.center.x, -viewport.center.y);

    try {
      render({
        ctx,
        viewport,
        size,
        pixelRatio,
        worldToScreen: (point) => worldToScreen(point, viewport, size),
      });
    } finally {
      ctx.restore();
    }
  }, [size, pixelRatio, viewport, render, showGrid]);

  const localPoint = useCallback(
    (clientX: number, clientY: number): Point2 => {
      const rect = containerRef.current?.getBoundingClientRect();

      return {
        x: clientX - (rect?.left ?? 0),
        y: clientY - (rect?.top ?? 0),
      };
    },
    [],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    dragRef.current = {
      ...drag,
      x: event.clientX,
      y: event.clientY,
    };

    onViewportChange(panViewport(viewportRef.current, dx, dy));
  };

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (size.width <= 0 || size.height <= 0) {
      return;
    }

    const anchor = localPoint(event.clientX, event.clientY);
    const factor = Math.exp(-event.deltaY * 0.0015);

    onViewportChange(
      zoomViewport(
        viewportRef.current,
        size,
        anchor,
        factor,
        minScale,
        maxScale,
      ),
    );
  };

  const overlayContext: Canvas2DOverlayContext = {
    viewport,
    size,
    worldToScreen: (point) => worldToScreen(point, viewport, size),
    screenToWorld: (point) => screenToWorld(point, viewport, size),
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(1, size.width)} ${Math.max(1, size.height)}`}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
        aria-label="Interaktivt SVG-lager"
      >
        {overlay?.(overlayContext)}
      </svg>
    </div>
  );
}
