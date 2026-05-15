import { useEffect, useRef } from "react";
import { useCanvasResize } from "../hooks/useCanvasResize";
import { useCurveAnimationState } from "../hooks/useCurveAnimationState";
import { drawLissajousScene } from "../rendering/drawLissajousScene";
import { drawCycloidScene, getCycloidWorldGeometry } from "../rendering/drawCycloidScene";

import { useCurveLab } from "../context/CurveLabContext";
import CurveHud from "./CurveHud";

import { useCamera } from "../../../shared/interaction/useCamera";
import { useCanvasPointer } from "../../../shared/interaction/useCanvasPointer";
import { MiniMap } from "./MiniMap";


export default function CurveCanvas() {
  const { state } = useCurveLab();
  const { curveType } = state;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const initialSizeRef = useRef({ width: 0, height: 0 });

  const { wrapperRef, sizeRef } = useCanvasResize(canvasRef);
  const animation = useCurveAnimationState(state);

  const camera = useCamera();

  useCanvasPointer({
    canvasRef,
    cameraApi: camera,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (initialSizeRef.current.width === 0) {
      initialSizeRef.current = {
        width: canvas.width,
        height: canvas.height,
      };
    }

    camera.fitBounds({
      minX: -100,
      maxX: 100,
      minY: -75,
      maxY: 75,
    }, width, height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (time: number) => {

      const { width, height } = sizeRef.current;
      const deltaTime = animation.getDeltaTime(time);

      const c = camera.cameraRef.current;

      ctx.clearRect(0, 0, width, height);

      ctx.save();

      ctx.translate(width / 2, height / 2);
      ctx.scale(c.zoom, c.zoom);
      ctx.translate(-c.x, -c.y);

      if (curveType === "lissajous") {
        drawLissajousScene({
          ctx,
          width,
          height,
          deltaTime,
          curveType,
          drawFullRef: animation.drawFullLissajousRef,
          speedRef: animation.lissajousSpeedRef,
          paramsRef: animation.lissajousParamsRef,
          progressRef: animation.progressRef,
        });
      } else {
        const geometry = getCycloidWorldGeometry({
          curveType,
          radius: animation.radiusRef.current,
          radiusMin: 10,
          radiusMax: 100,
        });

        drawCycloidScene({
          ctx,
          width,
          height,
          deltaTime,
          curveType,
          geometry,
          cycloidSpeedRef: animation.cycloidSpeedRef,
          positionRef: animation.positionRef,
          tRef: animation.tRef,
        });
      }

      ctx.restore();

      animation.requestRef.current = requestAnimationFrame(draw);
    };

    animation.requestRef.current = requestAnimationFrame(draw);

    return () => {
      animation.cleanup();
    };

  }, [curveType, sizeRef]);

  const width = sizeRef.current.width;
  const height = sizeRef.current.height;

  return (

    <div
      ref={wrapperRef}
      className="canvas-wrapper"
      data-curve-type={state.curveType}
    >
      <canvas
        ref={canvasRef}
        className="canvas"
        width={800}
        height={400}
      />

      <button 
      className="canvas-reset-button" 
        onClick={() =>
          camera.fitBounds({
            minX: -100,
            maxX: 100,
            minY: -75,
            maxY: 75
          }, width, height, 1)
        }
      >
        Reset view
      </button>

      {state.curveType === "lissajous" && <CurveHud state={state} />}

      <MiniMap
        camera={camera.camera}
        canvasWidth={width}
        canvasHeight={height}
        worldBounds={{
          minX: -width,
          maxX: width,
          minY: -height,
          maxY: height
        }}
        onJumpTo={(x, y) => {
          camera.centerOn(x, y);//, width, height);
        }}
      />
    </div>
  );
}