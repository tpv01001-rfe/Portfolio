import type { CurveLabState, CurveType, RollingCurveType } from "./curveTypes";


export function isRollingCurveType(
  curveType: CurveType
): curveType is RollingCurveType {
  return curveType !== "lissajous";
}

export function getActiveRollingCurveState(state: CurveLabState) {
  if (!isRollingCurveType(state.curveType)) return null;

  return state.rollingCurves[state.curveType];
}
