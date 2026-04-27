
import { useState } from "react";
//import type { CurveCanvasProps } from "../model/appTypes";
import type { CurveLabState } from "../model/curveTypes";

type CurveHudProps = {
  state: CurveLabState;//CurveCanvasProps["state"];
};

type HudRowProps = {
  label: string;
  value: string;
};
/*
import type { AppState } from "../model/curveTypes";

type CurveHudProps = {
  state: AppState;
};
*/
function HudRow({ label, value }: HudRowProps) {
  return (
    <div className="canvas-hud__row">
      <span className="canvas-hud__row-label">{label}</span>
      <span className="canvas-hud__row-value">{value}</span>
    </div>
  );
}

export default function CurveHud({ state }: CurveHudProps) {
  const [isHudCollapsed, setIsHudCollapsed] = useState(true);

  return (
    <div
      className={[
        "canvas-hud",
        isHudCollapsed ? "canvas-hud--collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="canvas-hud__toggle"
        onClick={() => setIsHudCollapsed((prev) => !prev)}
        aria-label={isHudCollapsed ? "Visa HUD" : "Dölj HUD"}
        title={isHudCollapsed ? "Visa HUD" : "Dölj HUD"}
      >
        {isHudCollapsed ? "+" : "−"}
      </button>

      {!isHudCollapsed && (
        <>
          <div className="canvas-hud__header">
            <div className="canvas-hud__title">CURVE LAB</div>
            <div className="canvas-hud__badge">
              {state.curveType.toUpperCase()}
            </div>
          </div>

          <div className="canvas-hud__live">
            <span className="canvas-hud__live-dot" />
            <span>LIVE</span>
          </div>

          <div className="canvas-hud__rows">
            <HudRow
              label="Speed"
              value={state.lissajous.speed.toFixed(1)}
            />
            <HudRow
              label="a / b"
              value={`${state.lissajous.params.a} / ${state.lissajous.params.b}`}
            />
            <HudRow
              label="A / B"
              value={`${state.lissajous.params.A} / ${state.lissajous.params.B}`}
            />
            <HudRow
              label="Trace"
              value={state.lissajous.drawFull ? "Full" : "Animated"}
            />
          </div>
        </>
      )}
    </div>
  );
}
  // type HudRowProps = {
  //   label: string;
  //   value: string;
  // };

  // export function HudRow({ label, value }: HudRowProps) {
  //   return (
  //     <div className="canvas-hud__row">
  //       <span className="canvas-hud__row-label">{label}</span>
  //       <span className="canvas-hud__row-value">{value}</span>
  //     </div>
  //   );
  // }
