import { useMemo, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { CurveLabState, CurveLabActions } from "../model/curveTypes";
import { createInitialCurveLabState } from "../model/curveState";

const CurveLabContext = createContext<{
  state: CurveLabState;
  actions: CurveLabActions;
} | null>(null);

export function CurveLabProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurveLabState>(() =>
    createInitialCurveLabState()
  );

const actions: CurveLabActions = useMemo(
  () => ({
    setCurveType: (curveType) => {
      setState((prev) => ({
        ...prev,
        curveType,
      }));
    },

    patchRollingCurve: (curveType, patch) => {
      setState((prev) => ({
        ...prev,
        rollingCurves: {
          ...prev.rollingCurves,
          [curveType]: {
            ...prev.rollingCurves[curveType],
            ...patch,
          },
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
  }),
  []
);

  return (
    <CurveLabContext.Provider value={{ state, actions }}>
      {children}
    </CurveLabContext.Provider>
  );
}

export function useCurveLab() {
  const context = useContext(CurveLabContext);

  if (!context) {
    throw new Error("useCurveLab must be used inside CurveLabProvider");
  }

  return context;
}
