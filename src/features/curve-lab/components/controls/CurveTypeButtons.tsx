import type { CurveType } from "../../model/curveTypes";

type CurveTypeButtonsProps = {
  curveType: CurveType;
  setCurveType: (value: CurveType) => void;
};

const curveOptions: Array<{
  value: CurveType;
  label: string;
  shortLabel: string;
}> = [
  { value: "cycloid", label: "Cycloid", shortLabel: "Cycloid" },
  { value: "epicycloid", label: "Epicycloid", shortLabel: "Epi" },
  { value: "hypocycloid", label: "Hypocycloid", shortLabel: "Hypo" },
  { value: "lissajous", label: "Lissajous", shortLabel: "Lissajous" },
];

export default function CurveTypeButtons({
  curveType,
  setCurveType,
}: CurveTypeButtonsProps) {
  return (
    <div className="curve-type-switcher" role="tablist" aria-label="Curve type">
      {curveOptions.map((option) => {
        const isActive = curveType === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              "curve-type-switcher__button",
              isActive ? "curve-type-switcher__button--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setCurveType(option.value)}
          >
            <span className="curve-type-switcher__label">
              {option.shortLabel}
            </span>
            <span className="curve-type-switcher__meta">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}