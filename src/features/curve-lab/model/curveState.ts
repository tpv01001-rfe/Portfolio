// import type { Dispatch, SetStateAction } from "react";
// import type { CurveLabState, CurveLabActions  } from "./curveTypes";


import type { Dispatch, SetStateAction } from "react";
import type { CurveLabActions, CurveLabState } from "./curveTypes";
import type { LissajousParams } from "./curveParams";

export function createInitialCurveLabState(): CurveLabState {
  return {
    curveType: "lissajous",
    cycloid: {
      speed: 1,
      radius: 40,
    },
    lissajous: {
      speed: 1,
      drawFull: false,
      params: {
        A: 120,
        B: 120,
        a: 3,
        b: 2,
        delta: 0,
      },
    },
  };
}

export function createCurveLabActions(
  setState: Dispatch<SetStateAction<CurveLabState>>
): CurveLabActions {
  return {
    setCurveType: (curveType) => {
      setState((prev) => ({ ...prev, curveType }));
    },

    setCycloidSpeed: (speed) => {
      setState((prev) => ({
        ...prev,
        cycloid: {
          ...prev.cycloid,
          speed,
        },
      }));
    },

    setCycloidRadius: (radius) => {
      setState((prev) => ({
        ...prev,
        cycloid: {
          ...prev.cycloid,
          radius,
        },
      }));
    },

    setLissajousSpeed: (speed) => {
      setState((prev) => ({
        ...prev,
        lissajous: {
          ...prev.lissajous,
          speed,
        },
      }));
    },

    setLissajousDrawFull: (drawFull) => {
      setState((prev) => ({
        ...prev,
        lissajous: {
          ...prev.lissajous,
          drawFull,
        },
      }));
    },

    setLissajousParams: (params: LissajousParams) => {
      setState((prev) => ({
        ...prev,
        lissajous: {
          ...prev.lissajous,
          params,
        },
      }));
    },

    patchLissajousParams: (patch) => {
      setState((prev) => ({
        ...prev,
        lissajous: {
          ...prev.lissajous,
          params: {
            ...prev.lissajous.params,
            ...patch,
          },
        },
      }));
    },
  };
}

/*
export function createInitialCurveAppState(): CurveLabState {
  return {
    curveType: "lissajous",
    isAnimating: true,
    showFullCurve: false,
    speed: 1,
  } as CurveLabState;
}

export function createCurveAppActions(
  setState: Dispatch<SetStateAction<CurveLabState>>
): CurveLabActions  {
  return {
    setCurveType: (curveType) => {
      setState((prev) => ({ ...prev, curveType }));
    },

    setIsAnimating: (isAnimating) => {
      setState((prev) => ({ ...prev, isAnimating }));
    },

    setShowFullCurve: (showFullCurve) => {
      setState((prev) => ({ ...prev, showFullCurve }));
    },

    setSpeed: (speed) => {
      setState((prev) => ({ ...prev, speed }));
    },
  } as CurveLabActions ;
}
*/