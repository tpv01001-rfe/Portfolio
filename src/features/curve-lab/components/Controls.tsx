import "../../../styles/theme.css";
import "../../../styles/controls.css";


import CycloidControls from "../components/controls/CycloidControls";
import LissajousControls from "../components/controls/LissajousControls";
import CurveTypeButtons from "../components/controls/CurveTypeButtons";
import ControlPanelSection from "../components/layout/ControlPanelSection";
import ControlsHeader from "../components/layout/ControlsHeader";
import { useCurveLab } from "../context/CurveLabContext";
import { getActiveRollingCurveState, isRollingCurveType } from "../model/curveSelectors";
import type { RollingCurveState } from "../model/curveTypes";


export function Controls() {
  const { state, actions } = useCurveLab();
  const { curveType, lissajous } = state;
  const rollingCurve = getActiveRollingCurveState(state);


//sätter radie och hastigheten generiskt
function setRollingParam(patch: Partial<RollingCurveState>) {
  if (!isRollingCurveType(curveType)) return;

  actions.patchRollingCurve(curveType, patch);
}

  return (
    <div className="controls-panel" data-curve-type={curveType}>
      <ControlsHeader curveType={curveType} />

      <ControlPanelSection
        title="Active Curve"
        description="Select the current curve mode"
      >
        <CurveTypeButtons
          curveType={curveType}
          setCurveType={actions.setCurveType}
        />
      </ControlPanelSection>

      {curveType === "lissajous" ? (
        <ControlPanelSection
          title="Lissajous Parameters"
          description="Adjust frequency, amplitude, and phase"
        >
          <LissajousControls
            drawFull={lissajous.drawFull}
            onDrawFullChange={actions.setLissajousDrawFull}
            speed={lissajous.speed}
            onSpeedChange={actions.setLissajousSpeed}
            params={lissajous.params}
            onParamsChange={actions.patchLissajousParams}
          />
        </ControlPanelSection>
      ) : (
        <ControlPanelSection
          title="Cycloid Parameters"
          description="Control radius and animation speed"
        >

          {rollingCurve ? (
            <CycloidControls
              speed={rollingCurve.speed}
              onSpeedChange={(value) => setRollingParam({speed: value})}
              radius={rollingCurve.radius}
              onRadiusChange={(value) => setRollingParam({radius: value})}
            />
          ) : null}
        </ControlPanelSection>
      )}
    </div>
  );
}
