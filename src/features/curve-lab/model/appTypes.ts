import type { CurveType } from "../model/curveTypes";
import type { LissajousParams } from "./curveParams";
import type { CurveLabActions, CurveLabState } from "../model/curveTypes";


export type CurveSelectionProps = {
  curveType: CurveType;
  setCurveType: React.Dispatch<React.SetStateAction<CurveType>>;
};

export type SpeedControlProps = {
  cycloidSpeed: number;
  setCycloidSpeed: React.Dispatch<React.SetStateAction<number>>;
};

export type RadiusControlProps = {
  radius: number;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
};

export type LissajousControlProps = {
  lissajousParams: LissajousParams;
  setLissajousParams: React.Dispatch<React.SetStateAction<LissajousParams>>;
  lissajousSpeed: number;
  setLissajousSpeed: React.Dispatch<React.SetStateAction<number>>;
  drawFullLissajous: boolean;
  setDrawFullLissajous: React.Dispatch<React.SetStateAction<boolean>>;
};

// export type CycloidState = {
//   speed: number;
//   radius: number;
// };

// export type LissajousState = {
//   speed: number;
//   drawFull: boolean;
//   params: LissajousParams;
// };

// export type AppState = {
//   curveType: CurveType;
//   cycloid: CycloidState;
//   lissajous: LissajousState;
// };


export type ControlsActions = {
  setCurveType: React.Dispatch<React.SetStateAction<CurveType>>;
  setCycloidSpeed: React.Dispatch<React.SetStateAction<number>>;
  setCycloidRadius: React.Dispatch<React.SetStateAction<number>>;
  setLissajousSpeed: React.Dispatch<React.SetStateAction<number>>;
  setDrawFullLissajous: React.Dispatch<React.SetStateAction<boolean>>;
  setLissajousParams: React.Dispatch<React.SetStateAction<LissajousParams>>;
};

export type AppActions = {
  curveType: {
    set: React.Dispatch<React.SetStateAction<CurveType>>;
  };
  cycloid: {
    setSpeed: React.Dispatch<React.SetStateAction<number>>;
    setRadius: React.Dispatch<React.SetStateAction<number>>;
  };
  lissajous: {
    setSpeed: React.Dispatch<React.SetStateAction<number>>;
    setDrawFull: React.Dispatch<React.SetStateAction<boolean>>;
    setParams: React.Dispatch<React.SetStateAction<LissajousParams>>;
  };
};


export type ControlsProps = {
  state: CurveLabState;
  actions: CurveLabActions;
};


export type CurveCanvasProps = {
  state: CurveLabState;
};
