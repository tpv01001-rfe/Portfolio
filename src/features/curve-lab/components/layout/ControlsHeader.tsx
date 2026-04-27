import type { CurveType } from "../../model/curveTypes";

type ControlsHeaderProps = {
  curveType: CurveType;
};

const curveTypeLabel: Record<CurveType, string> = {
  cycloid: "Cycloid",
  epicycloid: "Epicycloid",
  hypocycloid: "Hypocycloid",
  lissajous: "Lissajous",
};

export default function ControlsHeader({ curveType }: ControlsHeaderProps) {
  return (
    <div className="controls-header controls-header--compact">
      <div className="controls-header__eyebrow">Control Panel</div>

      <div className="controls-header__main">
        <div className="controls-header__title">
          Editing {curveTypeLabel[curveType]}
        </div>

        <div className="controls-header__badge">
          <span className="controls-header__badge-dot" />
          <span>{curveTypeLabel[curveType]}</span>
        </div>
      </div>

      <div className="controls-header__description">
        Adjust parameters and update the curve in real time.
      </div>
    </div>
  );
}