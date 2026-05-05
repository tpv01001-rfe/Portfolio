import { useEffect, useRef } from "react";
//import type { CurveLabState } from "../model/curveTypes";
import { useCanvasResize } from "../hooks/useCanvasResize";
import { useCurveAnimationState } from "../hooks/useCurveAnimationState";
import { drawLissajousScene } from "../rendering/drawLissajousScene";
import { drawCycloidScene, getResponsiveCycloidGeometry } from "../rendering/drawCycloidScene";

import { useCurveLab } from "../context/CurveLabContext";
import CurveHud from "./CurveHud";

import { useViewport } from "../../../shared/interaction/useViewport";
import { useCanvasPointer } from "../../../shared/interaction/useCanvasPointer";

//export default function CurveCanvas({ state }: CurveCanvasProps) {
export default function CurveCanvas() {
  const { state } = useCurveLab();
  const { curveType } = state;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const initialSizeRef = useRef({ width: 0, height: 0 });

  const { wrapperRef, sizeRef } = useCanvasResize(canvasRef);
  const animation = useCurveAnimationState(state);

  const viewport = useViewport();

  useCanvasPointer({
  canvasRef,
  viewportApi: viewport,
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
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (time: number) => {

      const { width, height } = sizeRef.current;
      const deltaTime = animation.getDeltaTime(time);

      const v = viewport.viewportRef.current;

      //ctx.clearRect(0, 0, width, height);
      ctx.clearRect(0, 0, width, height);

ctx.save();

ctx.translate(width / 2, height / 2);
ctx.translate(v.panX, v.panY);
ctx.scale(v.zoom, v.zoom);
ctx.translate(-width / 2, -height / 2);

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
        const geometry = getResponsiveCycloidGeometry({
          curveType,
          width,
          height,
          initialWidth: initialSizeRef.current.width || width,
          initialHeight: initialSizeRef.current.height || height,
          radius: animation.radiusRef.current,
          lineMargin: 15,
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

      {state.curveType === "lissajous" && <CurveHud state={state} />}
    </div>
  );
}