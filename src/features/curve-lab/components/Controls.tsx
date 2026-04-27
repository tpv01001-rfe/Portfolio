import "../../../styles/theme.css";
import "../../../styles/controls.css";

//import type { ControlsProps } from "../model/appTypes";
import CycloidControls from "../components/controls/CycloidControls";
import LissajousControls from "../components/controls/LissajousControls";
import CurveTypeButtons from "../components/controls/CurveTypeButtons";
import ControlPanelSection from "../components/layout/ControlPanelSection";
import ControlsHeader from "../components/layout/ControlsHeader";
import { useCurveLab } from "../context/CurveLabContext";


export function Controls() {
  const { state, actions } = useCurveLab();
  const { curveType, lissajous, cycloid } = state;
  return (
    <div className="controls-panel curve-lab-controls-panel" data-curve-type={curveType}>
      <ControlsHeader curveType={curveType} />

      <ControlPanelSection
        title="Active Curve"
        description="Select the current curve mode"
      >
        <CurveTypeButtons
          curveType={curveType}
          setCurveType={actions.setCurveType}//.curveType.set}
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
          <CycloidControls
            speed={cycloid.speed}
            onSpeedChange={actions.setCycloidSpeed}
            radius={cycloid.radius}
            onRadiusChange={actions.setCycloidRadius}
          />
        </ControlPanelSection>
      )}
    </div>
  );
}