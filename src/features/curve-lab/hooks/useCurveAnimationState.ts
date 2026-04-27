import { useEffect, useRef } from "react";
//import type { CurveCanvasProps } from "../model/appTypes";
import type { CurveLabState } from "../model/curveTypes";

//type CurveState = CurveCanvasProps["state"];

export function useCurveAnimationState(state: CurveLabState) {
  const { curveType, cycloid, lissajous } = state;

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const cycloidSpeedRef = useRef(cycloid.speed);
  const radiusRef = useRef(cycloid.radius);
  const positionRef = useRef(0);
  const tRef = useRef(0);

  const drawFullLissajousRef = useRef(lissajous.drawFull);
  const lissajousSpeedRef = useRef(lissajous.speed);
  const lissajousParamsRef = useRef(lissajous.params);
  const progressRef = useRef(0);

  useEffect(() => {
    cycloidSpeedRef.current = cycloid.speed;
  }, [cycloid.speed]);

  useEffect(() => {
    radiusRef.current = cycloid.radius;
  }, [cycloid.radius]);

  useEffect(() => {
    drawFullLissajousRef.current = lissajous.drawFull;
  }, [lissajous.drawFull]);

  useEffect(() => {
    lissajousSpeedRef.current = lissajous.speed;
  }, [lissajous.speed]);

  useEffect(() => {
    lissajousParamsRef.current = lissajous.params;
  }, [lissajous.params]);

  useEffect(() => {
    positionRef.current = 0;
    tRef.current = 0;

    if (curveType === "lissajous") {
      progressRef.current = 0;
    }
  }, [curveType]);

  const getDeltaTime = (time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
      return 0;
    }

    const deltaTime = (time - previousTimeRef.current) / 1000;
    previousTimeRef.current = time;
    return deltaTime;
  };

  const resetFrameTime = () => {
    previousTimeRef.current = null;
  };

  const cancelFrame = () => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const cleanup = () => {
    cancelFrame();
    resetFrameTime();
  };

  return {
    requestRef,
    previousTimeRef,

    cycloidSpeedRef,
    radiusRef,
    positionRef,
    tRef,

    drawFullLissajousRef,
    lissajousSpeedRef,
    lissajousParamsRef,
    progressRef,

    getDeltaTime,
    resetFrameTime,
    cancelFrame,
    cleanup,
  };
}