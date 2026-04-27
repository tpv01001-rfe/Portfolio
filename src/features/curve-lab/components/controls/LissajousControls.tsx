import type { LissajousParams } from "../../model/curveParams";
import SliderControl from "../../../../shared/ui/controls/SliderControl";
import CheckboxControl from "../../../../shared/ui/controls/CheckboxControl";


type LissajousControlsProps2 = {
  drawFullLissajous: boolean;
  setDrawFullLissajous: (value: boolean) => void;
  lissajousSpeed: number;
  setLissajousSpeed: (value: number) => void;
  lissajousParams: LissajousParams;
  setLissajousParams: (value: LissajousParams) => void;
  patchLissajousParams: (patch: Partial<LissajousParams>) => void;
};


type LissajousControlsProps = {
  drawFull: boolean;
  onDrawFullChange: (value: boolean) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  params: LissajousParams;
  onParamsChange: (patch: Partial<LissajousParams>) => void;
};

export default function LissajousControls({
  drawFull,
  onDrawFullChange,
  speed,
  onSpeedChange,
  params,
  onParamsChange,
}: LissajousControlsProps) {
  return (
    <div className="controls-stack">
      <div className="control-subsection">
        <div className="control-subsection__title">Display</div>

        <CheckboxControl
          label="Show full curve"
          checked={drawFull}
          onChange={onDrawFullChange}
        />

        <SliderControl
          label="Lissajous speed"
          min={1}
          max={3}
          step={0.1}
          value={speed}
          onChange={onSpeedChange}
        />
      </div>

      <div className="control-subsection">
        <div className="control-subsection__title">Frequency</div>

        <div className="control-grid">
          <SliderControl
            label="a"
            min={1}
            max={10}
            step={1}
            value={params.a}
            onChange={(value) => onParamsChange({ a: value })}
          />

          <SliderControl
            label="b"
            min={1}
            max={10}
            step={1}
            value={params.b}
            onChange={(value) => onParamsChange({ b: value })}
          />
        </div>
      </div>

      <div className="control-subsection">
        <div className="control-subsection__title">Amplitude</div>

        <div className="control-grid">
          <SliderControl
            label="A"
            min={100}
            max={190}
            step={1}
            value={params.A}
            onChange={(value) => onParamsChange({ A: value })}
          />

          <SliderControl
            label="B"
            min={100}
            max={190}
            step={1}
            value={params.B}
            onChange={(value) => onParamsChange({ B: value })}
          />
        </div>
      </div>

      <div className="control-subsection">
        <div className="control-subsection__title">Phase</div>

        <SliderControl
          label="Delta"
          min={0}
          max={90}
          step={1}
          value={params.delta}
          onChange={(value) => onParamsChange({ delta: value })}
        />
      </div>
    </div>
  );
}
