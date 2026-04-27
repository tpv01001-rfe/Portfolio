import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CurveLabState, CurveLabActions } from "../model/curveTypes";
import type { LissajousParams } from "../model/curveParams";

type CurveLabContextValue = {
  state: CurveLabState;
  actions: CurveLabActions;
};

const CurveLabContext = createContext<CurveLabContextValue | null>(null);

export function CurveLabProvider({ children }: { children: ReactNode }) {
  const [curveType, setCurveType] = useState<CurveLabState["curveType"]>("lissajous");

  const [cycloidSpeed, setCycloidSpeed] = useState(1);
  const [cycloidRadius, setCycloidRadius] = useState(40);

  const [lissajousSpeed, setLissajousSpeed] = useState(1);
  const [drawFullLissajous, setDrawFullLissajous] = useState(false);
  const [lissajousParams, setLissajousParams] = useState<LissajousParams>({
    A: 120,
    B: 120,
    a: 3,
    b: 2,
    delta: 0,
  });

  const state: CurveLabState = {
    curveType,
    cycloid: {
      speed: cycloidSpeed,
      radius: cycloidRadius,
    },
    lissajous: {
      speed: lissajousSpeed,
      drawFull: drawFullLissajous,
      params: lissajousParams,
    },
  };

  const actions: CurveLabActions = useMemo(
    () => ({
      setCurveType: (curveType) => {
        setCurveType(curveType);
      },

      setCycloidSpeed: (speed) => {
        setCycloidSpeed(speed);
      },

      setCycloidRadius: (radius) => {
        setCycloidRadius(radius);
      },

      setLissajousSpeed: (speed) => {
        setLissajousSpeed(speed);
      },

      setLissajousDrawFull: (drawFull) => {
        setDrawFullLissajous(drawFull);
      },

      setLissajousParams: (params) => {
        setLissajousParams(params);
      },

      patchLissajousParams: (patch) => {
        setLissajousParams((prev) => ({
          ...prev,
          ...patch,
        }));
      },
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <CurveLabContext.Provider value={value}>
      {children}
    </CurveLabContext.Provider>
  );
}

export function useCurveLab() {
  const context = useContext(CurveLabContext);

  if (!context) {
    throw new Error("useCurveLab must be used within CurveLabProvider");
  }

  return context;
}