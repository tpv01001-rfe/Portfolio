import { useEffect, useRef } from "react";
import type { CurveLabState } from "../model/curveTypes";
import { getActiveRollingCurveState } from "../model/curveSelectors";

export function useCurveAnimationState(state: CurveLabState) {
  const { curveType, lissajous } = state;

  const rollingCurve = getActiveRollingCurveState(state);

  const cycloidSpeedRef = useRef(rollingCurve?.speed ?? 1);
  const radiusRef = useRef(rollingCurve?.radius ?? 40);

  const lissajousSpeedRef = useRef(lissajous.speed);
  const lissajousParamsRef = useRef(lissajous.params);
  const drawFullLissajousRef = useRef(lissajous.drawFull);

  const positionRef = useRef(0);
  const tRef = useRef(0);
  const progressRef = useRef(0);
  const previousTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!rollingCurve) return;

    cycloidSpeedRef.current = rollingCurve.speed;
    radiusRef.current = rollingCurve.radius;
  }, [rollingCurve?.speed, rollingCurve?.radius]);

  useEffect(() => {
    lissajousSpeedRef.current = lissajous.speed;
  }, [lissajous.speed]);

  useEffect(() => {
    lissajousParamsRef.current = lissajous.params;
  }, [lissajous.params]);

  useEffect(() => {
    drawFullLissajousRef.current = lissajous.drawFull;
  }, [lissajous.drawFull]);

  useEffect(() => {
    positionRef.current = 0;
    tRef.current = 0;
    progressRef.current = 0;
    previousTimeRef.current = null;
  }, [curveType]);

  const getDeltaTime = (time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
    }

    const deltaTime = (time - previousTimeRef.current) / 1000;
    previousTimeRef.current = time;

    return deltaTime;
  };

  const cleanup = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    previousTimeRef.current = null;
  };

  return {
    cycloidSpeedRef,
    radiusRef,
    lissajousSpeedRef,
    lissajousParamsRef,
    drawFullLissajousRef,
    positionRef,
    tRef,
    progressRef,
    previousTimeRef,
    requestRef,
    getDeltaTime,
    cleanup,
  };
}
