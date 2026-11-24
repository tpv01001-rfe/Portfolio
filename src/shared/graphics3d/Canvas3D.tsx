
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { CameraController } from
    "../controllers/CameraController";

export type Canvas3DSize = {
    width: number;
    height: number;
    pixelRatio: number;
};

export type Canvas3DFrame = {
    ctx: CanvasRenderingContext2D;
    size: Canvas3DSize;
    deltaTime: number;
};

export type Canvas3DProps = {
    render: (frame: Canvas3DFrame) => void;
    className?: string;
    style?: CSSProperties;
    onCanvasReady?: (
        canvas: HTMLCanvasElement
    ) => CameraController;
};

export function Canvas3D({
    render,
    className,
    style,
    onCanvasReady,
}: Canvas3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderRef = useRef(render);

    const onCanvasReadyRef = useRef(onCanvasReady);

    useEffect(() => {
        onCanvasReadyRef.current = onCanvasReady;
    }, [onCanvasReady]);
    // Den senaste renderfunktionen utan att starta om
    // canvasens livscykel vid varje React-rendering.
    useEffect(() => {
        renderRef.current = render;
    }, [render]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // const cleanupController =
        //     onCanvasReadyRef.current?.(canvas);
        const controller =
  onCanvasReadyRef.current?.(canvas);

        let frameId = 0;
        let previousTime = 0;

        const size: Canvas3DSize = {
            width: 1,
            height: 1,
            pixelRatio: 1,
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();

            size.width = Math.max(1, rect.width);
            size.height = Math.max(1, rect.height);
            size.pixelRatio = window.devicePixelRatio || 1;

            const pixelWidth = Math.round(
                size.width * size.pixelRatio
            );
            const pixelHeight = Math.round(
                size.height * size.pixelRatio
            );

            if (
                canvas.width !== pixelWidth ||
                canvas.height !== pixelHeight
            ) {
                canvas.width = pixelWidth;
                canvas.height = pixelHeight;
            }
        };

        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        resize();

        const animate = (time: number) => {
            const deltaTime = previousTime
                ? Math.min((time - previousTime) / 1000, 0.05)
                : 0;

            previousTime = time;

            ctx.setTransform(
                size.pixelRatio, 0,
                0, size.pixelRatio,
                0, 0
            );

            ctx.clearRect(0, 0, size.width, size.height);

            controller?.update(deltaTime);

            renderRef.current({
                ctx,
                size,
                deltaTime,
            });

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
            observer.disconnect();
            controller?.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                display: "block",
                width: "100%",
                height: "100%",
                ...style,
            }}
        />
    );
}
